import { createHash } from 'node:crypto';
import {
  CatalogResponseSchema,
  ErrorEnvelopeSchema,
  MeResponseSchema,
  type CreateDeveloperRequest,
} from '@cv-rush/contracts';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/platform/database/prisma.service.js';
import { createTestApp } from './support/app.js';

const ORIGIN = 'http://localhost:3000';
const WEB = { 'x-cvr-client': 'web', origin: ORIGIN, 'content-type': 'application/json' };

const RICARDO: CreateDeveloperRequest = {
  displayName: 'Ricardo',
  seniority: 'senior',
  roleId: 'fullstack_developer',
  technologyIds: ['nodejs', 'php', 'react', 'postgresql', 'redis'],
};

let app: NestFastifyApplication;
let prisma: PrismaService;
const created: string[] = [];

beforeAll(async () => {
  app = await createTestApp();
  prisma = app.get(PrismaService);
});

afterAll(async () => {
  if (created.length > 0) await prisma.developer.deleteMany({ where: { id: { in: created } } });
  await app?.close();
});

function tokenFrom(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /^dc=([A-Za-z0-9_-]{43});/.exec(header ?? '');
  if (!match?.[1]) throw new Error(`No device cookie in: ${header}`);
  return match[1];
}

async function onboard(body: unknown = RICARDO, headers: Record<string, string> = WEB) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/developers',
    headers,
    payload: JSON.stringify(body),
  });
  if (response.statusCode === 201)
    created.push(MeResponseSchema.parse(response.json()).developer.id);
  return response;
}

function errorCode(response: { json: () => unknown }): string {
  return ErrorEnvelopeSchema.parse(response.json()).error.code;
}

const countDevelopers = () => prisma.developer.count();

describe('GET /api/v1/catalog', () => {
  it('serves the catalog with labels in the requested language', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/catalog?locale=es' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=300');
    const catalog = CatalogResponseSchema.parse(response.json());
    expect(catalog.locale).toBe('es');
    expect(catalog.roles.find((r) => r.id === 'fullstack_developer')).toMatchObject({
      trackId: 'fullstack',
      coreCategoryIds: ['frontend', 'backend'],
    });
    expect(catalog.categories.find((c) => c.id === 'databases')?.label).toBe('Bases de datos');
  });

  it('rejects unsupported languages', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/catalog?locale=fr' });
    expect(response.statusCode).toBe(400);
    expect(errorCode(response)).toBe('VALIDATION_FAILED');
  });
});

describe('onboarding and device recognition', () => {
  it('creates a provisional Developer and sets an httpOnly device cookie', async () => {
    const response = await onboard();
    expect(response.statusCode).toBe(201);
    expect(response.headers['cache-control']).toBe('no-store');
    const cookie = response.headers['set-cookie'] as string;
    expect(cookie).toMatch(
      /^dc=[A-Za-z0-9_-]{43}; Path=\/; Max-Age=34560000; HttpOnly; SameSite=Lax$/,
    );

    const me = MeResponseSchema.parse(response.json());
    expect(me.developer).toMatchObject({
      displayName: 'Ricardo',
      status: 'provisional',
      profileVisibility: 'private',
    });
    expect(me.profile).toMatchObject({
      seniority: 'senior',
      roleId: 'fullstack_developer',
      technologyIds: ['nodejs', 'php', 'react', 'postgresql', 'redis'],
      category: { key: 'fullstack:senior_plus', trackId: 'fullstack', band: 'senior_plus' },
    });
    // UUIDv7: server-generated and time-ordered.
    expect(me.developer.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/);
  });

  it('stores only the SHA-256 of the device token', async () => {
    const response = await onboard({ ...RICARDO, displayName: 'Hash Check' });
    const token = tokenFrom(response.headers['set-cookie']);
    const { developer } = MeResponseSchema.parse(response.json());
    const credentials = await prisma.deviceCredential.findMany({
      where: { developerId: developer.id },
    });
    expect(credentials).toHaveLength(1);
    const stored = Buffer.from(credentials[0]!.tokenHash);
    expect(stored.equals(createHash('sha256').update(token).digest())).toBe(true);
    expect(stored.toString('base64url')).not.toBe(token);
  });

  it('recognises the same device on return, and only that device', async () => {
    const response = await onboard({ ...RICARDO, displayName: 'Returning' });
    const token = tokenFrom(response.headers['set-cookie']);
    const { developer } = MeResponseSchema.parse(response.json());

    const again = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { cookie: `NEXT_LOCALE=es; dc=${token}` },
    });
    expect(again.statusCode).toBe(200);
    expect(again.headers['cache-control']).toBe('no-store');
    expect(MeResponseSchema.parse(again.json()).developer.id).toBe(developer.id);

    const anonymous = await app.inject({ method: 'GET', url: '/api/v1/me' });
    expect(anonymous.statusCode).toBe(401);
    expect(errorCode(anonymous)).toBe('UNAUTHENTICATED');

    const forged = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { cookie: `dc=${'A'.repeat(43)}` },
    });
    expect(forged.statusCode).toBe(401);
  });

  it('refuses revoked credentials', async () => {
    const response = await onboard({ ...RICARDO, displayName: 'Revoked' });
    const token = tokenFrom(response.headers['set-cookie']);
    const { developer } = MeResponseSchema.parse(response.json());
    await prisma.deviceCredential.updateMany({
      where: { developerId: developer.id },
      data: { revokedAt: new Date() },
    });
    const me = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { cookie: `dc=${token}` },
    });
    expect(me.statusCode).toBe(401);
  });

  it('renews the cookie and last activity at most once an hour', async () => {
    const response = await onboard({ ...RICARDO, displayName: 'Sliding' });
    const token = tokenFrom(response.headers['set-cookie']);
    const { developer } = MeResponseSchema.parse(response.json());
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await prisma.deviceCredential.updateMany({
      where: { developerId: developer.id },
      data: { lastUsedAt: twoHoursAgo },
    });
    await prisma.developer.update({
      where: { id: developer.id },
      data: { lastActiveAt: twoHoursAgo },
    });

    const first = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { cookie: `dc=${token}` },
    });
    expect(tokenFrom(first.headers['set-cookie'])).toBe(token);
    const row = await prisma.developer.findUniqueOrThrow({ where: { id: developer.id } });
    expect(row.lastActiveAt.getTime()).toBeGreaterThan(twoHoursAgo.getTime());

    const second = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { cookie: `dc=${token}` },
    });
    expect(second.headers['set-cookie']).toBeUndefined();
  });

  it('does not create a second Developer for a recognised device', async () => {
    const response = await onboard({ ...RICARDO, displayName: 'Only Once' });
    const token = tokenFrom(response.headers['set-cookie']);
    const before = await countDevelopers();
    const again = await onboard(RICARDO, { ...WEB, cookie: `dc=${token}` });
    expect(again.statusCode).toBe(409);
    expect(errorCode(again)).toBe('DEVELOPER_ALREADY_EXISTS');
    expect(await countDevelopers()).toBe(before);
  });
});

describe('request integrity (CSRF)', () => {
  it.each([
    ['no client header', { origin: ORIGIN, 'content-type': 'application/json' }],
    ['another origin', { ...WEB, origin: 'https://evil.example' }],
    [
      'a cross-site fetch',
      { 'x-cvr-client': 'web', 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
    ],
    ['a form content type', { ...WEB, 'content-type': 'text/plain' }],
  ])('rejects state changes with %s', async (_, headers) => {
    const before = await countDevelopers();
    const response = await onboard(RICARDO, headers);
    expect(response.statusCode).toBe(403);
    expect(errorCode(response)).toBe('CSRF_CHECK_FAILED');
    expect(await countDevelopers()).toBe(before);
  });

  it('answers malformed JSON with the error envelope', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/developers',
      headers: WEB,
      payload: '{"displayName": ',
    });
    expect(response.statusCode).toBe(400);
    expect(errorCode(response)).toBe('VALIDATION_FAILED');
  });
});

describe('profile tampering', () => {
  it.each([
    ['an unknown role', { roleId: 'wizard' }, 'PROFILE_ROLE_UNKNOWN'],
    [
      'a seniority the role does not allow',
      { roleId: 'software_architect', seniority: 'junior', technologyIds: ['java'] },
      'PROFILE_SENIORITY_NOT_ALLOWED',
    ],
    [
      'an unknown technology',
      { technologyIds: [...RICARDO.technologyIds, 'cobol'] },
      'PROFILE_TECHNOLOGY_UNKNOWN',
    ],
    [
      'a technology outside the role',
      { roleId: 'frontend_developer', technologyIds: ['react', 'kafka'] },
      'PROFILE_TECHNOLOGY_INCOMPATIBLE',
    ],
    [
      'a missing core category',
      { technologyIds: ['nodejs', 'postgresql'] },
      'PROFILE_CORE_CATEGORY_MISSING',
    ],
    ['an empty stack', { technologyIds: [] }, 'PROFILE_STACK_SIZE'],
    [
      'more than 12 technologies',
      {
        roleId: 'backend_developer',
        technologyIds: [
          'nodejs',
          'nestjs',
          'java',
          'spring_boot',
          'python',
          'go',
          'php',
          'laravel',
          'postgresql',
          'mysql',
          'redis',
          'kafka',
          'docker',
        ],
      },
      'PROFILE_STACK_SIZE',
    ],
    [
      'a name with an email',
      { displayName: 'ricardo@example.com' },
      'DISPLAY_NAME_INVALID_CHARACTERS',
    ],
    ['a name with a web address', { displayName: 'Ricardo.dev' }, 'DISPLAY_NAME_CONTACT_INFO'],
    ['a reserved name', { displayName: 'Admin' }, 'DISPLAY_NAME_NOT_ALLOWED'],
  ])('rejects %s without writing anything', async (_, patch, code) => {
    const before = await countDevelopers();
    const response = await onboard({ ...RICARDO, ...patch });
    expect(response.statusCode).toBe(422);
    expect(errorCode(response)).toBe(code);
    expect(await countDevelopers()).toBe(before);
  });

  it.each([
    ['a status', { status: 'claimed' }],
    ['an id', { id: '0190b6f0-0000-7000-8000-000000000000' }],
    ['an email', { email: 'ricardo@example.com' }],
  ])('rejects fields the client must not set: %s', async (_, extra) => {
    const response = await onboard({ ...RICARDO, ...extra });
    expect(response.statusCode).toBe(400);
    expect(errorCode(response)).toBe('VALIDATION_FAILED');
  });

  it('removes duplicate technologies, keeping the declared order', async () => {
    const response = await onboard({
      ...RICARDO,
      displayName: 'Duplicates',
      technologyIds: ['react', 'nodejs', 'react', 'redis', 'nodejs'],
    });
    expect(response.statusCode).toBe(201);
    expect(MeResponseSchema.parse(response.json()).profile.technologyIds).toEqual([
      'react',
      'nodejs',
      'redis',
    ]);
  });
});

describe('PATCH /api/v1/me/profile', () => {
  async function developerWithCookie(displayName: string) {
    const response = await onboard({ ...RICARDO, displayName });
    return {
      id: MeResponseSchema.parse(response.json()).developer.id,
      cookie: `dc=${tokenFrom(response.headers['set-cookie'])}`,
    };
  }

  const patch = (cookie: string, body: unknown, headers: Record<string, string> = WEB) =>
    app.inject({
      method: 'PATCH',
      url: '/api/v1/me/profile',
      headers: { ...headers, cookie },
      payload: JSON.stringify(body),
    });

  it('updates the name and the profile, validating the result as a whole', async () => {
    const { id, cookie } = await developerWithCookie('Editor');
    const response = await patch(cookie, {
      displayName: 'Ricardo Vera',
      seniority: 'lead',
      technologyIds: ['typescript', 'react', 'nestjs', 'postgresql'],
    });
    expect(response.statusCode).toBe(200);
    const me = MeResponseSchema.parse(response.json());
    expect(me.developer.displayName).toBe('Ricardo Vera');
    expect(me.profile).toMatchObject({
      seniority: 'lead',
      roleId: 'fullstack_developer',
      technologyIds: ['typescript', 'react', 'nestjs', 'postgresql'],
      category: { key: 'fullstack:senior_plus' },
    });
    const stored = await prisma.developerProfile.findUniqueOrThrow({ where: { developerId: id } });
    expect(stored.version).toBe(2);
  });

  it('rejects a role change that leaves the stack incompatible', async () => {
    const { cookie } = await developerWithCookie('Role Change');
    const response = await patch(cookie, { roleId: 'backend_developer' });
    expect(response.statusCode).toBe(422);
    expect(errorCode(response)).toBe('PROFILE_TECHNOLOGY_INCOMPATIBLE');
  });

  it('requires a device credential, the CSRF check and a non-empty body', async () => {
    const { cookie } = await developerWithCookie('Guarded');
    expect((await patch('', { seniority: 'mid' })).statusCode).toBe(401);
    const withoutClientHeader = { origin: ORIGIN, 'content-type': 'application/json' };
    expect((await patch(cookie, { seniority: 'mid' }, withoutClientHeader)).statusCode).toBe(403);
    expect((await patch(cookie, {})).statusCode).toBe(400);
  });
});
