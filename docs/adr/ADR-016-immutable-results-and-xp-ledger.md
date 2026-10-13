# ADR-016: Immutable game results and an append-only XP ledger

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The persistent profile is the product's asset. Results, XP, titles and history must be auditable (disputes, verification), survive profile changes and formula changes, and later be merged across provisional identities without duplication.

## Decision

- **`GameResult` is immutable**, with its competing context (profile snapshot), Job Challenge summary, breakdown, versions and season. Verification lives in a separate record.
- **XP is an append-only ledger**: each award is an entry with a unique idempotency key referencing its source; corrections are compensating entries (audited). Lifetime XP and level are derived and cached in the same transaction.
- History, stats, rankings and profile views are **projections** that can be rebuilt from these facts.

## Alternatives considered

| Alternative | Why not |
|---|---|
| A mutable `xp` counter on the developer | No audit trail; double-awards on retries; merges can't be reasoned about |
| Mutable results (update on disqualification) | Loses what happened; disputes become impossible |
| Event sourcing for everything | Powerful but heavy for an MVP; the ledger and immutable results give the needed guarantees where they matter |

## Consequences

- Positive: exact audit; idempotent awards; safe merges and claims; projections can evolve.
- Negative: storage grows with ledger entries (small rows); rebuild commands must be maintained.

## Related

[Scoring and progression](../architecture/11-scoring-and-progression.md), [domain model](../architecture/04-domain-model.md).
