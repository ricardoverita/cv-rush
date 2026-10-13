import { describe, expect, it } from 'vitest';
import { redisOptionsFromUrl } from './redis-options.js';

describe('redisOptionsFromUrl', () => {
  it('parses host, port and database', () => {
    expect(redisOptionsFromUrl('redis://localhost:6379/2')).toMatchObject({
      host: 'localhost',
      port: 6379,
      db: 2,
    });
  });

  it('parses credentials and TLS', () => {
    const options = redisOptionsFromUrl('rediss://user:p%40ss@cache.example:6380');
    expect(options).toMatchObject({ username: 'user', password: 'p@ss', port: 6380 });
    expect(options.tls).toEqual({});
  });
});
