# Contributing to CV Rush

Thanks for your interest! CV Rush is built in the open, and it's designed so that you can contribute **without understanding the whole system**: adding questions, technologies or translations doesn't require touching game code.

> **Status:** the project is in its foundations phase. There is no playable game yet; the [roadmap](docs/roadmap/README.md) and the [implementation plan](docs/architecture/22-implementation-plan.md) describe what comes next.

## Ways to contribute

| Contribution | Needs | Guide |
|---|---|---|
| Report a bug or a confusing doc | Nothing | [Open an issue](https://github.com/ricardoverita/cv-rush/issues/new/choose) |
| Fix a translation | JSON | [Adding a language](docs/contributing/adding-a-language.md) |
| Add questions | YAML + `pnpm questions:validate` | [Adding questions](docs/contributing/adding-questions.md) |
| Add a technology | YAML + `pnpm content:validate` | [Adding a technology](docs/contributing/adding-a-technology.md) |
| Add a role | YAML + `pnpm content:validate` | [Adding a role](docs/contributing/adding-a-role.md) |
| Propose a game mechanic | An issue with the proposal template | [Challenge anatomy](docs/game-design/challenges/README.md) |
| Code | TypeScript | [Local development](docs/contributing/local-development.md), [testing](docs/contributing/testing.md) |

## Getting started

```bash
git clone https://github.com/ricardoverita/cv-rush.git
cd cv-rush
corepack enable          # uses the pnpm version pinned in package.json
pnpm install             # also builds the shared packages and generates the Prisma client
docker compose up -d --wait
pnpm db:migrate
pnpm dev                 # web on http://localhost:3000, API on http://localhost:4000/api
```

You need **Node.js 24** (`.nvmrc` / `.node-version`) and **Docker**. Details in [local development](docs/contributing/local-development.md).

## Before opening a pull request

```bash
pnpm verify    # format check, lint, typecheck, unit tests, content/translation/docs validation, build
```

If your change touches the database: `pnpm test:integration` (needs Docker services running).

## Principles

- **The server is the referee.** Never move business rules (scores, answers, XP, rankings) into the browser. See [ADR-003](docs/adr/ADR-003-server-authoritative-gameplay.md).
- **No hardcoded copy.** User-facing text goes through `packages/i18n` (English and Spanish).
- **Respect module boundaries.** Packages never import apps; the game engine stays framework-agnostic; lint enforces it.
- **Minimal dependencies.** Justify new dependencies in the pull request (maintenance, size, license, real need).
- **Privacy.** Never commit secrets, real emails, real LinkedIn profiles or production data.
- **Document decisions.** Architectural changes get an ADR (`docs/adr/`); product decisions go to the [decision log](docs/case-study/decision-log.md).

## Commits and pull requests

- Small, focused pull requests are easier to review.
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/) are encouraged (`feat:`, `fix:`, `docs:`, `chore:`…).
- Fill in the pull request template, including the **authorship and origin** checklist.

## Licensing of contributions

By contributing, you agree that your contributions are licensed under the project's licenses: **Apache-2.0** for code and **CC BY 4.0** for content in `docs/` and `packages/content/data/` ([ADR-010](docs/adr/ADR-010-licensing.md)). You keep your copyright. There is no CLA.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues: see [SECURITY.md](SECURITY.md).

## Good first issues

Look for the `good first issue` label. Typical first contributions: translations, a few questions for a technology you know, a technology in the catalog, documentation fixes, or more test coverage for the validators.
