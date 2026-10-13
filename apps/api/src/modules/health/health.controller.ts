import { Controller, Get, Res } from '@nestjs/common';
import type { HealthResponse, ReadyResponse } from '@cv-rush/contracts';
import type { FastifyReply } from 'fastify';
import { PrismaService } from '../../platform/database/prisma.service.js';
import { RedisService } from '../../platform/redis/redis.service.js';

const VERSION = process.env.APP_VERSION ?? process.env.npm_package_version ?? '0.0.0';

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Liveness: the process is up. No dependencies are checked. */
  @Get('health')
  health(): HealthResponse {
    return { status: 'ok', service: 'api', version: VERSION, time: new Date().toISOString() };
  }

  /** Readiness: PostgreSQL and Redis are reachable. */
  @Get('ready')
  async ready(@Res({ passthrough: true }) reply: FastifyReply): Promise<ReadyResponse> {
    const [database, redis] = await Promise.all([this.prisma.isHealthy(), this.redis.isHealthy()]);
    const body: ReadyResponse = {
      status: database && redis ? 'ready' : 'not_ready',
      checks: { database: database ? 'up' : 'down', redis: redis ? 'up' : 'down' },
    };
    if (body.status !== 'ready') reply.code(503);
    return body;
  }
}
