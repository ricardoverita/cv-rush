import { compareSeniority, SUPPORTED_LOCALES } from '@cv-rush/contracts';
import type { ContentIssue } from './issues.js';
import { QUESTION_LIMITS, QuestionPackSchema, type Question } from './schemas.js';

export interface PackInput {
  file: string;
  data: unknown;
}

export interface QuestionValidationResult {
  questions: number;
  packs: number;
  issues: ContentIssue[];
}

function checkQuestion(
  q: Question,
  file: string,
  knownTechnologies: ReadonlySet<string>,
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const at = q.id;
  const add = (code: string, message: string) => issues.push({ code, file, at, message });

  if (new Set(q.options).size !== q.options.length)
    add('DUPLICATE_OPTION_ID', 'option ids must be unique');
  if (!q.options.includes(q.correctOptionId))
    add(
      'UNKNOWN_CORRECT_OPTION',
      `correctOptionId "${q.correctOptionId}" is not one of the options`,
    );
  if (compareSeniority(q.seniority.min, q.seniority.max) > 0)
    add('SENIORITY_RANGE_INVALID', `min "${q.seniority.min}" is above max "${q.seniority.max}"`);
  for (const tech of q.technologies) {
    if (!knownTechnologies.has(tech)) add('UNKNOWN_TECHNOLOGY', `unknown technology "${tech}"`);
  }

  for (const locale of SUPPORTED_LOCALES) {
    const t = q.translations[locale];
    if (!t) {
      add('MISSING_TRANSLATION', `missing "${locale}" translation`);
      continue;
    }
    if (t.prompt.length > QUESTION_LIMITS.promptMax)
      add(
        'PROMPT_TOO_LONG',
        `${locale} prompt has ${t.prompt.length} characters (max ${QUESTION_LIMITS.promptMax})`,
      );
    if (t.explanation.length > QUESTION_LIMITS.explanationMax)
      add(
        'EXPLANATION_TOO_LONG',
        `${locale} explanation is longer than ${QUESTION_LIMITS.explanationMax} characters`,
      );
    const textIds = Object.keys(t.options).sort();
    if (textIds.join(',') !== [...q.options].sort().join(',')) {
      add(
        'OPTION_TEXT_MISMATCH',
        `${locale} option texts must exist for exactly: ${q.options.join(', ')}`,
      );
    }
    const texts = Object.values(t.options).map((o) => o.trim().toLowerCase());
    if (new Set(texts).size !== texts.length)
      add('DUPLICATE_OPTION', `${locale} has duplicate option texts`);
    for (const [id, text] of Object.entries(t.options)) {
      if (text.length > QUESTION_LIMITS.optionMax)
        add(
          'OPTION_TOO_LONG',
          `${locale} option "${id}" has ${text.length} characters (max ${QUESTION_LIMITS.optionMax})`,
        );
    }
  }
  for (const locale of Object.keys(q.translations)) {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale))
      add('UNKNOWN_LOCALE', `unsupported locale "${locale}"`);
  }
  return issues;
}

/** Validates question packs against the schema, the catalog and cross-pack rules (unique ids). */
export function validateQuestionPacks(
  packs: PackInput[],
  knownTechnologies: ReadonlySet<string>,
): QuestionValidationResult {
  const issues: ContentIssue[] = [];
  const seenIds = new Map<string, string>();
  let questions = 0;

  for (const { file, data } of packs) {
    const parsed = QuestionPackSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          code: 'SCHEMA_INVALID',
          file,
          at: issue.path.join('.'),
          message: issue.message,
        });
      }
      continue;
    }
    for (const q of parsed.data.questions) {
      questions++;
      const previous = seenIds.get(q.id);
      if (previous)
        issues.push({
          code: 'DUPLICATE_ID',
          file,
          at: q.id,
          message: `id already used in ${previous}`,
        });
      else seenIds.set(q.id, file);
      issues.push(...checkQuestion(q, file, knownTechnologies));
    }
  }
  return { questions, packs: packs.length, issues };
}
