import type { Ruleset } from '@cv-rush/content';
import type { Blueprint, BlueprintSlot } from '../../job-challenges/index.js';
import {
  computeScore,
  type Grade,
  type RunStatus,
  type ScoredSlot,
  slotCredit,
} from '../../scoring/scoring.js';
import type { QuestionStage } from '../domain/effects.js';
import type { AttemptRow, SessionAggregate } from '../infrastructure/session.repository.js';

// Pure helpers that read a run's records (blueprint + attempts) for scoring and views.

export const QUESTION_STAGES: readonly QuestionStage[] = ['recruiter', 'hiring_manager', 'final'];

export interface QuestionSlot extends BlueprintSlot {
  stage: QuestionStage;
}

export function blueprintOf(agg: SessionAggregate): Blueprint {
  return agg.jobChallenge.blueprint as unknown as Blueprint;
}

/** Every question slot of the run, in order (R1–R3, H1–H3, F1). */
export function questionSlots(blueprint: Blueprint): QuestionSlot[] {
  return QUESTION_STAGES.flatMap((stage) => blueprint[stage].map((slot) => ({ ...slot, stage })));
}

export function attemptFor(agg: SessionAggregate, slot: string): AttemptRow | undefined {
  return agg.attempts.find((a) => a.slot === slot);
}

/** The run as the scoring engine sees it: unreached or unanswered slots are `pending`. */
export function scoredSlots(agg: SessionAggregate): ScoredSlot[] {
  return questionSlots(blueprintOf(agg)).map((slot) => {
    const attempt = attemptFor(agg, slot.slot);
    return {
      slot: slot.slot,
      level: slot.level,
      windowMs: slot.windowMs,
      outcome: attempt?.outcome ?? 'pending',
      grade: (attempt?.grade as Grade | null | undefined) ?? null,
      responseMs: attempt?.responseMs ?? null,
    };
  });
}

/** Correct answers (and aligned salary answers) in a stage. */
export function correctIn(agg: SessionAggregate, stage: QuestionStage, rules: Ruleset['scoring']) {
  const slots = scoredSlots(agg);
  const stageSlots = new Set(blueprintOf(agg)[stage].map((s) => s.slot));
  return slots.filter((s) => stageSlots.has(s.slot) && slotCredit(s, rules) === 1).length;
}

/** Consecutive full-credit answers ending at the latest resolved slot. */
export function currentCombo(agg: SessionAggregate, rules: Ruleset['scoring']): number {
  let combo = 0;
  for (const slot of scoredSlots(agg)) {
    if (slot.outcome === 'pending') break;
    if (slot.outcome === 'neutral') continue;
    combo = slotCredit(slot, rules) === 1 ? combo + 1 : 0;
  }
  return combo;
}

export function atsMatchOf(agg: SessionAggregate): number | null {
  const ats = agg.challenges.find((c) => c.stage === 'ats' && c.status === 'completed');
  const outcome = ats?.outcome as { match?: number } | null | undefined;
  return typeof outcome?.match === 'number' ? outcome.match : null;
}

export function scoreOf(agg: SessionAggregate, ruleset: Ruleset, status: RunStatus) {
  return computeScore(
    {
      slots: scoredSlots(agg),
      atsMatch: atsMatchOf(agg),
      cvHealth: agg.cvHealth,
      status,
      toleranceMs: ruleset.session.answerToleranceMs,
    },
    ruleset.scoring,
  );
}
