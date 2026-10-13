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
  technologyIds: string[];
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
const STACK_MIN = 6;
const STACK_MAX = 8;
const MAX_RESPONSIBILITIES_FROM_STACK = 4;

/**
 * The posting's stack: mostly the developer's own technologies, always covering the role's core
 * categories, topped up with technologies recommended for the role (never from other roles).
 */
export function postingStack(profile: PostingProfile, catalog: Catalog, rng: SeededRng): string[] {
  const role = catalog.roles.find((r) => r.id === profile.roleId);
  if (!role) throw new Error(`Unknown role ${profile.roleId}`);
  const categoryOf = new Map(catalog.technologies.map((t) => [t.id, t.category]));
  const own = [...profile.technologyIds];
  const target = Math.min(STACK_MAX, Math.max(STACK_MIN, own.length));

  const chosen: string[] = [];
  if (own.length <= STACK_MAX) {
    chosen.push(...own);
  } else {
    // One technology per core category first, then the rest of the developer's stack.
    for (const category of role.coreCategories) {
      const options = own.filter((t) => categoryOf.get(t) === category && !chosen.includes(t));
      if (options.length > 0) chosen.push(rng.pick(options));
    }
    for (const t of rng.shuffle(own.filter((t) => !chosen.includes(t)))) {
      if (chosen.length >= target) break;
      chosen.push(t);
    }
    chosen.sort((a, b) => own.indexOf(a) - own.indexOf(b));
  }
  const allowed = new Set([...role.coreCategories, ...role.allowedCategories]);
  const extras = rng.shuffle(
    role.recommended.filter((t) => !chosen.includes(t) && allowed.has(categoryOf.get(t) ?? '')),
  );
  while (chosen.length < target && extras.length > 0) chosen.push(extras.shift() as string);
  return chosen;
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

  const technologyIds = postingStack(profile, catalog, rng);
  const techById = new Map(catalog.technologies.map((t) => [t.id, t]));

  // Responsibilities: one per technology category in the posting, then general ones.
  const byCategory = new Map<string, string>();
  for (const id of technologyIds) {
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
    technologyIds,
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
