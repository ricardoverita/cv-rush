import { z } from 'zod';
import { SeniorityBandSchema, SenioritySchema } from './catalog.js';
import { CatalogIdSchema } from './catalog-view.js';
import { LocaleSchema } from './locales.js';

// Contracts of a game session (docs/architecture/07 and 13). What the client may see and send.
// Answer keys, grades, relevance flags, question ids and seeds never appear here.

export const RUN_TYPES = ['ranked', 'practice'] as const;
export const RunTypeSchema = z.enum(RUN_TYPES);
export type RunType = z.infer<typeof RunTypeSchema>;

export const SESSION_STATUSES = [
  'created',
  'in_progress',
  'delivered',
  'failed',
  'abandoned',
  'expired_unstarted',
] as const;
export const SessionStatusSchema = z.enum(SESSION_STATUSES);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SESSION_STAGES = [
  'job_review',
  'segment_1',
  'recruiter',
  'segment_2',
  'ats',
  'segment_3',
  'hiring_manager',
  'segment_4',
  'final',
  'finished',
] as const;
export const SessionStageSchema = z.enum(SESSION_STAGES);
export type SessionStage = z.infer<typeof SessionStageSchema>;

/** The four challenges of a run, in order. */
export const CHALLENGE_STAGES = ['recruiter', 'ats', 'hiring_manager', 'final'] as const;
export const ChallengeStageSchema = z.enum(CHALLENGE_STAGES);
export type ChallengeStage = z.infer<typeof ChallengeStageSchema>;

export const EFFECT_CODES = [
  'SPEED_BOOST',
  'SLOWDOWN',
  'CV_DAMAGE',
  'ATS_BONUS',
  'FINAL_BOOST',
] as const;
export const EffectSchema = z.object({ code: z.enum(EFFECT_CODES), value: z.number() });
export type Effect = z.infer<typeof EffectSchema>;

export const RESULT_REASON_CODES = ['ATS_FAILED', 'CV_DESTROYED', 'ABANDONED'] as const;
export const ResultReasonCodeSchema = z.enum(RESULT_REASON_CODES);

export const OptionIdSchema = z.enum(['a', 'b', 'c', 'd']);

// ---------------------------------------------------------------- requests

export const CreateGameSessionRequestSchema = z
  .object({ runType: RunTypeSchema, locale: LocaleSchema })
  .strict();
export type CreateGameSessionRequest = z.infer<typeof CreateGameSessionRequestSchema>;

export const AnswerRequestSchema = z
  .object({ questionAttemptId: z.uuid(), selectedOptionId: OptionIdSchema })
  .strict();
export type AnswerRequest = z.infer<typeof AnswerRequestSchema>;

export const AtsSubmitRequestSchema = z
  .object({ selectedTokenIds: z.array(z.string().regex(/^t\d{1,2}$/)).max(32) })
  .strict();
export type AtsSubmitRequest = z.infer<typeof AtsSubmitRequestSchema>;

// ---------------------------------------------------------------- views

/** The competitive identity frozen when the session was created. */
export const CompetingContextSchema = z.object({
  displayName: z.string(),
  seniority: SenioritySchema,
  band: SeniorityBandSchema,
  roleId: CatalogIdSchema,
  trackId: CatalogIdSchema,
  categoryKey: z.string(),
  technologyIds: z.array(CatalogIdSchema),
  profileVersion: z.number().int(),
});
export type CompetingContext = z.infer<typeof CompetingContextSchema>;

export const JobPostingViewSchema = z.object({
  company: z.object({ name: z.string(), sector: z.string() }),
  seniority: SenioritySchema,
  roleId: CatalogIdSchema,
  location: z.string(),
  workMode: z.string(),
  salary: z.object({ currency: z.string(), min: z.number(), max: z.number() }),
  summary: z.string(),
  responsibilities: z.array(z.string()),
  technologies: z.array(z.object({ id: CatalogIdSchema, name: z.string() })),
  experience: z.string(),
  perks: z.array(z.string()),
});
export type JobPostingView = z.infer<typeof JobPostingViewSchema>;

/** The current question, and only that: no answer key, no next question, no stable id. */
export const QuestionViewSchema = z.object({
  challengeId: z.uuid(),
  questionAttemptId: z.uuid(),
  stage: ChallengeStageSchema,
  slot: z.string(),
  index: z.number().int().min(1),
  total: z.number().int().min(1),
  prompt: z.string(),
  options: z.array(z.object({ id: OptionIdSchema, text: z.string() })).length(4),
  windowMs: z.number().int(),
  servedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});
export type QuestionView = z.infer<typeof QuestionViewSchema>;

/** The ATS scan as HTML: keyword tokens without their relevance. */
export const AtsViewSchema = z.object({
  challengeId: z.uuid(),
  tokens: z.array(z.object({ id: z.string(), label: z.string() })),
  threshold: z.number(),
  windowMs: z.number().int(),
  expiresAt: z.iso.datetime(),
});
export type AtsView = z.infer<typeof AtsViewSchema>;

export const StageProgressSchema = z.object({
  stage: ChallengeStageSchema,
  state: z.enum(['pending', 'current', 'passed', 'failed']),
  correct: z.number().int().optional(),
  total: z.number().int().optional(),
  match: z.number().optional(),
});

export const ScoreBreakdownSchema = z.object({
  answers: z.number().int(),
  speed: z.number().int(),
  completion: z.number().int(),
  ats: z.number().int(),
  cvHealth: z.number().int(),
  streak: z.number().int(),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const ReviewItemSchema = z.object({
  stage: ChallengeStageSchema,
  slot: z.string(),
  prompt: z.string(),
  outcome: z.enum(['correct', 'incorrect', 'timeout', 'graded', 'neutral']),
  /** Practice only: the expected option and the explanation (never for ranked runs). */
  correctOptionText: z.string().optional(),
  selectedOptionText: z.string().optional(),
  explanation: z.string().optional(),
});

export const GameResultViewSchema = z.object({
  id: z.uuid(),
  sessionId: z.uuid(),
  runType: RunTypeSchema,
  status: z.enum(['delivered', 'failed', 'abandoned']),
  reasonCode: ResultReasonCodeSchema.nullable(),
  totalScore: z.number().int(),
  breakdown: ScoreBreakdownSchema,
  accuracy: z.number().nullable(),
  counts: z.object({
    recruiter: z.object({ correct: z.number().int(), total: z.number().int() }),
    technical: z.object({ correct: z.number().int(), total: z.number().int() }),
  }),
  atsMatch: z.number().nullable(),
  cvHealth: z.number().int(),
  competingContext: CompetingContextSchema,
  job: z.object({ company: z.string(), seniority: SenioritySchema, roleId: CatalogIdSchema }),
  seasonId: z.string(),
  scoringVersion: z.string(),
  startedAt: z.iso.datetime().nullable(),
  endedAt: z.iso.datetime(),
  review: z.array(ReviewItemSchema),
});
export type GameResultView = z.infer<typeof GameResultViewSchema>;

export const SessionViewSchema = z.object({
  id: z.uuid(),
  runType: RunTypeSchema,
  status: SessionStatusSchema,
  stage: SessionStageSchema,
  locale: LocaleSchema,
  competingContext: CompetingContextSchema,
  job: JobPostingViewSchema,
  /** Ranked only: the attempt this run uses (once applied) or will use. */
  attempt: z
    .object({ number: z.number().int(), max: z.number().int(), committed: z.boolean() })
    .nullable(),
  cvHealth: z.number().int(),
  provisionalScore: z.number().int(),
  progress: z.array(StageProgressSchema),
  /** The next challenge the client may start (when the session waits in a segment). */
  nextChallenge: ChallengeStageSchema.nullable(),
  question: QuestionViewSchema.nullable(),
  ats: AtsViewSchema.nullable(),
  result: GameResultViewSchema.nullable(),
  reviewExpiresAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
  serverTime: z.iso.datetime(),
});
export type SessionView = z.infer<typeof SessionViewSchema>;

export const AnswerOutcomeSchema = z.object({
  correct: z.boolean(),
  timedOut: z.boolean(),
  /** True when the same answer was already recorded (a retry): nothing changed. */
  replayed: z.boolean(),
  points: z.number().int(),
  effects: z.array(EffectSchema),
  cvHealth: z.number().int(),
  combo: z.number().int(),
});
export const AnswerResponseSchema = z.object({
  outcome: AnswerOutcomeSchema,
  session: SessionViewSchema,
});
export type AnswerResponse = z.infer<typeof AnswerResponseSchema>;

export const AtsOutcomeSchema = z.object({
  match: z.number(),
  threshold: z.number(),
  passed: z.boolean(),
  relevantCollected: z.number().int(),
  relevantTotal: z.number().int(),
  irrelevantCollected: z.number().int(),
  timedOut: z.boolean(),
  replayed: z.boolean(),
  effects: z.array(EffectSchema),
  cvHealth: z.number().int(),
});
export const AtsResponseSchema = z.object({
  outcome: AtsOutcomeSchema,
  session: SessionViewSchema,
});
export type AtsResponse = z.infer<typeof AtsResponseSchema>;

export const RankedStatusSchema = z.object({
  dayKey: z.string(),
  max: z.number().int(),
  used: z.number().int(),
  remaining: z.number().int(),
  resetsAt: z.iso.datetime(),
  /** Whether the developer's track can be played in ranked (official or preview). */
  trackStatus: z.enum(['official', 'preview', 'practice_only']),
  /** The developer's active session, if any (to resume it). */
  activeSessionId: z.uuid().nullable(),
});
export type RankedStatus = z.infer<typeof RankedStatusSchema>;
