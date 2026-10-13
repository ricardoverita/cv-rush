# ADR-015: BullMQ only for long, scheduled or retryable work

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The maintainer asked not to assume a queue for every derived view and to justify where it adds value. Some work is long and fragile (AI generation), scheduled (daily close) or periodic (sweepers). Other work is what the player is looking at right now (result, XP, level, rank) and must be consistent immediately.

## Decision

- **Synchronous, in one transaction:** game result, XP ledger, progression, daily counters, stats, discoveries, ranking entry upserts, analytics events.
- **Outbox + in-process dispatcher (after commit):** cache invalidation and other best-effort side effects; the dispatcher can enqueue jobs when durability is needed.
- **BullMQ jobs** (worker process): AI question generation and rotation, the daily close and verification, the expired-session sweeper, projection rebuilds, and later external exports and emails.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Queue every projection | Eventual consistency where none is needed ("my XP didn't update"), more race conditions, harder tests |
| No queue (cron inside the API) | Duplicate execution with several instances, no retries or backoff, long jobs hurt API latency |
| A Postgres-based job queue | Viable; BullMQ was preferred for its limiter, schedules and tooling, given Redis is already present |

## Consequences

- Positive: immediate consistency for players; reliability for long and scheduled work; API latency isolated from the worker.
- Negative: two processes to run; idempotency required for every job (enforced by design).

## Related

[Async processing](../architecture/15-async-processing.md), decision log D-057.
