import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  AnswerRequest,
  AnswerResponse,
  AtsResponse,
  AtsSubmitRequest,
  ChallengeStage,
  CompetingContext,
  CreateGameSessionRequest,
  Effect,
  GameResultView,
  RankedStatus,
  SessionView,
} from '@cv-rush/contracts';
import type { Ruleset } from '@cv-rush/content';
import { createRng, deriveSeed } from '@cv-rush/simulation';
import type { Prisma } from '../../../generated/prisma/client.js';
import { Clock } from '../../../platform/clock.js';
import { PrismaService } from '../../../platform/database/prisma.service.js';
import { AppError } from '../../../platform/http/app-error.js';
import { Rulesets } from '../../../platform/rulesets.js';
import { CatalogService } from '../../catalog/index.js';
import {
  type Blueprint,
  buildBlueprint,
  JobChallengeService,
  type StoredPosting,
} from '../../job-challenges/index.js';
import { CompetitiveSnapshots } from '../../profiles/index.js';
import { type PoolSlotKind, QuestionEngine } from '../../questions/index.js';
import { slotCredit, slotPoints } from '../../scoring/scoring.js';
import { type AtsToken, generateAtsTokens, scoreAts } from '../domain/ats.js';
import {
  applyCvDamage,
  type QuestionStage,
  questionEffects,
  type ResolvedOutcome,
} from '../domain/effects.js';
import {
  InvalidTransition,
  isActive,
  SEGMENT_BEFORE,
  type SessionEvent,
  transition,
} from '../domain/state-machine.js';
import { endOfUtcDay, startOfUtcDay, utcDayKey } from '../domain/time.js';
import {
  type AttemptRow,
  type SessionAggregate,
  SessionRepository,
  type Tx,
} from '../infrastructure/session.repository.js';
import {
  atsMatchOf,
  blueprintOf,
  correctIn,
  currentCombo,
  questionSlots,
  scoreOf,
  scoredSlots,
} from './run-record.js';
import { sessionView } from './session-views.js';

type AnswerKey = { correct: string } | { grades: Record<string, string> };
type ResultStatus = 'delivered' | 'failed' | 'abandoned';

const POOL_KINDS = new Set<string>(['stack', 'track_fundamentals', 'seniority', 'mixed_scenario']);
const TX_OPTIONS = { timeout: 15_000, maxWait: 5_000 };

/**
 * The game-sessions module's use cases (docs/architecture/07). The server is the referee: it
 * decides the job, every question, every outcome, the ATS match, the score and the result.
 * Each request runs in one transaction with the session row locked; overdue deadlines are
 * resolved lazily on the next request (and by the sweeper), never by client claims.
 */
@Injectable()
export class GameSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: Clock,
    private readonly rulesets: Rulesets,
    private readonly sessions: SessionRepository,
    private readonly snapshots: CompetitiveSnapshots,
    private readonly jobs: JobChallengeService,
    private readonly questions: QuestionEngine,
    private readonly catalog: CatalogService,
  ) {}

  // ------------------------------------------------------------------ public use cases

  async rankedStatus(developerId: string): Promise<RankedStatus> {
    const now = this.clock.now();
    const ruleset = this.rulesets.current();
    const dayKey = utcDayKey(now);
    const [used, snapshot, activeSessionId] = await Promise.all([
      this.sessions.rankedAttemptsOn(this.prisma, developerId, dayKey),
      this.snapshots.take(this.prisma, developerId),
      this.sessions.resumableSessionId(this.prisma, developerId, now),
    ]);
    const max = ruleset.ranked.attemptsPerDay;
    return {
      dayKey,
      max,
      used,
      remaining: Math.max(0, max - used),
      resetsAt: endOfUtcDay(now).toISOString(),
      trackStatus: ruleset.ranked.tracks[snapshot.trackId] ?? 'practice_only',
      activeSessionId,
    };
  }

  /**
   * Creates a session in job review: the frozen snapshot, the Job Challenge and its posting.
   * Nothing competitive is revealed yet and no ranked attempt is used (ADR-019).
   */
  async create(developerId: string, request: CreateGameSessionRequest): Promise<SessionView> {
    const now = this.clock.now();
    const ruleset = this.rulesets.current();
    const dayKey = utcDayKey(now);
    const snapshot = await this.snapshots.take(this.prisma, developerId);
    const ranked = request.runType === 'ranked';

    if (ranked) {
      if (!ruleset.ranked.tracks[snapshot.trackId]) {
        throw AppError.rule('RANKED_NOT_AVAILABLE', { trackId: snapshot.trackId });
      }
      const used = await this.sessions.rankedAttemptsOn(this.prisma, developerId, dayKey);
      if (used >= ruleset.ranked.attemptsPerDay) {
        throw new AppError('RANKED_ATTEMPTS_EXHAUSTED', 409, {
          resetsAt: endOfUtcDay(now).toISOString(),
        });
      }
      const uncommitted = await this.sessions.uncommittedRankedOn(this.prisma, developerId, dayKey);
      if (uncommitted >= ruleset.ranked.maxUncommittedPerDay) {
        throw new AppError('TOO_MANY_RANKED_SESSIONS', 429);
      }
    }

    const seasonId = await this.sessions.activeSeasonId(this.prisma);
    if (!seasonId) throw new AppError('SERVICE_UNAVAILABLE', 503);

    const seed = randomBytes(32);
    const seedHex = seed.toString('hex');
    const posting = this.jobs.generate(snapshot, seedHex);
    const blueprint = buildBlueprint(ruleset, request.runType, snapshot.seniority, snapshot.band);

    // Every pool slot must be servable before the run exists (no attempt is ever lost to
    // missing content, docs/architecture/09 §3).
    const available = await this.questions.isAvailable(
      this.engineContext(this.prisma, {
        developerId,
        runType: request.runType,
        locale: request.locale,
        snapshot,
        postingTechnologyIds: posting.facts.technologyIds,
        seedHex,
        excludeQuestionIds: [],
        now,
      }),
      questionSlots(blueprint)
        .filter((s) => POOL_KINDS.has(s.kind))
        .map((s) => ({ slot: s.slot, kind: s.kind as PoolSlotKind, level: s.level })),
    );
    if (!available) {
      throw AppError.rule(ranked ? 'RANKED_CONTENT_UNAVAILABLE' : 'CONTENT_UNAVAILABLE');
    }

    const sessionId = await this.prisma.$transaction(async (tx) => {
      await this.sessions.lockDeveloper(tx, developerId);
      // One active session per developer: an unstarted one expires, a started one is abandoned.
      const previous = await this.sessions.activeSessionId(tx, developerId);
      if (previous) {
        const agg = await this.sessions.load(tx, previous);
        await this.close(tx, agg, now, agg.status === 'created' ? 'EXPIRE_REVIEW' : 'ABANDON');
      }
      const jobChallengeId = await this.jobs.persist(tx, {
        posting,
        blueprint,
        runType: request.runType,
        categoryKey: snapshot.categoryKey,
        dayKey,
        rulesetVersion: ruleset.version,
      });
      const session = await tx.gameSession.create({
        data: {
          developerId,
          runType: request.runType,
          snapshot: snapshot as unknown as Prisma.InputJsonValue,
          categoryKey: snapshot.categoryKey,
          jobChallengeId,
          seed,
          locale: request.locale,
          rulesetVersion: ruleset.version,
          scoringVersion: ruleset.scoring.version,
          seasonId,
          dayKey,
          cvHealth: ruleset.cvHealth.initial,
          reviewExpiresAt: new Date(now.getTime() + ruleset.session.reviewWindowMs),
          lastActivityAt: now,
        },
        select: { id: true },
      });
      return session.id;
    }, TX_OPTIONS);
    return this.get(developerId, sessionId);
  }

  /** The session's current state (refreshing lazily overdue deadlines). Never re-rolls anything. */
  get(developerId: string, sessionId: string): Promise<SessionView> {
    return this.mutate(developerId, sessionId, async (_tx, agg) => agg).then(({ view }) => view);
  }

  /**
   * Starts the race. Ranked: the attempt is committed here, atomically, and the ranked profile
   * is locked until the end of the UTC day. Applying twice returns the same state.
   */
  async apply(developerId: string, sessionId: string): Promise<SessionView> {
    const { view } = await this.mutate(developerId, sessionId, async (tx, agg, now) => {
      if (agg.status === 'in_progress' && agg.committedAt) return agg; // double click or retry
      if (agg.status === 'expired_unstarted') throw new AppError('SESSION_EXPIRED', 409);
      const ruleset = this.rulesets.get(agg.rulesetVersion);
      // The state machine first: only a session in job review can be applied to. The attempt is
      // allocated in the same transaction, so a refused allocation rolls the transition back.
      await this.move(tx, agg, { type: 'APPLY' }, now, {
        committedAt: now,
        expiresAt: new Date(now.getTime() + ruleset.session.maxLifetimeMs),
      });
      if (agg.runType === 'ranked') {
        const dayKey = utcDayKey(now);
        const used = await this.sessions.rankedAttemptsOn(tx, developerId, dayKey);
        if (used >= ruleset.ranked.attemptsPerDay) {
          throw new AppError('RANKED_ATTEMPTS_EXHAUSTED', 409, {
            resetsAt: endOfUtcDay(now).toISOString(),
          });
        }
        await tx.rankedAttempt.create({
          data: { developerId, dayKey, number: used + 1, sessionId: agg.id, committedAt: now },
        });
        await this.snapshots.lockRanked(tx, developerId, endOfUtcDay(now));
      }
      return this.sessions.load(tx, agg.id);
    });
    return view;
  }

  /** Reaches a checkpoint and opens its challenge, serving only the first question. */
  async startChallenge(
    developerId: string,
    sessionId: string,
    stage: ChallengeStage,
  ): Promise<SessionView> {
    const { view } = await this.mutate(developerId, sessionId, async (tx, agg, now) => {
      if (agg.status === 'in_progress' && agg.stage === stage) return agg; // already open
      const ruleset = this.rulesets.get(agg.rulesetVersion);
      if (agg.status === 'in_progress' && agg.stage === SEGMENT_BEFORE[stage]) {
        // The client can't reach a checkpoint before the race model allows (S3 sets real values).
        const segment = ['segment_1', 'segment_2', 'segment_3', 'segment_4'].indexOf(agg.stage);
        const minMs = ruleset.session.segmentMinMs[segment] ?? 0;
        const elapsed = now.getTime() - (agg.stageStartedAt ?? now).getTime();
        if (elapsed + ruleset.session.answerToleranceMs < minMs) {
          throw new AppError('CHECKPOINT_TOO_EARLY', 409, { waitMs: minMs - elapsed });
        }
      }
      await this.move(tx, agg, { type: 'START', challenge: stage }, now);
      const challengeId = randomUUID();
      if (stage === 'ats') {
        const posting = agg.jobChallenge.posting as unknown as StoredPosting;
        const role = this.catalog.content().roles.find((r) => r.id === posting.facts.roleId);
        const tokens = generateAtsTokens(
          posting.facts.technologyIds,
          {
            technologies: this.catalog.content().technologies,
            roleCategories: [...(role?.coreCategories ?? []), ...(role?.allowedCategories ?? [])],
          },
          ruleset.ats,
          createRng(deriveSeed(this.seedHex(agg), 'ats')),
        );
        await tx.challenge.create({
          data: {
            id: challengeId,
            sessionId: agg.id,
            stage,
            openedAt: now,
            deadlineAt: new Date(now.getTime() + ruleset.ats.windowMs),
            payload: { tokens } as unknown as Prisma.InputJsonValue,
          },
        });
        return this.sessions.load(tx, agg.id);
      }
      await tx.challenge.create({
        data: { id: challengeId, sessionId: agg.id, stage, openedAt: now },
      });
      const fresh = await this.sessions.load(tx, agg.id);
      return this.serveNext(tx, fresh, stage, now);
    });
    return view;
  }

  /**
   * Resolves the current question. The client sends only which option it chose; the server
   * decides correctness, points, effects and what comes next. Retries are idempotent.
   */
  async answer(
    developerId: string,
    sessionId: string,
    challengeId: string,
    request: AnswerRequest,
  ): Promise<AnswerResponse> {
    let outcome: AnswerResponse['outcome'] | undefined;
    const { view } = await this.mutate(developerId, sessionId, async (tx, agg, now) => {
      const attempt = agg.attempts.find(
        (a) => a.id === request.questionAttemptId && a.challengeId === challengeId,
      );
      if (!attempt) throw new AppError('NOT_FOUND', 404);
      const ruleset = this.rulesets.get(agg.rulesetVersion);
      if (attempt.answeredAt) {
        // A retry with the same answer (or one that arrived after the timeout) replays the
        // recorded outcome; changing the answer is never possible.
        const same =
          attempt.selectedOptionId === request.selectedOptionId || attempt.outcome === 'timeout';
        if (!same) throw new AppError('ALREADY_ANSWERED', 409);
        outcome = this.replayOutcome(agg, attempt, ruleset);
        return agg;
      }
      if (agg.status !== 'in_progress' || agg.stage !== attempt.stage) {
        throw new AppError('CHALLENGE_NOT_OPEN', 409);
      }
      const resolved = await this.resolveQuestion(tx, agg, attempt, request.selectedOptionId, now);
      outcome = resolved.outcome;
      return resolved.agg;
    });
    if (!outcome) throw new AppError('INTERNAL_ERROR', 500);
    return { outcome, session: view };
  }

  /** Completes the ATS scan from the selected keywords; the server computes the match. */
  async submitAts(
    developerId: string,
    sessionId: string,
    challengeId: string,
    request: AtsSubmitRequest,
  ): Promise<AtsResponse> {
    let outcome: AtsResponse['outcome'] | undefined;
    const { view } = await this.mutate(developerId, sessionId, async (tx, agg, now) => {
      const challenge = agg.challenges.find((c) => c.id === challengeId && c.stage === 'ats');
      if (!challenge) throw new AppError('NOT_FOUND', 404);
      if (challenge.status === 'completed') {
        const stored = challenge.outcome as unknown as AtsResponse['outcome'] & {
          selectedTokenIds: string[];
        };
        const same =
          stored.timedOut ||
          [...new Set(request.selectedTokenIds)].sort().join() ===
            [...stored.selectedTokenIds].sort().join();
        if (!same) throw new AppError('ALREADY_ANSWERED', 409);
        outcome = { ...this.atsOutcome(stored), replayed: true };
        return agg;
      }
      if (agg.status !== 'in_progress' || agg.stage !== 'ats') {
        throw new AppError('CHALLENGE_NOT_OPEN', 409);
      }
      const tokens = (challenge.payload as unknown as { tokens: AtsToken[] }).tokens;
      const known = new Set(tokens.map((t) => t.id));
      if (request.selectedTokenIds.some((id) => !known.has(id))) {
        throw AppError.validation(['selectedTokenIds']);
      }
      const resolved = await this.resolveAts(tx, agg, request.selectedTokenIds, now);
      outcome = resolved.outcome;
      return resolved.agg;
    });
    if (!outcome) throw new AppError('INTERNAL_ERROR', 500);
    return { outcome, session: view };
  }

  async result(developerId: string, sessionId: string): Promise<GameResultView> {
    const view = await this.get(developerId, sessionId);
    if (!view.result) throw new AppError('NOT_FOUND', 404);
    return view.result;
  }

  /**
   * The sweeper (worker, every minute): expires unstarted sessions past their review window
   * and abandons started ones past their maximum lifetime, creating their results.
   */
  async sweep(limit = 100): Promise<number> {
    const now = this.clock.now();
    let handled = 0;
    for (const id of await this.sessions.overdue(this.prisma, now, limit)) {
      await this.prisma.$transaction(async (tx) => {
        if (!(await this.sessions.lockForSweep(tx, id))) return;
        await this.refresh(tx, await this.sessions.load(tx, id), now);
        handled++;
      }, TX_OPTIONS);
    }
    return handled;
  }

  // ------------------------------------------------------------------ transaction plumbing

  private async mutate(
    developerId: string,
    sessionId: string,
    action: (tx: Tx, agg: SessionAggregate, now: Date) => Promise<SessionAggregate>,
  ): Promise<{ view: SessionView }> {
    // Locks are always taken developer first, then session, so creating and applying can't
    // deadlock. Overdue deadlines are committed in their own transaction first: they stand
    // even if the requested action is then rejected.
    const lockSession = async (tx: Tx) => {
      await this.sessions.lockDeveloper(tx, developerId);
      if (!(await this.sessions.lock(tx, sessionId, developerId))) {
        throw new AppError('NOT_FOUND', 404);
      }
    };
    await this.prisma.$transaction(async (tx) => {
      await lockSession(tx);
      await this.refresh(tx, await this.sessions.load(tx, sessionId), this.clock.now());
    }, TX_OPTIONS);
    return this.prisma.$transaction(async (tx) => {
      const now = this.clock.now();
      await lockSession(tx);
      const agg = await action(tx, await this.sessions.load(tx, sessionId), now);
      const usedToday =
        agg.runType === 'ranked'
          ? await this.sessions.rankedAttemptsOn(tx, developerId, utcDayKey(now))
          : 0;
      return {
        view: sessionView(agg, {
          ruleset: this.rulesets.get(agg.rulesetVersion),
          jobs: this.jobs,
          now,
          rankedUsedToday: usedToday,
        }),
      };
    }, TX_OPTIONS);
  }

  /** Lazy resolution of everything overdue: review window, lifetime, question and ATS deadlines. */
  private async refresh(tx: Tx, agg: SessionAggregate, now: Date): Promise<SessionAggregate> {
    if (agg.status === 'created' && now > agg.reviewExpiresAt) {
      return this.close(tx, agg, now, 'EXPIRE_REVIEW');
    }
    if (agg.status !== 'in_progress') return agg;
    if (agg.expiresAt && now > agg.expiresAt) return this.close(tx, agg, now, 'ABANDON');
    const tolerance = this.rulesets.get(agg.rulesetVersion).session.answerToleranceMs;
    const open = agg.attempts.find((a) => a.answeredAt === null && a.stage === agg.stage);
    if (open && now.getTime() > open.deadlineAt.getTime() + tolerance) {
      return (await this.resolveQuestion(tx, agg, open, null, now)).agg;
    }
    const ats = agg.challenges.find((c) => c.stage === 'ats' && c.status === 'open');
    if (
      agg.stage === 'ats' &&
      ats?.deadlineAt &&
      now.getTime() > ats.deadlineAt.getTime() + tolerance
    ) {
      return (await this.resolveAts(tx, agg, [], now)).agg;
    }
    return agg;
  }

  /** Applies a state-machine event and persists the new status and stage. */
  private async move(
    tx: Tx,
    agg: SessionAggregate,
    event: SessionEvent,
    now: Date,
    data: Prisma.GameSessionUpdateInput = {},
  ): Promise<void> {
    let next;
    try {
      next = transition({ status: agg.status, stage: agg.stage }, event);
    } catch (error) {
      if (error instanceof InvalidTransition) {
        throw new AppError('INVALID_TRANSITION', 409, {
          status: agg.status,
          stage: agg.stage,
          event: event.type,
        });
      }
      throw error;
    }
    await tx.gameSession.update({
      where: { id: agg.id },
      data: {
        ...data,
        status: next.status,
        stage: next.stage,
        active: isActive(next) ? true : null,
        stageStartedAt: now,
        lastActivityAt: now,
        version: { increment: 1 },
      },
    });
  }

  // ------------------------------------------------------------------ questions

  private seedHex(agg: SessionAggregate): string {
    return Buffer.from(agg.seed).toString('hex');
  }

  private engineContext(
    db: Tx | PrismaService,
    input: {
      developerId: string;
      runType: 'ranked' | 'practice';
      locale: string;
      snapshot: CompetingContext;
      postingTechnologyIds: readonly string[];
      seedHex: string;
      excludeQuestionIds: string[];
      now: Date;
    },
  ) {
    return {
      db,
      runType: input.runType,
      locale: input.locale,
      developerId: input.developerId,
      profile: {
        trackId: input.snapshot.trackId,
        band: input.snapshot.band,
        technologyIds: input.snapshot.technologyIds,
      },
      postingTechnologyIds: input.postingTechnologyIds,
      excludeQuestionIds: input.excludeQuestionIds,
      seedHex: input.seedHex,
      dayStart: startOfUtcDay(input.now),
    };
  }

  /** Serves the next unserved slot of a stage, just in time. */
  private async serveNext(
    tx: Tx,
    agg: SessionAggregate,
    stage: QuestionStage,
    now: Date,
  ): Promise<SessionAggregate> {
    const blueprint: Blueprint = blueprintOf(agg);
    const slot = blueprint[stage].find((s) => !agg.attempts.some((a) => a.slot === s.slot));
    if (!slot) return agg;
    const challenge = agg.challenges.find((c) => c.stage === stage);
    if (!challenge) throw new AppError('INTERNAL_ERROR', 500);
    const posting = agg.jobChallenge.posting as unknown as StoredPosting;
    const snapshot = agg.snapshot as unknown as CompetingContext;
    const base = {
      id: randomUUID(),
      sessionId: agg.id,
      challengeId: challenge.id,
      developerId: agg.developerId,
      runType: agg.runType,
      stage,
      slot: slot.slot,
      kind: slot.kind,
      level: slot.level,
      servedAt: now,
      deadlineAt: new Date(now.getTime() + slot.windowMs),
      windowMs: slot.windowMs,
    };

    if (!POOL_KINDS.has(slot.kind)) {
      const question = this.jobs.templateQuestion({
        slot,
        posting,
        profileTechnologyIds: snapshot.technologyIds,
        locale: agg.locale as 'en' | 'es',
        seedHex: this.seedHex(agg),
      });
      await tx.questionAttempt.create({
        data: {
          ...base,
          templateId: question.templateId,
          presented: { prompt: question.prompt, options: question.options },
          answerKey: question.answerKey as unknown as Prisma.InputJsonValue,
          explanation: question.explanation,
        },
      });
      return this.sessions.load(tx, agg.id);
    }

    const selected = await this.questions.select(
      this.engineContext(tx, {
        developerId: agg.developerId,
        runType: agg.runType,
        locale: agg.locale,
        snapshot,
        postingTechnologyIds: posting.facts.technologyIds,
        seedHex: this.seedHex(agg),
        excludeQuestionIds: agg.attempts.flatMap((a) => (a.questionId ? [a.questionId] : [])),
        now,
      }),
      { slot: slot.slot, kind: slot.kind as PoolSlotKind, level: slot.level },
    );
    if (!selected) {
      // Content vanished mid-run (e.g. invalidated a second ago): the slot is neutral — no
      // points, no damage, excluded from accuracy (docs/architecture/09 §3).
      await tx.questionAttempt.create({
        data: {
          ...base,
          presented: { prompt: '', options: [] },
          answerKey: {},
          answeredAt: now,
          outcome: 'neutral',
        },
      });
      return this.advance(tx, await this.sessions.load(tx, agg.id), stage, now);
    }
    await tx.questionAttempt.create({
      data: {
        ...base,
        questionId: selected.questionId,
        questionVersionId: selected.versionId,
        presented: { prompt: selected.prompt, options: selected.options },
        answerKey: { correct: selected.correctOption },
        explanation: selected.explanation,
      },
    });
    return this.sessions.load(tx, agg.id);
  }

  private async resolveQuestion(
    tx: Tx,
    agg: SessionAggregate,
    attempt: AttemptRow,
    selectedOptionId: string | null,
    now: Date,
  ): Promise<{ agg: SessionAggregate; outcome: AnswerResponse['outcome'] }> {
    const ruleset = this.rulesets.get(agg.rulesetVersion);
    const tolerance = ruleset.session.answerToleranceMs;
    const late = now.getTime() > attempt.deadlineAt.getTime() + tolerance;
    const key = attempt.answerKey as unknown as AnswerKey;
    const resolved: ResolvedOutcome =
      late || selectedOptionId === null
        ? { kind: 'timeout' }
        : 'grades' in key
          ? { kind: 'graded', grade: key.grades[selectedOptionId] as 'aligned' }
          : selectedOptionId === key.correct
            ? { kind: 'correct' }
            : { kind: 'incorrect' };
    const stage = attempt.stage as QuestionStage;
    const effects = questionEffects(stage, resolved, ruleset);
    const cvHealth = applyCvDamage(agg.cvHealth, effects);
    const responseMs = Math.min(
      now.getTime() - attempt.servedAt.getTime(),
      attempt.windowMs + tolerance,
    );
    // Conditional update: only an unanswered attempt can be resolved, whatever happens in parallel.
    const updated = await tx.questionAttempt.updateMany({
      where: { id: attempt.id, answeredAt: null },
      data: {
        answeredAt: now,
        selectedOptionId: resolved.kind === 'timeout' ? null : selectedOptionId,
        outcome: resolved.kind,
        grade: resolved.kind === 'graded' ? resolved.grade : null,
        responseMs,
      },
    });
    if (updated.count !== 1) throw new AppError('ALREADY_ANSWERED', 409);
    await tx.gameSession.update({
      where: { id: agg.id },
      data: { cvHealth, lastActivityAt: now, version: { increment: 1 } },
    });
    const fresh = await this.sessions.load(tx, agg.id);
    const outcome = this.answerOutcome(
      fresh,
      fresh.attempts.find((a) => a.id === attempt.id)!,
      ruleset,
      effects,
      false,
    );
    return { agg: await this.advance(tx, fresh, stage, now), outcome };
  }

  /** After a resolution: destroy, next question, next segment, or delivery. */
  private async advance(
    tx: Tx,
    agg: SessionAggregate,
    stage: QuestionStage,
    now: Date,
  ): Promise<SessionAggregate> {
    if (agg.cvHealth <= 0) return this.close(tx, agg, now, 'DESTROY_CV');
    const blueprint = blueprintOf(agg);
    const remaining = blueprint[stage].some((s) => !agg.attempts.some((a) => a.slot === s.slot));
    if (remaining) return this.serveNext(tx, agg, stage, now);
    await tx.challenge.updateMany({
      where: { sessionId: agg.id, stage, status: 'open' },
      data: { status: 'completed', completedAt: now },
    });
    if (stage === 'final')
      return this.close(tx, await this.sessions.load(tx, agg.id), now, 'DELIVER');
    await this.move(tx, agg, { type: 'COMPLETE', challenge: stage }, now);
    return this.sessions.load(tx, agg.id);
  }

  private answerOutcome(
    agg: SessionAggregate,
    attempt: AttemptRow,
    ruleset: Ruleset,
    effects: Effect[],
    replayed: boolean,
  ): AnswerResponse['outcome'] {
    const slots = scoredSlots(agg);
    const slot = slots.find((s) => s.slot === attempt.slot)!;
    return {
      correct: slotCredit(slot, ruleset.scoring) === 1,
      timedOut: attempt.outcome === 'timeout',
      replayed,
      points: slotPoints(slot, slots, ruleset.session.answerToleranceMs, ruleset.scoring),
      effects,
      cvHealth: agg.cvHealth,
      combo: currentCombo(agg, ruleset.scoring),
    };
  }

  private replayOutcome(agg: SessionAggregate, attempt: AttemptRow, ruleset: Ruleset) {
    const resolved: ResolvedOutcome =
      attempt.outcome === 'graded'
        ? { kind: 'graded', grade: attempt.grade as 'aligned' }
        : { kind: (attempt.outcome ?? 'timeout') as 'correct' | 'incorrect' | 'timeout' };
    const effects =
      attempt.outcome === 'neutral'
        ? []
        : questionEffects(attempt.stage as QuestionStage, resolved, ruleset);
    return this.answerOutcome(agg, attempt, ruleset, effects, true);
  }

  // ------------------------------------------------------------------ ATS

  private async resolveAts(
    tx: Tx,
    agg: SessionAggregate,
    selectedTokenIds: string[],
    now: Date,
  ): Promise<{ agg: SessionAggregate; outcome: AtsResponse['outcome'] }> {
    const ruleset = this.rulesets.get(agg.rulesetVersion);
    const challenge = agg.challenges.find((c) => c.stage === 'ats' && c.status === 'open');
    if (!challenge?.deadlineAt) throw new AppError('CHALLENGE_NOT_OPEN', 409);
    const timedOut =
      now.getTime() > challenge.deadlineAt.getTime() + ruleset.session.answerToleranceMs;
    const selection = timedOut ? [] : [...new Set(selectedTokenIds)];
    const tokens = (challenge.payload as unknown as { tokens: AtsToken[] }).tokens;
    const scored = scoreAts(
      tokens,
      selection,
      correctIn(agg, 'recruiter', ruleset.scoring),
      ruleset,
    );
    const effects: Effect[] = [];
    if (scored.cvDamage > 0) effects.push({ code: 'CV_DAMAGE', value: scored.cvDamage });
    if (scored.passed) effects.push({ code: 'SPEED_BOOST', value: 5 });
    const cvHealth = applyCvDamage(agg.cvHealth, effects);
    const stored = {
      ...scored,
      threshold: ruleset.ats.threshold,
      timedOut,
      selectedTokenIds: selection,
      effects,
      cvHealth,
    };
    await tx.challenge.update({
      where: { id: challenge.id },
      data: {
        status: 'completed',
        completedAt: now,
        outcome: stored as unknown as Prisma.InputJsonValue,
      },
    });
    await tx.gameSession.update({
      where: { id: agg.id },
      data: { cvHealth, lastActivityAt: now, version: { increment: 1 } },
    });
    let fresh = await this.sessions.load(tx, agg.id);
    if (cvHealth <= 0) fresh = await this.close(tx, fresh, now, 'DESTROY_CV');
    else if (!scored.passed) fresh = await this.close(tx, fresh, now, 'FAIL_ATS');
    else {
      await this.move(tx, fresh, { type: 'PASS_ATS' }, now);
      fresh = await this.sessions.load(tx, agg.id);
    }
    return { agg: fresh, outcome: { ...this.atsOutcome(stored), replayed: false } };
  }

  private atsOutcome(stored: Omit<AtsResponse['outcome'], 'replayed'>): AtsResponse['outcome'] {
    return {
      match: stored.match,
      threshold: stored.threshold,
      passed: stored.passed,
      relevantCollected: stored.relevantCollected,
      relevantTotal: stored.relevantTotal,
      irrelevantCollected: stored.irrelevantCollected,
      timedOut: stored.timedOut,
      replayed: false,
      effects: stored.effects,
      cvHealth: stored.cvHealth,
    };
  }

  // ------------------------------------------------------------------ completion

  /**
   * Ends the session through the state machine and, for started runs, records the immutable
   * GameResult in the same transaction (docs/architecture/11 §4). The unique session id on
   * results makes a second completion impossible.
   */
  private async close(
    tx: Tx,
    agg: SessionAggregate,
    now: Date,
    event: 'EXPIRE_REVIEW' | 'ABANDON' | 'DESTROY_CV' | 'FAIL_ATS' | 'DELIVER',
  ): Promise<SessionAggregate> {
    const reasonCode =
      event === 'DESTROY_CV'
        ? 'CV_DESTROYED'
        : event === 'FAIL_ATS'
          ? 'ATS_FAILED'
          : event === 'ABANDON'
            ? 'ABANDONED'
            : null;
    await this.move(tx, agg, { type: event }, now, { endedAt: now, reasonCode });
    if (event === 'EXPIRE_REVIEW' || agg.result) return this.sessions.load(tx, agg.id);

    const ruleset = this.rulesets.get(agg.rulesetVersion);
    const status: ResultStatus =
      event === 'DELIVER' ? 'delivered' : event === 'ABANDON' ? 'abandoned' : 'failed';
    const { total, breakdown } = scoreOf(agg, ruleset, status);
    const slots = scoredSlots(agg);
    const counted = slots.filter((s) => s.outcome !== 'neutral');
    const correct = counted.filter((s) => slotCredit(s, ruleset.scoring) === 1).length;
    const posting = agg.jobChallenge.posting as unknown as StoredPosting;
    await tx.gameResult.create({
      data: {
        sessionId: agg.id,
        developerId: agg.developerId,
        jobChallengeId: agg.jobChallengeId,
        runType: agg.runType,
        status,
        reasonCode,
        totalScore: total,
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
        accuracy:
          counted.length === 0 ? null : Math.round((correct / counted.length) * 1000) / 1000,
        counts: {
          recruiter: {
            correct: correctIn(agg, 'recruiter', ruleset.scoring),
            total: blueprintOf(agg).recruiter.length,
          },
          technical: {
            correct:
              correctIn(agg, 'hiring_manager', ruleset.scoring) +
              correctIn(agg, 'final', ruleset.scoring),
            total: blueprintOf(agg).hiring_manager.length + blueprintOf(agg).final.length,
          },
        },
        atsMatch: atsMatchOf(agg),
        cvHealth: agg.cvHealth,
        competingContext: agg.snapshot as Prisma.InputJsonValue,
        jobSummary: {
          source: agg.jobChallenge.source,
          company: posting.facts.company.name,
          seniority: posting.facts.seniority,
          roleId: posting.facts.roleId,
        },
        seasonId: agg.seasonId,
        dayKey: agg.dayKey,
        scoringVersion: agg.scoringVersion,
        rulesetVersion: agg.rulesetVersion,
        startedAt: agg.committedAt,
        endedAt: now,
      },
    });
    return this.sessions.load(tx, agg.id);
  }
}
