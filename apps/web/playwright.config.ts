import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

/**
 * End-to-end smoke of the main journey, against the production builds of the API and the web
 * app (run `pnpm build` first; PostgreSQL and Redis must be up, migrated and seeded).
 * Uses the installed Google Chrome (`channel: 'chrome'`), so no browser download is needed.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure', locale: 'en-US' },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'], channel: 'chrome' } }],
  webServer: [
    {
      command: 'pnpm --filter @cv-rush/api start',
      cwd: '../..',
      url: 'http://localhost:4000/api/ready',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'pnpm --filter @cv-rush/web start',
      cwd: '../..',
      url: `${baseURL}/en`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
