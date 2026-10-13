# Dependency vulnerability policy

> Status: **Accepted** (2026-10-13, decision log [D-076](../case-study/decision-log.md#d-076--dependency-vulnerability-policy)). Applies to every advisory reported by `pnpm audit` and by Dependabot alerts.

## 1. Scope: where a vulnerable package runs

| Scope | Definition | Examples |
|---|---|---|
| **Runtime** | Code that runs in the deployed API, worker or web server, or ships to browsers | NestJS, Fastify, the generated Prisma client, Next.js, React |
| **Tooling** | Code that only runs on developer machines or in CI: build, lint, test, code generation, database CLIs | ESLint plugins, Vitest, the Prisma CLI (`prisma generate`, `prisma migrate`) |

A package's scope is decided by **where it executes**, not by which `package.json` section lists it. The audit path shows how it is reached; the code shows whether it is ever loaded.

## 2. Rules

**Runtime vulnerability → resolve, or justify before release.**
Update or override to a patched version, verified by tests that exercise the affected path. If no fix exists, an exception needs a concrete argument for why the vulnerable code is unreachable or not exploitable in our deployment, and it blocks a release until it is reviewed.

**Tooling vulnerability → evaluate, document, review.**
Assess real exploitability (who controls the input that reaches the vulnerable code?). If it is not exploitable in practice, record a temporary exception. Review it on its date, or as soon as the dependency that introduces it changes.

**Never:**

- lower the audit threshold globally, or ignore advisories by severity, to get a green build;
- break a tool (for example forcing a major version of one of Prisma's internals) only to silence an advisory;
- keep an exception without a removal condition and a review date.

**Overrides** are welcome when they are compatible (same major version of the vulnerable package) and verifiable (our tests or commands exercise the code path). Example: fastify is pinned for Nest's own copy ([D-067](../case-study/decision-log.md#d-067--fastify-pinned-through-a-catalog-and-an-override)).

## 3. Enforcement

- `pnpm audit:check` (CI, quality job) runs `pnpm audit` and fails when an advisory is **not** listed in [`tools/audit-exceptions.json`](../../tools/audit-exceptions.json), when an exception is **past its review date**, or when an excepted advisory shows up **through a new dependency path** (for example, if it ever reaches a runtime package). Exceptions that no longer match anything are reported so they can be removed.
- GitHub **Dependabot alerts** are enabled. Dependabot update pull requests go through CI and review; nothing is merged automatically.
- `tools/audit-exceptions.json` is the source of truth; the table below summarizes it for readers.

## 4. Current exceptions

| Advisory | Package | Scope | Introduced by | Why it doesn't affect us | Remove when | Review by |
|---|---|---|---|---|---|---|
| [GHSA-3f6p-5ww8-9rcr](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr) (high) | mysql2 3.15.3 | Tooling | `prisma` CLI 7.10.0 | The Prisma CLI imports `mysql2` only for MySQL datasources (`import("mysql2/promise")` in its MySQL executor). Our datasource is PostgreSQL, so the module is never loaded; the flaw needs a connection to a malicious MySQL server | A stable Prisma release depends on `mysql2` ≥ 3.22.0 | 2026-12-15 |
| [GHSA-rgwj-5xj2-c3m3](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3) (moderate) | mysql2 3.15.3 | Tooling | `prisma` CLI 7.10.0 | Same as above: needs a compressed MySQL protocol connection, which we never open | A stable Prisma release depends on `mysql2` ≥ 3.23.1 | 2026-12-15 |
| [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) / CVE-2026-40345 (high) | deepmerge-ts 7.1.5 | Tooling | `@prisma/config` 7.10.0 (Prisma CLI) | Used only to merge layers of our own `prisma7.config.ts` (remote and RC configs disabled). The input is a file in this repository, without recursive objects | A stable Prisma release depends on `deepmerge-ts` ≥ 8 | 2026-12-15 |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) / CVE-2026-93687 (high) | braces 3.0.3 | Tooling | `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` | Runs only while linting, on glob patterns written in this repository; no untrusted input reaches it. No patched version exists yet | A patched `braces` exists (then override or update), or the plugin stops depending on it | 2026-12-15 |

The `@prisma/client > prisma` paths in `pnpm audit` come from the client's peer dependency on the CLI; the generated client used at runtime does not import the CLI.
