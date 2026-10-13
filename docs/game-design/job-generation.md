# Job posting generation

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**

## 1. Role of the job posting

Every run is a **Job Challenge**: a job posting plus the challenge blueprint (see [Job Challenges](../product/game-modes.md#1-every-run-is-a-job-challenge-for-your-profile)). The job posting does two jobs:

1. **Narrative briefing:** "this is *my* job". It is always generated **for the player's frozen profile snapshot** (seniority, role, stack), in both modes. Nobody plays someone else's job.
2. **Source of truth for the run:** job-memory questions, recruiter questions, the salary question, ATS relevance and Final Interview scenarios are all derived from it.

So it must be **coherent with the profile, readable in 30–45 seconds, and rich enough in facts** to ask about.

## 2. Anatomy

| Field | Example | Used by |
|---|---|---|
| Company | Kestrel Pay (fictional), sector, domain theme, logo shape and color | Flavor, memory, themed scenarios |
| Title | Senior Fullstack Developer (exact seniority + role from the snapshot) | Flavor, memory |
| Location + work mode | Barcelona · Hybrid | Memory |
| Salary range + currency | €45,000 – €60,000 | Memory, salary question |
| Summary | 1–2 sentences about the team or product, themed by the company's domain | Flavor |
| Responsibilities | 4–6 bullets from role and stack fragments | Memory, Final Interview scenarios |
| Required stack | The player's own technologies (up to 8) | Memory ("which was NOT in the posting?"), ATS relevance, stack questions |
| Nice to have | 0–2 related technologies the player didn't select | Realism only (never scored) |
| Experience | "5+ years building software" + 1–2 specific requirements | Memory |
| Nice to have | 1–2 items | Memory, ATS (secondary) |
| Perks | 2–3 items, at most one satirical ("Ping-pong table (unused since 2019)") | Humor, memory |
| Applicant count | "237 candidates applied" | Lobby (real numbers in ranked) |

**Length target:** ≤ ~120 words of body text, readable on a phone without much scrolling.

## 3. Generation from the profile snapshot (both modes)

**Inputs:** the snapshot (exact seniority, role, track, stack), the mode, the target difficulty (band curve in ranked, exact seniority in practice), the locale, the seeds, and in ranked the **Daily Company**.

**Rules:**

- **Title** = exact seniority + role ("Staff Fullstack Developer", "Trainee QA Engineer").
- **Required stack** (revised after S2, [D-086](../case-study/decision-log.md#d-086--required-stack-only-from-the-players-selection)): **only technologies the player selected**, never anything else. Up to 8; when the player selected more, the posting keeps at least one technology from each of the role's **core categories** (Fullstack: frontend + backend). A player with a short stack gets a short required list: it is never padded.
- **Nice to have:** occasionally 1–2 related technologies the player didn't select (recommended for the role, within its categories), shown explicitly as *Nice to have* for realism. They never generate technical questions, never count in the ATS (neither as keywords nor as traps), are never a missed requirement, never feed skill stats and never change the competitive identity.
- Technologies the player selected that a long stack leaves out of the posting become excellent "which was NOT in the posting?" answers.
- Never technologies unrelated to the role (no Swift in a Fullstack web posting).
- **Experience** by exact seniority: Trainee "no experience required, eager to learn" · Junior 0–2 years · Mid 2–4 years · Senior 5+ · Lead 7+ with team leadership · Staff 8+ · Principal 10+.
- **Responsibilities** from role and stack fragments (e.g. Kafka → "Work with event-driven architecture"; React → "Build React interfaces"). In ranked they are themed by the Daily Company's domain.
- **Salary range** from illustrative bands by exact seniority and location tier (authored content, not market data), formatted in the location's currency and the player's locale.
- **Location and work mode** from a curated list of ~12 hubs across Spanish- and English-speaking markets (e.g. Barcelona, Madrid, Lima, Mexico City, Bogotá, Buenos Aires, Santiago, London, Dublin, Berlin, Austin, Remote).
- **Askable facts:** every posting contains at least 8 distinct facts usable by job-memory templates (range, location, mode, years, 3+ stack items, 2+ responsibilities, a perk), so every player has the **same number and kind of facts** to be asked about.
- **Determinism:** the same snapshot + seeds always produce the same posting (for audit and debugging).

### Practice runs

- **Company:** generated per run from name parts + sector + logo shape and color, checked against a blocklist of well-known brands.

### Ranked: a personal job at the Daily Company

- Every UTC day has one **Daily Company**: a fictional company with a name, sector, **domain theme** (e.g. "fintech, payments at scale"), HQ and offices, and 2–3 culture quirks. Today, it is "hiring across every track and level".
- Each ranked player's posting is generated **on demand from their snapshot** at that company: Ricardo gets *Senior Fullstack Developer at Kestrel Pay*; Andrea gets *Junior Frontend Developer at Kestrel Pay*.
- The **category blueprint** fixes what must be equal within a category: the template set, the number of facts, the salary question logic, the ATS composition (see [game modes](../product/game-modes.md#33-the-category-blueprint)).
- **Daily Companies are scheduled in advance from a reviewed pool and are secret until 00:00 UTC.** No endpoint exposes future companies or themes.
- No manual curation per category per day: the generator plus a reviewed company pool scale to new categories.

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

Bands live in content files per location tier and can be corrected by contributors. The UI never presents them as market data.

## 4. Localization

- Fragments (summaries, responsibilities, perks, satirical lines, company quirks) are **authored per language**, not machine-translated at runtime. Spanish and English can carry different jokes with the same intent.
- Technology names are never translated; role titles follow the catalog's translations (Spanish keeps the usual English titles).
- Numbers, currencies and dates are formatted with the player's locale (`Intl`); the currency follows the job's location.
- A run's posting is rendered in the run's language; facts (numbers, technologies) are language-independent, so questions about them have identical answers in both languages.

## 5. Quality rules

- **Coherence:** the posting matches the snapshot. No Junior posting asking for 10 years, no stack contradictions, a salary band that matches the seniority, core categories always present.
- **Askable facts:** at least 8 per posting (see above).
- **Respectful satire:** at most one satirical flourish per posting; no real companies.
- **Readable:** short bullets, no walls of text.

## 6. Examples

**Ranked, Ricardo (Senior · Fullstack · Node.js, NestJS, PHP, React, PostgreSQL, Redis, Kafka, Docker), Daily Company Kestrel Pay:**

```
KESTREL PAY · Fintech · Today's Daily Challenge
Senior Fullstack Developer
Barcelona · Hybrid · €45,000 – €60,000

We're looking for a Senior Fullstack Developer to build high-availability
payment services and web apps used by thousands of merchants.

Responsibilities
• Design idempotent REST APIs for payments
• Build scalable backend services in Node.js and PHP
• Work with event-driven architecture
• Build React interfaces for merchants
• Optimize queries and caching

Required: Node.js · NestJS · PHP · React · PostgreSQL · Redis · Kafka · Docker
Experience: 5+ years building software · distributed systems · relational databases
Perks: Flexible hours · Learning budget · Ping-pong table (unused since 2019)
```

**Ranked, Andrea (Junior · Frontend · JavaScript, React, CSS), same day:**

```
KESTREL PAY · Fintech · Today's Daily Challenge
Junior Frontend Developer
Lima · Remote · US$18,000 – US$26,000

Join our merchant dashboard team and help thousands of shops get paid on time.

Responsibilities
• Build accessible React components
• Turn designs into responsive layouts with CSS
• Fix UI bugs reported by merchants
• Write unit tests for UI logic

Stack: JavaScript · React · CSS · HTML · Jest
Experience: 0–2 years · a portfolio or side projects welcome
Perks: Mentorship program · Learning budget · "Fun Fridays" (mandatory)
```

The Spanish versions use the Spanish fragments ("Buscamos un/a Senior Fullstack Developer…"), with identical facts.

## 7. From fictional jobs to real jobs (Stage 3)

| Job Challenge source | Company | Posting | When |
|---|---|---|---|
| `generated` | Random fictional company | Generated for the profile | MVP, practice runs |
| `daily` | The Daily Company (fictional) | Generated for the profile at that company | MVP, ranked runs |
| `job_posting` | A real, verified company | Published by the company; the challenge is derived from its stack and requirements | Stage 3: **Play to Apply** |

Everything downstream (stages, questions, results, XP, history) works the same way for all three sources. For `job_posting`, the facts of the run come from the real posting, and the developer's profile still defines the competing context. Real companies are never satirized: humor stays in the generic hiring-process elements.
