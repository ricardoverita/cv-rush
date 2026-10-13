# ADR-011: pnpm monorepo, Node 24 LTS and pinned tooling

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

Web, game, API, shared contracts, simulation, content and i18n must evolve together, share types and validation, and be easy to clone and run for contributors. Version drift between contributors' environments causes "works on my machine" problems.

## Decision

- **One repository**, **pnpm workspaces** (`apps/*`, `packages/*`, `tools/*`).
- **Node.js 24 LTS**, pinned with `.nvmrc` and `.node-version` and enforced with `engines` + `engine-strict=true`.
- **pnpm pinned** through the `packageManager` field (Corepack) and `engines.pnpm`.
- Lockfile committed; CI installs with `--frozen-lockfile`.
- No Nx/Turborepo initially; add Turborepo only if CI time requires task caching.
- ESLint rules enforce package and module boundaries.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Polyrepo (web, api, game separately) | Contract drift; harder contributions; duplicated tooling |
| npm or Yarn workspaces | pnpm is faster and stricter about phantom dependencies |
| Nx | Powerful but heavy for this size; more concepts for contributors |
| Turborepo from day one | Useful later; not needed until CI is slow |

## Consequences

- Positive: one `pnpm i`; shared types and schemas; consistent versions.
- Negative: contributors need Corepack enabled (documented); the repository grows with all apps.

## Related

[Monorepo](../architecture/02-monorepo.md).
