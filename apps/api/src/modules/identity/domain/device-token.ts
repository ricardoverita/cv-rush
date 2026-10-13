import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;
// 32 bytes in base64url without padding.
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

/** A device credential: 32 random bytes from a CSPRNG, base64url-encoded (docs/architecture/06 §2). */
export function generateDeviceToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

/**
 * Only this digest is stored. The token has 256 bits of entropy, so a fast hash is enough:
 * there is nothing to brute-force, unlike a password.
 */
export function hashDeviceToken(token: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(createHash('sha256').update(token, 'utf8').digest());
}

export function isWellFormedDeviceToken(value: string): boolean {
  return TOKEN_FORMAT.test(value);
}
