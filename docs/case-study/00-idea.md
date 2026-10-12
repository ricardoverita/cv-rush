# 00 · The idea

> Case-study notes · Recorded 2026-10-12

## The starting point

The project started as a long written brief from the maintainer: two messages, **85 numbered sections**, written in Spanish. It described a public web game called, provisionally, **CV Rush**: a competitive runner inspired by the hiring process. The player finds a job posting, applies, and races with their CV through recruiters, an ATS, a hiring manager and a final interview, against bot candidates, to physically deliver the CV at the company.

The sentence that best captures the intent (original wording, to keep for the Spanish article):

> "Estoy viviendo un proceso de selección laboral mientras intento conseguir que mi CV llegue hasta la empresa."

## What the brief already got right

- **A strong core fantasy:** the candidate is the protagonist, the CV is the object to protect, the company is the destination, other candidates are the rivals, and the hiring process is the obstacle.
- **Security instincts from the first page:** "questions cannot be in the frontend", a server-authoritative design, never trusting the client's score or time, a session state machine.
- **Product and community in the same breath as the code:** leaderboards as a professional showcase, LinkedIn exposure, privacy by design, i18n (es/en), open source, contributor experience, a case study.
- **An explicit dislike of over-engineering:** a modular monolith, no premature microservices, "don't use technologies just because they're listed".

## Initial technical preferences (from the brief)

Next.js + TypeScript (web), Phaser.js or an alternative (game), Node.js + NestJS (API), PostgreSQL + Prisma, Redis, BullMQ "only if it adds value", Docker. Each to be justified rather than assumed. That justification is Part 2's job.

## What the brief asked for first

Not code. Analysis, architecture, decisions, risks, flow and a plan. Then building in vertical slices.

## How we organised the work

1. **Part 0:** a plan and decisions, agreed before touching anything.
2. **Part 1:** product and game design (documentation only). ← these notes
3. **Part 2:** technical architecture and ADRs.
4. **Part 3:** repository foundations.
5. **Vertical slices**, each a demoable PR.
6. **Launch.**

## Decisions made before any design work (2026-10-12)

- Repository: `ricardoverita/cv-rush`, public. The local folder was renamed from `cvgame` to `cv-rush`.
- Code, technical docs, ADRs and issue templates in English; `README.es.md` in Spanish; the product bilingual from day one.
- Licenses to be studied in an ADR (direction: Apache-2.0 for code, CC BY 4.0 for content, branding excluded).
- UTC as the canonical server time, local time for display.
- Node 24 LTS, pinned for contributors; pnpm pinned via Corepack.
- Docker as the official path for local Postgres and Redis.

See the [decision log](decision-log.md) for the full list.
