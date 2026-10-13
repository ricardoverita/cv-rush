import 'reflect-metadata';
import { HealthResponseSchema, ReadyResponseSchema } from '@cv-rush/contracts';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { HealthController } from '../src/modules/health/health.controller.js';
import { PrismaService } from '../src/platform/database/prisma.service.js';
import { RedisService } from '../src/platform/redis/redis.service.js';

let app: NestFastifyApplication | undefined;

async function createApp(deps: {
  database: boolean;
  redis: boolean;
}): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [
      { provide: PrismaService, useValue: { isHealthy: async () => deps.database } },
      { provide: RedisService, useValue: { isHealthy: async () => deps.redis } },
    ],
  }).compile();
  const instance = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  instance.setGlobalPrefix('api');
  await instance.init();
  await instance.getHttpAdapter().getInstance().ready();
  return instance;
}

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('HealthController', () => {
  it('GET /api/health reports liveness without checking dependencies', async () => {
    app = await createApp({ database: false, redis: false });
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(HealthResponseSchema.parse(response.json()).status).toBe('ok');
  });

  it('GET /api/ready is 200 when every dependency is up', async () => {
    app = await createApp({ database: true, redis: true });
    const response = await app.inject({ method: 'GET', url: '/api/ready' });
    expect(response.statusCode).toBe(200);
    expect(ReadyResponseSchema.parse(response.json())).toEqual({
      status: 'ready',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('GET /api/ready is 503 when a dependency is down', async () => {
    app = await createApp({ database: true, redis: false });
    const response = await app.inject({ method: 'GET', url: '/api/ready' });
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'not_ready',
      checks: { database: 'up', redis: 'down' },
    });
  });
});
