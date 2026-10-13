# Architecture (Part 2)

> Status: **Approved** (current decisions; they evolve through ADRs). No vertical slice starts until this part is reviewed.
>
> Architectural north: **Developers → Games → Progress → Reputation inside CV Rush → Jobs → Applications → Recruiters.** The MVP builds the first links; the rest attach without changing the center.

## Documents

| # | Document | Contents |
|---|---|---|
| 01 | [Overview](01-overview.md) | Principles, system context, containers, technology choices, quality attributes |
| 02 | [Monorepo](02-monorepo.md) | Layout, shared packages, dependency rules, scripts, pinning |
| 03 | [Backend modules](03-backend-modules.md) | Modular monolith, layers, inter-module communication, the completion transaction |
| 04 | [Domain model](04-domain-model.md) | Aggregates, invariants, value objects, domain events, future aggregates |
| 05 | [Data model](05-data-model.md) | PostgreSQL tables per module, integrity mechanisms, Redis keys, retention |
| 06 | [Identity and credentials](06-identity-and-credentials.md) | Provisional Developer, device credential, management link, contact identifiers, LinkedIn normalization, claim and merge |
| 07 | [GameSession](07-game-session.md) | State machine, ranked attempt commitment, checkpoints, challenges, ATS re-simulation, completion, resume |
| 08 | [Job Challenges](08-job-challenges.md) | The source-agnostic abstraction, generation, Daily Company, blueprints, Play to Apply |
| 09 | [Question Engine](09-question-engine.md) | Strategies, selection, lifecycle, rotation, versioning, what leaves the server |
| 10 | [AI question pipeline](10-ai-question-pipeline.md) | Jobs, ports, structured output, validation stages, tiers, budgets |
| 11 | [Scoring and progression](11-scoring-and-progression.md) | Scoring v1, race model, bots, XP ledger, levels, anti-farming, the completion transaction |
| 12 | [Rankings and projections](12-rankings-and-projections.md) | Ranking projections, daily close, titles, profile projections, seasons, rebuilds |
| 13 | [API and protocol](13-api-and-protocol.md) | Endpoints, payloads, client–server events, what the client knows, error codes |
| 14 | [Game client integration](14-game-client-integration.md) | Phaser package API, GameHost, scenes, resilience, performance |
| 15 | [Async processing](15-async-processing.md) | When BullMQ and when not, outbox, queues, topology |
| 16 | [Observability](16-observability.md) | Logs, audit trail per run, errors, metrics, alerts |
| 17 | [Configuration](17-configuration.md) | Environment, rulesets, feature flags, secrets |
| 18 | [Deployment](18-deployment.md) | Environments, topology, hosting options, headers, backups |
| 19 | [Web app](19-web-app.md) | Routes, rendering, data access, accessibility, SEO |
| 20 | [Testing strategy](20-testing-strategy.md) | Layers, determinism, tampering suite, content CI |
| 21 | [Future evolution](21-future-evolution.md) | Network, jobs and recruiters on top of the MVP |
| 22 | [Implementation plan](22-implementation-plan.md) | Part 3 foundations and slices S1–S8 |

Cross-cutting: [security](../security/README.md) · [anti-cheat](../anti-cheat/README.md) · [i18n](../i18n/README.md) · [analytics](../analytics/README.md) · [ADRs](../adr/README.md).

## Where each requested topic is covered

| Topic | Where |
|---|---|
| Developer provisional identity | [06 §1](06-identity-and-credentials.md#1-provisional-developer-creation), [ADR-007](../adr/ADR-007-provisional-developer-identity.md) |
| Device credential | [06 §2](06-identity-and-credentials.md#2-device-credential) |
| Future account claim | [06 §6](06-identity-and-credentials.md#6-account-claim-and-merge-stage-2-designed-now), [ADR-020](../adr/ADR-020-account-claim-and-merge.md) |
| GameSession | [07](07-game-session.md) |
| Immutable GameResult | [04 §2](04-domain-model.md#2-aggregates-and-invariants), [ADR-016](../adr/ADR-016-immutable-results-and-xp-ledger.md) |
| Progression ledger, XP and level | [11 §3](11-scoring-and-progression.md#3-progression-progression-v1) |
| JobChallenge as the central abstraction | [08](08-job-challenges.md), [ADR-017](../adr/ADR-017-job-challenge-abstraction.md) |
| Ranked vs Practice | [07 §3](07-game-session.md#3-ranked-attempt-commitment), [09 §3](09-question-engine.md#3-selection-algorithm-pool-strategies), [ADR-019](../adr/ADR-019-ranked-attempt-commitment.md) |
| Question lifecycle | [09 §4](09-question-engine.md#4-lifecycle-storage-design), [ADR-004](../adr/ADR-004-question-engine-and-lifecycle.md) |
| AI question pipeline | [10](10-ai-question-pipeline.md), [ADR-018](../adr/ADR-018-ai-question-pipeline.md) |
| Phaser/server interaction | [14](14-game-client-integration.md), [13 §4](13-api-and-protocol.md#4-client-server-events-the-games-view) |
| Server-authoritative gameplay | [ADR-003](../adr/ADR-003-server-authoritative-gameplay.md), [07](07-game-session.md) |
| Scoring | [11 §1–2](11-scoring-and-progression.md), [ADR-005](../adr/ADR-005-score-calculation-server-side.md) |
| Anti-cheat | [anti-cheat](../anti-cheat/README.md) |
| Privacy | [security](../security/README.md), [ADR-021](../adr/ADR-021-personal-data-handling.md) |
| Rankings | [12](12-rankings-and-projections.md), [ADR-008](../adr/ADR-008-rankings-as-projections.md) |
| Developer profile projections | [12 §6](12-rankings-and-projections.md#6-developer-profile-projections) |
| PostgreSQL / Redis | [05](05-data-model.md), [ADR-013](../adr/ADR-013-postgresql-and-prisma.md), [ADR-014](../adr/ADR-014-redis-usage.md) |
| When to use BullMQ, and when not | [15](15-async-processing.md), [ADR-015](../adr/ADR-015-async-processing-scope.md) |
| Evolution toward jobs and recruiters | [21](21-future-evolution.md) |
| Licensing | [ADR-010](../adr/ADR-010-licensing.md) |
