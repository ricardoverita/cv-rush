# Roadmap

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> No dates on purpose. Phases follow the [product evolution](../product/product-evolution.md): **Game → Developer Network → Jobs → Recruiter Platform**. Each stage starts only when the previous one works. GitHub milestones will mirror these phases once the repository is public.

## Overview

| Phase | Product stage | Theme |
|---|---|---|
| **MVP** | Stage 1 · Game | A fun runner played as your profile, with persistent progress |
| **V1** | Stage 1 polish → Stage 2 begins | Accounts and claiming, public developer pages, richer rankings, curated content |
| **V2** | Stage 2 complete | A developer network worth keeping: seasons, badges, Open to Work, community content at scale |
| **V3** | Stage 3 · Jobs | Companies, real job postings, Play to Apply, applications |
| **Later** | Stage 4 · Recruiter Platform | Recruiter accounts, developer search over discoverable profiles, applicant views |

## MVP (summary)

Landing · light onboarding (name, seniority, role, stack) creating a **provisional developer identity** · explicit **Play Ranked / Practice** · a Job Challenge generated for the frozen profile snapshot · a **2D side-scrolling runner** with Recruiter, ATS, Hiring Manager and Final Interview · 5–10 in-world A/B/C/D questions per run from **AI-generated, validated pools** · bots · CV Health · server-computed score, **XP and CV Rush Level** · **history** and **last active** · **Save your progress** after the first game (optional email/LinkedIn) · ranked attempts (3/day) and practice runs · category rankings (daily, weekly) with the Daily Champion per category, Season 0 (Beta) · optional public LinkedIn · sharing · a **private "My profile" page** with initial stats · i18n es/en · accessibility basics · first-party analytics · moderation commands · open-source foundations.

Exact scope: [MVP scope](../product/mvp-scope.md).

## V1 (Stage 1 polish → Stage 2 begins)

| Item | Why |
|---|---|
| **Accounts** (email verification, GitHub, Google) and **claiming provisional profiles**, with merges | Turn provisional progress into a durable identity ([identity and accounts](../product/identity-and-accounts.md)) |
| **Public developer pages** (`/developers/{slug}`, per-section toggles, indexable once claimed) | The network's core asset |
| Weekly Top 7 and Candidate of the Week (per category) | Weekly narrative |
| Technology rankings; XP/level rankings | Progression features |
| Experimental normalized global view | Cross-category "top performers", never a title |
| **Curated content**: human review of AI pools, first community question packs (open, practice), calibration tooling | Quality and gradual replacement of AI content |
| Category cooldown | Anti-hopping |
| More ranked categories (Platform official, then practice-only tracks) | Growth, content-gated |
| Salary Negotiation stage, Ghosting | Signature hiring-process moments |
| Server-side re-simulation of ATS and collisions from input logs | Integrity |
| Admin panel v1 (content, reports, runs, moderation, titles) | Operations |
| "Challenge a friend" links | Social replay with the same company and category |
| Music and sound polish; new level themes (startup, bank, big tech) | Game feel and variety |
| PR preview deployments | Contributor experience |

## V2 (Stage 2 complete)

| Item | Why |
|---|---|
| **Seasons** with season XP and resets (history preserved) | Long-term competition |
| **Badges**, portfolio link, voluntary **Open to Work** | Profile richness |
| Public history and technology stats sections (opt-in) | Visibility |
| Community question packs at scale; a curated competitive pool with families and calibration | Content quality and contributor community |
| Public read-only API (rankings, public profiles, aggregates) | Ecosystem |
| Aggregated, anonymized talent insights ("State of the Stack") | Community value |
| More languages (e.g. Portuguese) | Reach |
| Ghost runs of real top players | Competitive replay |

## V3 (Stage 3 · Jobs)

| Item | Why |
|---|---|
| `Company` (real) and verified company profiles | Trust |
| `JobPosting` published by companies | Real jobs |
| **Play to Apply**: a Job Challenge derived from a real posting | The game as an application path |
| `Application` with explicit per-application consent; the developer chooses what's shared | Voluntary applications |
| **Legal review** (employment, anti-discrimination, automated decisions, AI regulation) | A hard prerequisite |

## Later (Stage 4 · Recruiter Platform)

Company accounts · recruiter accounts · developer search over **discoverable** public profiles (separate consent) · applicant dashboards · opt-in messaging · possibly paid plans. Guardrails in [product evolution](../product/product-evolution.md#4-guardrails-apply-to-every-stage).

## Ideas (unscheduled)

Real-time multiplayer races · company or university leagues · an event mode for meetups and hackathons · a streamer mode · a seasonal "Hiring Freeze" event · cosmetic CV skins · a Hall of Fame · Technical Assignment, Culture Fit and Referral Boost challenges · an Elo-like long-term rating.

## Deliberately postponed

| Postponed | Why not now | Revisit when |
|---|---|---|
| Accounts and claiming | Friction for the first run; a provisional identity covers the MVP | Retention proves the profile is worth keeping (V1) |
| Public developer pages | Needs claimed identities to be trustworthy and indexable | With accounts (V1) |
| Hand-written question banks at scale | Too slow for a first version | Once AI pools prove the system; curation replaces them gradually |
| Weekly Top 7, Candidate of the Week | Simplify the MVP | V1 |
| Seasons (resets, season XP) | Needs history worth resetting | V2 (Season 0 tagging from day one) |
| Category cooldown | The daily lock covers the main risk | V1 |
| Splitting bands or tracks | Small fields at launch | The median daily field of a category stays above ~200 for 4 weeks |
| A global competitive ranking | Raw scores are not comparable | Data supports normalization (V1, experimental) |
| Jobs, applications, companies | "First a fun developer game" | Stage 2 gates are met |
| Recruiter features, messaging, paid plans | Needs a network and a legal framework first | Stage 3 works |
| Engineering Manager, Product Manager, UX/UI Designer roles | Need non-technical content | A content plan for those roles |
| Real-time multiplayer | Huge complexity; bots deliver the feeling | Strong demand and a stable core |
| Native apps | Links reach everyone on the web | Distribution data says otherwise |

## Non-goals

See [MVP scope › explicit non-goals](../product/mvp-scope.md#5-explicit-non-goals).
