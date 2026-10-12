# Future platform possibilities (outside the MVP)

> Part 1 · Product & Game Design · Status: **Draft for review**
>
> **Principle: first a good game, later a talent platform.** Nothing in this document is built in the MVP. It exists so that early decisions don't close these doors, and so that the limits are written down before there is any commercial pressure.

## 1. Hard limits (apply to every future feature)

- **Never** present CV Rush results as an evaluation, certification or prediction of professional performance. No "this candidate is 87% better".
- **Never** sell or share individual player data.
- **Never** rank people *for hiring purposes*. Rankings are game results.
- **Never** infer or store protected characteristics (gender, age, ethnicity, health, religion…).
- **Never** give a third party individual results without the player's **explicit, per-purpose, revocable** consent.
- Every public statistic is **aggregated** and published only above a minimum group size.
- CV Rush signals are **complementary**. They never replace interviews, experience, a CV or human judgment. Any future recruiter-facing feature must say this prominently.

## 2. Talent insights (aggregate, anonymized)

**What:** public, aggregated insights such as most selected technologies, common stacks, popular roles and seniorities, hardest topics, error rates per question, average time per challenge, completion by seniority, and technology trends over time. A periodic "State of the Stack" report is possible.

**Guardrails:** aggregates only; minimum group sizes; no geographic data unless volunteered in the future (and then only coarse, opt-in); documented methodology.

**What the MVP must preserve:**

- Analytics events with non-sensitive metadata (role, seniority, technology IDs, challenge type, duration, success).
- A **profile snapshot per run** (role, seniority, stack at the time of play), so history stays correct when profiles change.
- A stable **topic and tag taxonomy** for questions and technologies.
- Per-attempt records (question version, answer, timing, result).

## 3. Skill Passport (voluntary player profile)

**What:** after several runs, a player can **opt in** to a public profile page, for example:

```
Alex Morgan · Senior Fullstack Developer
24 runs played · Best: #1 Daily Challenge (13 Oct)
Strong topics in CV Rush: Node.js · APIs · Redis
Challenges completed: Backend FinTech · SaaS Architecture · E-commerce Scale
CV Rush results — not a professional certification.
```

**Guardrails:** off by default; the player chooses which sections are visible; the disclaimer is always visible; "strong topics" is based on enough attempts and described as game performance; it can be deleted at any time.

**What the MVP must preserve:** stable player identity (anonymous now, linkable to an account later); per-run snapshots; per-attempt records with topics; challenge and job templates with stable identifiers and names; consent records by purpose.

## 4. Seasons

**What:** time-boxed competition periods ("Season 1", "Season 2") that reset long-term leaderboards **without destroying history**. They can be used to launch new maps, challenges, roles, question packs, or important scoring changes ("scoring v2 starts in Season 3").

**What the MVP must preserve:**

- Leaderboards are defined over **competition periods** (day, week; season later), not hardcoded to days.
- Every run records the **ruleset and scoring version** it was played under, so results remain explainable after rules change.
- Champions and results are archived with their period.

## 5. Recruiter challenges (opt-in candidates)

**What:** an organization configures a challenge (e.g. "Senior Backend Engineer · Node.js · PostgreSQL · Redis · Kafka · AWS"). The system generates a CV Rush-like experience. Candidates who **voluntarily** participate can share aggregated signals: technical accuracy, job-memory accuracy, decision making in situational questions, response times, stack-specific accuracy, completion.

**Guardrails:** separate product surface; explicit candidate consent per process; candidates see exactly what is shared; signals described as complementary; no automated rejection based on CV Rush results; documented limitations; no access to non-participants' data.

**What the MVP must preserve:**

- **Job postings as an entity** with an origin (system-generated now; authored by an organization later).
- **Challenge templates and blueprints as data**, with an "owner" concept (the system now; organizations later).
- Questions with ownership and visibility (community, competitive, and later organization-private).
- Authentication added without rewriting the domain (anonymous identity → account later).

## 6. Sponsored challenges

See [community › sponsorship and integrity](community.md#7-sponsorship-and-integrity). A sponsored challenge is just a challenge with a label and a sponsor reference. Its rules and scoring are identical and public.

## 7. Public API

**What:** a read-only public API for leaderboards, champions, public profiles (respecting consent) and aggregated statistics.

**What the MVP must preserve:** internal APIs designed around clean resources; a strict separation between public and private fields in the domain; versioning and rate limiting as standard practice. A public API must be versioned, documented, rate-limited and free of private data.

## 8. Summary: doors left open by the MVP

| Future capability | Enabler in the MVP domain |
|---|---|
| Talent insights | First-party events with safe metadata; per-run profile snapshots; topic taxonomy |
| Skill Passport | Stable player identity; per-attempt records; consent by purpose |
| Seasons | Competition periods; ruleset and scoring version per run |
| Recruiter challenges | Job postings and challenge blueprints as data with an owner |
| Sponsored challenges | Challenge metadata (label, sponsor reference) without special rules |
| Login | Anonymous identity that can later be linked to an account |
| Public API | Public vs private field classification; resource-oriented internal APIs |
