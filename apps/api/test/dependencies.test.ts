import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

function versionOf(pkg: string, from = require): string {
  return (from(`${pkg}/package.json`) as { version: string }).version;
}

describe('runtime dependencies', () => {
  // @nestjs/platform-fastify pins its own fastify. Unless the workspace override is kept in sync,
  // a security bump of our fastify dependency never reaches the server that actually runs.
  it('runs the HTTP server on the same fastify version the API depends on', () => {
    const nestRequire = createRequire(require.resolve('@nestjs/platform-fastify/package.json'));
    expect(versionOf('fastify', nestRequire)).toBe(versionOf('fastify'));
  });
});
