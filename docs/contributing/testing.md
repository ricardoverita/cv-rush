# Testing

| Command | What runs | Needs |
|---|---|---|
| `pnpm test` | Unit tests in every package and app (Vitest) | Nothing |
| `pnpm test:integration` | API tests against real PostgreSQL and Redis | `docker compose up -d --wait`, `pnpm db:migrate`, `pnpm db:seed` |
| `pnpm test:e2e` | The main journey in a real browser (Playwright): onboarding → Ranked → offer → Apply → every challenge → result, plus a refresh and tampering attempts | The integration prerequisites, `pnpm build`, and Google Chrome installed (Playwright's `chrome` channel; no browser download) |
| `pnpm audit:check` | `pnpm audit` against the [dependency policy](../security/dependency-policy.md) | Network |
| `pnpm validate` | Catalog, questions, translations and documentation links | Nothing |
| `pnpm verify` | Format, lint, typecheck, unit tests, validation, build | Nothing |

Conventions:

- Unit tests live next to the code (`*.test.ts`). API tests that boot NestJS live in `apps/api/test/`; they're compiled with SWC so decorators and dependency injection work.
- Integration tests are named `*.int.test.ts` and only run with `pnpm test:integration`.
- Domain code must be deterministic: inject the clock, use `@cv-rush/simulation`'s seeded RNG, never `Math.random()` or `Date.now()` in rules.
- Validators have tests for every rule they enforce (see `packages/content/src/*.test.ts`), so a content PR can't silently weaken them.
- Time-dependent rules (review windows, question deadlines, session lifetimes) are tested by moving the server's clock: integration tests replace the `Clock` provider with `TestClock` (`apps/api/test/support/app.ts`).
- Tampering tests send what a modified client could send (extra fields, skipped stages, replays, other developers' ids) and assert that the server refuses it and writes nothing.
- The E2E test (`apps/web/e2e/*.e2e.ts`) starts the production builds itself, or reuses servers already running on ports 3000 and 4000. `E2E_SCREENSHOTS_DIR=/some/dir pnpm test:e2e` also saves screenshots of each step.

The overall testing strategy is in [architecture › testing](../architecture/20-testing-strategy.md).
