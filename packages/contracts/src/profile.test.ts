import { describe, expect, it } from 'vitest';
import {
  checkDisplayName,
  checkProfile,
  competingCategory,
  CreateDeveloperRequestSchema,
  normalizeDisplayName,
  normalizeStack,
  UpdateProfileRequestSchema,
  type CatalogRules,
} from './index.js';

const rules: CatalogRules = {
  roles: [
    {
      id: 'fullstack_developer',
      trackId: 'fullstack',
      coreCategoryIds: ['frontend', 'backend'],
      allowedCategoryIds: ['databases', 'caching_search'],
    },
    {
      id: 'software_architect',
      trackId: 'architecture',
      minSeniority: 'senior',
      coreCategoryIds: ['backend'],
      allowedCategoryIds: [],
    },
  ],
  technologies: [
    { id: 'react', categoryId: 'frontend' },
    { id: 'nodejs', categoryId: 'backend' },
    { id: 'php', categoryId: 'backend' },
    { id: 'postgresql', categoryId: 'databases' },
    { id: 'redis', categoryId: 'caching_search' },
    { id: 'swift', categoryId: 'mobile' },
  ],
};

const ricardo = {
  seniority: 'senior' as const,
  roleId: 'fullstack_developer',
  technologyIds: ['nodejs', 'php', 'react', 'postgresql', 'redis'],
};

describe('display names', () => {
  it('normalizes whitespace and Unicode before checking', () => {
    expect(normalizeDisplayName('  Ricardo \t  Vera ')).toBe('Ricardo Vera');
    expect(normalizeDisplayName('José')).toBe('José');
  });

  it.each(['Ricardo', 'Ana María', "O'Brien", 'Jean-Luc', 'J. R. R.', '李小龍', 'Zoë'])(
    'accepts %s',
    (name) => expect(checkDisplayName(normalizeDisplayName(name))).toBeNull(),
  );

  it.each([
    ['R', 'DISPLAY_NAME_TOO_SHORT'],
    ['R'.repeat(33), 'DISPLAY_NAME_TOO_LONG'],
    ['Dev42', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['ricardo@example.com', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['@ricardo', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['https://evil.example', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['+51 999 999 999', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['<script>', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['- .', 'DISPLAY_NAME_INVALID_CHARACTERS'],
    ['example.com', 'DISPLAY_NAME_CONTACT_INFO'],
    ['Visit mysite.dev', 'DISPLAY_NAME_CONTACT_INFO'],
  ])('rejects %s with %s', (name, code) => {
    expect(checkDisplayName(normalizeDisplayName(name))).toBe(code);
  });
});

describe('profile rules', () => {
  it('accepts a Senior Fullstack Developer with Node.js, PHP, React, PostgreSQL and Redis', () => {
    expect(checkProfile(rules, ricardo)).toEqual([]);
  });

  it('removes duplicate technologies, keeping the declared order', () => {
    expect(normalizeStack(['react', 'nodejs', 'react'])).toEqual(['react', 'nodejs']);
  });

  it('rejects an unknown role and stops there', () => {
    expect(checkProfile(rules, { ...ricardo, roleId: 'wizard' })).toEqual([
      { code: 'PROFILE_ROLE_UNKNOWN', params: { roleId: 'wizard' } },
    ]);
  });

  it('enforces the minimum seniority of a role', () => {
    const issues = checkProfile(rules, {
      seniority: 'junior',
      roleId: 'software_architect',
      technologyIds: ['nodejs'],
    });
    expect(issues).toEqual([
      {
        code: 'PROFILE_SENIORITY_NOT_ALLOWED',
        params: { roleId: 'software_architect', minSeniority: 'senior' },
      },
    ]);
  });

  it('requires one technology from each core category', () => {
    const issues = checkProfile(rules, { ...ricardo, technologyIds: ['nodejs', 'postgresql'] });
    expect(issues).toEqual([
      {
        code: 'PROFILE_CORE_CATEGORY_MISSING',
        params: { categoryId: 'frontend', roleId: 'fullstack_developer' },
      },
    ]);
  });

  it('rejects unknown and incompatible technologies', () => {
    const issues = checkProfile(rules, {
      ...ricardo,
      technologyIds: [...ricardo.technologyIds, 'cobol', 'swift'],
    });
    expect(issues.map((i) => i.code)).toEqual([
      'PROFILE_TECHNOLOGY_UNKNOWN',
      'PROFILE_TECHNOLOGY_INCOMPATIBLE',
    ]);
  });

  it('requires between 1 and 12 distinct technologies', () => {
    expect(checkProfile(rules, { ...ricardo, technologyIds: [] }).map((i) => i.code)).toContain(
      'PROFILE_STACK_SIZE',
    );
    const thirteen = Array.from({ length: 13 }, (_, i) => `tech_${i}`);
    expect(
      checkProfile(rules, { ...ricardo, technologyIds: thirteen }).map((i) => i.code),
    ).toContain('PROFILE_STACK_SIZE');
  });

  it('computes the competitive category from track and seniority band', () => {
    expect(competingCategory('fullstack', 'senior')).toEqual({
      key: 'fullstack:senior_plus',
      trackId: 'fullstack',
      band: 'senior_plus',
    });
    expect(competingCategory('frontend', 'trainee').key).toBe('frontend:junior');
  });
});

describe('developer request schemas', () => {
  it('rejects fields the client must not choose, such as status or an id', () => {
    const body = { displayName: 'Ricardo', ...ricardo };
    expect(CreateDeveloperRequestSchema.safeParse(body).success).toBe(true);
    expect(CreateDeveloperRequestSchema.safeParse({ ...body, status: 'claimed' }).success).toBe(
      false,
    );
    expect(CreateDeveloperRequestSchema.safeParse({ ...body, id: 'x' }).success).toBe(false);
  });

  it('accepts partial profile updates but not empty ones', () => {
    expect(UpdateProfileRequestSchema.safeParse({ seniority: 'lead' }).success).toBe(true);
    expect(UpdateProfileRequestSchema.safeParse({}).success).toBe(false);
  });
});
