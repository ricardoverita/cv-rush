import type { Locale } from '@cv-rush/contracts';
import { SENIORITIES } from '@cv-rush/contracts';
import type { Catalog, JobsContent } from '@cv-rush/content';
import type { SeededRng } from '@cv-rush/simulation';
import type { GeneratedPosting } from './job-posting.js';

// Questions built from the posting's facts (docs/architecture/09 §7): job memory for R1–R2 and
// the graded salary question for R3. The answer key is the posting, which the player has read.

export const JOB_MEMORY_TEMPLATES = [
  'location',
  'experience',
  'missing_technology',
  'included_technology',
  'perk',
] as const;
export type JobMemoryTemplate = (typeof JOB_MEMORY_TEMPLATES)[number];
export type SalaryGrade = 'aligned' | 'undersell' | 'vague' | 'out_of_range';

const ALIASES = ['a', 'b', 'c', 'd'] as const;
type Alias = (typeof ALIASES)[number];

export interface PresentedQuestion {
  templateId: string;
  prompt: string;
  options: { id: Alias; text: string }[];
  answerKey: { correct: Alias } | { grades: Record<Alias, SalaryGrade> };
  explanation: string;
}

export interface TemplateContext {
  posting: GeneratedPosting;
  catalog: Catalog;
  content: JobsContent;
  /** The developer's own stack (the best distractors for "which was NOT in the posting"). */
  profileTechnologyIds: readonly string[];
  locale: Locale;
  rng: SeededRng;
}

/** Two different job-memory templates for R1 and R2, chosen by the session seed. */
export function pickJobMemoryTemplates(rng: SeededRng): [JobMemoryTemplate, JobMemoryTemplate] {
  const [first, second] = rng.shuffle(JOB_MEMORY_TEMPLATES);
  return [first as JobMemoryTemplate, second as JobMemoryTemplate];
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

function distinct(values: string[], exclude: string[]): string[] {
  const seen = new Set(exclude);
  return values.filter((v) => !seen.has(v) && (seen.add(v), true));
}

function shuffled<K>(
  rng: SeededRng,
  entries: { text: string; key: K }[],
): { options: { id: Alias; text: string }[]; keys: Record<Alias, K> } {
  const order = rng.shuffle(entries);
  const keys = {} as Record<Alias, K>;
  const options = order.map((entry, i) => {
    const id = ALIASES[i] as Alias;
    keys[id] = entry.key;
    return { id, text: entry.text };
  });
  return { options, keys };
}

function memoryQuestion(
  ctx: TemplateContext,
  templateId: JobMemoryTemplate,
  correct: string,
  distractors: string[],
): PresentedQuestion {
  const { fragments } = ctx.content;
  const wrong = ctx.rng.shuffle(distinct(distractors, [correct])).slice(0, 3);
  if (wrong.length < 3) throw new Error(`Not enough distractors for ${templateId}`);
  const { options, keys } = shuffled(ctx.rng, [
    { text: correct, key: true },
    ...wrong.map((text) => ({ text, key: false })),
  ]);
  const correctAlias = ALIASES.find((alias) => keys[alias]) as Alias;
  return {
    templateId,
    prompt: fragments.questionTemplates[templateId][ctx.locale],
    options,
    answerKey: { correct: correctAlias },
    explanation: fill(fragments.templateExplanation[ctx.locale], { answer: correct }),
  };
}

export function buildJobMemoryQuestion(
  templateId: JobMemoryTemplate,
  ctx: TemplateContext,
): PresentedQuestion {
  const { posting, catalog, content, locale, rng } = ctx;
  const texts = posting.texts[locale];
  const facts = posting.facts;
  const name = new Map(catalog.technologies.map((t) => [t.id, t.name]));
  const role = catalog.roles.find((r) => r.id === facts.roleId);
  const roleCategories = new Set([
    ...(role?.coreCategories ?? []),
    ...(role?.allowedCategories ?? []),
  ]);
  const inPosting = new Set(facts.technologyIds);
  const roleTechnologies = catalog.technologies
    .filter((t) => roleCategories.has(t.category) && !inPosting.has(t.id))
    .map((t) => t.id);
  const ownNotInPosting = ctx.profileTechnologyIds.filter((t) => !inPosting.has(t));

  switch (templateId) {
    case 'location':
      return memoryQuestion(
        ctx,
        templateId,
        texts.location,
        content.locations.locations.map((l) => l.labels[locale]),
      );
    case 'experience':
      return memoryQuestion(
        ctx,
        templateId,
        texts.experience,
        SENIORITIES.map((s) => content.fragments.experience[s][locale]),
      );
    case 'missing_technology': {
      // Prefer a technology from the developer's own stack that the posting left out.
      const pool = ownNotInPosting.length > 0 ? ownNotInPosting : rng.shuffle(roleTechnologies);
      const missing = rng.pick(pool);
      return memoryQuestion(
        ctx,
        templateId,
        name.get(missing) ?? missing,
        facts.technologyIds.map((t) => name.get(t) ?? t),
      );
    }
    case 'included_technology': {
      const included = rng.pick(facts.technologyIds);
      const others = [...rng.shuffle(ownNotInPosting), ...rng.shuffle(roleTechnologies)];
      // memoryQuestion shuffles distractors; keep the most plausible ones first.
      const wrong = distinct(
        others.map((t) => name.get(t) ?? t),
        [name.get(included) ?? included],
      ).slice(0, 3);
      return memoryQuestion(ctx, templateId, name.get(included) ?? included, wrong);
    }
    case 'perk': {
      const offered = new Set(facts.perkIds);
      const perk = rng.pick(content.fragments.perks.filter((p) => offered.has(p.id)));
      return memoryQuestion(
        ctx,
        templateId,
        perk[locale],
        content.fragments.perks.filter((p) => !offered.has(p.id)).map((p) => p[locale]),
      );
    }
  }
}

/**
 * R3: "What are your salary expectations?" with graded options (docs/game-design/challenges/
 * recruiter-screening.md): a value inside the posted range is aligned; ~60% of the minimum
 * undersells; "whatever is fair" is vague; ~135% of the maximum is out of range.
 */
export function buildSalaryQuestion(ctx: TemplateContext): PresentedQuestion {
  const { salary } = ctx.posting.facts;
  const format = new Intl.NumberFormat(ctx.locale, {
    style: 'currency',
    currency: salary.currency,
    maximumFractionDigits: 0,
  });
  const round = (value: number) => Math.round(value / 1000) * 1000;
  const { fragments } = ctx.content;
  const { options, keys } = shuffled<SalaryGrade>(ctx.rng, [
    { text: format.format(round((salary.min + salary.max) / 2)), key: 'aligned' },
    { text: format.format(round(salary.min * 0.6)), key: 'undersell' },
    { text: fragments.salaryVagueOption[ctx.locale], key: 'vague' },
    { text: format.format(round(salary.max * 1.35)), key: 'out_of_range' },
  ]);
  return {
    templateId: 'salary_expectation',
    prompt: fragments.questionTemplates.salary_expectation[ctx.locale],
    options,
    answerKey: { grades: keys },
    explanation: fill(fragments.salaryExplanation[ctx.locale], {
      range: `${format.format(salary.min)} – ${format.format(salary.max)}`,
    }),
  };
}
