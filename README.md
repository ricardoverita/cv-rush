# CV Rush

*Read this in [Español](README.es.md).*

[![CI](https://github.com/ricardoverita/cv-rush/actions/workflows/ci.yml/badge.svg)](https://github.com/ricardoverita/cv-rush/actions/workflows/ci.yml)

**CV Rush** (provisional name) is an open-source 2D browser game about the hiring process, designed as the entry point to a developer network. You pick your seniority, role and stack, grab your CV and race through recruiters, an ATS machine and interviews to deliver it at the company. Every run is meant to build your developer profile: score, XP, levels, history and rankings.

> **The game creates engagement. The profile accumulates value. Jobs create opportunity.**

## Current status

**Slice S1: you can create your developer profile. There is no playable game yet.**

| Done | Not yet |
|---|---|
| Product and game design ([Part 1](docs/README.md)) and technical architecture with 24 ADRs ([Part 2](docs/architecture/README.md)) | The game itself (Phaser runner, challenges, questions in play) |
| A monorepo that builds, tests and runs locally | History, XP, levels, rankings, sharing |
| Developer identity and onboarding (S1): a provisional developer profile (name, seniority, role, stack from the catalog) recognised on the same device, in English and Spanish | AI question generation |
| An API with health and readiness checks, a worker with a heartbeat job | Accounts, jobs, recruiter features (later stages) |
| Content validation with a sample question pack; CI | |

Next: S2, a complete Job Challenge played without the game engine, then S3, the first playable race. See the [implementation plan](docs/architecture/22-implementation-plan.md).

## Architecture in one minute

- **Server-authoritative:** the browser renders and sends intents; the server decides answers, scores, XP and rankings. Answer keys never reach the client.
- **Modular monolith:** a NestJS API with an HTTP entrypoint and a worker entrypoint, PostgreSQL (Prisma) as the source of truth, Redis for rate limits, locks, queues and caches.
- **Next.js web app** on the same origin as the API, with locale-prefixed routing (`/en`, `/es`).
- **Shared packages:** contracts (Zod schemas), deterministic simulation, open content, i18n catalogs, and the game engine contract.

```
apps/
  web/         Next.js: pages, i18n, SEO, (later) the game host
  api/         NestJS: HTTP API + worker, Prisma schema and migrations
packages/
  contracts/   Zod schemas and types shared by every app
  simulation/  Pure deterministic logic (seeded RNG)
  content/     Catalogs and sample questions (YAML) + validators
  i18n/        Message catalogs (en, es) + validator
  game/        Game engine contracts (Phaser arrives in slice S3)
  config/      Shared TypeScript presets
docs/          Product, game design, architecture, ADRs, case study
```

More: [architecture overview](docs/architecture/01-overview.md) · [ADRs](docs/adr/README.md) · [product vision](docs/product/vision.md).

## Run it locally

Requirements: **Node.js 24** (see `.nvmrc`), **Docker** with Compose v2, and Corepack (bundled with Node).

```bash
git clone https://github.com/ricardoverita/cv-rush.git
cd cv-rush
corepack enable
pnpm install
docker compose up -d --wait
pnpm db:migrate
pnpm dev
```

- Web: http://localhost:3000 (redirects to `/en` or `/es`); create your profile at `/en/play`
- API: http://localhost:4000/api/health and http://localhost:4000/api/ready

No `.env` file is needed for local development; see [`.env.example`](.env.example) for overrides. Details and all scripts: [local development](docs/contributing/local-development.md).

## Useful commands

```bash
pnpm verify               # format check, lint, typecheck, unit tests, validation, build
pnpm test:integration     # API tests against real PostgreSQL and Redis
pnpm questions:validate   # validate question packs
pnpm translations:validate
```

## Roadmap

**Game → Developer Network → Jobs → Recruiter Platform**, one stage at a time. See the [roadmap](docs/roadmap/README.md) and the [product evolution](docs/product/product-evolution.md).

## Contributing

Questions, technologies and translations can be contributed without touching game code. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the [contributor guides](docs/contributing/README.md). Please follow the [Code of Conduct](CODE_OF_CONDUCT.md); report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

- **Code:** [Apache License 2.0](LICENSE) (see [NOTICE](NOTICE)).
- **Content** in `docs/` and `packages/content/data/`: [CC BY 4.0](docs/LICENSE).
- **Name and logos:** not licensed; see [TRADEMARKS.md](TRADEMARKS.md).

Rationale: [ADR-010](docs/adr/ADR-010-licensing.md).
