import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

describe('loadEnv', () => {
  it('uses local defaults in development', () => {
    const env = loadEnv({});
    expect(env.NODE_ENV).toBe('development');
    expect(env.API_PORT).toBe(4000);
    expect(env.DATABASE_URL).toMatch(/^postgresql:\/\//);
    expect(env.QUESTION_GENERATION_PROVIDER).toBe('fake');
  });

  it('requires explicit URLs in production', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow(/DATABASE_URL/);
  });

  it('accepts explicit production configuration', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      PUBLIC_BASE_URL: 'https://cvrush.example',
      DATABASE_URL: 'postgres://u:p@db:5432/app',
      REDIS_URL: 'rediss://cache:6380',
      API_PORT: '8080',
    });
    expect(env.API_PORT).toBe(8080);
  });

  it('requires an https public origin in production', () => {
    expect(() =>
      loadEnv({
        NODE_ENV: 'production',
        PUBLIC_BASE_URL: 'http://cvrush.example',
        DATABASE_URL: 'postgres://u:p@db:5432/app',
        REDIS_URL: 'rediss://cache:6380',
      }),
    ).toThrow(/PUBLIC_BASE_URL/);
  });

  it('rejects invalid values', () => {
    expect(() => loadEnv({ API_PORT: 'not-a-port' })).toThrow(/API_PORT/);
    expect(() => loadEnv({ REDIS_URL: 'http://localhost:6379' })).toThrow(/REDIS_URL/);
    expect(() => loadEnv({ QUESTION_GENERATION_PROVIDER: 'unknown' })).toThrow();
  });
});
