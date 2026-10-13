import { readRuleset } from '@cv-rush/content';
import { describe, expect, it } from 'vitest';
import { computeScore, type ScoredSlot, slotPoints, speedCredit } from './scoring.js';

const rules = readRuleset('ruleset-v0').scoring;
const tolerance = 300;

// Senior+ blueprint: R1–R3 at level 2, H1 3, H2 3, H3 4, F1 4 → total weight 20.
function slots(outcome: ScoredSlot['outcome'], responseMs = 2000): ScoredSlot[] {
  const spec: [string, number, number][] = [
    ['R1', 2, 10000],
    ['R2', 2, 10000],
    ['R3', 2, 10000],
    ['H1', 3, 15000],
    ['H2', 3, 15000],
    ['H3', 4, 15000],
    ['F1', 4, 20000],
  ];
  return spec.map(([slot, level, windowMs]) => ({
    slot,
    level,
    windowMs,
    outcome: slot === 'R3' && outcome === 'correct' ? 'graded' : outcome,
    grade: slot === 'R3' && outcome === 'correct' ? 'aligned' : null,
    responseMs,
  }));
}

describe('scoring-v0', () => {
  it('gives the maximum (25,000) to a fast, perfect, delivered run', () => {
    const { total, breakdown } = computeScore(
      {
        slots: slots('correct'),
        atsMatch: 100,
        cvHealth: 100,
        status: 'delivered',
        toleranceMs: tolerance,
      },
      rules,
    );
    expect(breakdown).toEqual({
      answers: 11250,
      speed: 3750,
      completion: 3000,
      ats: 2500,
      cvHealth: 2500,
      streak: 2000,
    });
    expect(total).toBe(25000);
  });

  it('gives no answer, speed, streak, completion or CV points to an all-wrong failed run', () => {
    const { total, breakdown } = computeScore(
      {
        slots: slots('incorrect'),
        atsMatch: 75,
        cvHealth: 0,
        status: 'failed',
        toleranceMs: tolerance,
      },
      rules,
    );
    expect(breakdown).toEqual({
      answers: 0,
      speed: 0,
      completion: 0,
      ats: 1875,
      cvHealth: 0,
      streak: 0,
    });
    expect(total).toBe(1875);
  });

  it('counts unreached slots in the denominator (a run that fails early keeps a partial score)', () => {
    const partial = slots('correct').map((s, i) =>
      i < 3 ? s : { ...s, outcome: 'pending' as const },
    );
    const { breakdown } = computeScore(
      { slots: partial, atsMatch: 50, cvHealth: 90, status: 'failed', toleranceMs: tolerance },
      rules,
    );
    // 6 of 20 weight points answered correctly.
    expect(breakdown.answers).toBe(Math.round((11250 * 6) / 20));
    expect(breakdown.completion).toBe(0);
    expect(breakdown.cvHealth).toBe(0);
  });

  it('credits graded salary answers partially and breaks the streak', () => {
    const run = slots('correct');
    run[2] = { ...run[2]!, grade: 'undersell' };
    const { breakdown } = computeScore(
      { slots: run, atsMatch: 100, cvHealth: 100, status: 'delivered', toleranceMs: tolerance },
      rules,
    );
    // R3 earns 25% of its weight; the longest streak is H1–F1 (4 of 7 slots).
    expect(breakdown.answers).toBe(Math.round((11250 * (18 + 2 * 0.25)) / 20));
    expect(breakdown.streak).toBe(Math.round((2000 * 4) / 7));
  });

  it('rewards speed in buckets, after the tolerance', () => {
    const slot = { slot: 'H1', level: 3, windowMs: 10000, outcome: 'correct' as const };
    expect(speedCredit({ ...slot, responseMs: 2800 }, tolerance, rules)).toBe(1);
    expect(speedCredit({ ...slot, responseMs: 4000 }, tolerance, rules)).toBe(0.75);
    expect(speedCredit({ ...slot, responseMs: 7000 }, tolerance, rules)).toBe(0.5);
    expect(speedCredit({ ...slot, responseMs: 10300 }, tolerance, rules)).toBe(0.25);
  });

  it('shows per-slot points consistent with the final breakdown', () => {
    const run = slots('correct');
    const sum = run.reduce((total, s) => total + slotPoints(s, run, tolerance, rules), 0);
    expect(Math.abs(sum - (11250 + 3750))).toBeLessThanOrEqual(run.length);
  });

  it('ignores neutral slots (e.g. a question invalidated mid-run)', () => {
    const run = slots('correct');
    run[3] = { ...run[3]!, outcome: 'neutral' };
    const { breakdown } = computeScore(
      { slots: run, atsMatch: 100, cvHealth: 100, status: 'delivered', toleranceMs: tolerance },
      rules,
    );
    expect(breakdown.answers).toBe(11250);
    expect(breakdown.streak).toBe(2000);
  });
});
