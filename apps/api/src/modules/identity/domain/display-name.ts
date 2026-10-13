import { checkDisplayName, DISPLAY_NAME_LIMITS, normalizeDisplayName } from '@cv-rush/contracts';
import type { ErrorCode } from '@cv-rush/contracts';
import { isBlockedDisplayName } from './name-blocklist.js';

export type DisplayNameResult =
  { ok: true; value: string } | { ok: false; code: ErrorCode; params?: Record<string, unknown> };

/**
 * The shared structural rules plus server-side moderation. A blocked name gets a neutral code
 * that never reveals which term matched.
 */
export function validateDisplayName(raw: string): DisplayNameResult {
  const value = normalizeDisplayName(raw);
  const issue = checkDisplayName(value);
  if (issue === 'DISPLAY_NAME_TOO_SHORT') {
    return { ok: false, code: issue, params: { min: DISPLAY_NAME_LIMITS.min } };
  }
  if (issue === 'DISPLAY_NAME_TOO_LONG') {
    return { ok: false, code: issue, params: { max: DISPLAY_NAME_LIMITS.max } };
  }
  if (issue) return { ok: false, code: issue };
  if (isBlockedDisplayName(value)) return { ok: false, code: 'DISPLAY_NAME_NOT_ALLOWED' };
  return { ok: true, value };
}
