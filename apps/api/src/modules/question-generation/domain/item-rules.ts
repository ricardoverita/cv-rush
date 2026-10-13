import type { QuestionContextRef } from './context.js';
import { type GeneratedItem, GeneratedItemSchema } from './generated-item.js';

// Pipeline stages 1–4 (docs/architecture/10 §6): schema, rules, heuristics, deduplication.
// Each rejection has a reason code, recorded in the batch for review.

export type RejectionReason =
  | 'SCHEMA_INVALID'
  | 'DIFFICULTY_MISMATCH'
  | 'TECHNOLOGY_MISMATCH'
  | 'DUPLICATE_OPTION'
  | 'BANNED_PATTERN'
  | 'ANSWER_IN_PROMPT'
  | 'DUPLICATE'
  | 'VERIFICATION_DISAGREES';

const BANNED = [
  /\ball of the above\b/i,
  /\bnone of the above\b/i,
  /\btodas las anteriores\b/i,
  /\bninguna de las anteriores\b/i,
];

/** Lowercase, no diacritics, punctuation or extra spaces: for comparisons and dedupe. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export type CheckedItem =
  { ok: true; item: GeneratedItem; dedupeKey: string } | { ok: false; reasons: RejectionReason[] };

export function checkGeneratedItem(raw: unknown, context: QuestionContextRef): CheckedItem {
  const parsed = GeneratedItemSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reasons: ['SCHEMA_INVALID'] };
  const item = parsed.data;
  const reasons = new Set<RejectionReason>();

  if (item.difficulty !== context.level) reasons.add('DIFFICULTY_MISMATCH');
  const expectedTechnology = context.kind === 'tech' ? context.subject : null;
  if (item.technology !== expectedTechnology) reasons.add('TECHNOLOGY_MISMATCH');

  for (const translation of Object.values(item.translations)) {
    const options = Object.values(translation.options);
    if (new Set(options.map(normalizeText)).size !== options.length) {
      reasons.add('DUPLICATE_OPTION');
    }
    if ([translation.question, ...options].some((text) => BANNED.some((re) => re.test(text)))) {
      reasons.add('BANNED_PATTERN');
    }
    const answer = normalizeText(translation.options[item.correctOption]);
    if (answer.length >= 5 && normalizeText(translation.question).includes(answer)) {
      reasons.add('ANSWER_IN_PROMPT');
    }
  }
  if (reasons.size > 0) return { ok: false, reasons: [...reasons] };
  return { ok: true, item, dedupeKey: normalizeText(item.translations.en.question) };
}
