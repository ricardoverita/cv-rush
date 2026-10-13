import { defineConfig } from 'vitest/config';
import { swcPlugin } from './vitest.config.js';

// Integration tests need PostgreSQL and Redis (docker compose up -d --wait, then pnpm db:migrate && pnpm db:seed).
export default defineConfig({
  plugins: [swcPlugin],
  test: {
    include: ['test/**/*.int.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
