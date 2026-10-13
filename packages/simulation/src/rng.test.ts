import { describe, expect, it } from 'vitest';
import { createRng, deriveSeed } from './index.js';

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng('session-123');
    const b = createRng('session-123');
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng('session-123');
    const b = createRng('session-124');
    expect(a.next()).not.toEqual(b.next());
  });

  it('keeps floats in [0, 1) and integers within bounds', () => {
    const rng = createRng('bounds');
    for (let i = 0; i < 1000; i++) {
      const f = rng.next();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
      const n = rng.int(1, 4);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(4);
    }
  });

  it('shuffles into a permutation without mutating the input', () => {
    const input = ['a', 'b', 'c', 'd'] as const;
    const shuffled = createRng('shuffle').shuffle(input);
    expect([...shuffled].sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(input).toEqual(['a', 'b', 'c', 'd']);
  });

  it('rejects invalid ranges and empty picks', () => {
    const rng = createRng('errors');
    expect(() => rng.int(5, 1)).toThrow(RangeError);
    expect(() => rng.pick([])).toThrow(RangeError);
  });

  it('derives purpose-specific seeds', () => {
    const base = 'seed';
    expect(deriveSeed(base, 'q:R1')).not.toEqual(deriveSeed(base, 'q:R2'));
    expect(createRng(deriveSeed(base, 'q:R1')).next()).not.toEqual(
      createRng(deriveSeed(base, 'q:R2')).next(),
    );
  });
});
