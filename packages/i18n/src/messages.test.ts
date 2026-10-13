import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ERROR_CODES } from '@cv-rush/contracts';
import { describe, expect, it } from 'vitest';
import { FALLBACK_LOCALE } from './catalogs.js';

const messagesDir = fileURLToPath(new URL('../messages/', import.meta.url));

describe('error messages', () => {
  // Other locales are checked against the fallback by `pnpm translations:validate`.
  it('translates every API error code', () => {
    const errors = JSON.parse(
      readFileSync(`${messagesDir}${FALLBACK_LOCALE}/errors.json`, 'utf8'),
    ) as Record<string, string>;
    expect(ERROR_CODES.filter((code) => !errors[code])).toEqual([]);
  });
});
