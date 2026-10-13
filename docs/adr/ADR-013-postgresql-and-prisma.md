# ADR-013: PostgreSQL as the source of truth, Prisma as the ORM

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

The domain is relational (developers, sessions, attempts, results, ledger, rankings) and relies on transactions and constraints for integrity (single answers, attempt limits, idempotent XP). Contributors need a familiar, typed data layer with migrations.

## Decision

- **PostgreSQL** (current stable major) is the only source of truth. Use constraints (unique, check, partial unique indexes), transactions, `SELECT … FOR UPDATE` where needed, JSONB for snapshots and localized content, GIN indexes for arrays, and `pg_trgm` for question deduplication.
- **Prisma** for the schema, migrations and typed queries. Ranking queries and other performance-sensitive SQL use Prisma's typed raw SQL (parameterized).
- Immutable tables (`game_results`, `question_versions`, `xp_ledger`) have no update paths in code; database triggers can reject updates as a safety net.
- Migrations follow expand → migrate → contract for zero-downtime deploys.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Drizzle or Kysely | Excellent SQL-first options; Prisma is preferred by the maintainer and familiar to more contributors |
| TypeORM | Weaker typing ergonomics; more runtime surprises |
| MongoDB | Weaker relational integrity for this domain |

## Consequences

- Positive: integrity at the database level; typed access; easy local setup with Docker.
- Negative: Prisma abstractions occasionally need raw SQL; interactive transactions must be kept short.

## Related

[Data model](../architecture/05-data-model.md).
