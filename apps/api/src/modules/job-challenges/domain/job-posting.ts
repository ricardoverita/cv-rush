import type { Locale, Seniority } from '@cv-rush/contracts';
import { SUPPORTED_LOCALES } from '@cv-rush/contracts';
import type { Catalog, JobsContent } from '@cv-rush/content';
import type { SeededRng } from '@cv-rush/simulation';

// Job posting generation (docs/game-design/job-generation.md, docs/architecture/08 §3).
// Deterministic: the same snapshot, seed and content produce the same posting. Facts are
// language-independent; texts are rendered from authored fragments per locale.

export interface PostingProfile {
  seniority: Seniority;
  roleId: string;
  trackId: string;
  technologyIds: readonly string[];
}

export interface JobFacts {
  company: { name: string; sectorId: string };
  seniority: Seniority;
  roleId: string;
  trackId: string;
  locationId: string;
  workMode: 'onsite' | 'hybrid' | 'remote';
  salary: { currency: string; min: number; max: number };
  experienceYears: number;
  /** Always a subset of the developer's own stack: the posting never requires anything else. */
  requiredTechnologyIds: string[];
  /**
   * Related technologies the developer didn't select, shown as "nice to have" for realism. They
   * never produce technical questions, never count in the ATS and never change the snapshot.
   */
  niceToHaveTechnologyIds: string[];
  perkIds: string[];
}

export interface JobTexts {
  sector: string;
  location: string;
  workMode: string;
  summary: string;
  responsibilities: string[];
  experience: string;
  perks: string[];
}

export interface GeneratedPosting {
  facts: JobFacts;
  texts: Record<Locale, JobTexts>;
}

const SENIOR_PLUS: readonly Seniority[] = ['senior', 'lead', 'staff', 'principal'];
const REQUIRED_MAX = 8;
const NICE_TO_HAVE_MAX = 2;
const MAX_RESPONSIBILITIES_FROM_STACK = 4;

/**
 * The posting's technologies (docs/game-design/job-generation.md §3, decision D-086).
 * Required: the developer's own stack (up to 8, covering the role's core categories). Nice to
 * have: occasionally 1–2 technologies recommended for the role that the developer didn't select.
 */
export function postingStack(
  profile: PostingProfile,
  catalog: Catalog,
  rng: SeededRng,
): { required: string[]; niceToHave: string[] } {
  const role = catalog.roles.find((r) => r.id === profile.roleId);
  if (!role) throw new Error(`Unknown role ${profile.roleId}`);
  const categoryOf = new Map(catalog.technologies.map((t) => [t.id, t.category]));
  const own = [...profile.technologyIds];

  const required: string[] = [];
  if (own.length <= REQUIRED_MAX) {
    required.push(...own);
  } else {
    // One technology per core category first, then the rest of the developer's stack.
    for (const category of role.coreCategories) {
      const options = own.filter((t) => categoryOf.get(t) === category && !required.includes(t));
      if (options.length > 0) required.push(rng.pick(options));
    }
    for (const t of rng.shuffle(own.filter((t) => !required.includes(t)))) {
      if (required.length >= REQUIRED_MAX) break;
      required.push(t);
    }
    required.sort((a, b) => own.indexOf(a) - own.indexOf(b));
  }

  const allowed = new Set([...role.coreCategories, ...role.allowedCategories]);
  const related = rng.shuffle(
    role.recommended.filter((t) => !own.includes(t) && allowed.has(categoryOf.get(t) ?? '')),
  );
  const niceToHave = related.slice(0, rng.int(0, NICE_TO_HAVE_MAX));
  return { required, niceToHave };
}

/** Postings stored before D-086 had a single `technologyIds` list: read it as required. */
export function postingTechnologies(facts: JobFacts): { required: string[]; niceToHave: string[] } {
  const legacy = (facts as JobFacts & { technologyIds?: string[] }).technologyIds;
  return {
    required: facts.requiredTechnologyIds ?? legacy ?? [],
    niceToHave: facts.niceToHaveTechnologyIds ?? [],
  };
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export function generatePosting(
  profile: PostingProfile,
  catalog: Catalog,
  content: JobsContent,
  rng: SeededRng,
): GeneratedPosting {
  const { companies, locations, salaryBands, fragments } = content;

  const sector = rng.pick(companies.sectors);
  let name = '';
  for (let tries = 0; tries < 20; tries++) {
    name = `${rng.pick(companies.nameParts)} ${rng.pick(sector.suffixes)}`;
    if (!companies.blockedNames.includes(name)) break;
  }
  const location = rng.pick(locations.locations);
  const workMode = rng.pick(location.modes);
  const tier = locations.tiers.find((t) => t.id === location.tier);
  const band = salaryBands.bands[location.tier]?.[profile.seniority];
  if (!tier || !band) throw new Error(`No salary band for ${location.tier}/${profile.seniority}`);

  const stack = postingStack(profile, catalog, rng);
  const techById = new Map(catalog.technologies.map((t) => [t.id, t]));

  // Responsibilities: one per category of the required stack, then general ones.
  const byCategory = new Map<string, string>();
  for (const id of stack.required) {
    const category = techById.get(id)?.category;
    if (category && !byCategory.has(category)) byCategory.set(category, id);
  }
  const stackResponsibilities = [...byCategory.entries()].slice(0, MAX_RESPONSIBILITIES_FROM_STACK);
  const general = rng.pick(fragments.generalResponsibilities);
  const senior = SENIOR_PLUS.includes(profile.seniority)
    ? rng.pick(fragments.seniorResponsibilities)
    : undefined;

  // Three perks, at most one satirical.
  const serious = rng.shuffle(fragments.perks.filter((p) => !p.satirical));
  const satirical = rng.shuffle(fragments.perks.filter((p) => p.satirical));
  const perks = [
    ...serious.slice(0, 2),
    ...(satirical.length > 0 ? satirical.slice(0, 1) : serious.slice(2, 3)),
  ];

  const experience = fragments.experience[profile.seniority];
  const facts: JobFacts = {
    company: { name, sectorId: sector.id },
    seniority: profile.seniority,
    roleId: profile.roleId,
    trackId: profile.trackId,
    locationId: location.id,
    workMode,
    salary: { currency: tier.currency, min: band.min, max: band.max },
    experienceYears: experience.years,
    requiredTechnologyIds: stack.required,
    niceToHaveTechnologyIds: stack.niceToHave,
    perkIds: perks.map((p) => p.id),
  };

  const texts = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale): [Locale, JobTexts] => [
      locale,
      {
        sector: sector.labels[locale],
        location: location.labels[locale],
        workMode: locations.workModes[workMode][locale],
        summary: sector.summary[locale],
        responsibilities: [
          ...stackResponsibilities.map(([category, techId]) =>
            fill(fragments.responsibilities[category]?.[locale] ?? '', {
              tech: techById.get(techId)?.name ?? techId,
            }),
          ),
          general[locale],
          ...(senior ? [senior[locale]] : []),
        ],
        experience: experience[locale],
        perks: perks.map((p) => p[locale]),
      },
    ]),
  ) as Record<Locale, JobTexts>;

  return { facts, texts };
}
