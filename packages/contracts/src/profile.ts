import {
  bandForSeniority,
  compareSeniority,
  type Seniority,
  type SeniorityBand,
} from './catalog.js';

// Profile rules shared by the API (authoritative) and the web app (instant feedback).
// See docs/product/competitive-identity.md §4 and docs/product/public-profile-and-privacy.md §6.

export const DISPLAY_NAME_LIMITS = { min: 2, max: 32 } as const;
export const STACK_LIMITS = { min: 1, max: 12 } as const;

/** Collapses whitespace and normalizes Unicode (NFC). Every name rule runs on this form. */
export function normalizeDisplayName(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/gu, ' ').trim();
}

export type DisplayNameIssue =
  | 'DISPLAY_NAME_TOO_SHORT'
  | 'DISPLAY_NAME_TOO_LONG'
  | 'DISPLAY_NAME_INVALID_CHARACTERS'
  | 'DISPLAY_NAME_CONTACT_INFO';

// Letters (any script, with combining marks), spaces, apostrophes, hyphens and dots.
const ALLOWED_NAME = /^[\p{L}\p{M} '’.-]+$/u;
const HAS_LETTER = /\p{L}/u;
// "example.com", "ana.dev": a dot followed by letters inside a word reads as a domain.
const DOMAIN_LIKE = /\p{L}\.\p{L}{2,}/u;

/**
 * Structural display-name rules. Names may not carry contact details: digits, `@`, `/` and `:`
 * are outside the allowed characters, so emails, handles, phone numbers and most URLs are
 * rejected there; domain-like words are rejected separately. The API also applies a moderation
 * blocklist, which is not shared with clients.
 */
export function checkDisplayName(normalized: string): DisplayNameIssue | null {
  const length = [...normalized].length;
  if (length < DISPLAY_NAME_LIMITS.min) return 'DISPLAY_NAME_TOO_SHORT';
  if (length > DISPLAY_NAME_LIMITS.max) return 'DISPLAY_NAME_TOO_LONG';
  if (!ALLOWED_NAME.test(normalized) || !HAS_LETTER.test(normalized)) {
    return 'DISPLAY_NAME_INVALID_CHARACTERS';
  }
  if (DOMAIN_LIKE.test(normalized)) return 'DISPLAY_NAME_CONTACT_INFO';
  return null;
}

/** The part of the catalog the profile rules need. `CatalogResponse` satisfies it. */
export interface CatalogRules {
  roles: ReadonlyArray<{
    id: string;
    trackId: string;
    minSeniority?: Seniority | undefined;
    coreCategoryIds: readonly string[];
    allowedCategoryIds: readonly string[];
  }>;
  technologies: ReadonlyArray<{ id: string; categoryId: string }>;
}

export interface ProfileInput {
  seniority: Seniority;
  roleId: string;
  technologyIds: readonly string[];
}

export type ProfileIssue =
  | { code: 'PROFILE_ROLE_UNKNOWN'; params: { roleId: string } }
  | { code: 'PROFILE_SENIORITY_NOT_ALLOWED'; params: { roleId: string; minSeniority: Seniority } }
  | { code: 'PROFILE_STACK_SIZE'; params: { min: number; max: number } }
  | { code: 'PROFILE_TECHNOLOGY_UNKNOWN'; params: { technologyId: string } }
  | { code: 'PROFILE_TECHNOLOGY_INCOMPATIBLE'; params: { technologyId: string; roleId: string } }
  | { code: 'PROFILE_CORE_CATEGORY_MISSING'; params: { categoryId: string; roleId: string } };

/** Removes duplicates, keeping the declared order (it decides which chips are shown first). */
export function normalizeStack(technologyIds: readonly string[]): string[] {
  return [...new Set(technologyIds)];
}

/**
 * Checks a profile against the catalog. Returns every issue, in a stable order (role, seniority,
 * stack size, each technology, core categories), so clients can show them all at once.
 */
export function checkProfile(rules: CatalogRules, input: ProfileInput): ProfileIssue[] {
  const role = rules.roles.find((r) => r.id === input.roleId);
  if (!role) return [{ code: 'PROFILE_ROLE_UNKNOWN', params: { roleId: input.roleId } }];

  const issues: ProfileIssue[] = [];
  if (role.minSeniority && compareSeniority(input.seniority, role.minSeniority) < 0) {
    issues.push({
      code: 'PROFILE_SENIORITY_NOT_ALLOWED',
      params: { roleId: role.id, minSeniority: role.minSeniority },
    });
  }

  const stack = normalizeStack(input.technologyIds);
  if (stack.length < STACK_LIMITS.min || stack.length > STACK_LIMITS.max) {
    issues.push({ code: 'PROFILE_STACK_SIZE', params: { ...STACK_LIMITS } });
  }

  const allowed = new Set([...role.coreCategoryIds, ...role.allowedCategoryIds]);
  const categoryOf = new Map(rules.technologies.map((t) => [t.id, t.categoryId]));
  const covered = new Set<string>();
  for (const technologyId of stack) {
    const categoryId = categoryOf.get(technologyId);
    if (categoryId === undefined) {
      issues.push({ code: 'PROFILE_TECHNOLOGY_UNKNOWN', params: { technologyId } });
    } else if (!allowed.has(categoryId)) {
      issues.push({
        code: 'PROFILE_TECHNOLOGY_INCOMPATIBLE',
        params: { technologyId, roleId: role.id },
      });
    } else {
      covered.add(categoryId);
    }
  }

  for (const categoryId of role.coreCategoryIds) {
    if (!covered.has(categoryId)) {
      issues.push({
        code: 'PROFILE_CORE_CATEGORY_MISSING',
        params: { categoryId, roleId: role.id },
      });
    }
  }
  return issues;
}

/** The competitive category: track × seniority band (e.g. `fullstack:senior_plus`). */
export interface CompetingCategory {
  key: string;
  trackId: string;
  band: SeniorityBand;
}

export function competingCategory(trackId: string, seniority: Seniority): CompetingCategory {
  const band = bandForSeniority(seniority);
  return { key: `${trackId}:${band}`, trackId, band };
}
