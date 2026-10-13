import type { SeededRng } from '@cv-rush/simulation';

// Pure selection rules (docs/architecture/09 §3). The engine gathers candidates per context
// group; these functions decide which one is served and in which option order.

export const OPTION_ALIASES = ['a', 'b', 'c', 'd'] as const;
export type OptionAlias = (typeof OPTION_ALIASES)[number];

export type PoolSlotKind = 'stack' | 'track_fundamentals' | 'seniority' | 'mixed_scenario';

export interface PoolProfile {
  trackId: string;
  band: string;
  technologyIds: readonly string[];
}

const TIER_RANK: Record<string, number> = {
  curated: 4,
  human_reviewed: 3,
  ai_validated: 2,
  ai_generated: 1,
  sample: 0,
};

/**
 * Context groups to try, in order: the slot's own pools (as one group), then fallbacks.
 * Stack slots only use technologies the developer declared AND the posting includes, so
 * technical questions never leave the developer's topic boundaries.
 */
export function contextGroups(
  kind: PoolSlotKind,
  level: number,
  profile: PoolProfile,
  postingTechnologyIds: readonly string[],
): string[][] {
  const techs = profile.technologyIds
    .filter((t) => postingTechnologyIds.includes(t))
    .map((t) => `tech:${t}:${level}`);
  const track = `track:${profile.trackId}:${level}`;
  const band = `band:${profile.band}:${level}`;
  const primary: Record<PoolSlotKind, string[]> = {
    stack: techs,
    track_fundamentals: [track],
    seniority: [band],
    mixed_scenario: [band, ...techs],
  };
  const fallbacks = [track, band, `general:${level}`];
  if (level > 1) fallbacks.push(`general:${level - 1}`);
  const groups = [primary[kind], ...fallbacks.map((key) => [key])];
  const seen = new Set<string>();
  return groups
    .map((group) => group.filter((key) => !seen.has(key) && (seen.add(key), true)))
    .filter((group) => group.length > 0);
}

export interface Candidate {
  questionId: string;
  versionId: string;
  contextKey: string;
  tier: string;
  seenByDeveloper: boolean;
}

/** Never-seen questions first, then the highest verification tier, then a seeded pick. */
export function pickCandidate(candidates: Candidate[], rng: SeededRng): Candidate | undefined {
  if (candidates.length === 0) return undefined;
  const unseen = candidates.filter((c) => !c.seenByDeveloper);
  const pool = unseen.length > 0 ? unseen : candidates;
  const bestTier = Math.max(...pool.map((c) => TIER_RANK[c.tier] ?? 0));
  const best = pool
    .filter((c) => (TIER_RANK[c.tier] ?? 0) === bestTier)
    .sort((a, b) => a.questionId.localeCompare(b.questionId));
  return rng.pick(best);
}

/**
 * Seeded option order. Returns the question's own option ids in display order; the client only
 * sees the per-attempt aliases a–d, so the same question never exposes stable option ids.
 */
export function shuffleOptions(optionIds: readonly string[], rng: SeededRng): string[] {
  return rng.shuffle(optionIds);
}
