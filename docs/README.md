# Documentation

> "CV Rush" is the provisional public name. Domain concepts in these documents (run, challenge, candidate, job posting…) are deliberately brand-agnostic.

## Status

| Part | Scope | Status |
|---|---|---|
| **1** | Product and game design | **Draft, in review (revision 2: profile-first ranked)** |
| 2 | Technical architecture and ADRs | Not started |
| 3 | Repository foundations (tooling, CI, community files) | Not started |
| 4+ | Vertical slices | Not started |

## Map

| Folder | Contents |
|---|---|
| [`product/`](product/README.md) | Vision, **competitive identity**, users, journey, modes, leaderboards, privacy, scope, risks, metrics, community, future platform, glossary |
| [`game-design/`](game-design/README.md) | Run structure, challenges, bots, CV Health, job generation, scoring principles, fairness, replayability |
| [`questions/`](questions/README.md) | Content strategy and question strategy |
| [`roadmap/`](roadmap/README.md) | MVP, V1, V2, ideas, deliberately postponed |
| [`case-study/`](case-study/README.md) | Working notes for the future technical article, plus the decision log |

Planned for later parts: `architecture/`, `adr/`, `security/`, `anti-cheat/`, `i18n/`, `analytics/`, `contributing/`.

## Suggested reading order (Part 1 review)

1. [Competitive identity](product/competitive-identity.md) (**central principle**: compete as who you are)
2. [Game modes](product/game-modes.md) and [leaderboards](product/leaderboards.md) (**key decisions**), then [fairness](game-design/fairness.md)
3. [Vision](product/vision.md), then the [player journey](product/player-journey.md)
4. [Run structure](game-design/run-structure.md), then the [challenges](game-design/challenges/README.md)
5. [Content strategy](questions/content-strategy.md) (**key decision**), then the [question strategy](questions/question-strategy.md)
6. [Public profile and privacy](product/public-profile-and-privacy.md)
7. [MVP scope](product/mvp-scope.md), the [roadmap](roadmap/README.md) and the [risks](product/risks.md)
8. [Decision log](case-study/decision-log.md): the "Proposed" entries need a verdict

## Part 1 deliverables map

| # | Deliverable | Where |
|---|---|---|
| 1 | Product vision | [product/vision.md §1](product/vision.md#1-vision) |
| 2 | Core fantasy | [product/vision.md §2](product/vision.md#2-core-fantasy) |
| 3 | Target users | [product/vision.md §5](product/vision.md#5-target-users) |
| 4 | Complete player journey | [product/player-journey.md](product/player-journey.md) |
| 5 | Game loop | [player-journey.md §6](product/player-journey.md#6-game-loop) · [run-structure.md](game-design/run-structure.md) |
| 6 | Casual Mode | [game-modes.md §2](product/game-modes.md#2-casual--personalized-mode) |
| 7 | Ranked / Daily Challenge | [game-modes.md §3](product/game-modes.md#3-ranked--daily-challenge-mode) · [competitive-identity.md](product/competitive-identity.md) |
| 8 | Recruiter challenge | [challenges/recruiter-screening.md](game-design/challenges/recruiter-screening.md) |
| 9 | ATS challenge | [challenges/ats-scan.md](game-design/challenges/ats-scan.md) |
| 10 | Hiring Manager challenge | [challenges/hiring-manager.md](game-design/challenges/hiring-manager.md) |
| 11 | Final Interview | [challenges/final-interview.md](game-design/challenges/final-interview.md) |
| 12 | Bots | [game-design/bots.md](game-design/bots.md) |
| 13 | CV Health | [game-design/cv-health.md](game-design/cv-health.md) |
| 14 | Job generation | [game-design/job-generation.md](game-design/job-generation.md) |
| 15 | Content strategy | [questions/content-strategy.md](questions/content-strategy.md) |
| 16 | Question strategy | [questions/question-strategy.md](questions/question-strategy.md) |
| 17 | Fairness strategy | [game-design/fairness.md](game-design/fairness.md) · [game-modes.md](product/game-modes.md) |
| 18 | Daily Champion | [leaderboards.md §5](product/leaderboards.md#5-daily-champion-per-category) |
| 19 | Weekly Top 7 | [leaderboards.md §6](product/leaderboards.md#6-weekly-top-7-per-category) |
| 20 | Candidate of the Week | [leaderboards.md §7](product/leaderboards.md#7-candidate-of-the-week-per-category) |
| 21 | LinkedIn exposure flow | [public-profile-and-privacy.md §3](product/public-profile-and-privacy.md#3-linkedin-exposure-flow) |
| 22 | Privacy and consent UX | [public-profile-and-privacy.md](product/public-profile-and-privacy.md) |
| 23 | Replayability | [game-design/replayability.md](game-design/replayability.md) |
| 24 | MVP exact scope | [product/mvp-scope.md](product/mvp-scope.md) |
| 25 | V1 | [roadmap › V1](roadmap/README.md#v1) |
| 26 | V2 | [roadmap › V2](roadmap/README.md#v2) |
| 27 | Explicit non-goals | [mvp-scope.md §5](product/mvp-scope.md#5-explicit-non-goals) |
| 28 | Product risks | [risks.md §1](product/risks.md#1-product-risks) |
| 29 | Abuse and cheating risks (game design) | [risks.md §2](product/risks.md#2-abuse-and-cheating-risks-game-design-perspective) |
| 30 | Success metrics | [product/success-metrics.md](product/success-metrics.md) |
| 31 | Open-source and community strategy | [product/community.md](product/community.md) |
| 32 | Future recruiter and analytics possibilities | [product/future-platform.md](product/future-platform.md) |
| 33 | Ideas deliberately postponed | [roadmap › deliberately postponed](roadmap/README.md#deliberately-postponed) |
| 34 | Case-study notes | [case-study/00-idea.md](case-study/00-idea.md) · [01-product-definition.md](case-study/01-product-definition.md) · [decision-log.md](case-study/decision-log.md) |
| ★ | **Competitive identity** (revision 2: profile snapshot, categories, competing context) | [product/competitive-identity.md](product/competitive-identity.md) |
| + | Scoring principles | [game-design/scoring-principles.md](game-design/scoring-principles.md) |
| + | Salary Negotiation (V1 stage) | [challenges/salary-negotiation.md](game-design/challenges/salary-negotiation.md) |
| + | Glossary | [product/glossary.md](product/glossary.md) |

## Conventions

- **English** for all technical documentation; the product is bilingual (es/en).
- **Mermaid** for diagrams, so they stay versionable and reviewable.
- Numbers marked as **initial values** or **tunables** are game configuration (Part 2), never hardcoded.
- Decisions are logged in the [decision log](case-study/decision-log.md); architectural decisions become ADRs from Part 2.
