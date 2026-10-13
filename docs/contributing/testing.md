# Testing

| Command | What runs | Needs |
|---|---|---|
| `pnpm test` | Unit tests in every package and app (Vitest) | Nothing |
| `pnpm test:integration` | API tests against real PostgreSQL and Redis | `docker compose up -d --wait`, `pnpm db:migrate`, `pnpm db:seed` |
| `pnpm validate` | Catalog, questions, translations and documentation links | Nothing |
| `pnpm verify` | Format, lint, typecheck, unit tests, validation, build | Nothing |

Conventions:

- Unit tests live next to the code (`*.test.ts`). API tests that boot NestJS live in `apps/api/test/`; they're compiled with SWC so decorators and dependency injection work.
- Integration tests are named `*.int.test.ts` and only run with `pnpm test:integration`.
- Domain code must be deterministic: inject the clock, use `@cv-rush/simulation`'s seeded RNG, never `Math.random()` or `Date.now()` in rules.
- Validators have tests for every rule they enforce (see `packages/content/src/*.test.ts`), so a content PR can't silently weaken them.

The testing strategy for later slices (tampering suite, time travel, e2e) is in [architecture › testing](../architecture/20-testing-strategy.md).
