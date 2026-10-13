# Local development

## Requirements

- **Node.js 24 LTS**: the version is pinned in `.nvmrc` and `.node-version` (`nvm use`, `fnm use`, mise and Volta read them). `engines` enforces it.
- **pnpm**: pinned in `package.json` (`packageManager`). Run `corepack enable` once and the right version is used automatically.
- **Docker** with Compose v2 (Docker Desktop, OrbStack, Colima…) for PostgreSQL and Redis.

## From zero

```bash
git clone https://github.com/ricardoverita/cv-rush.git
cd cv-rush
corepack enable
pnpm install                  # builds the shared packages and generates the Prisma client (postinstall)
docker compose up -d --wait   # PostgreSQL 17 and Redis 8, waits until they are healthy
pnpm db:migrate               # applies migrations
pnpm db:seed                  # optional: idempotent seed (Season 0)
pnpm dev                      # web + API + worker in watch mode
```

Open:

- http://localhost:3000 → redirects to `/en` or `/es` depending on your browser language.
- http://localhost:4000/api/health and http://localhost:4000/api/ready (also reachable through the web origin at http://localhost:3000/api/…).

**No `.env` file is needed** for local development: the defaults match `compose.yaml`. Copy `.env.example` to `.env` only to override something (ports, URLs, log level).

## What `pnpm dev` runs

| Process | What |
|---|---|
| `packages/*` | `tsc --watch` (shared packages are consumed from `dist/`) |
| `apps/web` | `next dev` on port 3000; `/api/*` is proxied to the API (same origin, like production) |
| `apps/api` (http) | NestJS HTTP entrypoint on port 4000, restarted on rebuild |
| `apps/api` (worker) | NestJS worker entrypoint (BullMQ queues and schedules) |

## Scripts (repository root)

| Script | Does |
|---|---|
| `pnpm dev` | Everything in watch mode |
| `pnpm build` | Builds packages and apps (including `next build`) |
| `pnpm typecheck` | Strict type checks everywhere |
| `pnpm lint` / `pnpm format` / `pnpm format:check` | ESLint (with boundary rules) and Prettier |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:integration` | API integration tests (needs Docker services, migrations and seed) |
| `pnpm db:migrate` | Applies migrations (`prisma migrate deploy`) |
| `pnpm db:migrate:dev` | Creates a migration from schema changes (`prisma migrate dev`) |
| `pnpm db:seed` | Idempotent seed |
| `pnpm db:check` | Fails if the Prisma schema and the migrations differ |
| `pnpm db:studio` | Prisma Studio |
| `pnpm content:validate` | Validates catalogs |
| `pnpm questions:validate` | Validates question packs |
| `pnpm translations:validate` | Validates message catalogs (keys and placeholders) |
| `pnpm docs:check` | Validates relative links and anchors in Markdown |
| `pnpm validate` | All four validators |
| `pnpm verify` | What CI runs (except the database job) |

## Troubleshooting

- **`Unsupported engine`**: you're not on Node 24. Run `nvm use` (or your version manager's equivalent).
- **Wrong pnpm version**: run `corepack enable`, then open a new shell.
- **Port already in use**: change `POSTGRES_PORT` / `REDIS_PORT` (Compose) or `API_PORT` in `.env`, and adjust `DATABASE_URL` / `REDIS_URL`.
- **`/api/ready` returns 503**: PostgreSQL or Redis is down: `docker compose ps`.
- **Reset the local database**: `docker compose down -v && docker compose up -d --wait && pnpm db:migrate`.
