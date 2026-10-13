import { Injectable } from '@nestjs/common';
import type { Db } from '../../../platform/database/db.js';
import type { Candidate } from '../domain/selection.js';

type RunType = 'ranked' | 'practice';
const COMPETITIVE_TIERS = ['ai_validated', 'human_reviewed', 'curated'] as const;

export interface StoredVersion {
  id: string;
  content: unknown;
  optionIds: string[];
  correctOptionId: string;
  technologyIds: string[];
  topics: string[];
}

@Injectable()
export class QuestionRepository {
  /**
   * Eligible questions in some contexts: competitive rotation (verified tiers) for ranked, the
   * practice pool for practice. Invalidated or retired questions are never eligible.
   */
  async candidates(
    db: Db,
    input: {
      contextKeys: string[];
      runType: RunType;
      locale: string;
      developerId: string;
      excludeQuestionIds: string[];
    },
  ): Promise<Candidate[]> {
    const rows = await db.question.findMany({
      where: {
        contextKey: { in: input.contextKeys },
        id: { notIn: input.excludeQuestionIds },
        ...(input.runType === 'ranked'
          ? { lifecycleState: 'competitive', verificationTier: { in: [...COMPETITIVE_TIERS] } }
          : { lifecycleState: 'practice' }),
      },
      select: {
        id: true,
        contextKey: true,
        verificationTier: true,
        versions: { orderBy: { version: 'desc' }, take: 1, select: { id: true, content: true } },
      },
    });
    const usable = rows.filter((row) => {
      const content = row.versions[0]?.content as Record<string, unknown> | undefined;
      return content?.[input.locale] !== undefined;
    });
    if (usable.length === 0) return [];
    const seen = await db.questionAttempt.findMany({
      where: { developerId: input.developerId, questionId: { in: usable.map((r) => r.id) } },
      select: { questionId: true },
      distinct: ['questionId'],
    });
    const seenIds = new Set(seen.map((s) => s.questionId));
    return usable.map((row) => ({
      questionId: row.id,
      versionId: row.versions[0]!.id,
      contextKey: row.contextKey,
      tier: row.verificationTier,
      seenByDeveloper: seenIds.has(row.id),
    }));
  }

  /** Questions this developer was served in ranked runs since `since` (the UTC day start). */
  async servedInRankedSince(db: Db, developerId: string, since: Date): Promise<string[]> {
    const rows = await db.questionAttempt.findMany({
      where: {
        developerId,
        runType: 'ranked',
        servedAt: { gte: since },
        questionId: { not: null },
      },
      select: { questionId: true },
      distinct: ['questionId'],
    });
    return rows.flatMap((r) => (r.questionId ? [r.questionId] : []));
  }

  version(db: Db, versionId: string): Promise<StoredVersion> {
    return db.questionVersion.findUniqueOrThrow({
      where: { id: versionId },
      select: {
        id: true,
        content: true,
        optionIds: true,
        correctOptionId: true,
        technologyIds: true,
        topics: true,
      },
    });
  }

  async countRankedExposure(db: Db, questionId: string): Promise<void> {
    await db.question.update({
      where: { id: questionId },
      data: { rankedExposures: { increment: 1 } },
    });
  }
}
