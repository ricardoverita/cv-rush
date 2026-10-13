import type { RedisOptions } from 'ioredis';

/** Converts a redis:// or rediss:// URL into ioredis options. */
export function redisOptionsFromUrl(url: string): RedisOptions {
  const parsed = new URL(url);
  const db = parsed.pathname.length > 1 ? Number(parsed.pathname.slice(1)) : 0;
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    db: Number.isInteger(db) ? db : 0,
    ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}
