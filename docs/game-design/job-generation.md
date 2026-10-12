# Job posting generation

> Part 1 · Product & Game Design · Status: **Draft for review**

## 1. Role of the job posting

The job posting does two jobs:

1. **Narrative briefing:** "this is the job you are applying to". It makes the run personal (casual) or shared (ranked).
2. **Source of truth for the run:** job-memory questions, recruiter questions, the salary question, ATS relevance and Final Interview scenarios are all derived from it.

So it must be **coherent, readable in 30–45 seconds, and rich enough in facts** to ask about.

## 2. Anatomy

| Field | Example | Used by |
|---|---|---|
| Company | Kestrel Pay (fictional), sector, logo shape and color | Flavor, memory |
| Title | Senior Fullstack Developer | Flavor, memory |
| Location + work mode | Barcelona · Hybrid | Memory |
| Salary range + currency | €50,000 – €60,000 | Memory, salary question |
| Summary | 1–2 sentences about the team or product | Flavor |
| Responsibilities | 4–6 bullets | Memory, Final Interview scenarios |
| Stack | 6–8 technologies | Memory ("which was NOT in the posting?"), ATS relevance, Hiring Manager topics |
| Experience | "5+ years building software" + 1–2 specific requirements | Memory |
| Nice to have | 1–2 items | Memory, ATS (secondary) |
| Perks | 2–3 items, at most one satirical ("Ping-pong table (unused since 2019)") | Humor, memory |
| Applicant count | "237 candidates applied" | Lobby (real number in ranked) |

**Length target:** ≤ ~120 words of body text, readable on a phone without scrolling much.

## 3. Casual generation

**Inputs:** role, seniority, stack, locale, seed.

**Rules:**

- **Title** from role + seniority ("Senior Fullstack Developer", "Trainee QA Engineer").
- **Stack:** 6–8 technologies, mostly a **subset of the player's selected stack**, prioritizing technologies typical for the role. If the player selected few technologies, add 1–2 role-typical ones. Technologies the player selected but the posting does *not* include become excellent "which was NOT in the posting?" distractors.
- **Experience** by seniority: Trainee "no experience required, eager to learn" · Junior 0–2 years · Mid 2–4 years · Senior 5+ · Lead 7+ with team leadership · Staff 8+ · Principal 10+.
- **Responsibilities** from role and stack fragments (e.g. Kafka → "Work with event-driven architecture"; React → "Build React interfaces").
- **Salary range** from illustrative bands by seniority and location tier (authored content, not market data), formatted in the location's currency and the player's locale.
- **Location** from a curated list of ~12 hubs, with work mode (On-site, Hybrid, Remote). The list covers Spanish- and English-speaking markets (e.g. Barcelona, Madrid, Lima, Mexico City, Bogotá, Buenos Aires, Santiago, London, Dublin, Berlin, Austin, Remote).
- **Company** generated from name parts + sector + logo shape and color, checked against a blocklist of well-known brands to avoid real companies.
- **Determinism:** the same inputs + seed always produce the same posting (for audit and debugging).

### Illustrative salary bands (Spain, EUR; content, not market data)

| Seniority | Band |
|---|---|
| Trainee | €18K – €22K |
| Junior | €24K – €32K |
| Mid | €32K – €45K |
| Senior | €45K – €60K |
| Lead | €55K – €70K |
| Staff | €65K – €85K |
| Principal | €75K – €95K |

Bands live in content files per location tier and can be corrected by contributors. The UI says nothing about them being "market data".

## 4. Ranked: the Daily Job

- **Curated in advance** (generated with the same generator, then reviewed by a person) and **scheduled** for a UTC day.
- **Secret until it opens at 00:00 UTC.** Future daily jobs are never exposed by any endpoint.
- **The same for everyone that day.** The fixed **Mid–Senior** level keeps difficulty comparable across days.
- The track rotates according to the schedule (see [game modes](../product/game-modes.md#32-the-daily-job)).
- Reviewed for both locales before scheduling.

## 5. Localization

- Fragments (summaries, responsibilities, perks, satirical lines) are **authored per language**, not machine-translated at runtime. Spanish and English can carry different jokes with the same intent.
- Technology names are never translated.
- Numbers, currencies and dates are formatted with the player's locale (`Intl`). The currency follows the job's location (EUR for Barcelona, USD for Austin, PEN or USD for Lima, as decided in the location content).
- A run's job posting is rendered in the run's language; facts (numbers, technologies) are language-independent, so questions about them have identical answers in both languages.

## 6. Quality rules

- **Coherence:** no Junior posting asking for 10 years; no stack contradictions (e.g. "Kubernetes" as a frontend framework); the salary band matches the seniority.
- **Askable facts:** each posting contains at least 8 distinct facts usable by job-memory templates (range, location, mode, years, 3+ stack items, 2+ responsibilities, a perk).
- **Respectful satire:** at most one satirical flourish per posting; no mocking of real companies.
- **Readable:** short bullets, no walls of text.

## 7. Example (casual)

```
KESTREL PAY · Fintech
Senior Fullstack Developer
Barcelona · Hybrid · €50,000 – €60,000

We're looking for a Senior Fullstack Developer to build high-availability
payment services and web apps used by thousands of merchants.

Responsibilities
• Design REST APIs
• Build scalable backend services
• Work with event-driven architecture
• Build React interfaces
• Optimize queries and caching

Stack: Node.js · NestJS · React · PostgreSQL · Redis · Kafka · Docker · AWS
Experience: 5+ years building software · distributed systems · relational databases
Perks: Flexible hours · Learning budget · Ping-pong table (unused since 2019)
```

The same posting in Spanish uses the Spanish fragments ("Buscamos un/a Senior Fullstack Developer…"), with identical facts.
