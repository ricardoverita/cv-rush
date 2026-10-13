import { randomUUID } from 'node:crypto';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';

/** The Fastify adapter used by the HTTP entrypoint and by the API's integration tests. */
export function createFastifyAdapter(): FastifyAdapter {
  return new FastifyAdapter({
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    trustProxy: true,
    bodyLimit: 64 * 1024,
  });
}

/** Routing conventions shared by the entrypoint and the tests. Call before `init()`. */
export function configureHttpApp(app: NestFastifyApplication): void {
  app.setGlobalPrefix('api');
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onSend', async (request, reply) => {
      reply.header('x-request-id', request.id);
    });
}
