import { describe, expect, it } from 'vitest';
import { compareCatalogs, flatten, placeholders } from './validation.js';

describe('placeholders', () => {
  it('extracts top-level ICU arguments only', () => {
    expect(placeholders('Hi {name}!')).toEqual(['name']);
    expect(placeholders('{count, plural, one {# point} other {# points}} for {name}')).toEqual([
      'count',
      'name',
    ]);
    expect(placeholders('No arguments')).toEqual([]);
  });
});

describe('compareCatalogs', () => {
  const context = { locale: 'es', namespace: 'common' };

  it('accepts matching catalogs', () => {
    expect(
      compareCatalogs({ a: { b: 'Hi {name}' } }, { a: { b: 'Hola {name}' } }, context),
    ).toEqual([]);
  });

  it('reports missing, extra and empty keys', () => {
    const issues = compareCatalogs({ a: 'x', b: 'y' }, { a: '', c: 'z' }, context);
    expect(issues.map((i) => i.code).sort()).toEqual(['EMPTY_MESSAGE', 'EXTRA_KEY', 'MISSING_KEY']);
  });

  it('reports placeholder mismatches', () => {
    const issues = compareCatalogs({ a: 'Wait {seconds}s' }, { a: 'Espera {segundos}s' }, context);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe('PLACEHOLDER_MISMATCH');
  });

  it('flattens nested trees into dotted keys', () => {
    expect(flatten({ a: { b: { c: 'x' } }, d: 'y' })).toEqual({ 'a.b.c': 'x', d: 'y' });
  });
});
