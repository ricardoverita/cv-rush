import { describe, expect, it } from 'vitest';
import { FAKE_FIXTURES } from '../infrastructure/providers/fake-fixtures.js';
import { FakeQuestionGenerationProvider } from '../infrastructure/providers/fake-question-provider.js';
import { parseContextKey } from './context.js';
import type { GeneratedItem } from './generated-item.js';
import { checkGeneratedItem } from './item-rules.js';

const valid = FAKE_FIXTURES['tech:redis:3']![0]!;
const redis3 = parseContextKey('tech:redis:3');

describe('generated item rules', () => {
  it('accepts every fixture except the deliberately invalid one', () => {
    const rejected: string[] = [];
    for (const [key, items] of Object.entries(FAKE_FIXTURES)) {
      for (const item of items) {
        const result = checkGeneratedItem(item, parseContextKey(key));
        if (!result.ok) rejected.push(`${key} ${item.topic}: ${result.reasons.join(',')}`);
      }
    }
    expect(rejected).toEqual(['general:2 invalid.all-of-the-above: BANNED_PATTERN']);
  });

  it('rejects items that do not match the schema or the context', () => {
    expect(checkGeneratedItem({ topic: 'x' }, redis3)).toEqual({
      ok: false,
      reasons: ['SCHEMA_INVALID'],
    });
    const tooLong = structuredClone(valid);
    tooLong.translations.en.options.A = 'x'.repeat(41);
    expect(checkGeneratedItem(tooLong, redis3)).toMatchObject({ reasons: ['SCHEMA_INVALID'] });
    expect(checkGeneratedItem({ ...valid, difficulty: 2 }, redis3)).toMatchObject({
      reasons: ['DIFFICULTY_MISMATCH'],
    });
    expect(checkGeneratedItem({ ...valid, technology: 'kafka' }, redis3)).toMatchObject({
      reasons: ['TECHNOLOGY_MISMATCH'],
    });
  });

  it('rejects duplicate options and answers given away by the prompt', () => {
    const duplicate: GeneratedItem = structuredClone(valid);
    duplicate.translations.es.options.B = duplicate.translations.es.options.A.toUpperCase();
    expect(checkGeneratedItem(duplicate, redis3)).toMatchObject({ reasons: ['DUPLICATE_OPTION'] });
    const giveaway: GeneratedItem = structuredClone(valid);
    giveaway.translations.en.question =
      'Is a Sorted set the structure for a real-time leaderboard?';
    expect(checkGeneratedItem(giveaway, redis3)).toMatchObject({ reasons: ['ANSWER_IN_PROMPT'] });
  });
});

describe('FakeQuestionGenerationProvider', () => {
  const provider = new FakeQuestionGenerationProvider();

  it('generates the fixtures of a context, deterministically', async () => {
    const spec = { context: redis3, count: 20, promptVersion: 'p', existingPrompts: [] };
    const first = await provider.generate(spec);
    expect(first.items).toHaveLength(3);
    expect(await provider.generate(spec)).toEqual(first);
  });

  it('verifies an item without its key, in either language', async () => {
    const { en, es } = valid.translations;
    expect(await provider.verify({ question: en.question, options: en.options }, 'en')).toEqual({
      answer: valid.correctOption,
      confidence: 1,
    });
    expect(
      (await provider.verify({ question: es.question, options: es.options }, 'es')).answer,
    ).toBe(valid.correctOption);
    expect(await provider.verify({ question: 'Unknown?', options: en.options }, 'en')).toEqual({
      answer: 'A',
      confidence: 0,
    });
  });
});
