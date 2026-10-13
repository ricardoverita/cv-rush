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
