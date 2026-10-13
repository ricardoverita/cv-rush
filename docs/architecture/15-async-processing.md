# Async processing: when BullMQ, and when not

> Part 2 · Technical architecture · Status: **Approved** (current decisions; they evolve through ADRs) · Decision: [ADR-015](../adr/ADR-015-async-processing-scope.md)

## 1. The rule

> **Use a queue only when the work is long, retryable, scheduled, rate-limited, or must not slow down a player's request. Everything the player is looking at right now is computed synchronously, in one transaction.**

Eventual consistency has a cost: "my XP didn't update", "my rank is stale", race conditions between consumers, harder tests. We pay it only where it buys something.

## 2. Decision table

| Work | Sync (transaction) | In-process after commit (outbox) | BullMQ job | Why |
|---|---|---|---|---|
| Persist `GameResult` | ✅ | | | It is the fact |
| XP ledger, level, daily counters | ✅ | | | The result screen shows final XP and level; idempotency keys make it safe |
| Developer stats, question stats, discoveries | ✅ | | | Cheap upserts; immediate profile freshness |
| Ranking entry upsert (day, week) | ✅ | | | Immediate provisional rank |
| Analytics events (first-party table) | ✅ | | | One insert; no provider call on the request path |
| Ranking cache invalidation | | ✅ | | Best effort; a TTL bounds staleness |
| AI question generation | | | ✅ | Long, costly, rate-limited, retryable, must never touch the request path |
| Question rotation per context | | | ✅ (scheduled) | Periodic, per-context, retryable |
| Daily close: verification, titles, title XP | | | ✅ (scheduled) | Must run once per day, idempotent, with retries and locks |
| Expired session sweeper | | | ✅ (scheduled, every minute) | Periodic; cheap |
| Daily blueprint pre-creation at 00:00 UTC | | | ✅ (scheduled) | Optional warm-up; lazy creation is the fallback |
| Share image (OG) generation | | | | Rendered on demand by the web app and cached by the CDN; no queue |
| Projection rebuilds | | | ✅ (manual) | Long; triggered by an admin command |
| Analytics export to an external provider *(later)* | | | ✅ | Batching, provider outages |
| Emails *(Stage 2: verification, claim)* | | | ✅ | Provider outages, retries |

## 3. The outbox

- Domain events are inserted into `outbox` **in the same transaction** as the change.
- In the MVP, a lightweight dispatcher inside the API process reads committed outbox rows and calls in-process handlers (cache invalidation, metrics). It's idempotent (handlers tolerate repeats) and marks rows as dispatched.
- When an event needs durable, retryable processing (future emails, exports), the handler simply enqueues a BullMQ job. Events never get lost between a commit and a queue.

## 4. Queues (MVP)

| Queue | Jobs | Concurrency | Notes |
|---|---|---|---|
| `question-generation` | `generate-batch`, `rotate-context`, `invalidate-batch` | Low (1–2), provider-rate-limited | Daily budget guard |
| `rankings` | `close-day` (repeatable 00:15 UTC), `prepare-day` (00:00 UTC) | 1 | Redis lock + `period_closures` |
| `maintenance` | `sweep-expired-sessions` (every minute), rebuilds | 1–2 | |

All jobs are **idempotent** (stable `jobId`s, idempotent writes), use exponential backoff, and move to a dead-letter state after max attempts with an alert.

## 5. Process topology

- **API process:** HTTP only. It can enqueue jobs but never runs heavy processors.
- **Worker process:** the same codebase with a different entrypoint (`main.worker.ts`): processors, schedulers and the AI provider adapters.
- Both connect to the same PostgreSQL and Redis. Scaling: more API instances for traffic, one worker (two for redundancy; locks prevent duplicate scheduled work).

## 6. What if Redis is down?

- API: game requests keep working with database-only paths; rate limiting fails **closed** for sensitive endpoints (session creation, apply) and **open** for reads; caches are bypassed.
- Worker: jobs pause; schedulers re-enqueue on recovery; the daily close runs late (idempotent), and an alert fires.
