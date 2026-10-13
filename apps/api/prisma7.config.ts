import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Load the repository's root .env when present (Prisma does not load .env files by itself).
const rootEnv = new URL('../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

// Local development works without a .env file: these defaults match compose.yaml.
const DEV_DATABASE_URL = 'postgresql://cvrush:cvrush@localhost:5432/cvrush';

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEV_DATABASE_URL,
  },
});
