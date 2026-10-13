import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { ENV, type Env } from './platform/config/env.js';

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    trustProxy: true,
    bodyLimit: 64 * 1024,
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onSend', async (request, reply) => {
      reply.header('x-request-id', request.id);
    });

  const env = app.get<Env>(ENV);
  await app.listen(env.API_PORT, env.API_HOST);
  app.get(Logger).log(`API listening on http://${env.API_HOST}:${env.API_PORT}/api`, 'Bootstrap');
}

void bootstrap();
