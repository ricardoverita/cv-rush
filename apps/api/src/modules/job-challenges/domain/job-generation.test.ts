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
  it("builds Ricardo's posting from his own stack, topped up with fullstack technologies only", () => {
    for (let i = 0; i < 50; i++) {
      const stack = postingStack(ricardo, catalog, createRng(`seed-${i}`));
      expect(stack.slice(0, 5)).toEqual(ricardo.technologyIds);
      expect(stack).toHaveLength(6);
      for (const t of stack) expect(fullstackCategories.has(categoryOf.get(t)!)).toBe(true);
      expect(stack).not.toContain('swift');
      expect(stack).not.toContain('kotlin');
    }
  });

  it('keeps 6–8 technologies and covers the core categories for long stacks', () => {
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
      const stack = postingStack(many, catalog, createRng(`many-${i}`));
      expect(stack.length).toBe(8);
      expect(stack).toContain('react');
      expect(stack).toContain('nodejs');
      for (const t of stack) expect(many.technologyIds).toContain(t);
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
    const names = posting.facts.technologyIds.map(
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
      const [r1, r2] = pickJobMemoryTemplates(createRng(`t-${i}`));
      expect(r1).not.toBe(r2);
    }
  });
});
