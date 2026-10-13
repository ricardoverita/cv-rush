# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions will follow [Semantic Versioning](https://semver.org/) once the first release exists.

## [Unreleased]

### Added

- Product and game design documentation (Part 1): vision, developer network evolution, identity and account migration strategy, progression, run types, rankings, privacy, MVP scope, risks, metrics and case-study notes.
- Technical architecture and ADR-001 to ADR-024 (Part 2).
- Repository foundations (Part 3):
  - pnpm monorepo pinned to Node.js 24 LTS and pnpm 12 (Corepack), strict TypeScript presets.
  - `apps/web`: Next.js skeleton with locale-prefixed i18n (en, es; English fallback), Tailwind CSS, a status landing page.
  - `apps/api`: NestJS modular monolith skeleton (Fastify), environment validation, structured logs with request IDs, `GET /api/health` and `GET /api/ready`.
  - Worker entrypoint with a BullMQ maintenance queue (heartbeat).
  - Prisma with an initial migration (`seasons`) and an idempotent seed (Season 0).
  - Docker Compose for PostgreSQL and Redis.
  - Shared packages: `contracts`, `simulation`, `content`, `i18n`, `game` (contracts only), `config`.
  - Content validation (`pnpm content:validate`, `pnpm questions:validate`) with a sample question pack.
  - Translation and documentation link validation.
  - ESLint (with architecture boundary rules), Prettier, Vitest, GitHub Actions CI.
  - Open-source files: licenses (Apache-2.0 for code, CC BY 4.0 for content), NOTICE, trademarks policy, contributing guide, code of conduct, security policy, issue and pull request templates.
- Developer identity and onboarding (slice S1):
  - `GET /api/v1/catalog`: roles, tracks, technology categories and technologies with localized labels, validated at boot.
  - `POST /api/v1/developers`: creates a provisional Developer (UUIDv7) and its profile, and sets an httpOnly device credential cookie (only its SHA-256 is stored).
  - `GET /api/v1/me` and `PATCH /api/v1/me/profile`: the same device is recognised on return; the profile can be edited.
  - Shared name and profile rules (`packages/contracts`) applied by the API and, for instant feedback, by the web app; display-name moderation on the server.
  - CSRF protection for state-changing requests (client header, JSON content type, origin check) and a uniform error envelope.
  - Web: landing with automatic `en`/`es` detection, a four-step onboarding (name, seniority, role, stack picker with search by aliases) and a "Competing as" card.
- The Job Challenge without the game engine (slice S2):
  - Ruleset v0: every gameplay constant in a versioned file (ranked attempts, windows, lifetimes, stages, levels, CV damage, ATS, scoring-v0).
  - Job postings generated for the profile snapshot from authored en/es content; Job Challenges with a source (`generated` today; `daily` and real `job_posting` later).
  - Question pools filled through the provider-agnostic pipeline (schema, rules, deduplication, independent verification, allocation) with an offline fake provider; sample packs for practice.
  - Game sessions: Ranked (3 attempts per UTC day, committed at apply, daily ranked profile lock) and Practice; a frozen competitive identity snapshot; a server-side state machine; just-in-time questions; server-decided answers with idempotent replays and lazy timeouts; the ATS rule; scoring-v0; immutable game results; a worker sweeper for expired and abandoned runs.
  - Web: Ranked or Practice choice with today's remaining attempts, job review and Apply, stage progress, A/B/C/D questions, the ATS keyword selection and the result screen.
  - End-to-end journey test with Playwright in CI.

### Security

- Dependency vulnerability policy (runtime findings fixed or justified before release, tooling findings documented with a review date), enforced in CI by `pnpm audit:check`. Dependabot alerts enabled.

- The API's HTTP server now runs fastify 5.12.5 instead of the 5.11.3 copy pinned by `@nestjs/platform-fastify` (seven advisories, including `X-Forwarded-*` spoofing under `trustProxy`). One fastify version for the whole workspace, guarded by a test.
