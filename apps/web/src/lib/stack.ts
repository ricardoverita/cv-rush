import type { CatalogResponse } from '@cv-rush/contracts';

type Technology = CatalogResponse['technologies'][number];
type Role = CatalogResponse['roles'][number];

/** Lowercase, without diacritics or punctuation: "Node.js" → "nodejs", "PostgreSQL" → "postgresql". */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]/gu, '');
}

/** Technologies a role accepts: its core categories first, then the allowed ones. */
export function technologiesForRole(catalog: CatalogResponse, role: Role): Technology[] {
  const order = [...role.coreCategoryIds, ...role.allowedCategoryIds];
  return catalog.technologies
    .filter((t) => order.includes(t.categoryId))
    .sort((a, b) => order.indexOf(a.categoryId) - order.indexOf(b.categoryId));
}

/**
 * Matches names and aliases ("k8s" → Kubernetes, "postgres" → PostgreSQL). Prefix matches rank
 * before substring matches; the catalog order breaks ties.
 */
export function searchTechnologies(technologies: Technology[], query: string): Technology[] {
  const q = fold(query);
  if (!q) return [];
  const rank = (t: Technology): number => {
    const terms = [t.name, t.id, ...t.aliases].map(fold);
    if (terms.some((term) => term.startsWith(q))) return 0;
    if (terms.some((term) => term.includes(q))) return 1;
    return 2;
  };
  return technologies
    .map((t, index) => ({ t, index, rank: rank(t) }))
    .filter((entry) => entry.rank < 2)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.t);
}

/** Up to `max` names in declared order, plus how many are left out (shown as "+N"). */
export function stackChips(
  catalog: CatalogResponse,
  technologyIds: readonly string[],
  max = 5,
): { names: string[]; more: number } {
  const byId = new Map(catalog.technologies.map((t) => [t.id, t.name]));
  const names = technologyIds.map((id) => byId.get(id) ?? id);
  return { names: names.slice(0, max), more: Math.max(0, names.length - max) };
}
