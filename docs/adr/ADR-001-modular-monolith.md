# ADR-001: Modular monolith

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

CV Rush starts with one maintainer, a small audience, and a domain that will grow (developer network, jobs, recruiters). The brief asks for clean, decoupled architecture without premature microservices. Most critical operations (completing a run) must update several concerns atomically: result, XP, stats, rankings.

## Decision

Build the backend as a **modular monolith** in NestJS: one codebase and database, with two process entrypoints (HTTP API and worker). Modules own their tables, expose a public API (`index.ts`), and communicate through explicit calls within transactions or through an outbox for after-commit effects. Core modules use a light domain/application/infrastructure/interfaces split; simple modules don't.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Microservices | Distributed transactions for "complete a run", operational cost, slower iteration, nothing to scale independently yet |
| Unstructured monolith | Fast at first, but modules would entangle; extraction and contributions get harder |
| Business logic in Next.js route handlers | Mixes UI and rules; the game worker would need the same rules elsewhere; weaker boundaries |

## Consequences

- Positive: atomic transactions for core flows; simple deployment; clear module boundaries for contributors; extraction remains possible.
- Negative: discipline is needed to keep boundaries (lint rules on imports, review); one database means shared scaling until extraction.
- Follow-ups: ESLint boundary rules in Part 3; module READMEs.

## Related

[Backend modules](../architecture/03-backend-modules.md), [overview](../architecture/01-overview.md).
