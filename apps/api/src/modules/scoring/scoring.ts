import type { ScoreBreakdown } from '@cv-rush/contracts';
import type { Ruleset } from '@cv-rush/content';

// The scoring engine (docs/architecture/11 §1): a pure function of server records and the
// versioned rules. No I/O, no clock, no randomness, and the only place where points come from.
// scoring-v0: scoring-v1 without the race; "completion" replaces "final position" until bots
// and race time exist. Values live in the ruleset, so rebalancing never touches this code.

export type ScoringRules = Ruleset['scoring'];
export type Grade = keyof ScoringRules['gradedCredit'];
export type SlotOutcome = 'correct' | 'incorrect' | 'timeout' | 'graded' | 'neutral' | 'pending';
export type RunStatus = 'in_progress' | 'delivered' | 'failed' | 'abandoned';

export interface ScoredSlot {
  slot: string;
  /** Difficulty level, used as the slot's weight. */
  level: number;
  /** `pending` = not reached (yet); it still counts in the denominator. */
  outcome: SlotOutcome;
  grade?: Grade | null;
  responseMs?: number | null;
  windowMs: number;
}

export interface ScoringInput {
  /** Every question slot of the blueprint, in run order. */
  slots: ScoredSlot[];
  /** ATS match (0–100), or null if the ATS wasn't completed. */
  atsMatch: number | null;
  cvHealth: number;
  status: RunStatus;
  toleranceMs: number;
}

/** 1 for a correct answer, the grade's credit for graded answers, 0 otherwise. */
export function slotCredit(slot: ScoredSlot, rules: ScoringRules): number {
  if (slot.outcome === 'correct') return 1;
  if (slot.outcome === 'graded' && slot.grade) return rules.gradedCredit[slot.grade];
  return 0;
}

/** Share of the speed points: faster answers (relative to the window) earn more. */
export function speedCredit(slot: ScoredSlot, toleranceMs: number, rules: ScoringRules): number {
  if (slot.responseMs == null) return 0;
  const used = Math.max(0, slot.responseMs - toleranceMs) / slot.windowMs;
  return rules.speedBuckets.find((bucket) => used <= bucket.upTo)?.credit ?? 0;
}

function totalWeight(slots: ScoredSlot[]): number {
  return slots.filter((s) => s.outcome !== 'neutral').reduce((sum, s) => sum + s.level, 0);
}

/** Points a single resolved slot contributes (answer + speed), shown right after answering. */
export function slotPoints(
  slot: ScoredSlot,
  allSlots: ScoredSlot[],
  toleranceMs: number,
  rules: ScoringRules,
): number {
  const weight = totalWeight(allSlots);
  if (weight === 0 || slot.outcome === 'neutral') return 0;
  const credit = slotCredit(slot, rules);
  const answers = (rules.weights.answers * slot.level * credit) / weight;
  const speed =
    (rules.weights.speed * slot.level * credit * speedCredit(slot, toleranceMs, rules)) / weight;
  return Math.round(answers + speed);
}

function longestStreak(slots: ScoredSlot[], rules: ScoringRules): number {
  let best = 0;
  let current = 0;
  for (const slot of slots) {
    if (slot.outcome === 'neutral') continue;
    current = slotCredit(slot, rules) === 1 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

export function computeScore(
  input: ScoringInput,
  rules: ScoringRules,
): { total: number; breakdown: ScoreBreakdown } {
  const { weights } = rules;
  const counted = input.slots.filter((s) => s.outcome !== 'neutral');
  const weight = totalWeight(input.slots);
  const share = (perSlot: (slot: ScoredSlot) => number) =>
    weight === 0 ? 0 : counted.reduce((sum, s) => sum + s.level * perSlot(s), 0) / weight;
  const delivered = input.status === 'delivered';

  const breakdown: ScoreBreakdown = {
    answers: Math.round(weights.answers * share((s) => slotCredit(s, rules))),
    speed: Math.round(
      weights.speed * share((s) => slotCredit(s, rules) * speedCredit(s, input.toleranceMs, rules)),
    ),
    completion: delivered ? weights.completion : 0,
    ats: Math.round((weights.ats * (input.atsMatch ?? 0)) / 100),
    cvHealth: delivered ? Math.round((weights.cvHealth * input.cvHealth) / 100) : 0,
    streak:
      counted.length === 0
        ? 0
        : Math.round((weights.streak * longestStreak(input.slots, rules)) / counted.length),
  };
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return { total, breakdown };
}
