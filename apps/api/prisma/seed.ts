import { PrismaPg } from '@prisma/adapter-pg';
import { existsSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  allocateContext,
  runGenerationBatch,
} from '../src/modules/question-generation/application/generation-pipeline.js';
import { createQuestionProvider } from '../src/modules/question-generation/infrastructure/providers/create-provider.js';
import { FakeQuestionGenerationProvider } from '../src/modules/question-generation/infrastructure/providers/fake-question-provider.js';
import { ingestSamplePacks } from '../src/modules/questions/application/sample-packs.js';

const rootEnv = new URL('../../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://cvrush:cvrush@localhost:5432/cvrush';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seedQuestionPools(): Promise<void> {
  // Through the real pipeline (schema, rules, dedupe, independent verification, allocation),
  // with the configured provider. Only `fake` exists until slice S6.
  const generator = createQuestionProvider(process.env.QUESTION_GENERATION_PROVIDER ?? 'fake');
  const verifier = createQuestionProvider(process.env.QUESTION_VERIFICATION_PROVIDER ?? 'fake');
  const contexts = generator instanceof FakeQuestionGenerationProvider ? generator.contexts() : [];
  for (const contextKey of contexts) {
    const existing = await prisma.question.count({
      where: { contextKey, source: { not: 'sample' } },
    });
    if (existing > 0) continue; // already seeded: contexts are filled when first needed
    const batch = await runGenerationBatch({ db: prisma, generator, verifier }, contextKey);
    const allocation = await allocateContext(prisma, contextKey, new Date());
    const rejected = batch.rejected.map((r) => `${r.topic}: ${r.reasons.join(', ')}`);
    console.log(
      `✓ ${contextKey}: ${batch.accepted} accepted (${allocation.competitive} competitive, ` +
        `${allocation.practice} practice)` +
        (rejected.length > 0 ? `, ${rejected.length} rejected [${rejected.join('; ')}]` : ''),
    );
  }
  const samples = await ingestSamplePacks(prisma);
  if (samples > 0) console.log(`✓ Sample packs: ${samples} practice question(s)`);
}

async function main(): Promise<void> {
  // Idempotent: safe to run many times.
  await prisma.season.upsert({
    where: { id: 'season-0' },
    update: {},
    create: {
      id: 'season-0',
      name: 'Season 0 (Beta)',
      status: 'active',
      startsAt: new Date('2026-10-12T00:00:00.000Z'),
    },
  });
  await seedQuestionPools();
  console.log('✓ Seed complete: season-0 and question pools');
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
