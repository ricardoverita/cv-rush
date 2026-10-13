import type { Prisma } from '../../../generated/prisma/client.js';
import type { Db } from '../../../platform/database/db.js';
import { parseContextKey } from '../domain/context.js';
import type { GeneratedItem } from '../domain/generated-item.js';
import { checkGeneratedItem, normalizeText, type RejectionReason } from '../domain/item-rules.js';
import type { QuestionGenerationProvider } from '../domain/provider.js';

export const PROMPT_VERSION = 'prompt-v0';

export interface PipelineDeps {
  db: Db;
  generator: QuestionGenerationProvider;
  verifier: QuestionGenerationProvider;
}

export interface BatchSummary {
  batchId: string;
  contextKey: string;
  requested: number;
  accepted: number;
  rejected: { index: number; topic: string | null; reasons: RejectionReason[] }[];
}

type StoredContent = Record<string, { prompt: string; options: Record<string, string> }>;

function toVersionContent(item: GeneratedItem): Prisma.InputJsonValue {
  const content: Record<string, unknown> = {};
  for (const [locale, t] of Object.entries(item.translations)) {
    content[locale] = {
      prompt: t.question,
      options: { a: t.options.A, b: t.options.B, c: t.options.C, d: t.options.D },
      explanation: t.explanation,
    };
  }
  return content as Prisma.InputJsonValue;
}

/**
 * One generation batch for a context (docs/architecture/10 §3): generate → schema and rules →
 * deduplicate → independent verification without the key → persist as `validated`.
 * Runs in the seeding command today and in the worker from slice S6; the provider is injected.
 */
export async function runGenerationBatch(
  { db, generator, verifier }: PipelineDeps,
  contextKey: string,
  count = 20,
): Promise<BatchSummary> {
  const context = parseContextKey(contextKey);
  await db.questionContext.upsert({
    where: { key: context.key },
    create: { key: context.key, kind: context.kind, level: context.level },
    update: {},
  });
  const existing = await db.questionVersion.findMany({
    where: { question: { contextKey: context.key } },
    select: { content: true },
  });
  const existingPrompts = existing.map((v) =>
    normalizeText((v.content as StoredContent).en?.prompt ?? ''),
  );
  const batch = await db.generationBatch.create({
    data: {
      contextKey: context.key,
      provider: generator.id,
      verifier: verifier.id,
      promptVersion: PROMPT_VERSION,
      requested: count,
      status: 'running',
    },
  });

  const output = await generator.generate({
    context,
    count,
    promptVersion: PROMPT_VERSION,
    existingPrompts,
  });
  const seen = new Set(existingPrompts);
  const accepted: GeneratedItem[] = [];
  const rejected: BatchSummary['rejected'] = [];
  for (const [index, raw] of output.items.entries()) {
    const topic = (raw as { topic?: unknown }).topic;
    const label = typeof topic === 'string' ? topic : null;
    const checked = checkGeneratedItem(raw, context);
    if (!checked.ok) {
      rejected.push({ index, topic: label, reasons: checked.reasons });
      continue;
    }
    if (seen.has(checked.dedupeKey)) {
      rejected.push({ index, topic: label, reasons: ['DUPLICATE'] });
      continue;
    }
    // Stage 5: the verifier answers without the key. Agreement detects problems; it doesn't
    // prove correctness (docs/architecture/10 §6).
    const { en } = checked.item.translations;
    const verdict = await verifier.verify({ question: en.question, options: en.options }, 'en');
    if (verdict.answer !== checked.item.correctOption) {
      rejected.push({ index, topic: label, reasons: ['VERIFICATION_DISAGREES'] });
      continue;
    }
    seen.add(checked.dedupeKey);
    accepted.push(checked.item);
  }

  for (const item of accepted) {
    await db.question.create({
      data: {
        contextKey: context.key,
        source: generator.id === 'fake' ? 'fake_provider' : 'ai_generated',
        lifecycleState: 'validated',
        verificationTier: 'ai_validated',
        batchId: batch.id,
        versions: {
          create: {
            version: 1,
            content: toVersionContent(item),
            optionIds: ['a', 'b', 'c', 'd'],
            correctOptionId: item.correctOption.toLowerCase(),
            difficulty: item.difficulty,
            technologyIds: item.technology ? [item.technology] : [],
            topics: [item.topic],
          },
        },
      },
    });
  }
  await db.generationBatch.update({
    where: { id: batch.id },
    data: {
      accepted: accepted.length,
      rejected: rejected.length,
      rejections: rejected as unknown as Prisma.InputJsonValue,
      status: 'completed',
      completedAt: new Date(),
    },
  });
  return {
    batchId: batch.id,
    contextKey: context.key,
    requested: count,
    accepted: accepted.length,
    rejected,
  };
}

/**
 * Bootstrap allocation of validated questions (docs/architecture/09 §4): about two thirds enter
 * competitive rotation and the rest go to practice. A practice question never returns to
 * competition (one-way rule).
 */
export async function allocateContext(
  db: Db,
  contextKey: string,
  now: Date,
): Promise<{ competitive: number; practice: number }> {
  const validated = await db.question.findMany({
    where: { contextKey, lifecycleState: 'validated' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  const competitiveCount = Math.ceil((validated.length * 2) / 3);
  const competitive = validated.slice(0, competitiveCount).map((q) => q.id);
  const practice = validated.slice(competitiveCount).map((q) => q.id);
  if (competitive.length > 0) {
    await db.question.updateMany({
      where: { id: { in: competitive } },
      data: { lifecycleState: 'competitive', competitiveSince: now },
    });
  }
  if (practice.length > 0) {
    await db.question.updateMany({
      where: { id: { in: practice } },
      data: { lifecycleState: 'practice' },
    });
  }
  return { competitive: competitive.length, practice: practice.length };
}
