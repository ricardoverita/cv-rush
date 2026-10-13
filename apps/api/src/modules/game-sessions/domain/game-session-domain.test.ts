import { readRuleset } from '@cv-rush/content';
import { createRng } from '@cv-rush/simulation';
import { describe, expect, it } from 'vitest';
import { generateAtsTokens, scoreAts } from './ats.js';
import { applyCvDamage, questionEffects } from './effects.js';
import {
  InvalidTransition,
  type SessionEvent,
  type SessionState,
  transition,
} from './state-machine.js';
import { endOfUtcDay, utcDayKey } from './time.js';

const ruleset = readRuleset('ruleset-v0');
const start: SessionState = { status: 'created', stage: 'job_review' };

function run(events: SessionEvent[], from = start): SessionState {
  return events.reduce(transition, from);
}

const happyPath: SessionEvent[] = [
  { type: 'APPLY' },
  { type: 'START', challenge: 'recruiter' },
  { type: 'COMPLETE', challenge: 'recruiter' },
  { type: 'START', challenge: 'ats' },
  { type: 'PASS_ATS' },
  { type: 'START', challenge: 'hiring_manager' },
  { type: 'COMPLETE', challenge: 'hiring_manager' },
  { type: 'START', challenge: 'final' },
  { type: 'DELIVER' },
];

describe('session state machine', () => {
  it('walks the whole run in order', () => {
    const states = happyPath.map((_, i) => run(happyPath.slice(0, i + 1)));
    expect(states.map((s) => s.stage)).toEqual([
      'segment_1',
      'recruiter',
      'segment_2',
      'ats',
      'segment_3',
      'hiring_manager',
      'segment_4',
      'final',
      'finished',
    ]);
    expect(states.at(-1)?.status).toBe('delivered');
  });

  it.each<[string, SessionEvent[], SessionEvent]>([
    [
      'start the final interview during the recruiter stage',
      happyPath.slice(0, 2),
      { type: 'START', challenge: 'final' },
    ],
    ['start a challenge before applying', [], { type: 'START', challenge: 'recruiter' }],
    ['apply twice', happyPath.slice(0, 1), { type: 'APPLY' }],
    ['skip the ATS', happyPath.slice(0, 3), { type: 'START', challenge: 'hiring_manager' }],
    ['pass the ATS outside the ATS', happyPath.slice(0, 2), { type: 'PASS_ATS' }],
    ['deliver from the hiring manager', happyPath.slice(0, 6), { type: 'DELIVER' }],
    [
      'complete the recruiter stage twice',
      happyPath.slice(0, 3),
      { type: 'COMPLETE', challenge: 'recruiter' },
    ],
    ['destroy the CV between stages', happyPath.slice(0, 3), { type: 'DESTROY_CV' }],
    ['act after delivering', happyPath, { type: 'START', challenge: 'recruiter' }],
    ['abandon an expired review', [{ type: 'EXPIRE_REVIEW' }], { type: 'ABANDON' }],
  ])('rejects: %s', (_, before, event) => {
    expect(() => transition(run(before), event)).toThrow(InvalidTransition);
  });

  it('fails the run on ATS rejection or a destroyed CV, and abandons from any active stage', () => {
    expect(run([...happyPath.slice(0, 4), { type: 'FAIL_ATS' }])).toEqual({
      status: 'failed',
      stage: 'ats',
    });
    expect(run([...happyPath.slice(0, 2), { type: 'DESTROY_CV' }])).toEqual({
      status: 'failed',
      stage: 'recruiter',
    });
    expect(run([...happyPath.slice(0, 5), { type: 'ABANDON' }])).toEqual({
      status: 'abandoned',
      stage: 'segment_3',
    });
    expect(run([{ type: 'EXPIRE_REVIEW' }])).toEqual({
      status: 'expired_unstarted',
      stage: 'job_review',
    });
  });
});

describe('effects', () => {
  it('damages the CV for wrong answers and timeouts, more in later stages', () => {
    expect(applyCvDamage(100, questionEffects('recruiter', { kind: 'incorrect' }, ruleset))).toBe(
      90,
    );
    expect(
      applyCvDamage(100, questionEffects('hiring_manager', { kind: 'timeout' }, ruleset)),
    ).toBe(85);
    expect(applyCvDamage(20, questionEffects('final', { kind: 'incorrect' }, ruleset))).toBe(0);
    expect(questionEffects('final', { kind: 'correct' }, ruleset)).toEqual([
      { code: 'FINAL_BOOST', value: 20 },
    ]);
  });

  it('a run with every answer wrong does not reach the company (3×10 + 3×15 + 25 = 100)', () => {
    let cv = 100;
    for (const stage of [
      'recruiter',
      'recruiter',
      'recruiter',
      'hiring_manager',
      'hiring_manager',
      'hiring_manager',
      'final',
    ] as const) {
      cv = applyCvDamage(cv, questionEffects(stage, { kind: 'incorrect' }, ruleset));
    }
    expect(cv).toBe(0);
  });
});

describe('ATS', () => {
  const catalog = {
    technologies: [
      { id: 'nodejs', name: 'Node.js', category: 'backend', aliases: ['node'] },
      { id: 'react', name: 'React', category: 'frontend' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'databases', aliases: ['postgres'] },
      { id: 'angular', name: 'Angular', category: 'frontend' },
      { id: 'swift', name: 'Swift', category: 'mobile' },
      { id: 'spark', name: 'Spark', category: 'data' },
    ],
    roleCategories: ['frontend', 'backend', 'databases'],
  };
  const tokens = generateAtsTokens(
    ['nodejs', 'react', 'postgresql'],
    catalog,
    ruleset.ats,
    createRng('ats'),
  );

  it('mixes the posting keywords with irrelevant technologies and buzzwords', () => {
    expect(tokens.filter((t) => t.relevant)).toHaveLength(3);
    expect(tokens.filter((t) => !t.relevant)).toHaveLength(
      ruleset.ats.irrelevantTechnologies + ruleset.ats.buzzwords,
    );
    expect(tokens.map((t) => t.id)).toEqual(tokens.map((_, i) => `t${i + 1}`));
  });

  it('computes the match with the recruiter bonus and the irrelevant penalty', () => {
    const relevant = tokens.filter((t) => t.relevant).map((t) => t.id);
    const irrelevant = tokens.filter((t) => !t.relevant).map((t) => t.id);
    expect(scoreAts(tokens, relevant, 0, ruleset)).toMatchObject({
      match: 100,
      passed: true,
      cvDamage: 0,
    });
    const twoOfThree = scoreAts(tokens, [...relevant.slice(0, 2), irrelevant[0]!], 2, ruleset);
    expect(twoOfThree).toMatchObject({
      match: 64.7,
      passed: false,
      irrelevantCollected: 1,
      cvDamage: 5,
    });
    expect(scoreAts(tokens, irrelevant, 3, ruleset)).toMatchObject({ match: 0, cvDamage: 20 });
    // Unknown ids and duplicates don't count.
    expect(scoreAts(tokens, [...relevant, relevant[0]!, 't99'], 0, ruleset).relevantCollected).toBe(
      3,
    );
  });
});

describe('UTC days', () => {
  it('uses UTC boundaries for day keys and locks', () => {
    const lateInLima = new Date('2026-10-13T04:30:00.000Z'); // 23:30 on the 12th in Lima
    expect(utcDayKey(lateInLima)).toBe('2026-10-13');
    expect(endOfUtcDay(lateInLima).toISOString()).toBe('2026-10-14T00:00:00.000Z');
  });
});
