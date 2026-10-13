import {
  AnswerResponseSchema,
  AtsResponseSchema,
  type CreateDeveloperRequest,
  ErrorEnvelopeSchema,
  GameResultViewSchema,
  MeResponseSchema,
  RankedStatusSchema,
  type SessionView,
  SessionViewSchema,
} from '@cv-rush/contracts';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { GameSessionsService } from '../src/modules/game-sessions/index.js';
import { PrismaService } from '../src/platform/database/prisma.service.js';
import { createTestApp, TestClock } from './support/app.js';

// Requires the seeded question pools (pnpm db:seed). Every test creates its own developers.

const WEB = { 'x-cvr-client': 'web', origin: 'http://localhost:3000' };
const JSON_WEB = { ...WEB, 'content-type': 'application/json' };
const RICARDO: CreateDeveloperRequest = {
  displayName: 'Ricardo',
  seniority: 'senior',
  roleId: 'fullstack_developer',
  technologyIds: ['nodejs', 'php', 'react', 'postgresql', 'redis'],
};

const clock = new TestClock();
let app: NestFastifyApplication;
let prisma: PrismaService;
const developers: string[] = [];

beforeAll(async () => {
  app = await createTestApp(clock);
  prisma = app.get(PrismaService);
});

afterEach(() => clock.reset());

afterAll(async () => {
  // History is immutable; test cleanup uses the explicit deletion switch (see the migration).
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL cvrush.allow_history_delete = 'on'`;
    const sessions = await tx.gameSession.findMany({
      where: { developerId: { in: developers } },
      select: { jobChallengeId: true, jobChallenge: { select: { jobPostingId: true } } },
    });
    await tx.developer.deleteMany({ where: { id: { in: developers } } });
    await tx.jobChallenge.deleteMany({
      where: { id: { in: sessions.map((s) => s.jobChallengeId) } },
    });
    await tx.jobPosting.deleteMany({
      where: { id: { in: sessions.map((s) => s.jobChallenge.jobPostingId) } },
    });
  });
  await app?.close();
});

// ------------------------------------------------------------------ helpers

type Player = { id: string; cookie: string };

async function newPlayer(profile: CreateDeveloperRequest = RICARDO): Promise<Player> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/developers',
    headers: JSON_WEB,
    payload: JSON.stringify(profile),
  });
  expect(response.statusCode).toBe(201);
  const id = MeResponseSchema.parse(response.json()).developer.id;
  developers.push(id);
  const cookie = String(response.headers['set-cookie']).split(';')[0]!;
  return { id, cookie };
}

function call(player: Player, method: 'GET' | 'POST' | 'PATCH', url: string, body?: unknown) {
  return app.inject({
    method,
    url: `/api/v1${url}`,
    headers: { ...(body === undefined ? WEB : JSON_WEB), cookie: player.cookie },
    ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
  });
}

function code(response: { json: () => unknown }): string {
  return ErrorEnvelopeSchema.parse(response.json()).error.code;
}

async function create(player: Player, runType: 'ranked' | 'practice' = 'ranked', locale = 'en') {
  const response = await call(player, 'POST', '/game-sessions', { runType, locale });
  expect(response.statusCode, response.body).toBe(201);
  return SessionViewSchema.parse(response.json());
}

async function step(player: Player, method: 'GET' | 'POST', url: string, body?: unknown) {
  const response = await call(player, method, url, body);
  expect(response.statusCode, response.body).toBe(200);
  return response.json() as unknown;
}

async function view(player: Player, id: string): Promise<SessionView> {
  return SessionViewSchema.parse(await step(player, 'GET', `/game-sessions/${id}`));
}

async function rankedStatus(player: Player) {
  return RankedStatusSchema.parse(await step(player, 'GET', '/game-sessions/ranked-status'));
}

async function answer(player: Player, session: SessionView, option: 'a' | 'b' | 'c' | 'd' = 'a') {
  const q = session.question!;
  return AnswerResponseSchema.parse(
    await step(player, 'POST', `/game-sessions/${session.id}/challenges/${q.challengeId}/answer`, {
      questionAttemptId: q.questionAttemptId,
      selectedOptionId: option,
    }),
  );
}

/** The correct option of the current question, read from the server-side record (tests only). */
async function correctOption(session: SessionView): Promise<'a' | 'b' | 'c' | 'd'> {
  const attempt = await prisma.questionAttempt.findUniqueOrThrow({
    where: { id: session.question!.questionAttemptId },
  });
  const key = attempt.answerKey as { correct?: string; grades?: Record<string, string> };
  const correct =
    key.correct ?? Object.entries(key.grades ?? {}).find(([, g]) => g === 'aligned')?.[0];
  return correct as 'a' | 'b' | 'c' | 'd';
}

/** A wrong option; for the graded salary question, the one that is out of range. */
async function wrongOption(session: SessionView): Promise<'a' | 'b' | 'c' | 'd'> {
  const attempt = await prisma.questionAttempt.findUniqueOrThrow({
    where: { id: session.question!.questionAttemptId },
  });
  const key = attempt.answerKey as { correct?: string; grades?: Record<string, string> };
  if (key.grades) {
    return Object.entries(key.grades).find(([, g]) => g === 'out_of_range')![0] as 'a';
  }
  return (['a', 'b', 'c', 'd'] as const).find((o) => o !== key.correct)!;
}

async function answerStage(player: Player, session: SessionView, mode: 'right' | 'wrong') {
  let current = session;
  const stage = current.stage;
  while (current.status === 'in_progress' && current.stage === stage && current.question) {
    const option = mode === 'right' ? await correctOption(current) : await wrongOption(current);
    current = (await answer(player, current, option)).session;
  }
  return current;
}

async function start(player: Player, id: string, stage: string): Promise<SessionView> {
  return SessionViewSchema.parse(
    await step(player, 'POST', `/game-sessions/${id}/challenges/${stage}/start`),
  );
}

async function passAts(player: Player, session: SessionView) {
  const challenge = await prisma.challenge.findUniqueOrThrow({
    where: { id: session.ats!.challengeId },
  });
  const tokens = (challenge.payload as { tokens: { id: string; relevant: boolean }[] }).tokens;
  return AtsResponseSchema.parse(
    await step(
      player,
      'POST',
      `/game-sessions/${session.id}/challenges/${session.ats!.challengeId}/ats`,
      {
        selectedTokenIds: tokens.filter((t) => t.relevant).map((t) => t.id),
      },
    ),
  );
}

async function playToTheEnd(
  player: Player,
  applied: SessionView,
  mode: 'right' | 'wrong' = 'right',
) {
  let s = await answerStage(player, await start(player, applied.id, 'recruiter'), mode);
  s = (await passAts(player, await start(player, s.id, 'ats'))).session;
  s = await answerStage(player, await start(player, s.id, 'hiring_manager'), mode);
  return answerStage(player, await start(player, s.id, 'final'), mode);
}

// ------------------------------------------------------------------ tests

describe('a complete ranked run (the S2 journey)', () => {
  it('creates, applies, plays every stage and records one immutable result', async () => {
    const ricardo = await newPlayer();
    expect(await rankedStatus(ricardo)).toMatchObject({ remaining: 3, trackStatus: 'official' });

    // Job review: an offer for the profile; nothing competitive yet, no attempt used.
    const created = await create(ricardo);
    expect(created).toMatchObject({ status: 'created', stage: 'job_review', question: null });
    expect(created.attempt).toEqual({ number: 1, max: 3, committed: false });
    expect(created.job).toMatchObject({ seniority: 'senior', roleId: 'fullstack_developer' });
    // Required = exactly the developer's stack; anything else is only "nice to have".
    expect(created.job.requiredTechnologies.map((t) => t.id)).toEqual(RICARDO.technologyIds);
    const niceToHave = created.job.niceToHaveTechnologies.map((t) => t.id);
    for (const id of niceToHave) expect(RICARDO.technologyIds).not.toContain(id);
    expect([...niceToHave, ...RICARDO.technologyIds]).not.toContain('swift');
    expect(await rankedStatus(ricardo)).toMatchObject({
      remaining: 3,
      activeSessionId: created.id,
    });
    await view(ricardo, created.id);
    expect((await rankedStatus(ricardo)).remaining).toBe(3);

    // Apply: the attempt is committed on the server.
    const applied = SessionViewSchema.parse(
      await step(ricardo, 'POST', `/game-sessions/${created.id}/apply`),
    );
    expect(applied).toMatchObject({
      status: 'in_progress',
      stage: 'segment_1',
      nextChallenge: 'recruiter',
    });
    expect(applied.attempt).toEqual({ number: 1, max: 3, committed: true });
    expect((await rankedStatus(ricardo)).remaining).toBe(2);

    const finished = await playToTheEnd(ricardo, applied);
    expect(finished).toMatchObject({ status: 'delivered', stage: 'finished' });
    // Technical questions and ATS keywords only come from the developer's own stack.
    const versions = await prisma.questionVersion.findMany({
      where: {
        id: {
          in: (await prisma.questionAttempt.findMany({ where: { sessionId: created.id } })).flatMap(
            (a) => (a.questionVersionId ? [a.questionVersionId] : []),
          ),
        },
      },
    });
    for (const v of versions) {
      for (const t of v.technologyIds) expect(RICARDO.technologyIds).toContain(t);
    }
    const ats = await prisma.challenge.findFirstOrThrow({
      where: { sessionId: created.id, stage: 'ats' },
    });
    const relevantTokens = (ats.payload as { tokens: { label: string; relevant: boolean }[] })
      .tokens;
    expect(relevantTokens.filter((t) => t.relevant)).toHaveLength(RICARDO.technologyIds.length);
    const niceNames = created.job.niceToHaveTechnologies.map((t) => t.name);
    for (const token of relevantTokens) expect(niceNames).not.toContain(token.label);
    const result = GameResultViewSchema.parse(finished.result);
    expect(result).toMatchObject({
      status: 'delivered',
      reasonCode: null,
      atsMatch: 100,
      cvHealth: 100,
      counts: { recruiter: { correct: 3, total: 3 }, technical: { correct: 4, total: 4 } },
    });
    expect(result.breakdown.answers).toBe(11250);
    expect(result.breakdown.completion).toBe(3000);
    expect(result.totalScore).toBe(Object.values(result.breakdown).reduce((a, b) => a + b, 0));
    expect(result.competingContext).toMatchObject({
      displayName: 'Ricardo',
      seniority: 'senior',
      band: 'senior_plus',
      trackId: 'fullstack',
      technologyIds: RICARDO.technologyIds,
    });
    // Ranked reviews never reveal answers.
    expect(result.review.every((item) => item.correctOptionText === undefined)).toBe(true);

    // Refreshing keeps showing the same result; the result endpoint agrees.
    expect((await view(ricardo, created.id)).result).toEqual(result);
    expect(
      GameResultViewSchema.parse(await step(ricardo, 'GET', `/game-sessions/${created.id}/result`)),
    ).toEqual(result);
    expect(await prisma.gameResult.count({ where: { sessionId: created.id } })).toBe(1);

    // The result is an immutable fact.
    await expect(
      prisma.gameResult.update({ where: { sessionId: created.id }, data: { totalScore: 99999 } }),
    ).rejects.toThrow(/immutable/);
    await expect(prisma.gameResult.delete({ where: { sessionId: created.id } })).rejects.toThrow(
      /immutable/,
    );
  });
});

describe('competitive identity snapshot', () => {
  it('keeps the context the run was created with, whatever happens to the profile later', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Snapshot' });
    const created = await create(player, 'practice');
    const before = created.competingContext;
    expect(before).toMatchObject({ seniority: 'senior', profileVersion: 1 });

    const patched = await call(player, 'PATCH', '/me/profile', {
      seniority: 'lead',
      technologyIds: ['react', 'nodejs'],
    });
    expect(patched.statusCode).toBe(200);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const finished = await playToTheEnd(player, await view(player, created.id));
    expect(finished.competingContext).toEqual(before);
    expect(finished.result?.competingContext).toEqual(before);
  });
});

describe('ranked attempts', () => {
  it('counts double clicks and parallel applies once', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Double Click' });
    const created = await create(player);
    const responses = await Promise.all([
      call(player, 'POST', `/game-sessions/${created.id}/apply`),
      call(player, 'POST', `/game-sessions/${created.id}/apply`),
    ]);
    expect(responses.map((r) => r.statusCode)).toEqual([200, 200]);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    expect((await rankedStatus(player)).remaining).toBe(2);
    expect(await prisma.rankedAttempt.count({ where: { developerId: player.id } })).toBe(1);
  });

  it('allows three per UTC day; leaving a started run still uses its attempt', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Three Tries' });
    for (let i = 1; i <= 3; i++) {
      const created = await create(player);
      expect(created.attempt?.number).toBe(i);
      await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    }
    // Creating a new run abandoned the previous started ones, each with a result.
    const abandoned = await prisma.gameResult.findMany({ where: { developerId: player.id } });
    expect(abandoned.map((r) => [r.status, r.reasonCode])).toEqual([
      ['abandoned', 'ABANDONED'],
      ['abandoned', 'ABANDONED'],
    ]);
    const fourth = await call(player, 'POST', '/game-sessions', {
      runType: 'ranked',
      locale: 'en',
    });
    expect(fourth.statusCode).toBe(409);
    expect(code(fourth)).toBe('RANKED_ATTEMPTS_EXHAUSTED');
    expect(await rankedStatus(player)).toMatchObject({ used: 3, remaining: 0 });
    // Practice stays open and never touches ranked attempts.
    const practice = await create(player, 'practice');
    expect(practice.attempt).toBeNull();
    await step(player, 'POST', `/game-sessions/${practice.id}/apply`);
    expect(await prisma.rankedAttempt.count({ where: { developerId: player.id } })).toBe(3);
  });

  it('locks the ranked profile for the rest of the UTC day after applying', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Locked' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const change = await call(player, 'PATCH', '/me/profile', { seniority: 'junior' });
    expect(change.statusCode).toBe(409);
    expect(code(change)).toBe('RANKED_PROFILE_LOCKED');
    expect(
      (await call(player, 'PATCH', '/me/profile', { displayName: 'Still Me' })).statusCode,
    ).toBe(200);
  });

  it('is never consumed when the job review expires without applying', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Just Looking' });
    const created = await create(player);
    clock.advance(121_000);
    expect(await view(player, created.id)).toMatchObject({ status: 'expired_unstarted' });
    const apply = await call(player, 'POST', `/game-sessions/${created.id}/apply`);
    expect(code(apply)).toBe('SESSION_EXPIRED');
    expect((await rankedStatus(player)).remaining).toBe(3);
  });

  it('is refused before apply for tracks without ranked', async () => {
    const mobile = await newPlayer({
      displayName: 'Mobile Dev',
      seniority: 'mid',
      roleId: 'mobile_developer',
      technologyIds: ['swift', 'kotlin'],
    });
    const response = await call(mobile, 'POST', '/game-sessions', {
      runType: 'ranked',
      locale: 'en',
    });
    expect(response.statusCode).toBe(422);
    expect(code(response)).toBe('RANKED_NOT_AVAILABLE');
  });
});

describe('state machine over HTTP', () => {
  it('rejects skipped stages and actions before applying', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Skipper' });
    const created = await create(player);
    const early = await call(
      player,
      'POST',
      `/game-sessions/${created.id}/challenges/recruiter/start`,
    );
    expect(code(early)).toBe('INVALID_TRANSITION');
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    for (const stage of ['final', 'ats', 'hiring_manager']) {
      const skip = await call(
        player,
        'POST',
        `/game-sessions/${created.id}/challenges/${stage}/start`,
      );
      expect(skip.statusCode).toBe(409);
      expect(code(skip)).toBe('INVALID_TRANSITION');
    }
    const recruiter = await start(player, created.id, 'recruiter');
    // Starting the open stage again is idempotent (same question, nothing re-rolled).
    expect((await start(player, created.id, 'recruiter')).question).toEqual(recruiter.question);
    const final = await call(player, 'POST', `/game-sessions/${created.id}/challenges/final/start`);
    expect(code(final)).toBe('INVALID_TRANSITION');
  });

  it('refuses to apply again to a finished run, without touching attempts', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Again' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    await playToTheEnd(player, await view(player, created.id));
    const again = await call(player, 'POST', `/game-sessions/${created.id}/apply`);
    expect(again.statusCode).toBe(409);
    expect(code(again)).toBe('INVALID_TRANSITION');
    expect(await prisma.rankedAttempt.count({ where: { developerId: player.id } })).toBe(1);
  });

  it("never exposes another developer's session", async () => {
    const owner = await newPlayer({ ...RICARDO, displayName: 'Owner' });
    const other = await newPlayer({ ...RICARDO, displayName: 'Intruder' });
    const created = await create(owner);
    for (const [method, url] of [
      ['GET', `/game-sessions/${created.id}`],
      ['POST', `/game-sessions/${created.id}/apply`],
      ['GET', `/game-sessions/${created.id}/result`],
    ] as const) {
      const response = await call(other, method, url);
      expect(response.statusCode).toBe(404);
    }
  });

  it('requires the CSRF client header on game actions', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'No Header' });
    const created = await create(player);
    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/game-sessions/${created.id}/apply`,
      headers: { origin: WEB.origin, cookie: player.cookie },
    });
    expect(response.statusCode).toBe(403);
  });
});

describe('questions are served just in time', () => {
  it('sends only the current question, without its answer, and resolves on the server', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Curious' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const response = await call(
      player,
      'POST',
      `/game-sessions/${created.id}/challenges/recruiter/start`,
    );
    const raw = response.body;
    const session = SessionViewSchema.parse(response.json());
    expect(session.question).toMatchObject({ slot: 'R1', index: 1, total: 3 });
    expect(session.question!.options.map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']);
    for (const secret of [
      '"answerKey"',
      '"correctOption',
      '"grades"',
      '"relevant"',
      '"explanation"',
      '"questionId"',
      '"seed"',
    ]) {
      expect(raw).not.toContain(secret);
    }
    // Only one question exists server-side so far.
    expect(await prisma.questionAttempt.count({ where: { sessionId: created.id } })).toBe(1);

    const right = await correctOption(session);
    const first = await answer(player, session, right);
    expect(first.outcome).toMatchObject({
      correct: true,
      timedOut: false,
      replayed: false,
      cvHealth: 100,
      combo: 1,
    });
    expect(first.outcome.points).toBeGreaterThan(0);
    expect(first.session.question).toMatchObject({ slot: 'R2', index: 2 });
    expect(await prisma.questionAttempt.count({ where: { sessionId: created.id } })).toBe(2);

    // Replaying the same answer changes nothing; another answer is refused.
    const replay = await answer(player, session, right);
    expect(replay.outcome).toMatchObject({ replayed: true, points: first.outcome.points });
    expect(replay.session.provisionalScore).toBe(first.session.provisionalScore);
    const other = (['a', 'b', 'c', 'd'] as const).find((o) => o !== right)!;
    const change = await call(
      player,
      'POST',
      `/game-sessions/${created.id}/challenges/${session.question!.challengeId}/answer`,
      {
        questionAttemptId: session.question!.questionAttemptId,
        selectedOptionId: other,
      },
    );
    expect(change.statusCode).toBe(409);
    expect(code(change)).toBe('ALREADY_ANSWERED');

    // A wrong answer damages the CV and breaks the combo.
    const r2 = await answer(player, first.session, await wrongOption(first.session));
    expect(r2.outcome).toMatchObject({ correct: false, combo: 0, cvHealth: 90 });
    expect(r2.outcome.effects).toContainEqual({ code: 'CV_DAMAGE', value: 10 });
  });

  it('resolves late answers as timeouts', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Slowpoke' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const session = await start(player, created.id, 'recruiter');
    clock.advance(session.question!.windowMs + 1000);
    const late = await answer(player, session, await correctOption(session));
    expect(late.outcome).toMatchObject({ correct: false, timedOut: true, points: 0, cvHealth: 90 });
    expect(late.session.question?.slot).toBe('R2');
  });

  it('rejects tampered payloads and unknown ids', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Tamperer' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const session = await start(player, created.id, 'recruiter');
    const url = `/game-sessions/${created.id}/challenges/${session.question!.challengeId}/answer`;
    const base = { questionAttemptId: session.question!.questionAttemptId, selectedOptionId: 'a' };
    for (const tampered of [
      { ...base, correct: true },
      { ...base, points: 99999 },
      { ...base, selectedOptionId: 'e' },
      { ...base, questionAttemptId: 'not-a-uuid' },
    ]) {
      const response = await call(player, 'POST', url, tampered);
      expect(response.statusCode).toBe(400);
      expect(code(response)).toBe('VALIDATION_FAILED');
    }
    const unknown = await call(player, 'POST', url, {
      ...base,
      questionAttemptId: crypto.randomUUID(),
    });
    expect(unknown.statusCode).toBe(404);
    const created2 = await call(player, 'POST', '/game-sessions', {
      runType: 'ranked',
      locale: 'en',
      score: 1,
    });
    expect(code(created2)).toBe('VALIDATION_FAILED');
  });
});

describe('ATS', () => {
  it('computes the match on the server and fails the run below the threshold', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Keyword Stuffer' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    let s = await answerStage(player, await start(player, created.id, 'recruiter'), 'wrong');
    s = await start(player, s.id, 'ats');
    expect(s.ats!.tokens.length).toBeGreaterThan(6);
    expect(JSON.stringify(s.ats)).not.toContain('relevant');
    const unknown = await call(
      player,
      'POST',
      `/game-sessions/${s.id}/challenges/${s.ats!.challengeId}/ats`,
      {
        selectedTokenIds: ['t99'],
      },
    );
    expect(code(unknown)).toBe('VALIDATION_FAILED');

    const challenge = await prisma.challenge.findUniqueOrThrow({
      where: { id: s.ats!.challengeId },
    });
    const tokens = (challenge.payload as { tokens: { id: string; relevant: boolean }[] }).tokens;
    const irrelevant = tokens.filter((t) => !t.relevant).map((t) => t.id);
    const outcome = AtsResponseSchema.parse(
      await step(player, 'POST', `/game-sessions/${s.id}/challenges/${s.ats!.challengeId}/ats`, {
        selectedTokenIds: irrelevant,
      }),
    );
    expect(outcome.outcome).toMatchObject({ passed: false, match: 0, relevantCollected: 0 });
    expect(outcome.session).toMatchObject({ status: 'failed' });
    expect(outcome.session.result).toMatchObject({ status: 'failed', reasonCode: 'ATS_FAILED' });
    // Replays return the stored outcome.
    const replay = AtsResponseSchema.parse(
      await step(player, 'POST', `/game-sessions/${s.id}/challenges/${s.ats!.challengeId}/ats`, {
        selectedTokenIds: [...irrelevant].reverse(),
      }),
    );
    expect(replay.outcome).toMatchObject({ replayed: true, match: 0 });
    expect(await prisma.gameResult.count({ where: { sessionId: s.id } })).toBe(1);
  });
});

describe('failure, abandonment and practice', () => {
  it('rejects the application when the CV is destroyed', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Unlucky' });
    const created = await create(player);
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const finished = await playToTheEnd(player, await view(player, created.id), 'wrong');
    expect(finished).toMatchObject({ status: 'failed', cvHealth: 0 });
    expect(finished.result).toMatchObject({ status: 'failed', reasonCode: 'CV_DESTROYED' });
    expect(finished.result!.breakdown).toMatchObject({ answers: 0, completion: 0, cvHealth: 0 });
  });

  it('abandons runs past their lifetime, on the next request or by the sweeper', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Gone' });
    const first = await create(player);
    await step(player, 'POST', `/game-sessions/${first.id}/apply`);
    await start(player, first.id, 'recruiter');
    clock.advance(11 * 60_000);
    expect(await view(player, first.id)).toMatchObject({
      status: 'abandoned',
      result: { status: 'abandoned', reasonCode: 'ABANDONED' },
    });

    clock.reset();
    const second = await create(player, 'practice');
    await step(player, 'POST', `/game-sessions/${second.id}/apply`);
    clock.advance(11 * 60_000);
    expect(await app.get(GameSessionsService).sweep()).toBeGreaterThanOrEqual(1);
    const row = await prisma.gameSession.findUniqueOrThrow({
      where: { id: second.id },
      include: { result: true },
    });
    expect(row.status).toBe('abandoned');
    expect(row.active).toBeNull();
    expect(row.result?.status).toBe('abandoned');
  });

  it('plays practice with relaxed windows, reviews answers and never touches ranked', async () => {
    const player = await newPlayer({ ...RICARDO, displayName: 'Practicing' });
    const created = await create(player, 'practice', 'es');
    await step(player, 'POST', `/game-sessions/${created.id}/apply`);
    const recruiter = await start(player, created.id, 'recruiter');
    expect(recruiter.question!.windowMs).toBe(15000);
    const finished = await playToTheEnd(player, await view(player, created.id));
    expect(finished.result).toMatchObject({ runType: 'practice', status: 'delivered' });
    expect(
      finished.result!.review.every((item) => item.correctOptionText && item.explanation),
    ).toBe(true);
    expect((await rankedStatus(player)).remaining).toBe(3);
  });

  it('refuses runs it cannot serve fairly, before anything starts', async () => {
    const player = await newPlayer({
      displayName: 'Principal Data',
      seniority: 'principal',
      roleId: 'data_scientist',
      technologyIds: ['pandas', 'scikit_learn'],
    });
    const response = await call(player, 'POST', '/game-sessions', {
      runType: 'practice',
      locale: 'en',
    });
    expect(response.statusCode).toBe(422);
    expect(code(response)).toBe('CONTENT_UNAVAILABLE');
  });
});
