import { DifficultySchema, SenioritySchema, SUPPORTED_LOCALES } from '@cv-rush/contracts';
import { z } from 'zod';

const Id = z.string().regex(/^[a-z0-9][a-z0-9_]*$/, 'must be lowercase snake_case');
const DottedId = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_.-]*$/, 'must be lowercase, using dots, hyphens or underscores');

/** Labels for every supported locale. */
const Labels = z.object(
  Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, z.string().min(1)])) as Record<
    (typeof SUPPORTED_LOCALES)[number],
    z.ZodString
  >,
);

// ---------------------------------------------------------------- catalog

export const TracksFileSchema = z.object({
  tracks: z.array(z.object({ id: Id, labels: Labels }).strict()).min(1),
});

export const CategoriesFileSchema = z.object({
  categories: z.array(z.object({ id: Id, labels: Labels }).strict()).min(1),
});

export const TechnologiesFileSchema = z.object({
  technologies: z
    .array(
      z
        .object({
          id: Id,
          name: z.string().min(1),
          category: Id,
          aliases: z.array(z.string().min(1)).optional(),
        })
        .strict(),
    )
    .min(1),
});

export const RolesFileSchema = z.object({
  roles: z
    .array(
      z
        .object({
          id: Id,
          track: Id,
          labels: Labels,
          minSeniority: SenioritySchema.optional(),
          coreCategories: z.array(Id).min(1),
          allowedCategories: z.array(Id),
          recommended: z.array(Id),
        })
        .strict(),
    )
    .min(1),
});

export type TracksFile = z.infer<typeof TracksFileSchema>;
export type CategoriesFile = z.infer<typeof CategoriesFileSchema>;
export type TechnologiesFile = z.infer<typeof TechnologiesFileSchema>;
export type RolesFile = z.infer<typeof RolesFileSchema>;

// ---------------------------------------------------------------- questions

export const QUESTION_LIMITS = { promptMax: 140, optionMax: 40, explanationMax: 300 } as const;

export const QUESTION_CATEGORIES = [
  'stack',
  'technical',
  'situational',
  'architecture',
  'humor',
] as const;

const OptionId = z.string().regex(/^[a-z]$/, 'option ids are single lowercase letters');

const QuestionTranslationSchema = z
  .object({
    prompt: z.string().min(1),
    options: z.record(z.string(), z.string().min(1)),
    explanation: z.string().min(1),
  })
  .strict();

export const QuestionSchema = z
  .object({
    id: DottedId,
    version: z.number().int().min(1),
    category: z.enum(QUESTION_CATEGORIES),
    technologies: z.array(Id),
    topics: z.array(DottedId).min(1),
    difficulty: DifficultySchema,
    seniority: z.object({ min: SenioritySchema, max: SenioritySchema }).strict(),
    options: z.array(OptionId).length(4, 'questions have exactly 4 options'),
    correctOptionId: OptionId,
    translations: z.record(z.string(), QuestionTranslationSchema),
  })
  .strict();

export const QuestionPackSchema = z
  .object({
    pack: z
      .object({
        id: DottedId,
        source: z.enum(['sample', 'community']),
        description: z.string().min(1),
      })
      .strict(),
    questions: z.array(QuestionSchema).min(1),
  })
  .strict();

export type Question = z.infer<typeof QuestionSchema>;
export type QuestionPack = z.infer<typeof QuestionPackSchema>;
