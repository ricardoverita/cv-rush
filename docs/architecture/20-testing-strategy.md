# Testing strategy

> Part 2 · Technical architecture · Status: **Approved** (current decisions; they evolve through ADRs)

## 1. Layers

| Layer | Tool | What | Where |
|---|---|---|---|
| Unit | Vitest | Domain rules: state machine, scoring, XP, levels, anti-farming, ranking order, LinkedIn normalization, blueprint validation, question selection, job generation determinism, simulation (race model, ATS re-simulation) | Every package and module |
| Contract | Vitest + Zod | Every API response conforms to its schema; **no public schema contains email fields**; error codes have translations | `packages/contracts`, API |
| Integration | Vitest + Testcontainers (Postgres, Redis) | Use cases end to end against a real database: create session → apply → answer → complete; constraints (attempts, double answers, idempotency); daily close; merges (Stage 2) | `apps/api` |
| E2E | Playwright | Full journeys on desktop and mobile viewports (onboarding → play → result → Save your progress → My Profile), accessibility checks (axe), visual snapshots of key screens | `apps/web` |
| Game | Vitest (pure logic) + Playwright with a fake server port | Input mapping, layout from scripts, scene flow | `packages/game` |
| Content | Validators | Catalogs, rulesets, templates, sample pool, translations | `tools/` |

## 2. Determinism and time

- An injectable `Clock` everywhere (no `Date.now()` in domain code). Tests "time travel" across UTC day and ISO week boundaries.
- Seeded RNG everywhere; fixed seeds in tests make job postings, selections, streams and bots reproducible.
- Golden tests for the scoring engine: input fixtures → exact breakdowns per `scoring_version`.

## 3. Security and tampering tests (a dedicated suite)

| Attack | Expected |
|---|---|
| Answer twice with different options | `ALREADY_ANSWERED`; the first answer stands |
| Answer after the deadline | Resolved as a timeout |
| Answer a question of another session or another developer | `QUESTION_NOT_CURRENT` / 404 |
| Reach a checkpoint too early | `CHECKPOINT_TOO_EARLY` |
| Skip a stage (call `final/start` during `recruiter`) | `INVALID_TRANSITION` |
| Apply twice; apply a 4th ranked attempt | One commit; `RANKED_ATTEMPTS_EXHAUSTED` |
| Start ranked, abandon after apply, start again | The attempt stays consumed |
| Change profile during the ranked lock | `RANKED_PROFILE_LOCKED` |
| Send profile fields in game requests | Ignored (and logged) |
| Fake ATS input log (impossible speeds, overlapping positions) | `ATS_LOG_INVALID` |
| Claim pickups or obstacles that weren't spawned; exceed caps | Dropped and counted |
| Forge XP, score or rank in any payload | No endpoint accepts them |
| Practice run receiving a competitive question | Never (lifecycle query test) |
| Email exposure | No response, page, share card, log line or analytics event contains an email (scans in tests) |
| CSRF (missing header, wrong origin) | 403 |

## 4. Content and translations in CI

`pnpm content:validate`, `pnpm questions:validate`, `pnpm translations:validate` run on every pull request; a content-only PR can't merge if any fails.

## 5. Performance checks

- k6 (or Artillery) scenario before launch: N concurrent runs with realistic pacing; p95 targets for game endpoints.
- A Lighthouse budget for the landing page (mobile).
