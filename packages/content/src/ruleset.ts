import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SENIORITIES, SENIORITY_BANDS } from '@cv-rush/contracts';
import { z } from 'zod';
import type { ContentIssue } from './issues.js';
import { readYaml } from './load.js';

/** Absolute path to the package's `rulesets/` directory (ADR-024). */
export const RULESETS_DIR = fileURLToPath(new URL('../rulesets/', import.meta.url));

export const SLOT_KINDS = [
  'job_memory',
  'salary_graded',
  'stack',
  'track_fundamentals',
  'seniority',
  'mixed_scenario',
] as const;
export type SlotKind = (typeof SLOT_KINDS)[number];

const Slot = z
  .object({
    slot: z.string().regex(/^[RHF][1-9]$/),
    kind: z.enum(SLOT_KINDS),
    windowMs: z.number().int().min(3000).max(60000),
  })
  .strict();

const Level = z.number().int().min(1).max(5);
const TechnicalLevels = z.object({ H1: Level, H2: Level, H3: Level, F1: Level }).strict();
const byKeys = <K extends string, V extends z.ZodType>(keys: readonly K[], value: V) =>
  z.object(Object.fromEntries(keys.map((k) => [k, value])) as Record<K, V>).strict();

export const RulesetSchema = z
  .object({
    version: z.string().regex(/^ruleset-v\d+$/),
    ranked: z
      .object({
        attemptsPerDay: z.number().int().min(1).max(10),
        maxUncommittedPerDay: z.number().int().min(1),
        tracks: z.record(z.string(), z.enum(['official', 'preview'])),
      })
      .strict(),
    session: z
      .object({
        reviewWindowMs: z.number().int().positive(),
        maxLifetimeMs: z.number().int().positive(),
        answerToleranceMs: z.number().int().min(0).max(2000),
        segmentMinMs: z.array(z.number().int().min(0)).length(4),
        practiceWindowFactor: z.number().min(1).max(3),
      })
      .strict(),
    stages: z
      .object({
        recruiter: z.array(Slot).min(1),
        hiring_manager: z.array(Slot).min(1),
        final: z.array(Slot).length(1),
      })
      .strict(),
    levels: z
      .object({
        recruiter: Level,
        ranked: byKeys(SENIORITY_BANDS, TechnicalLevels),
        practice: byKeys(SENIORITIES, TechnicalLevels),
      })
      .strict(),
    cvHealth: z
      .object({
        initial: z.number().int().min(1).max(100),
        damage: z
          .object({
            recruiter: z.number().int().min(0),
            salaryOutOfRange: z.number().int().min(0),
            hiring_manager: z.number().int().min(0),
            final: z.number().int().min(0),
            atsIrrelevantKeyword: z.number().int().min(0),
            atsCap: z.number().int().min(0),
          })
          .strict(),
      })
      .strict(),
    ats: z
      .object({
        windowMs: z.number().int().min(5000),
        threshold: z.number().min(0).max(100),
        recruiterBonusPerCorrect: z.number().min(0),
        penaltyPerIrrelevant: z.number().min(0),
        irrelevantTechnologies: z.number().int().min(1),
        buzzwords: z.number().int().min(0),
      })
      .strict(),
    scoring: z
      .object({
        version: z.string().regex(/^scoring-v\d+$/),
        weights: z
          .object({
            answers: z.number().int().min(0),
            speed: z.number().int().min(0),
            completion: z.number().int().min(0),
            ats: z.number().int().min(0),
            cvHealth: z.number().int().min(0),
            streak: z.number().int().min(0),
          })
          .strict(),
        speedBuckets: z
          .array(z.object({ upTo: z.number().gt(0).max(1), credit: z.number().min(0).max(1) }))
          .min(1),
        gradedCredit: z
          .object({
            aligned: z.number().min(0).max(1),
            undersell: z.number().min(0).max(1),
            vague: z.number().min(0).max(1),
            out_of_range: z.number().min(0).max(1),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();
export type Ruleset = z.infer<typeof RulesetSchema>;
export type SlotSpec = z.infer<typeof Slot>;

/** Cross-field rules that a schema can't express. */
export function checkRuleset(ruleset: Ruleset, file: string, trackIds: ReadonlySet<string>) {
  const issues: ContentIssue[] = [];
  const add = (code: string, message: string) => issues.push({ code, file, message });
  const slots = [
    ...ruleset.stages.recruiter,
    ...ruleset.stages.hiring_manager,
    ...ruleset.stages.final,
  ].map((s) => s.slot);
  if (new Set(slots).size !== slots.length) add('DUPLICATE_SLOT', 'slot ids must be unique');
  for (const required of ['H1', 'H2', 'H3', 'F1']) {
    if (!slots.includes(required)) add('MISSING_SLOT', `slot ${required} is required`);
  }
  for (const track of Object.keys(ruleset.ranked.tracks)) {
    if (!trackIds.has(track)) add('UNKNOWN_TRACK', `ranked track "${track}" is not in the catalog`);
  }
  const buckets = ruleset.scoring.speedBuckets;
  const ascending = buckets.every((b, i) => i === 0 || b.upTo > (buckets[i - 1]?.upTo ?? 0));
  if (!ascending || buckets.at(-1)?.upTo !== 1) {
    add('SPEED_BUCKETS_INVALID', 'speed buckets must ascend and end at 1');
  }
  const total = Object.values(ruleset.scoring.weights).reduce((sum, w) => sum + w, 0);
  if (total !== 25000) add('SCORING_TOTAL', `scoring weights add up to ${total}, expected 25000`);
  return issues;
}

/** Reads and validates a ruleset file (e.g. `ruleset-v0`). Throws on invalid content. */
export function readRuleset(version: string, dir = RULESETS_DIR): Ruleset {
  const parsed = RulesetSchema.safeParse(readYaml(`${dir}${version}.yaml`));
  if (!parsed.success) {
    throw new Error(`Invalid ruleset ${version}:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

export function listRulesets(dir = RULESETS_DIR): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace(/\.yaml$/, ''))
    .sort();
}
