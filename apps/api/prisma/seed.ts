import { PrismaPg } from '@prisma/adapter-pg';
import { existsSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client.js';

const rootEnv = new URL('../../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://cvrush:cvrush@localhost:5432/cvrush';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

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
  console.log('✓ Seed complete: season-0');
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
