import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ENV, type Env } from '../config/env.js';
import { redisOptionsFromUrl } from './redis-options.js';

/** Shared Redis client for rate limits, locks and caches (never a source of truth). */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  readonly client: Redis;

  constructor(@Inject(ENV) env: Env) {
    this.client = new Redis({
      ...redisOptionsFromUrl(env.REDIS_URL),
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    // Connection errors are reported through readiness checks, not as unhandled events.
    this.client.on('error', () => undefined);
  }

  onModuleInit(): void {
    this.client.connect().catch(() => undefined);
  }

  async isHealthy(timeoutMs = 1000): Promise<boolean> {
    try {
      const pong = await Promise.race([
        this.client.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs),
        ),
      ]);
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.client.disconnect();
  }
}
