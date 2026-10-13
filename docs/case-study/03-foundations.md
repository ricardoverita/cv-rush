# 03 · Repository foundations

> Case-study notes · Recorded 2026-10-12/13, during Part 3 (foundations). Working notes, not the article.

## Goal

Turn a documentation-only repository into an open-source project that builds, runs locally with a few commands, has CI, and is ready for contributors, without starting the game itself.

## What we built

A pnpm monorepo (Node 24, pnpm 12 via Corepack) with a Next.js skeleton (i18n en/es, status page), a NestJS API skeleton (health/readiness, structured logs, environment validation), a worker entrypoint (BullMQ heartbeat), Prisma with a first migration, Docker Compose for PostgreSQL and Redis, shared packages (contracts, simulation, content, i18n, game contracts, config), validators for content, questions, translations and documentation links, ESLint boundary rules, Vitest, GitHub Actions CI, and the open-source files (licenses, NOTICE, trademarks, contributing, code of conduct, security, templates).

## Problems we hit (and what we did)

| Problem | What happened | Decision |
|---|---|---|
| **pnpm 12 blocks install scripts** | `ERR_PNPM_IGNORED_BUILDS` for Prisma, esbuild, SWC… and the old `onlyBuiltDependencies` setting didn't apply | Explicit `allowBuilds` allowlist in `pnpm-workspace.yaml`; optional native speed-ups (msgpackr-extract) stay blocked |
| **pnpm 12 supply-chain policy (minimum release age)** | Pinning "latest" pulled versions published hours earlier; pnpm added exclusions automatically | Removed the exclusions and pinned the newest versions older than the policy window instead. Security policy > freshness. |
| **NestJS 12 was released the same day** | Every 12.x version was less than a day old | Stayed on **NestJS 11.2.7** (stable). Revisit after it matures. |
| **TypeScript 7 (native compiler)** | `typescript-eslint` supports `<6.1` only | Pinned **TypeScript 6.0.x**; move to 7 when the lint toolchain supports it |
| **ESLint 10 vs Next.js plugins** | `eslint-config-next` brings plugins whose peers stop at ESLint 9 | Pinned **ESLint 9.39.x**; no peer warnings |
| **BullMQ 6 connection types** | Spreading ioredis options no longer typechecks | Use BullMQ's own `{ url, maxRetriesPerRequest: null }` options |
| **Prisma 7 configuration** | `prisma init` creates `prisma7.config.ts`; `.env` isn't loaded automatically; the client needs a driver adapter | `prisma7.config.ts` loads the root `.env` if present and falls back to local defaults; `@prisma/adapter-pg` in the service |
| **NestJS decorators in Vitest** | esbuild doesn't emit decorator metadata, which Nest's DI needs | SWC (`unplugin-swc`) for API tests only |
| **Lint rule for a dependency-free package** | A glob pattern also blocked relative imports | A regex pattern that only blocks bare specifiers; verified with deliberate violations |
| **SSH to GitHub blocked on the network** | `git push` over ports 22 and 443 timed out | Repository remote switched to HTTPS with the GitHub CLI as the credential helper (repo-local config) |
| **API restart loop found only in a clean clone** | `node --watch-path=dist` restarted the API and worker on changes outside `dist` (the web app's `.next` output) when the repository lived under another path; the project looked healthy in the original folder | Use `node --watch` (module graph only). Lesson: verify the documented flow in a fresh clone, not only in the working copy |
| **`pnpm ci` is a pnpm 12 built-in** | Our `ci` script was shadowed by pnpm's own clean-install command | Renamed the script to `pnpm verify` |
| **No `.env` friction** | The ideal flow had no `cp .env.example .env` step | Local defaults that match `compose.yaml` (development only; production requires explicit values) |
| **A security update that wouldn't have reached the server** | Dependabot's fastify bump (seven advisories) was green in CI, but `@nestjs/platform-fastify` pins its own fastify: the running server would have stayed on the vulnerable copy | One fastify for the whole workspace (pnpm catalog + override) and a test that compares the server's fastify with ours. Lesson: a green CI only proves what the tests check; read where a dependency is actually used ([D-067](decision-log.md#d-067--fastify-pinned-through-a-catalog-and-an-override)) |
| **Dependabot "ignoring" its ignore rules** | NestJS 12 and `@types/node` 26 pull requests reappeared minutes after the ignore rules were pushed | The job logs showed the rules working ("All updates for @nestjs/common were ignored"); the new pull requests had been queued by jobs that ran with the first configuration. Closed them and confirmed with a fresh run |

## Verification (actually run)

`pnpm install` (with postinstall builds), `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` (42 unit tests), `pnpm validate`, `pnpm build` (including `next build`), `docker compose up -d --wait`, `pnpm db:migrate`, `pnpm db:check`, `pnpm db:seed` (twice), `pnpm test:integration` (real PostgreSQL and Redis), and `pnpm dev` probed with HTTP requests, then the whole documented flow repeated in a **fresh clone with an empty database** (clone → install → compose up → migrate → dev → seed → db:check → integration tests): health and readiness, request IDs, locale redirects (es-PE → /es, it-IT → /en, cookie overrides Accept-Language), localized pages with absolute canonical and hreflang links, the `/api` rewrite, and the worker's heartbeat job.

## To measure later

Cold `pnpm install` time, CI duration, the first contributor's time to a running project.
