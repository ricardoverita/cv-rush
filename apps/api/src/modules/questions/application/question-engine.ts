import { Injectable } from '@nestjs/common';
import { createRng, deriveSeed } from '@cv-rush/simulation';
import type { Db } from '../../../platform/database/db.js';
import {
  type Candidate,
  contextGroups,
  OPTION_ALIASES,
  type OptionAlias,
  pickCandidate,
  type PoolProfile,
  type PoolSlotKind,
  shuffleOptions,
} from '../domain/selection.js';
import { QuestionRepository } from '../infrastructure/question.repository.js';

export interface PoolSlotRequest {
  slot: string;
  kind: PoolSlotKind;
  level: number;
}

export interface EngineContext {
  db: Db;
  runType: 'ranked' | 'practice';
  locale: string;
  developerId: string;
  profile: PoolProfile;
  postingTechnologyIds: readonly string[];
  /** Questions already in this run (never repeated within a run). */
  excludeQuestionIds: string[];
  /** Hex of the session seed: selection is reproducible for audits. */
  seedHex: string;
  /** Start of the UTC day: ranked never repeats a question served to the developer today. */
  dayStart: Date;
}

export interface SelectedQuestion {
  questionId: string;
  versionId: string;
  contextKey: string;
  prompt: string;
  options: { id: OptionAlias; text: string }[];
  correctOption: OptionAlias;
  explanation: string;
  technologyIds: string[];
  topics: string[];
}

type VersionContent = Record<
  string,
  { prompt: string; options: Record<string, string>; explanation: string }
>;

/**
 * The Question Engine (docs/architecture/09): which question a developer gets for a pool slot,
 * at the moment the challenge needs it. It never generates inline: without candidates it
 * falls back to broader pools, and `isAvailable` checks a whole run before it starts.
 */
@Injectable()
export class QuestionEngine {
  constructor(private readonly questions: QuestionRepository) {}

  async select(ctx: EngineContext, slot: PoolSlotRequest): Promise<SelectedQuestion | null> {
    const picked = await this.pick(ctx, slot, await this.excluded(ctx));
    if (!picked) return null;
    const version = await this.questions.version(ctx.db, picked.candidate.versionId);
    const content = (version.content as VersionContent)[ctx.locale];
    if (!content) return null;
    const order = shuffleOptions(version.optionIds, picked.rng);
    const correctIndex = order.indexOf(version.correctOptionId);
    if (ctx.runType === 'ranked') {
      await this.questions.countRankedExposure(ctx.db, picked.candidate.questionId);
    }
    return {
      questionId: picked.candidate.questionId,
      versionId: version.id,
      contextKey: picked.candidate.contextKey,
      prompt: content.prompt,
      options: order.map((optionId, i) => ({
        id: OPTION_ALIASES[i] as OptionAlias,
        text: content.options[optionId] ?? '',
      })),
      correctOption: OPTION_ALIASES[correctIndex] as OptionAlias,
      explanation: content.explanation,
      technologyIds: version.technologyIds,
      topics: version.topics,
    };
  }

  /**
   * Dry run of the same deterministic selection for every pool slot of a run, without serving
   * anything. A ranked run that can't be served is refused before apply, so no attempt is lost.
   */
  async isAvailable(ctx: EngineContext, slots: PoolSlotRequest[]): Promise<boolean> {
    const excluded = await this.excluded(ctx);
    for (const slot of slots) {
      const picked = await this.pick(ctx, slot, excluded);
      if (!picked) return false;
      excluded.push(picked.candidate.questionId);
    }
    return true;
  }

  private async excluded(ctx: EngineContext): Promise<string[]> {
    const today =
      ctx.runType === 'ranked'
        ? await this.questions.servedInRankedSince(ctx.db, ctx.developerId, ctx.dayStart)
        : [];
    return [...new Set([...ctx.excludeQuestionIds, ...today])];
  }

  private async pick(ctx: EngineContext, slot: PoolSlotRequest, excluded: string[]) {
    const rng = createRng(deriveSeed(ctx.seedHex, `q:${slot.slot}`));
    for (const group of contextGroups(
      slot.kind,
      slot.level,
      ctx.profile,
      ctx.postingTechnologyIds,
    )) {
      const candidates: Candidate[] = await this.questions.candidates(ctx.db, {
        contextKeys: group,
        runType: ctx.runType,
        locale: ctx.locale,
        developerId: ctx.developerId,
        excludeQuestionIds: excluded,
      });
      const candidate = pickCandidate(candidates, rng);
      if (candidate) return { candidate, rng };
    }
    return null;
  }
}
