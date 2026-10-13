# Architecture Decision Records

ADRs record the **current** decisions. They evolve: a change is a new ADR that supersedes an old one. ADRs record decisions that explain **what problem existed, which alternatives were considered, what was decided and why, and the consequences and trade-offs**. They are not documentation for its own sake.

- Status values: **Proposed** (awaiting review), **Accepted**, **Superseded by ADR-XXX**, **Deprecated**.
- New ADRs copy [the template](TEMPLATE.md) and take the next number.
- Product decisions live in the [decision log](../case-study/decision-log.md); ADRs cover architecture and project-wide technical choices.

| ADR | Title | Status |
|---|---|---|
| [001](ADR-001-modular-monolith.md) | Modular monolith | Accepted |
| [002](ADR-002-phaser-game-engine.md) | Phaser as the game engine, decoupled from the web app | Accepted |
| [003](ADR-003-server-authoritative-gameplay.md) | Server-authoritative gameplay | Accepted |
| [004](ADR-004-question-engine-and-lifecycle.md) | Question Engine with strategies and a question lifecycle | Accepted |
| [005](ADR-005-score-calculation-server-side.md) | Score calculation server-side, versioned | Accepted |
| [006](ADR-006-i18n-routing.md) | i18n with locale-prefixed routing and semantic codes | Accepted |
| [007](ADR-007-provisional-developer-identity.md) | Provisional Developer identity and device credentials | Accepted |
| [008](ADR-008-rankings-as-projections.md) | Rankings as projections over immutable results | Accepted |
| [009](ADR-009-question-localization.md) | Question localization with language-independent answers | Accepted |
| [010](ADR-010-licensing.md) | Licensing: Apache-2.0 code, CC BY 4.0 content, branding excluded | Accepted |
| [011](ADR-011-monorepo-and-tooling.md) | pnpm monorepo, Node 24 LTS and pinned tooling | Accepted |
| [012](ADR-012-web-and-api-applications.md) | Next.js web app and NestJS API on one origin | Accepted |
| [013](ADR-013-postgresql-and-prisma.md) | PostgreSQL as the source of truth, Prisma as the ORM | Accepted |
| [014](ADR-014-redis-usage.md) | Redis-compatible store: rate limits, locks, queues, caches only | Accepted |
| [015](ADR-015-async-processing-scope.md) | BullMQ only for long, scheduled or retryable work | Accepted |
| [016](ADR-016-immutable-results-and-xp-ledger.md) | Immutable game results and an append-only XP ledger | Accepted |
| [017](ADR-017-job-challenge-abstraction.md) | Job Challenge as a source-agnostic abstraction | Accepted |
| [018](ADR-018-ai-question-pipeline.md) | AI question pipeline: async, validated, provider-agnostic | Accepted |
| [019](ADR-019-ranked-attempt-commitment.md) | Ranked attempts committed at race start | Accepted |
| [020](ADR-020-account-claim-and-merge.md) | Future account claim and merge by proof of control | Accepted |
| [021](ADR-021-personal-data-handling.md) | Personal data handling (encrypted email, no PII in logs or analytics) | Accepted |
| [022](ADR-022-shared-contracts-and-validation.md) | Shared contracts and validation with Zod | Accepted |
| [023](ADR-023-analytics-events.md) | Provider-agnostic analytics events | Accepted |
| [024](ADR-024-game-configuration-and-feature-flags.md) | Versioned rulesets and simple feature flags | Accepted |
