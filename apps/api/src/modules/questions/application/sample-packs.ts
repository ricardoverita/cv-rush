import { join } from 'node:path';
import { DATA_DIR, loadYamlTree, QuestionPackSchema } from '@cv-rush/content';
import type { Prisma } from '../../../generated/prisma/client.js';
import type { Db } from '../../../platform/database/db.js';

/**
 * Loads the open sample packs (packages/content/data/questions) into the practice pool.
 * They are public, so they are never competitive (lifecycle `practice`, tier `sample`).
 * Idempotent: each question version is stored once (external reference).
 */
export async function ingestSamplePacks(db: Db): Promise<number> {
  let added = 0;
  for (const { data } of loadYamlTree(join(DATA_DIR, 'questions'))) {
    const pack = QuestionPackSchema.parse(data);
    for (const q of pack.questions) {
      const externalRef = `${pack.pack.source}:${q.id}:v${q.version}`;
      if (await db.question.findUnique({ where: { externalRef }, select: { id: true } })) continue;
      const technology = q.technologies[0];
      const contextKey = technology
        ? `tech:${technology}:${q.difficulty}`
        : `general:${q.difficulty}`;
      await db.questionContext.upsert({
        where: { key: contextKey },
        create: { key: contextKey, kind: technology ? 'tech' : 'general', level: q.difficulty },
        update: {},
      });
      await db.question.create({
        data: {
          contextKey,
          source: 'sample',
          externalRef,
          lifecycleState: 'practice',
          verificationTier: 'sample',
          versions: {
            create: {
              version: 1,
              content: q.translations as Prisma.InputJsonValue,
              optionIds: q.options,
              correctOptionId: q.correctOptionId,
              difficulty: q.difficulty,
              technologyIds: q.technologies,
              topics: q.topics,
            },
          },
        },
      });
      added++;
    }
  }
  return added;
}
