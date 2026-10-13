// @ts-check
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Packages must never import apps (dependency direction: apps → packages). */
const noAppImports = {
  group: ['@cv-rush/web', '@cv-rush/api', '**/apps/*/**'],
  message: 'Packages must not depend on apps.',
};

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
    '**/next-env.d.ts',
    'apps/api/src/generated/**',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // design-lab/: throwaway decision prototypes (S2.5), plain browser scripts. Never imported by
  // the apps; its capture tool runs on Node.
  {
    files: ['design-lab/**/*.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.browser } },
  },

  // Next.js rules, scoped to the web app.
  ...nextVitals.map((config) => ({ ...config, files: ['apps/web/**/*.{js,jsx,ts,tsx}'] })),
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    settings: { next: { rootDir: 'apps/web' } },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  // ---- Architecture boundaries (see docs/architecture/02-monorepo.md) ----
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@cv-rush/api', '**/apps/api/**'],
              message:
                'The web app talks to the API over HTTP only; business rules live in apps/api.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [noAppImports] }] },
  },
  {
    files: ['packages/game/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom', 'next'],
          patterns: [
            noAppImports,
            {
              group: ['react/*', 'react-dom/*', 'next/*'],
              message: 'The game engine must stay framework-agnostic.',
            },
            {
              group: ['@cv-rush/i18n'],
              message: 'The game receives a translator from its host; it never loads catalogs.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/simulation/src/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.\\.?/)',
              message: 'simulation must stay dependency-free (pure, deterministic code).',
            },
          ],
        },
      ],
    },
  },
]);
