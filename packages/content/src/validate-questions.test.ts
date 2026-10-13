import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DATA_DIR, loadYamlTree } from './load.js';
import { validateQuestionPacks } from './validate-questions.js';

const technologies = new Set(['react', 'redis']);

function validQuestion(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sample.question',
    version: 1,
    category: 'stack',
    technologies: ['react'],
    topics: ['react.hooks.state'],
    difficulty: 1,
    seniority: { min: 'trainee', max: 'mid' },
    options: ['a', 'b', 'c', 'd'],
    correctOptionId: 'a',
    translations: {
      en: {
        prompt: 'Question?',
        options: { a: 'A', b: 'B', c: 'C', d: 'D' },
        explanation: 'Because.',
      },
      es: {
        prompt: '¿Pregunta?',
        options: { a: 'A', b: 'B', c: 'C', d: 'D' },
        explanation: 'Porque.',
      },
    },
    ...overrides,
  };
}

function pack(...questions: unknown[]) {
  return {
    file: 'test.yaml',
    data: { pack: { id: 'test', source: 'sample', description: 'Test pack' }, questions },
  };
}

function codes(...questions: unknown[]): string[] {
  return validateQuestionPacks([pack(...questions)], technologies).issues.map((i) => i.code);
}

describe('validateQuestionPacks', () => {
  it('accepts the repository sample pack', () => {
    const packs = loadYamlTree(join(DATA_DIR, 'questions'));
    const result = validateQuestionPacks(packs, new Set(['react', 'redis']));
    expect(result.issues).toEqual([]);
    expect(result.questions).toBeGreaterThan(0);
  });

  it('accepts a valid question', () => {
    expect(codes(validQuestion())).toEqual([]);
  });

  it('detects a missing translation', () => {
    const q = validQuestion();
    delete (q.translations as Record<string, unknown>).es;
    expect(codes(q)).toContain('MISSING_TRANSLATION');
  });

  it('detects duplicate option texts', () => {
    const q = validQuestion({
      translations: {
        en: { prompt: 'Q?', options: { a: 'Same', b: 'same', c: 'C', d: 'D' }, explanation: 'x' },
        es: { prompt: '¿Q?', options: { a: 'A', b: 'B', c: 'C', d: 'D' }, explanation: 'x' },
      },
    });
    expect(codes(q)).toContain('DUPLICATE_OPTION');
  });

  it('detects a correct answer that does not exist', () => {
    expect(codes(validQuestion({ correctOptionId: 'e' }))).toContain('UNKNOWN_CORRECT_OPTION');
  });

  it('detects an invalid difficulty', () => {
    expect(codes(validQuestion({ difficulty: 7 }))).toContain('SCHEMA_INVALID');
  });

  it('detects an invalid seniority and an inverted range', () => {
    expect(codes(validQuestion({ seniority: { min: 'guru', max: 'mid' } }))).toContain(
      'SCHEMA_INVALID',
    );
    expect(codes(validQuestion({ seniority: { min: 'senior', max: 'junior' } }))).toContain(
      'SENIORITY_RANGE_INVALID',
    );
  });

  it('detects unknown technologies', () => {
    expect(codes(validQuestion({ technologies: ['cobol'] }))).toContain('UNKNOWN_TECHNOLOGY');
  });

  it('detects duplicate ids across questions', () => {
    expect(codes(validQuestion(), validQuestion())).toContain('DUPLICATE_ID');
  });

  it('detects malformed questions', () => {
    expect(codes({ id: 'broken' })).toContain('SCHEMA_INVALID');
    expect(codes(validQuestion({ options: ['a', 'b', 'c'] }))).toContain('SCHEMA_INVALID');
  });

  it('detects option texts that do not match the option ids', () => {
    const q = validQuestion({
      translations: {
        en: { prompt: 'Q?', options: { a: 'A', b: 'B', c: 'C' }, explanation: 'x' },
        es: { prompt: '¿Q?', options: { a: 'A', b: 'B', c: 'C', d: 'D' }, explanation: 'x' },
      },
    });
    expect(codes(q)).toContain('OPTION_TEXT_MISMATCH');
  });

  it('enforces readable lengths', () => {
    const long = 'x'.repeat(141);
    const q = validQuestion({
      translations: {
        en: {
          prompt: long,
          options: { a: 'y'.repeat(41), b: 'B', c: 'C', d: 'D' },
          explanation: 'x',
        },
        es: { prompt: '¿Q?', options: { a: 'A', b: 'B', c: 'C', d: 'D' }, explanation: 'x' },
      },
    });
    expect(codes(q)).toEqual(expect.arrayContaining(['PROMPT_TOO_LONG', 'OPTION_TOO_LONG']));
  });
});
