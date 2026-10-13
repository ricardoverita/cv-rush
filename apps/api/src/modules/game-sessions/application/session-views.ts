import type {
  AtsView,
  ChallengeStage,
  CompetingContext,
  GameResultView,
  Locale,
  QuestionView,
  ScoreBreakdown,
  SessionView,
} from '@cv-rush/contracts';
import { CHALLENGE_STAGES } from '@cv-rush/contracts';
import type { Ruleset } from '@cv-rush/content';
import type { JobChallengeService, StoredPosting } from '../../job-challenges/index.js';
import type { AtsToken } from '../domain/ats.js';
import type { QuestionStage } from '../domain/effects.js';
import { SEGMENT_BEFORE } from '../domain/state-machine.js';
import type { AttemptRow, SessionAggregate } from '../infrastructure/session.repository.js';
import { blueprintOf, correctIn, scoreOf } from './run-record.js';

// What leaves the server (docs/architecture/09 §6): the current question only, without its key;
// ATS tokens without relevance; explanations and expected answers only in practice reviews.

interface Presented {
  prompt: string;
  options: { id: 'a' | 'b' | 'c' | 'd'; text: string }[];
}
type AnswerKey = { correct: string } | { grades: Record<string, string> };

const NEXT_CHALLENGE: Partial<Record<SessionView['stage'], ChallengeStage>> = Object.fromEntries(
  CHALLENGE_STAGES.map((stage) => [SEGMENT_BEFORE[stage], stage]),
);

function iso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

function questionView(agg: SessionAggregate, attempt: AttemptRow): QuestionView {
  const presented = attempt.presented as unknown as Presented;
  const stageSlots = blueprintOf(agg)[attempt.stage as QuestionStage];
  return {
    challengeId: attempt.challengeId,
    questionAttemptId: attempt.id,
    stage: attempt.stage,
    slot: attempt.slot,
    index: stageSlots.findIndex((s) => s.slot === attempt.slot) + 1,
    total: stageSlots.length,
    prompt: presented.prompt,
    options: presented.options,
    windowMs: attempt.windowMs,
    servedAt: attempt.servedAt.toISOString(),
    expiresAt: attempt.deadlineAt.toISOString(),
  };
}

function atsView(agg: SessionAggregate, ruleset: Ruleset): AtsView | null {
  const challenge = agg.challenges.find((c) => c.stage === 'ats' && c.status === 'open');
  if (!challenge || !challenge.deadlineAt) return null;
  const tokens = (challenge.payload as unknown as { tokens: AtsToken[] }).tokens;
  return {
    challengeId: challenge.id,
    tokens: tokens.map(({ id, label }) => ({ id, label })),
    threshold: ruleset.ats.threshold,
    windowMs: ruleset.ats.windowMs,
    expiresAt: challenge.deadlineAt.toISOString(),
  };
}

function progress(agg: SessionAggregate, ruleset: Ruleset): SessionView['progress'] {
  const blueprint = blueprintOf(agg);
  const failedAt = agg.status === 'failed' || agg.status === 'abandoned' ? agg.stage : null;
  return CHALLENGE_STAGES.map((stage) => {
    const challenge = agg.challenges.find((c) => c.stage === stage);
    const state =
      failedAt === stage
        ? 'failed'
        : agg.status === 'in_progress' && agg.stage === stage
          ? 'current'
          : challenge?.status === 'completed'
            ? 'passed'
            : 'pending';
    if (stage === 'ats') {
      const match = (challenge?.outcome as { match?: number } | null)?.match;
      return { stage, state, ...(match === undefined ? {} : { match }) };
    }
    return {
      stage,
      state,
      correct: correctIn(agg, stage, ruleset.scoring),
      total: blueprint[stage].length,
    };
  });
}

export function resultView(agg: SessionAggregate): GameResultView | null {
  const result = agg.result;
  if (!result) return null;
  const posting = agg.jobChallenge.posting as unknown as StoredPosting;
  const practice = agg.runType === 'practice';
  const review = agg.attempts
    .filter((a) => a.outcome !== null)
    .map((a) => {
      const presented = a.presented as unknown as Presented;
      const key = a.answerKey as unknown as AnswerKey;
      const textOf = (id: string | null | undefined) =>
        presented.options.find((o) => o.id === id)?.text;
      const expected =
        'correct' in key
          ? key.correct
          : Object.entries(key.grades).find(([, grade]) => grade === 'aligned')?.[0];
      return {
        stage: a.stage,
        slot: a.slot,
        prompt: presented.prompt,
        outcome: a.outcome ?? 'neutral',
        // Ranked reviews show results and topics only; answers stay secret (docs/architecture/09 §6).
        ...(practice
          ? {
              correctOptionText: textOf(expected),
              selectedOptionText: textOf(a.selectedOptionId),
              explanation: a.explanation ?? undefined,
            }
          : {}),
      };
    });
  const counts = result.counts as GameResultView['counts'];
  return {
    id: result.id,
    sessionId: result.sessionId,
    runType: result.runType,
    status: result.status,
    reasonCode: result.reasonCode as GameResultView['reasonCode'],
    totalScore: result.totalScore,
    breakdown: result.breakdown as unknown as ScoreBreakdown,
    accuracy: result.accuracy,
    counts,
    atsMatch: result.atsMatch,
    cvHealth: result.cvHealth,
    competingContext: result.competingContext as unknown as CompetingContext,
    job: {
      company: posting.facts.company.name,
      seniority: posting.facts.seniority,
      roleId: posting.facts.roleId,
    },
    seasonId: result.seasonId,
    scoringVersion: result.scoringVersion,
    startedAt: iso(result.startedAt),
    endedAt: result.endedAt.toISOString(),
    review: review.map((item) => JSON.parse(JSON.stringify(item))),
  };
}

export function sessionView(
  agg: SessionAggregate,
  ctx: { ruleset: Ruleset; jobs: JobChallengeService; now: Date; rankedUsedToday: number },
): SessionView {
  const posting = agg.jobChallenge.posting as unknown as StoredPosting;
  const open =
    agg.status === 'in_progress'
      ? agg.attempts.find((a) => a.answeredAt === null && a.stage === agg.stage)
      : undefined;
  const result = resultView(agg);
  const max = ctx.ruleset.ranked.attemptsPerDay;
  return {
    id: agg.id,
    runType: agg.runType,
    status: agg.status,
    stage: agg.stage,
    locale: agg.locale as Locale,
    competingContext: agg.snapshot as unknown as CompetingContext,
    job: ctx.jobs.postingView(posting, agg.locale as Locale),
    attempt:
      agg.runType !== 'ranked'
        ? null
        : agg.rankedAttempt
          ? { number: agg.rankedAttempt.number, max, committed: true }
          : { number: Math.min(max, ctx.rankedUsedToday + 1), max, committed: false },
    cvHealth: agg.cvHealth,
    provisionalScore: result ? result.totalScore : scoreOf(agg, ctx.ruleset, 'in_progress').total,
    progress: progress(agg, ctx.ruleset),
    nextChallenge: agg.status === 'in_progress' ? (NEXT_CHALLENGE[agg.stage] ?? null) : null,
    question: open ? questionView(agg, open) : null,
    ats: agg.status === 'in_progress' && agg.stage === 'ats' ? atsView(agg, ctx.ruleset) : null,
    result,
    reviewExpiresAt: agg.reviewExpiresAt.toISOString(),
    expiresAt: iso(agg.expiresAt),
    serverTime: ctx.now.toISOString(),
  };
}
