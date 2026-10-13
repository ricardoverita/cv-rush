/**
 * Seeded pseudo-random number generation.
 *
 * The server derives seeds from secrets it never shares; this module only turns a seed
 * into a reproducible sequence, so the same seed always yields the same job posting,
 * question order, ATS stream or bot behavior (useful for audits and tests).
 * It is NOT cryptographically secure and must never be used to create secrets.
 */

export interface SeededRng {
  /** A float in [0, 1). */
  next(): number;
  /** An integer in [min, max] (inclusive). */
  int(min: number, max: number): number;
  /** One element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** A shuffled copy of the array (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[];
}

/** cyrb128: hashes a string into four 32-bit seeds. */
function cyrb128(input: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < input.length; i++) {
    const k = input.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/** sfc32: a small, fast PRNG with good statistical quality for games. */
function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function createRng(seed: string): SeededRng {
  const next = sfc32(...cyrb128(seed));
  // Discard the first outputs to decorrelate similar seeds.
  for (let i = 0; i < 15; i++) next();

  const int = (min: number, max: number): number => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`Invalid integer range [${min}, ${max}]`);
    }
    return min + Math.floor(next() * (max - min + 1));
  };

  return {
    next,
    int,
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new RangeError('Cannot pick from an empty array');
      return items[int(0, items.length - 1)] as T;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const result = [...items];
      for (let i = result.length - 1; i > 0; i--) {
        const j = int(0, i);
        [result[i], result[j]] = [result[j] as T, result[i] as T];
      }
      return result;
    },
  };
}

/** Derives a purpose-specific seed string, e.g. deriveSeed(sessionSeed, 'q:R1'). */
export function deriveSeed(seed: string, purpose: string): string {
  return `${seed}:${purpose}`;
}
