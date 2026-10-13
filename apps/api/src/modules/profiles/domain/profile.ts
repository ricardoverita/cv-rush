import {
  type CatalogRules,
  checkProfile,
  type CompetingCategory,
  competingCategory,
  normalizeStack,
  type ProfileInput,
  type ProfileIssue,
  type Seniority,
} from '@cv-rush/contracts';

export interface Profile {
  seniority: Seniority;
  roleId: string;
  technologyIds: string[];
}

export type ProfileResult = { ok: true; profile: Profile } | { ok: false; issue: ProfileIssue };

/**
 * Applies the shared profile rules (packages/contracts) to client input. The stack is
 * de-duplicated first; the declared order is kept because it decides which chips show first.
 */
export function validateProfile(rules: CatalogRules, input: ProfileInput): ProfileResult {
  const profile: Profile = {
    seniority: input.seniority,
    roleId: input.roleId,
    technologyIds: normalizeStack(input.technologyIds),
  };
  const [issue] = checkProfile(rules, profile);
  return issue ? { ok: false, issue } : { ok: true, profile };
}

/** The category a profile competes in. The role must exist (validated profiles only). */
export function categoryOf(rules: CatalogRules, profile: Profile): CompetingCategory {
  const role = rules.roles.find((r) => r.id === profile.roleId);
  if (!role) throw new Error(`Unknown role in a stored profile: ${profile.roleId}`);
  return competingCategory(role.trackId, profile.seniority);
}
