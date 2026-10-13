import 'reflect-metadata';
import { existsSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { Clock } from '../../src/platform/clock.js';
import { configureHttpApp, createFastifyAdapter } from '../../src/platform/http/http-app.js';

// Requires: docker compose up -d --wait && pnpm db:migrate && pnpm db:seed
const rootEnv = new URL('../../../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
process.env.LOG_LEVEL ??= 'silent';

/** A clock tests can move forward to cross review windows, deadlines and lifetimes. */
export class TestClock extends Clock {
  private offsetMs = 0;

  override now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }

  advance(ms: number): void {
    this.offsetMs += ms;
  }

  reset(): void {
    this.offsetMs = 0;
  }
}

/** The real application (every module, real PostgreSQL and Redis), served in memory. */
export async function createTestApp(clock?: TestClock): Promise<NestFastifyApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (clock) builder = builder.overrideProvider(Clock).useValue(clock);
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(createFastifyAdapter());
  configureHttpApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
