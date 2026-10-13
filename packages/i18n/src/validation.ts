import type { MessageTree } from './catalogs.js';

export interface TranslationIssue {
  code: 'MISSING_KEY' | 'EXTRA_KEY' | 'NOT_A_STRING' | 'PLACEHOLDER_MISMATCH' | 'EMPTY_MESSAGE';
  locale: string;
  namespace: string;
  key: string;
  detail?: string;
}

/** Flattens a message tree into dotted keys: { a: { b: 'x' } } → { 'a.b': 'x' }. */
export function flatten(tree: MessageTree, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      Object.assign(out, flatten(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

/** Top-level ICU argument names, e.g. "Hi {name}, {count, plural, one {…} other {…}}" → [count, name]. */
export function placeholders(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    if (char === '{') {
      if (depth === 0) {
        const match = /^\{\s*([A-Za-z_][\w]*)\s*[,}]/.exec(message.slice(i));
        if (match?.[1]) names.add(match[1]);
      }
      depth++;
    } else if (char === '}') {
      depth = Math.max(0, depth - 1);
    }
  }
  return [...names].sort();
}

/** Compares a locale's namespace against the reference (fallback) locale. */
export function compareCatalogs(
  reference: MessageTree,
  candidate: MessageTree,
  context: { locale: string; namespace: string },
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];
  const ref = flatten(reference);
  const cand = flatten(candidate);

  for (const [key, refValue] of Object.entries(ref)) {
    const value = cand[key];
    if (value === undefined) {
      issues.push({ code: 'MISSING_KEY', ...context, key });
      continue;
    }
    if (typeof value !== 'string' || typeof refValue !== 'string') {
      issues.push({ code: 'NOT_A_STRING', ...context, key });
      continue;
    }
    if (value.trim() === '') {
      issues.push({ code: 'EMPTY_MESSAGE', ...context, key });
      continue;
    }
    const expected = placeholders(refValue).join(',');
    const actual = placeholders(value).join(',');
    if (expected !== actual) {
      issues.push({
        code: 'PLACEHOLDER_MISMATCH',
        ...context,
        key,
        detail: `expected {${expected}} but found {${actual}}`,
      });
    }
  }
  for (const key of Object.keys(cand)) {
    if (!(key in ref)) issues.push({ code: 'EXTRA_KEY', ...context, key });
  }
  return issues;
}
