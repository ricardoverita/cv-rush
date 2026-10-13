import { describe, expect, it } from 'vitest';
import { generateDeviceToken, hashDeviceToken, isWellFormedDeviceToken } from './device-token.js';
import { validateDisplayName } from './display-name.js';

describe('validateDisplayName', () => {
  it('returns the normalized name', () => {
    expect(validateDisplayName('  Ricardo   Vera ')).toEqual({ ok: true, value: 'Ricardo Vera' });
  });

  it('reports structural issues with their limits', () => {
    expect(validateDisplayName('R')).toEqual({
      ok: false,
      code: 'DISPLAY_NAME_TOO_SHORT',
      params: { min: 2 },
    });
    expect(validateDisplayName('ricardo@example.com')).toMatchObject({
      code: 'DISPLAY_NAME_INVALID_CHARACTERS',
    });
  });

  it.each(['Admin', 'CV Rush', 'Anonymous Candidate', 'Candidato Anónimo', 'Pútá', 'xFUCKx'])(
    'blocks %s with a neutral code',
    (name) => {
      expect(validateDisplayName(name)).toEqual({ ok: false, code: 'DISPLAY_NAME_NOT_ALLOWED' });
    },
  );

  it.each(['Cassandra', 'Dickens', 'Hancock', 'Moderato', 'Marisa'])(
    'does not block innocent names that contain a short term (%s)',
    (name) => {
      expect(validateDisplayName(name).ok).toBe(true);
    },
  );
});

describe('device tokens', () => {
  it('are 32 random bytes in base64url, different every time', () => {
    const a = generateDeviceToken();
    const b = generateDeviceToken();
    expect(isWellFormedDeviceToken(a)).toBe(true);
    expect(Buffer.from(a, 'base64url')).toHaveLength(32);
    expect(a).not.toBe(b);
  });

  it('are stored as a SHA-256 digest', () => {
    const token = generateDeviceToken();
    const digest = hashDeviceToken(token);
    expect(digest).toHaveLength(32);
    expect(hashDeviceToken(token)).toEqual(digest);
    expect(Buffer.from(digest).toString('base64url')).not.toBe(token);
  });

  it('rejects malformed values before any lookup', () => {
    expect(isWellFormedDeviceToken('')).toBe(false);
    expect(isWellFormedDeviceToken('a'.repeat(42))).toBe(false);
    expect(isWellFormedDeviceToken(`${'a'.repeat(42)}=`)).toBe(false);
    expect(isWellFormedDeviceToken("' OR 1=1 --")).toBe(false);
  });
});
