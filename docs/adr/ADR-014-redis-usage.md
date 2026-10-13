# ADR-014: Redis-compatible store for rate limits, locks, queues and caches only

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The product needs rate limiting across API instances, distributed locks for scheduled work, a queue backend, and short-lived caches for hot reads (top-N rankings). It must not depend on Redis for durable facts.

## Decision

- Use a **Redis-compatible** store (Redis or Valkey, whichever the hosting offers under acceptable license and cost) for: rate limits, locks, BullMQ, and short-TTL caches.
- **Never** store authoritative game state, answers, XP or rankings only in Redis. Losing Redis loses nothing durable.
- Leaderboards stay in PostgreSQL; Redis sorted sets are an optional optimization if measurements require it.

## Alternatives considered

| Alternative | Why not |
|---|---|
| No Redis (Postgres for rate limits, locks via advisory locks, queues via a Postgres queue library) | Viable at very small scale; BullMQ's retries, schedules and limiter, plus fast rate limiting, justify Redis |
| Redis as the primary store for sessions and leaderboards | Durability and audit concerns |

## Consequences

- Positive: simple, well-known infrastructure; clear failure modes.
- Negative: one more service to run (Docker locally, managed in production).

## Related

[Data model §4](../architecture/05-data-model.md#4-redis-never-a-source-of-truth), [async processing](../architecture/15-async-processing.md).
