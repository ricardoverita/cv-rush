import type { Ruleset } from '@cv-rush/content';
import type { SeededRng } from '@cv-rush/simulation';

// The ATS 9000 as a rule (docs/game-design/challenges/ats-scan.md). S2 presents it as a list of
// keywords; S4 turns the same rule into the conveyor belt. Relevance never leaves the server.

const BUZZWORDS = ['Synergy', 'Rockstar', 'Ninja', '10x', 'Guru', 'Disruptive'];

export interface AtsToken {
  id: string;
  label: string;
  relevant: boolean;
}

export interface AtsCatalog {
  technologies: { id: string; name: string; category: string; aliases?: string[] }[];
  roleCategories: string[];
}

/**
 * Relevant tokens are the posting's required technologies (sometimes shown by an alias, e.g.
 * "Postgres"). Irrelevant tokens: one technology of the role that the posting didn't mention,
 * others from unrelated categories, and buzzword traps. Nice-to-have technologies are never
 * tokens: they are in the posting, so they can't be traps, and they aren't requirements.
 */
export function generateAtsTokens(
  postingTechnologyIds: readonly string[],
  catalog: AtsCatalog,
  ats: Ruleset['ats'],
  rng: SeededRng,
  neverShownIds: readonly string[] = [],
): AtsToken[] {
  const byId = new Map(catalog.technologies.map((t) => [t.id, t]));
  const label = (id: string) => {
    const tech = byId.get(id);
    if (!tech) return id;
    const aliases = (tech.aliases ?? []).filter((a) => /^[a-z]/i.test(a) && a.length > 2);
    return aliases.length > 0 && rng.next() < 0.3 ? capitalize(rng.pick(aliases)) : tech.name;
  };
  const inPosting = new Set([...postingTechnologyIds, ...neverShownIds]);
  const roleCategories = new Set(catalog.roleCategories);
  const sameRole = rng.shuffle(
    catalog.technologies.filter((t) => roleCategories.has(t.category) && !inPosting.has(t.id)),
  );
  const unrelated = rng.shuffle(
    catalog.technologies.filter((t) => !roleCategories.has(t.category)),
  );
  const irrelevantTechs = [...sameRole.slice(0, 1), ...unrelated].slice(
    0,
    ats.irrelevantTechnologies,
  );

  const entries = [
    ...postingTechnologyIds.map((id) => ({ label: label(id), relevant: true })),
    ...irrelevantTechs.map((t) => ({ label: t.name, relevant: false })),
    ...rng
      .shuffle(BUZZWORDS)
      .slice(0, ats.buzzwords)
      .map((w) => ({ label: w, relevant: false })),
  ];
  return rng.shuffle(entries).map((entry, i) => ({ id: `t${i + 1}`, ...entry }));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface AtsResult {
  match: number;
  passed: boolean;
  relevantCollected: number;
  relevantTotal: number;
  irrelevantCollected: number;
  cvDamage: number;
}

/**
 * match = clamp(recruiterBonus + 100 × relevantCollected / relevantTotal − penalty × irrelevant,
 * 0, 100). Unknown token ids are ignored; duplicates count once.
 */
export function scoreAts(
  tokens: readonly AtsToken[],
  selectedIds: readonly string[],
  recruiterCorrect: number,
  ruleset: Ruleset,
): AtsResult {
  const selected = new Set(selectedIds);
  const picked = tokens.filter((t) => selected.has(t.id));
  const relevantTotal = tokens.filter((t) => t.relevant).length;
  const relevantCollected = picked.filter((t) => t.relevant).length;
  const irrelevantCollected = picked.length - relevantCollected;
  const { ats, cvHealth } = ruleset;
  const raw =
    ats.recruiterBonusPerCorrect * recruiterCorrect +
    (relevantTotal === 0 ? 0 : (100 * relevantCollected) / relevantTotal) -
    ats.penaltyPerIrrelevant * irrelevantCollected;
  const match = Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10;
  return {
    match,
    passed: match >= ats.threshold,
    relevantCollected,
    relevantTotal,
    irrelevantCollected,
    cvDamage: Math.min(
      cvHealth.damage.atsCap,
      irrelevantCollected * cvHealth.damage.atsIrrelevantKeyword,
    ),
  };
}
