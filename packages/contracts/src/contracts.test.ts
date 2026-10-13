import { describe, expect, it } from 'vitest';
import {
  bandForSeniority,
  compareSeniority,
  ErrorEnvelopeSchema,
  HealthResponseSchema,
  isLocale,
  ReadyResponseSchema,
} from './index.js';

describe('locales', () => {
  it('accepts supported locales only', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});

describe('seniority bands', () => {
  it('groups seniorities into Junior, Mid and Senior+', () => {
    expect(bandForSeniority('trainee')).toBe('junior');
    expect(bandForSeniority('junior')).toBe('junior');
    expect(bandForSeniority('mid')).toBe('mid');
    expect(bandForSeniority('principal')).toBe('senior_plus');
  });

  it('orders seniorities', () => {
    expect(compareSeniority('junior', 'senior')).toBeLessThan(0);
    expect(compareSeniority('staff', 'lead')).toBeGreaterThan(0);
  });
});

describe('API schemas', () => {
  it('validates a health response', () => {
    const parsed = HealthResponseSchema.parse({
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      time: new Date().toISOString(),
    });
    expect(parsed.status).toBe('ok');
  });

  it('rejects an unknown dependency status', () => {
    const result = ReadyResponseSchema.safeParse({
      status: 'ready',
      checks: { database: 'maybe', redis: 'up' },
    });
    expect(result.success).toBe(false);
  });

  it('only allows known error codes', () => {
    expect(ErrorEnvelopeSchema.safeParse({ error: { code: 'NOT_FOUND' } }).success).toBe(true);
    expect(ErrorEnvelopeSchema.safeParse({ error: { code: 'Something went wrong' } }).success).toBe(
      false,
    );
  });
});
