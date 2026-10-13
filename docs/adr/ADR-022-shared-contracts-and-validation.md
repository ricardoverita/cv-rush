# ADR-022: Shared contracts and validation with Zod

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

The web app, the game engine and the API exchange many payloads (sessions, questions, outcomes, effects, errors, analytics events). Nothing from the browser can be trusted, so every input must be validated, and types must not drift between apps.

## Decision

- `packages/contracts` defines **Zod schemas** (and inferred TypeScript types) for every API request and response, error codes, effect codes, reason codes and analytics events.
- The API validates every input with these schemas (a Nest pipe) and every output in tests (and optionally in development at runtime).
- Clients use the same schemas for typed calls.
- Content files (catalogs, rulesets, blueprints, question packs) also have Zod schemas used by validators and at boot.
- JSON Schema is generated from Zod where needed (e.g. structured LLM output).

## Alternatives considered

| Alternative | Why not |
|---|---|
| class-validator + class-transformer | Decorator-based, not shareable with the browser or the game |
| OpenAPI-first with code generation | Heavier toolchain; can be generated from Zod later for a public API |
| TypeScript types only | No runtime validation |

## Consequences

- Positive: one source of truth; runtime safety at every boundary; easy contract tests.
- Negative: Zod becomes a core dependency (well maintained, widely used).

## Related

[API and protocol](../architecture/13-api-and-protocol.md).
