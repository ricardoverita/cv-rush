# Architecture Decision Records

ADRs record decisions that explain **what problem existed, which alternatives were considered, what was decided and why, and the consequences and trade-offs**. They are not documentation for its own sake.

- Status values: **Proposed** (awaiting review), **Accepted**, **Superseded by ADR-XXX**, **Deprecated**.
- New ADRs copy [the template](TEMPLATE.md) and take the next number.
- Product decisions live in the [decision log](../case-study/decision-log.md); ADRs cover architecture and project-wide technical choices.

| ADR | Title | Status |
|---|---|---|
| [001](ADR-001-modular-monolith.md) | Modular monolith | Proposed |
| [002](ADR-002-phaser-game-engine.md) | Phaser as the game engine, decoupled from the web app | Proposed |
| [003](ADR-003-server-authoritative-gameplay.md) | Server-authoritative gameplay | Proposed |
| [004](ADR-004-question-engine-and-lifecycle.md) | Question Engine with strategies and a question lifecycle | Proposed |
| [005](ADR-005-score-calculation-server-side.md) | Score calculation server-side, versioned | Proposed |
| [006](ADR-006-i18n-routing.md) | i18n with locale-prefixed routing and semantic codes | Proposed |
| [007](ADR-007-provisional-developer-identity.md) | Provisional Developer identity and device credentials | Proposed |
| [008](ADR-008-rankings-as-projections.md) | Rankings as projections over immutable results | Proposed |
| [009](ADR-009-question-localization.md) | Question localization with language-independent answers | Proposed |
| [010](ADR-010-licensing.md) | Licensing: Apache-2.0 code, CC BY 4.0 content, branding excluded | Proposed |
| [011](ADR-011-monorepo-and-tooling.md) | pnpm monorepo, Node 24 LTS and pinned tooling | Proposed |
| [012](ADR-012-web-and-api-applications.md) | Next.js web app and NestJS API on one origin | Proposed |
| [013](ADR-013-postgresql-and-prisma.md) | PostgreSQL as the source of truth, Prisma as the ORM | Proposed |
| [014](ADR-014-redis-usage.md) | Redis-compatible store: rate limits, locks, queues, caches only | Proposed |
| [015](ADR-015-async-processing-scope.md) | BullMQ only for long, scheduled or retryable work | Proposed |
| [016](ADR-016-immutable-results-and-xp-ledger.md) | Immutable game results and an append-only XP ledger | Proposed |
| [017](ADR-017-job-challenge-abstraction.md) | Job Challenge as a source-agnostic abstraction | Proposed |
| [018](ADR-018-ai-question-pipeline.md) | AI question pipeline: async, validated, provider-agnostic | Proposed |
| [019](ADR-019-ranked-attempt-commitment.md) | Ranked attempts committed at race start | Proposed |
| [020](ADR-020-account-claim-and-merge.md) | Future account claim and merge by proof of control | Proposed |
| [021](ADR-021-personal-data-handling.md) | Personal data handling (encrypted email, no PII in logs or analytics) | Proposed |
| [022](ADR-022-shared-contracts-and-validation.md) | Shared contracts and validation with Zod | Proposed |
| [023](ADR-023-analytics-events.md) | Provider-agnostic analytics events | Proposed |
| [024](ADR-024-game-configuration-and-feature-flags.md) | Versioned rulesets and simple feature flags | Proposed |
