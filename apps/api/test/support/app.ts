import 'reflect-metadata';
import { existsSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { configureHttpApp, createFastifyAdapter } from '../../src/platform/http/http-app.js';

// Requires: docker compose up -d --wait && pnpm db:migrate && pnpm db:seed
const rootEnv = new URL('../../../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
process.env.LOG_LEVEL ??= 'silent';

/** The real application (every module, real PostgreSQL and Redis), served in memory. */
export async function createTestApp(): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(createFastifyAdapter());
  configureHttpApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
