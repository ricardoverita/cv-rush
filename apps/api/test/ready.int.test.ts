import { ReadyResponseSchema } from '@cv-rush/contracts';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/platform/database/prisma.service.js';
import { createTestApp } from './support/app.js';

let app: NestFastifyApplication;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app?.close();
});

describe('API with real PostgreSQL and Redis', () => {
  it('GET /api/ready reports both dependencies up', async () => {
    let body: unknown;
    // Redis connects asynchronously at startup; give it a moment.
    for (let attempt = 0; attempt < 20; attempt++) {
      const response = await app.inject({ method: 'GET', url: '/api/ready' });
      body = response.json();
      if (response.statusCode === 200) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    expect(ReadyResponseSchema.parse(body)).toEqual({
      status: 'ready',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('has the initial migration and seed applied (season-0)', async () => {
    const season = await app.get(PrismaService).season.findUnique({ where: { id: 'season-0' } });
    expect(season).toMatchObject({ id: 'season-0', status: 'active' });
  });
});
