import { join } from 'node:path';
import { SENIORITIES, SUPPORTED_LOCALES } from '@cv-rush/contracts';
import { z } from 'zod';
import type { ContentIssue } from './issues.js';
import { DATA_DIR, readYaml } from './load.js';
import { QUESTION_LIMITS } from './schemas.js';
import type { Catalog } from './validate-catalog.js';

const Id = z.string().regex(/^[a-z0-9][a-z0-9_]*$/, 'must be lowercase snake_case');
const Text = z.object(
  Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, z.string().min(1)])) as Record<
    (typeof SUPPORTED_LOCALES)[number],
    z.ZodString
  >,
);
const WORK_MODES = ['onsite', 'hybrid', 'remote'] as const;
const Band = z.object({ min: z.number().int().positive(), max: z.number().int().positive() });

export const LocationsFileSchema = z
  .object({
    tiers: z.array(z.object({ id: Id, currency: z.string().regex(/^[A-Z]{3}$/) }).strict()),
    locations: z.array(
      z
        .object({
          id: Id,
          labels: Text,
          tier: Id,
          modes: z.array(z.enum(WORK_MODES)).min(1),
        })
        .strict(),
    ),
    workModes: z.object({ onsite: Text, hybrid: Text, remote: Text }).strict(),
  })
  .strict();

export const SalaryBandsFileSchema = z
  .object({ bands: z.record(Id, z.record(z.string(), Band)) })
  .strict();

export const CompaniesFileSchema = z
  .object({
    nameParts: z.array(z.string().min(2)).min(4),
    sectors: z
      .array(
        z
          .object({
            id: Id,
            labels: Text,
            suffixes: z.array(z.string().min(2)).min(1),
            summary: Text,
          })
          .strict(),
      )
      .min(1),
    blockedNames: z.array(z.string()),
  })
  .strict();

const TEMPLATE_IDS = [
  'location',
  'experience',
  'missing_technology',
  'included_technology',
  'perk',
  'salary_expectation',
] as const;
export type JobQuestionTemplateId = (typeof TEMPLATE_IDS)[number];

const Experience = Text.extend({ years: z.number().int().min(0) });

export const FragmentsFileSchema = z
  .object({
    experience: z.object(
      Object.fromEntries(SENIORITIES.map((s) => [s, Experience])) as Record<
        (typeof SENIORITIES)[number],
        typeof Experience
      >,
    ),
    responsibilities: z.record(Id, Text),
    generalResponsibilities: z.array(Text).min(1),
    seniorResponsibilities: z.array(Text).min(1),
    perks: z.array(Text.extend({ id: Id, satirical: z.boolean().optional() })).min(4),
    questionTemplates: z.object(
      Object.fromEntries(TEMPLATE_IDS.map((t) => [t, Text])) as Record<
        JobQuestionTemplateId,
        typeof Text
      >,
    ),
    salaryVagueOption: Text,
    templateExplanation: Text,
    salaryExplanation: Text,
  })
  .strict();

export interface JobsContent {
  locations: z.infer<typeof LocationsFileSchema>;
  salaryBands: z.infer<typeof SalaryBandsFileSchema>;
  companies: z.infer<typeof CompaniesFileSchema>;
  fragments: z.infer<typeof FragmentsFileSchema>;
}

export interface JobsInput {
  locations: unknown;
  salaryBands: unknown;
  companies: unknown;
  fragments: unknown;
}

export function readJobsFiles(dataDir = DATA_DIR): JobsInput {
  const dir = join(dataDir, 'jobs');
  return {
    locations: readYaml(join(dir, 'locations.yaml')),
    salaryBands: readYaml(join(dir, 'salary-bands.yaml')),
    companies: readYaml(join(dir, 'companies.yaml')),
    fragments: readYaml(join(dir, 'fragments.yaml')),
  };
}

/**
 * Validates the job-generation content: schemas, references between files and to the catalog,
 * and the 40-character limit for texts that can become answer options.
 */
export function validateJobsContent(
  input: JobsInput,
  catalog: Catalog,
): { content?: JobsContent; issues: ContentIssue[] } {
  const issues: ContentIssue[] = [];
  const parse = <S extends z.ZodType>(schema: S, data: unknown, file: string) => {
    const result = schema.safeParse(data);
    if (result.success) return result.data as z.infer<S>;
    for (const issue of result.error.issues) {
      issues.push({
        code: 'SCHEMA_INVALID',
        file,
        at: issue.path.join('.'),
        message: issue.message,
      });
    }
    return undefined;
  };
  const locations = parse(LocationsFileSchema, input.locations, 'jobs/locations.yaml');
  const salaryBands = parse(SalaryBandsFileSchema, input.salaryBands, 'jobs/salary-bands.yaml');
  const companies = parse(CompaniesFileSchema, input.companies, 'jobs/companies.yaml');
  const fragments = parse(FragmentsFileSchema, input.fragments, 'jobs/fragments.yaml');
  if (!locations || !salaryBands || !companies || !fragments) return { issues };

  const add = (code: string, file: string, at: string, message: string) =>
    issues.push({ code, file, at, message });
  const tierIds = new Set(locations.tiers.map((t) => t.id));
  for (const location of locations.locations) {
    if (!tierIds.has(location.tier)) {
      add('UNKNOWN_TIER', 'jobs/locations.yaml', location.id, `unknown tier "${location.tier}"`);
    }
  }
  for (const tier of tierIds) {
    const bands = salaryBands.bands[tier];
    for (const seniority of SENIORITIES) {
      const band = bands?.[seniority];
      if (!band) add('MISSING_BAND', 'jobs/salary-bands.yaml', `${tier}.${seniority}`, 'missing');
      else if (band.min >= band.max) {
        add('BAND_INVALID', 'jobs/salary-bands.yaml', `${tier}.${seniority}`, 'min must be < max');
      }
    }
  }
  for (const category of catalog.categories) {
    if (!fragments.responsibilities[category.id]) {
      add(
        'MISSING_RESPONSIBILITY',
        'jobs/fragments.yaml',
        category.id,
        'every technology category needs a responsibility fragment',
      );
    }
  }
  const optionTexts: [string, Record<string, string>][] = [
    ...SENIORITIES.map((s): [string, Record<string, string>] => [
      `experience.${s}`,
      { en: fragments.experience[s].en, es: fragments.experience[s].es },
    ]),
    ...fragments.perks.map((p): [string, Record<string, string>] => [
      `perks.${p.id}`,
      { en: p.en, es: p.es },
    ]),
    ['salaryVagueOption', fragments.salaryVagueOption],
    ...locations.locations.map((l): [string, Record<string, string>] => [
      `locations.${l.id}`,
      l.labels,
    ]),
  ];
  for (const [at, text] of optionTexts) {
    for (const locale of SUPPORTED_LOCALES) {
      const value = text[locale] ?? '';
      if (value.length > QUESTION_LIMITS.optionMax) {
        add(
          'OPTION_TOO_LONG',
          'jobs',
          `${at}.${locale}`,
          `"${value}" has ${value.length} characters (max ${QUESTION_LIMITS.optionMax})`,
        );
      }
    }
  }
  return { content: { locations, salaryBands, companies, fragments }, issues };
}
