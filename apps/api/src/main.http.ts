import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { ENV, type Env } from './platform/config/env.js';
import { configureHttpApp, createFastifyAdapter } from './platform/http/http-app.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, createFastifyAdapter(), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  configureHttpApp(app);
  app.enableShutdownHooks();

  const env = app.get<Env>(ENV);
  await app.listen(env.API_PORT, env.API_HOST);
  app.get(Logger).log(`API listening on http://${env.API_HOST}:${env.API_PORT}/api`, 'Bootstrap');
}

void bootstrap();
