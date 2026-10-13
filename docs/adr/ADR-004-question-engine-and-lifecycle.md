# ADR-004: Question Engine with strategies and a question lifecycle

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

Questions must match the developer's profile (stack, track, band or exact seniority), the Job Challenge and the slot; vary between players; avoid repeats; keep ranked fair; and let practice teach without exposing active ranked questions. Pools start small (~20 per context), so a fixed ranked/practice split would run out. New question types will be added by contributors.

## Decision

- A **Question Engine** in the `questions` module with one **strategy per slot kind** (job memory, salary, stack, track fundamentals, seniority, mixed scenario, humor), selected by the blueprint. New kinds = new strategies.
- Selection is **seeded** (reproducible), **unseen-first**, prefers higher verification tiers, and uses **fallback contexts**; availability is checked before a ranked attempt is committed.
- A **question lifecycle**: `generated → validated → competitive → retired → practice` (+ `rejected`, `invalidated`, `archived`). Ranked serves only `competitive`; practice serves only `practice`; `retired → practice` is one-way; invalidation works per question or per batch.
- **Immutable versions**; attempts store the version and option order.

## Alternatives considered

| Alternative | Why not |
|---|---|
| A fixed ranked/practice split per pool | Exhausts quickly; no rotation |
| Same pool for both run types | Practice would reveal ranked answers |
| Questions as files in the repository (for ranked) | The public repository would expose answer keys |
| An LLM call per question at runtime | Latency, cost, dependency, no validation |

## Consequences

- Positive: personal and fair selection; a growing practice pool fed by retirement; content quality improves through invalidation and tiers; extensible strategies.
- Negative: more moving parts (rotation jobs, exposure counters); the one-way rule means retired questions are "spent" for ranked.
- Follow-ups: rotation parameters in the ruleset; human review tooling in V1.

## Related

[Question Engine](../architecture/09-question-engine.md), [content strategy](../questions/content-strategy.md), [ADR-018](ADR-018-ai-question-pipeline.md).
