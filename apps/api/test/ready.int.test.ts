import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { ReadyResponseSchema } from '@cv-rush/contracts';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/platform/database/prisma.service.js';

// Requires: docker compose up -d --wait && pnpm db:migrate && pnpm db:seed
const rootEnv = new URL('../../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
process.env.LOG_LEVEL ??= 'silent';

let app: NestFastifyApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.setGlobalPrefix('api');
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
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
