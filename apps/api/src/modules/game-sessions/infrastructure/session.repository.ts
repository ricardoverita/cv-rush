import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import type { Db } from '../../../platform/database/db.js';

export type Tx = Prisma.TransactionClient;

const aggregateInclude = {
  jobChallenge: { include: { posting: true } },
  rankedAttempt: true,
  challenges: { orderBy: { openedAt: 'asc' } },
  attempts: { orderBy: { servedAt: 'asc' } },
  result: true,
} as const satisfies Prisma.GameSessionInclude;

export type SessionAggregate = Prisma.GameSessionGetPayload<{ include: typeof aggregateInclude }>;
export type AttemptRow = SessionAggregate['attempts'][number];
export type ChallengeRow = SessionAggregate['challenges'][number];

/**
 * Persistence of game sessions. Every mutation locks the session row first (`FOR UPDATE`), so
 * two tabs or a retried request are processed one after the other and the first valid action
 * wins (docs/architecture/07 §9). PostgreSQL is the source of truth; nothing lives only in Redis.
 */
@Injectable()
export class SessionRepository {
  /** Locks the session if it belongs to the developer; null otherwise (never reveals others'). */
  async lock(tx: Tx, sessionId: string, developerId: string): Promise<boolean> {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM game_sessions
      WHERE id = ${sessionId}::uuid AND developer_id = ${developerId}::uuid
      FOR UPDATE`;
    return rows.length > 0;
  }

  /** Locks the session for the sweeper, skipping rows another transaction is working on. */
  async lockForSweep(tx: Tx, sessionId: string): Promise<boolean> {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM game_sessions WHERE id = ${sessionId}::uuid FOR UPDATE SKIP LOCKED`;
    return rows.length > 0;
  }

  /** Serializes session creation and attempt allocation per developer. */
  async lockDeveloper(tx: Tx, developerId: string): Promise<void> {
    await tx.$queryRaw`SELECT id FROM developers WHERE id = ${developerId}::uuid FOR UPDATE`;
  }

  load(db: Db, sessionId: string): Promise<SessionAggregate> {
    return db.gameSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: aggregateInclude,
    });
  }

  activeSessionId(db: Db, developerId: string): Promise<string | null> {
    return db.gameSession
      .findFirst({ where: { developerId, active: true }, select: { id: true } })
      .then((row) => row?.id ?? null);
  }

  rankedAttemptsOn(db: Db, developerId: string, dayKey: string): Promise<number> {
    return db.rankedAttempt.count({ where: { developerId, dayKey } });
  }

  uncommittedRankedOn(db: Db, developerId: string, dayKey: string): Promise<number> {
    return db.gameSession.count({
      where: { developerId, runType: 'ranked', dayKey, committedAt: null },
    });
  }

  activeSeasonId(db: Db): Promise<string | null> {
    return db.season
      .findFirst({
        where: { status: 'active' },
        orderBy: { startsAt: 'desc' },
        select: { id: true },
      })
      .then((row) => row?.id ?? null);
  }

  /** Sessions whose review window or maximum lifetime has passed. */
  overdue(db: Db, now: Date, limit: number): Promise<string[]> {
    return db.gameSession
      .findMany({
        where: {
          OR: [
            { status: 'created', reviewExpiresAt: { lt: now } },
            { status: 'in_progress', expiresAt: { lt: now } },
          ],
        },
        select: { id: true },
        take: limit,
      })
      .then((rows) => rows.map((r) => r.id));
  }
}
