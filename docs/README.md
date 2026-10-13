# Documentation

> "CV Rush" is the provisional public name. Domain concepts in these documents (developer, game session, job challenge, result…) are deliberately brand-agnostic.

## Status

| Part | Scope | Status |
|---|---|---|
| **1** | Product and game design | ✅ **Approved (revision 4)** |
| 2 | Technical architecture and ADRs | ✅ **Approved** (current decisions, evolving through ADRs) |
| 3 | Repository foundations (tooling, CI, community files) | ✅ **Implemented, in review** ([local development](contributing/local-development.md)) |
| 4+ | Vertical slices | Not started |

Revision history of Part 1: **r1** initial design → **r2** profile-first ranked ("compete as who you are") → **r3** the game as the entry point to a developer network, with persistent identity and progression → **r4** approval adjustments (save progress after the first game, explicit ranked, question lifecycle, practice XP). See the [case study](case-study/01-product-definition.md) and the [decision log](case-study/decision-log.md).

## Map

| Folder | Contents |
|---|---|
| [`product/`](product/README.md) | Vision, product evolution, domain concepts, identity and accounts, developer profile, competitive identity, journey, run types, rankings, privacy, scope, risks, metrics, community, glossary |
| [`game-design/`](game-design/README.md) | Run structure (side-scrolling), challenges, bots, CV Health, job generation, progression, scoring principles, fairness, replayability |
| [`questions/`](questions/README.md) | Content strategy (AI-generated pools in the MVP) and question strategy |
| [`roadmap/`](roadmap/README.md) | MVP, V1, V2, V3 (jobs), later (recruiters), ideas, postponed |
| [`architecture/`](architecture/README.md) | Part 2: overview, monorepo, modules, domain and data model, identity, GameSession, Job Challenges, Question Engine, AI pipeline, scoring and progression, rankings, API, game integration, async processing, observability, configuration, deployment, web app, testing, future evolution, implementation plan |
| [`adr/`](adr/README.md) | Architecture Decision Records (ADR-001 to ADR-024) |
| [`security/`](security/README.md) · [`anti-cheat/`](anti-cheat/README.md) | Threat model, privacy engineering; anti-cheat design assuming public source code |
| [`i18n/`](i18n/README.md) · [`analytics/`](analytics/README.md) | Locales, routing, catalogs; event catalog and privacy rules |
| [`case-study/`](case-study/README.md) | Working notes for the future technical article, plus the decision log |
| [`contributing/`](contributing/README.md) | Local development, testing, adding questions, technologies, roles and languages |

## Suggested reading order (Part 1 review)

1. [Vision](product/vision.md) and [long-term product evolution](product/product-evolution.md) (**new north star**)
2. [Domain concepts](product/domain-concepts.md) (**the new center**) and [identity and accounts](product/identity-and-accounts.md) (**account migration strategy**)
3. [Progression](game-design/progression.md) and [developer profile](product/developer-profile.md)
4. [MVP scope](product/mvp-scope.md) (**the 26-step MVP**) and the [player journey](product/player-journey.md)
5. [Run types and Job Challenges](product/game-modes.md), [competitive identity](product/competitive-identity.md), [rankings](product/leaderboards.md)
6. [Run structure](game-design/run-structure.md) (side-scrolling, in-world answers) and the [challenges](game-design/challenges/README.md)
7. [Content strategy](questions/content-strategy.md) (AI pools) and the [question strategy](questions/question-strategy.md)
8. [Privacy](product/public-profile-and-privacy.md), [risks](product/risks.md), [metrics](product/success-metrics.md), [roadmap](roadmap/README.md)
9. [Decision log](case-study/decision-log.md): the "Proposed" entries need a verdict

## Part 1 deliverables map

| # | Deliverable | Where |
|---|---|---|
| 1 | Product vision | [vision.md §1](product/vision.md#1-vision) |
| 2 | Core fantasy | [vision.md §2](product/vision.md#2-core-fantasy) |
| 3 | Target users | [vision.md §5](product/vision.md#5-target-users) |
| 4 | Complete player journey | [player-journey.md](product/player-journey.md) |
| 5 | Game loop | [player-journey.md §6](product/player-journey.md#6-game-loop) · [run-structure.md](game-design/run-structure.md) |
| 6 | Casual mode → **practice runs** | [game-modes.md §2](product/game-modes.md#2-practice-runs) |
| 7 | Ranked / Daily Challenge → **ranked runs**, Daily Challenge as a feature | [game-modes.md §3](product/game-modes.md#3-ranked-runs) · [competitive-identity.md](product/competitive-identity.md) |
| 8 | Recruiter challenge | [challenges/recruiter-screening.md](game-design/challenges/recruiter-screening.md) |
| 9 | ATS challenge | [challenges/ats-scan.md](game-design/challenges/ats-scan.md) |
| 10 | Hiring Manager challenge | [challenges/hiring-manager.md](game-design/challenges/hiring-manager.md) |
| 11 | Final Interview | [challenges/final-interview.md](game-design/challenges/final-interview.md) |
| 12 | Bots | [game-design/bots.md](game-design/bots.md) |
| 13 | CV Health | [game-design/cv-health.md](game-design/cv-health.md) |
| 14 | Job generation | [game-design/job-generation.md](game-design/job-generation.md) |
| 15 | Content strategy | [questions/content-strategy.md](questions/content-strategy.md) |
| 16 | Question strategy | [questions/question-strategy.md](questions/question-strategy.md) |
| 17 | Fairness strategy | [game-design/fairness.md](game-design/fairness.md) |
| 18 | Daily Champion | [leaderboards.md §5](product/leaderboards.md#5-daily-champion-per-category) |
| 19 | Weekly Top 7 (V1) | [leaderboards.md §6](product/leaderboards.md#6-weekly-top-7-per-category--v1) |
| 20 | Candidate of the Week (V1) | [leaderboards.md §7](product/leaderboards.md#7-candidate-of-the-week-per-category--v1) |
| 21 | LinkedIn exposure flow | [public-profile-and-privacy.md §4](product/public-profile-and-privacy.md#4-linkedin) |
| 22 | Privacy and consent UX | [public-profile-and-privacy.md](product/public-profile-and-privacy.md) |
| 23 | Replayability | [game-design/replayability.md](game-design/replayability.md) |
| 24 | MVP exact scope | [product/mvp-scope.md](product/mvp-scope.md) |
| 25 | V1 | [roadmap › V1](roadmap/README.md#v1-stage-1-polish--stage-2-begins) |
| 26 | V2 | [roadmap › V2](roadmap/README.md#v2-stage-2-complete) |
| 27 | Explicit non-goals | [mvp-scope.md §5](product/mvp-scope.md#5-explicit-non-goals) |
| 28 | Product risks | [risks.md §1](product/risks.md#1-product-risks) |
| 29 | Abuse and cheating risks | [risks.md §2](product/risks.md#2-abuse-and-cheating-risks-game-design-perspective) |
| 30 | Success metrics and analytics | [product/success-metrics.md](product/success-metrics.md) |
| 31 | Open-source and community strategy | [product/community.md](product/community.md) |
| 32 | Future recruiter and analytics possibilities | [product/product-evolution.md](product/product-evolution.md) |
| 33 | Ideas deliberately postponed | [roadmap › deliberately postponed](roadmap/README.md#deliberately-postponed) |
| 34 | Case-study notes | [00-idea.md](case-study/00-idea.md) · [01-product-definition.md](case-study/01-product-definition.md) · [decision-log.md](case-study/decision-log.md) |
| r3 | **Long-term product evolution** | [product/product-evolution.md](product/product-evolution.md) |
| r3 | **Identity and account migration strategy** | [product/identity-and-accounts.md](product/identity-and-accounts.md) |
| r3 | Domain concepts and assumptions | [product/domain-concepts.md](product/domain-concepts.md) |
| r3 | Progression (score, XP, levels, history, stats) | [game-design/progression.md](game-design/progression.md) |
| r3 | Developer profile | [product/developer-profile.md](product/developer-profile.md) |
| r2 | Competitive identity | [product/competitive-identity.md](product/competitive-identity.md) |
| + | Scoring principles · Salary Negotiation (V1) · Glossary | [scoring](game-design/scoring-principles.md) · [salary](game-design/challenges/salary-negotiation.md) · [glossary](product/glossary.md) |

## Conventions

- **English** for all technical documentation; the product is bilingual (es/en).
- **Mermaid** for diagrams, so they stay versionable and reviewable.
- Numbers marked as **initial values** or **tunables** are game configuration (Part 2), never hardcoded.
- Decisions are logged in the [decision log](case-study/decision-log.md); architectural decisions become ADRs from Part 2.
