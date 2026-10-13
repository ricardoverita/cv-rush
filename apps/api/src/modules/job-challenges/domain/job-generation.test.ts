import {
  readCatalogFiles,
  readJobsFiles,
  validateCatalog,
  validateJobsContent,
} from '@cv-rush/content';
import { createRng } from '@cv-rush/simulation';
import { describe, expect, it } from 'vitest';
import { generatePosting, type PostingProfile, postingStack } from './job-posting.js';
import {
  buildJobMemoryQuestion,
  buildSalaryQuestion,
  JOB_MEMORY_TEMPLATES,
  pickJobMemoryTemplates,
} from './job-questions.js';

const catalog = validateCatalog(readCatalogFiles()).catalog!;
const content = validateJobsContent(readJobsFiles(), catalog).content!;
const categoryOf = new Map(catalog.technologies.map((t) => [t.id, t.category]));

const ricardo: PostingProfile = {
  seniority: 'senior',
  roleId: 'fullstack_developer',
  trackId: 'fullstack',
  technologyIds: ['nodejs', 'php', 'react', 'postgresql', 'redis'],
};
const fullstackCategories = new Set([
  'frontend',
  'backend',
  'databases',
  'caching_search',
  'messaging',
  'cloud',
  'infrastructure',
  'testing',
]);

describe('job posting generation', () => {
  it("requires exactly Ricardo's own stack; extras only ever appear as nice to have", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const { required, niceToHave } = postingStack(ricardo, catalog, createRng(`seed-${i}`));
      expect(required).toEqual(ricardo.technologyIds);
      expect(niceToHave.length).toBeLessThanOrEqual(2);
      seen.add(niceToHave.length);
      for (const t of niceToHave) {
        expect(ricardo.technologyIds).not.toContain(t);
        expect(fullstackCategories.has(categoryOf.get(t)!)).toBe(true);
        expect(['swift', 'kotlin']).not.toContain(t);
      }
    }
    // "Occasionally": some postings have none, some one, some two.
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });

  it('keeps at most 8 required technologies, covering the core categories, for long stacks', () => {
    const many: PostingProfile = {
      ...ricardo,
      technologyIds: [
        'postgresql',
        'redis',
        'kafka',
        'docker',
        'aws',
        'jest',
        'mysql',
        'mongodb',
        'rabbitmq',
        'react',
        'nodejs',
        'kubernetes',
      ],
    };
    for (let i = 0; i < 50; i++) {
      const { required, niceToHave } = postingStack(many, catalog, createRng(`many-${i}`));
      expect(required.length).toBe(8);
      expect(required).toContain('react');
      expect(required).toContain('nodejs');
      for (const t of required) expect(many.technologyIds).toContain(t);
      for (const t of niceToHave) expect(many.technologyIds).not.toContain(t);
    }
  });

  it('never pads a short stack with required technologies', () => {
    const single: PostingProfile = {
      ...ricardo,
      roleId: 'frontend_developer',
      trackId: 'frontend',
      technologyIds: ['react'],
    };
    for (let i = 0; i < 20; i++) {
      const posting = generatePosting(single, catalog, content, createRng(`single-${i}`));
      expect(posting.facts.requiredTechnologyIds).toEqual(['react']);
      // "Which technology was NOT in the posting?" needs three required ones as distractors.
      const [r1, r2] = pickJobMemoryTemplates(createRng(`t-${i}`), posting);
      expect([r1, r2]).not.toContain('missing_technology');
    }
  });

  it('is deterministic for a seed and coherent with the seniority', () => {
    const a = generatePosting(ricardo, catalog, content, createRng('same'));
    const b = generatePosting(ricardo, catalog, content, createRng('same'));
    expect(a).toEqual(b);
    expect(a.facts.experienceYears).toBe(5);
    expect(a.texts.en.experience).toBe('5+ years building software');
    expect(a.texts.es.experience).toBe('5+ años desarrollando software');
    expect(a.facts.salary.min).toBeLessThan(a.facts.salary.max);
    expect(a.texts.en.responsibilities.length).toBeGreaterThanOrEqual(4);
    expect(a.facts.perkIds).toHaveLength(3);
  });
});

describe('job-derived questions', () => {
  const posting = generatePosting(ricardo, catalog, content, createRng('posting'));

  it.each(JOB_MEMORY_TEMPLATES)('%s: four distinct options with one correct answer', (template) => {
    for (const locale of ['en', 'es'] as const) {
      const q = buildJobMemoryQuestion(template, {
        posting,
        catalog,
        content,
        profileTechnologyIds: ricardo.technologyIds,
        locale,
        rng: createRng(`${template}-${locale}`),
      });
      expect(q.options.map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
      expect('correct' in q.answerKey).toBe(true);
      for (const o of q.options) expect(o.text.length).toBeLessThanOrEqual(40);
    }
  });

  it('asks for a technology that really is missing from the posting', () => {
    const q = buildJobMemoryQuestion('missing_technology', {
      posting,
      catalog,
      content,
      profileTechnologyIds: ricardo.technologyIds,
      locale: 'en',
      rng: createRng('missing'),
    });
    const correct = q.options.find(
      (o) => 'correct' in q.answerKey && o.id === q.answerKey.correct,
    )!;
    const names = posting.facts.requiredTechnologyIds.map(
      (id) => catalog.technologies.find((t) => t.id === id)!.name,
    );
    expect(names).not.toContain(correct.text);
    for (const o of q.options.filter((o) => o !== correct)) expect(names).toContain(o.text);
  });

  it('grades salary expectations against the posted range', () => {
    const q = buildSalaryQuestion({
      posting,
      catalog,
      content,
      profileTechnologyIds: ricardo.technologyIds,
      locale: 'es',
      rng: createRng('salary'),
    });
    expect('grades' in q.answerKey && Object.values(q.answerKey.grades).sort()).toEqual([
      'aligned',
      'out_of_range',
      'undersell',
      'vague',
    ]);
  });

  it('uses two different templates for R1 and R2', () => {
    for (let i = 0; i < 20; i++) {
      const [r1, r2] = pickJobMemoryTemplates(createRng(`t-${i}`), posting);
      expect(r1).not.toBe(r2);
    }
  });
});
