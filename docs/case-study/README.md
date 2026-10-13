# Case study notes

> These notes preserve the **real technical history** of the project so that a technical article (first in Spanish, later in English) can be written from facts rather than memory. They are working notes, not the article.

## What we record, while it happens

- **Decisions:** what we decided and why. Short entries go in the [decision log](decision-log.md); architectural ones also become ADRs (`docs/adr/`, from Part 2).
- **Alternatives we discarded**, and why.
- **Problems and mistakes**: what broke, what we got wrong, what we changed our minds about.
- **Architecture changes**: before and after, and the trigger.
- **Screenshots and recordings** of meaningful milestones (`assets/`).
- **Metrics and benchmarks** with their date and context (load times, fps, API latency, completion rates).
- **Player feedback** that changed the design (anonymized).
- **Lessons learned.**

Rule: **write it when it happens.** Retroactive notes lose the interesting parts: the doubt, the wrong first guess, the surprise.

## Planned chapters

| File | Topic | Status |
|---|---|---|
| [00-idea.md](00-idea.md) | The original idea | ✅ Started |
| [01-product-definition.md](01-product-definition.md) | How the concept evolved during product design | ✅ Started |
| [02-architecture.md](02-architecture.md) | Developer-centric domain, facts vs projections, consistency vs queues, attempt commitment, licensing | ✅ Started |
| [03-foundations.md](03-foundations.md) | Monorepo foundations: tooling decisions and the problems we hit | ✅ Started |
| 03b-game-engine.md | Phaser + Next.js without coupling | S3 |
| 04-question-engine.md | Strategies, pools, just-in-time questions | Part 2 / S2 |
| 05-server-authoritative.md | The browser as an untrusted terminal | Part 2 / S2 |
| 06-anti-cheat.md | Integrity with fully public source code | Part 2+ |
| 07-i18n.md | i18n from the domain: semantic codes, localized questions | Part 2 / S1 |
| 08-leaderboards.md | UTC days, categories, verification, champions | Slices |
| 09-open-source.md | Making the project contributable | Part 3 |
| 10-launch.md | Launch and first metrics | Launch |
| 11-lessons-learned.md | What we would do differently | Ongoing |
| 12-developer-network.md | From a game to a developer network: provisional identity, claiming, XP and progression | Part 2 / V1 |
| 13-ai-content-pipeline.md | AI-generated question pools with validation instead of a runtime LLM | Part 2 / slices |

## Entry template (for the decision log)

```markdown
### D-XXX · Title
- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by D-YYY
- **Context:** what problem existed
- **Decision:** what we chose
- **Alternatives:** what we discarded and why
- **Consequences:** trade-offs, follow-ups
- **Article angle:** why this is interesting for other developers (optional)
```

## Candidate article narrative

*"Cómo convertí un proceso de selección en un juego web competitivo"*. Topics to cover with real material: the initial idea; gameplay design; personalization by role and seniority; dynamic job postings; the Question Engine; why questions are never downloaded in advance; server-authoritative gameplay; anti-cheat with public source code; Phaser + Next.js; the GameSession state machine; leaderboards; Redis; i18n; analytics; open-source design; how to prepare a project for contributors; what went wrong; what we simplified; metrics after launch.

The article must teach something to another developer. It is not a promotional piece.
