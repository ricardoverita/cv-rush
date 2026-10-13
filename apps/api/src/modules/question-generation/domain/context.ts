// Question contexts are pools of comparable questions: a technology, a track's fundamentals,
// a seniority band or general engineering, at one difficulty level.

export const CONTEXT_KINDS = ['tech', 'track', 'band', 'general'] as const;
export type ContextKind = (typeof CONTEXT_KINDS)[number];

export interface QuestionContextRef {
  key: string;
  kind: ContextKind;
  /** Technology, track or band id (null for general). */
  subject: string | null;
  level: number;
}

export function contextKey(kind: ContextKind, subject: string | null, level: number): string {
  return kind === 'general' ? `general:${level}` : `${kind}:${subject}:${level}`;
}

export function parseContextKey(key: string): QuestionContextRef {
  const parts = key.split(':');
  const kind = parts[0] as ContextKind;
  if (!CONTEXT_KINDS.includes(kind)) throw new Error(`Unknown context kind in "${key}"`);
  const level = Number(parts.at(-1));
  if (!Number.isInteger(level) || level < 1 || level > 5) throw new Error(`Bad level in "${key}"`);
  const subject = kind === 'general' ? null : (parts[1] ?? null);
  if (kind !== 'general' && !subject) throw new Error(`Missing subject in "${key}"`);
  return { key, kind, subject, level };
}
