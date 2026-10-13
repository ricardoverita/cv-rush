# ADR-008: Rankings as projections over immutable results

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

Rankings are a progression feature, not the center of the model. Scopes will grow (daily and weekly per category now; technology, XP, seasons later). Players expect to see their provisional rank right after a run. Titles (Daily Champion) need verification after the day closes.

## Decision

- Rankings are **projections** (`ranking_entries`) over immutable ranked `game_results`, keyed by `season × periodType × periodKey × dimension × scopeKey × developer`, keeping the best result per key.
- Entries are **upserted in the run's completion transaction** (immediate provisional rank).
- Reads use an ordering index in PostgreSQL, with a short Redis cache for top-N. Redis sorted sets are an optional optimization, never the source of truth.
- A scheduled, idempotent **daily close** verifies top results and records **titles** (+XP).
- New scopes are new projections; everything can be **rebuilt** from results.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Redis sorted sets as the source of truth | Durability and audit concerns; rebuild complexity; unnecessary at MVP scale |
| Compute rankings on the fly from results | Fine for small data, but harder indexing for "best per developer per period" and slower as data grows |
| A Daily Champion-centric model | Product decision: rankings are a feature; the center is the developer |
| Asynchronous ranking updates | Stale provisional ranks on the result screen for no benefit |

## Consequences

- Positive: immediate, consistent ranks; new scopes without domain changes; rebuildable after corrections or merges.
- Negative: write amplification (one upsert per scope per ranked result), negligible at MVP scale.

## Related

[Rankings and projections](../architecture/12-rankings-and-projections.md), [rankings (product)](../product/leaderboards.md).
