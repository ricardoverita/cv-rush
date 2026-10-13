# ADR-005: Score calculation server-side, versioned

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

Scores decide rankings and titles. They must be explainable to players, impossible to forge, centralized (not scattered across components) and stable over time even when the formula changes.

## Decision

- One **pure scoring engine** (`scoring` module): `computeScore(inputs, rules) → breakdown`, with no I/O, clock or randomness.
- Inputs come only from server records (attempts with server timings, ATS re-simulation, the race model and bots, bounded events).
- The formula and weights live in a **versioned ruleset** (`scoring-v1`); every result stores `scoring_version` and its full breakdown.
- Past results are never recomputed; formula changes create a new version and coincide with a period or season boundary.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Client-side scoring | Forgeable |
| Recompute historical scores on formula changes | Rankings and titles would shift retroactively; disputes become impossible to settle |
| Scoring rules inside challenge handlers | Scattered, inconsistent, untestable |

## Consequences

- Positive: golden tests per version; explainable breakdowns; disputes are settled by replaying the stored inputs.
- Negative: mixing versions inside a period must be avoided operationally.

## Related

[Scoring and progression](../architecture/11-scoring-and-progression.md), [scoring principles](../game-design/scoring-principles.md).
