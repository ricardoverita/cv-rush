import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { JobPostingView, Locale, RunType, Seniority, SeniorityBand } from '@cv-rush/contracts';
import {
  type JobsContent,
  readJobsFiles,
  type Ruleset,
  type SlotKind,
  validateJobsContent,
} from '@cv-rush/content';
import { createRng, deriveSeed } from '@cv-rush/simulation';
import type { Prisma } from '../../../generated/prisma/client.js';
import type { Db } from '../../../platform/database/db.js';
import { CatalogService } from '../../catalog/index.js';
import {
  generatePosting,
  type GeneratedPosting,
  type JobFacts,
  type JobTexts,
  type PostingProfile,
} from '../domain/job-posting.js';
import {
  buildJobMemoryQuestion,
  buildSalaryQuestion,
  pickJobMemoryTemplates,
  type PresentedQuestion,
} from '../domain/job-questions.js';

export interface BlueprintSlot {
  slot: string;
  kind: SlotKind;
  level: number;
  windowMs: number;
}

/** What a run is played against: stages, slots, levels and windows (docs/architecture/08 §5). */
export interface Blueprint {
  recruiter: BlueprintSlot[];
  hiring_manager: BlueprintSlot[];
  final: BlueprintSlot[];
}

export function buildBlueprint(
  ruleset: Ruleset,
  runType: RunType,
  seniority: Seniority,
  band: SeniorityBand,
): Blueprint {
  const levels =
    runType === 'ranked' ? ruleset.levels.ranked[band] : ruleset.levels.practice[seniority];
  const factor = runType === 'practice' ? ruleset.session.practiceWindowFactor : 1;
  const withLevel = (slots: Ruleset['stages']['recruiter'], level: (slot: string) => number) =>
    slots.map((s) => ({
      slot: s.slot,
      kind: s.kind,
      level: level(s.slot),
      windowMs: Math.round(s.windowMs * factor),
    }));
  const technical = (slot: string) => levels[slot as keyof typeof levels];
  return {
    recruiter: withLevel(ruleset.stages.recruiter, () => ruleset.levels.recruiter),
    hiring_manager: withLevel(ruleset.stages.hiring_manager, technical),
    final: withLevel(ruleset.stages.final, technical),
  };
}

export interface StoredPosting {
  facts: JobFacts;
  texts: Record<Locale, JobTexts>;
}

/**
 * The job-challenges module's public API: builds Job Challenges for a profile snapshot and the
 * questions derived from their postings. Sessions don't care about the challenge source
 * (`generated` today; `daily` and real `job_posting` later, ADR-017).
 */
@Injectable()
export class JobChallengeService {
  readonly content: JobsContent;
  readonly contentVersion: string;

  constructor(private readonly catalog: CatalogService) {
    const { content, issues } = validateJobsContent(readJobsFiles(), catalog.content());
    if (!content || issues.length > 0) {
      throw new Error(`Invalid job content: ${issues.map((i) => `${i.code} ${i.at}`).join(', ')}`);
    }
    this.content = content;
    this.contentVersion = createHash('sha256')
      .update(JSON.stringify(content) + catalog.version)
      .digest('hex')
      .slice(0, 12);
  }

  generate(profile: PostingProfile, seedHex: string): GeneratedPosting {
    return generatePosting(
      profile,
      this.catalog.content(),
      this.content,
      createRng(deriveSeed(seedHex, 'job')),
    );
  }

  async persist(
    db: Db,
    input: {
      posting: GeneratedPosting;
      blueprint: Blueprint;
      runType: RunType;
      categoryKey: string;
      dayKey: string;
      rulesetVersion: string;
    },
  ): Promise<string> {
    const posting = await db.jobPosting.create({
      data: {
        origin: 'generated',
        companyName: input.posting.facts.company.name,
        facts: input.posting.facts as unknown as Prisma.InputJsonValue,
        texts: input.posting.texts as unknown as Prisma.InputJsonValue,
        contentVersion: this.contentVersion,
      },
    });
    const challenge = await db.jobChallenge.create({
      data: {
        source: 'generated',
        jobPostingId: posting.id,
        runType: input.runType,
        categoryKey: input.categoryKey,
        dayKey: input.dayKey,
        blueprint: input.blueprint as unknown as Prisma.InputJsonValue,
        rulesetVersion: input.rulesetVersion,
      },
    });
    return challenge.id;
  }

  postingView(posting: StoredPosting, locale: Locale): JobPostingView {
    const { facts } = posting;
    const texts = posting.texts[locale];
    const names = new Map(this.catalog.content().technologies.map((t) => [t.id, t.name]));
    return {
      company: { name: facts.company.name, sector: texts.sector },
      seniority: facts.seniority,
      roleId: facts.roleId,
      location: texts.location,
      workMode: texts.workMode,
      salary: facts.salary,
      summary: texts.summary,
      responsibilities: texts.responsibilities,
      technologies: facts.technologyIds.map((id) => ({ id, name: names.get(id) ?? id })),
      experience: texts.experience,
      perks: texts.perks,
    };
  }

  /** The question for a recruiter slot: job memory (R1, R2) or the graded salary question. */
  templateQuestion(input: {
    slot: BlueprintSlot;
    posting: StoredPosting;
    profileTechnologyIds: readonly string[];
    locale: Locale;
    seedHex: string;
  }): PresentedQuestion {
    const ctx = {
      posting: input.posting,
      catalog: this.catalog.content(),
      content: this.content,
      profileTechnologyIds: input.profileTechnologyIds,
      locale: input.locale,
      rng: createRng(deriveSeed(input.seedHex, `q:${input.slot.slot}`)),
    };
    if (input.slot.kind === 'salary_graded') return buildSalaryQuestion(ctx);
    const templates = pickJobMemoryTemplates(createRng(deriveSeed(input.seedHex, 'job-memory')));
    const index = input.slot.slot === 'R1' ? 0 : 1;
    return buildJobMemoryQuestion(templates[index] as (typeof templates)[number], ctx);
  }
}
