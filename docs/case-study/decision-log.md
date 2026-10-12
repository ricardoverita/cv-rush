# Decision log

> A chronological, lightweight record of product and project decisions. Architectural decisions also get a full ADR in `docs/adr/` (from Part 2). Status: **Accepted** (approved by the maintainer) or **Proposed** (awaiting review).

## 2026-10-12 · Part 0: project setup decisions

### D-001 · Repository name and brand decoupling
- **Status:** Accepted
- **Decision:** public repository `ricardoverita/cv-rush`. "CV Rush" is the provisional public brand; domain code, tables, classes and events stay brand-agnostic.
- **Alternatives:** `cvgames` (initial proposal).

### D-002 · Language policy
- **Status:** Accepted
- **Decision:** code, domain names, technical comments, technical docs, ADRs and issue templates in English; `README.md` in English and `README.es.md` in Spanish. The product is bilingual (es/en) from the start. Case-study notes may be in English, preserving material for a Spanish article.

### D-003 · License direction
- **Status:** Direction accepted, **ADR pending (Part 2)**
- **Decision:** study Apache-2.0 for code, CC BY 4.0 for content packs, and branding (name, logo) not licensed with the code. The ADR must cover Apache-2.0 vs MIT, coexistence with CC BY 4.0, contributor implications, PR-contributed questions, copyright and attribution.

### D-004 · Time model
- **Status:** Accepted
- **Decision:** UTC as the server canonical time; local time for player display. Countdowns such as "Daily Challenge ends in 04:32:18"; documented closing rules.

### D-005 · Runtime and tooling pinning
- **Status:** Accepted
- **Decision:** Node 24 LTS; pin via `.nvmrc` and/or `.node-version` plus `engines`; pin pnpm via Corepack `packageManager`. Details evaluated in Part 3.

### D-006 · Local services via Docker
- **Status:** Accepted
- **Decision:** Docker is the official documented path for Postgres and Redis. Documentation work (Parts 1–2) does not block on Docker being installed.

### D-007 · Two modes: Casual and Ranked
- **Status:** Accepted (the concrete design is proposed in D-010)
- **Decision:** Casual / Personalized (personalization and fun) and Ranked / Daily Challenge (fairness). Self-declared seniority must not affect ranked difficulty.

### D-008 · Community packs vs competitive pool
- **Status:** Accepted (product level; technical design in Part 2)
- **Decision:** open Community Question Packs for practice, casual, learning, contributors and tests; a private Competitive Question Pool for ranked, plus templates, job-derived questions and (later) validated AI.

### D-009 · "First a good game, later a talent platform"
- **Status:** Accepted
- **Decision:** keep future analytics, recruiter features, Skill Passport and Seasons possible, without building them or polluting the MVP. Privacy by design.

## 2026-10-12 · Part 1: product and game design proposals

### D-010 · Ranked design: "the job sets the bar"
- **Status:** Proposed
- **Decision:** one Daily Job per UTC day for everyone; a Daily Blueprint (fixed stages, slots, difficulty curve 2-2-2 / 2-3-4 / 4, timers, ATS composition, bot field); equivalent question families; shuffled options; a server-side seed; the profile is identity only.
- **Alternatives:** seniority-based difficulty, multipliers, leagues, Elo-like rating, identical questions, ranked-only. See [game modes](../product/game-modes.md#5-alternatives-considered).

### D-011 · Fixed Mid–Senior level for Daily Jobs (MVP)
- **Status:** Proposed
- **Context:** keeps scores comparable across days (Candidate of the Week).
- **Consequence:** favors experienced players; juniors compete on memory, ATS and speed; casual is their space.

### D-012 · Daily track rotation as content
- **Status:** Proposed
- **Decision:** the daily track rotates by a configured schedule (e.g. Mon Frontend · Tue Backend · Wed Fullstack · Thu DevOps & Cloud · Fri Backend · Sat Frontend · Sun Fullstack). The Weekly Top 7 then showcases diverse disciplines.

### D-013 · 3 ranked attempts per day, best counts
- **Status:** Proposed
- **Alternatives:** 1 (Wordle tension), unlimited (grinding, harvesting).

### D-014 · Candidate of the Week by raw score (MVP)
- **Status:** Proposed
- **Decision:** the highest raw score among the 7 verified Daily Champions, made fair by D-010/D-011. Switch to a field-relative index if data shows bias.

### D-015 · Salary as a graded recruiter question in the MVP
- **Status:** Proposed
- **Decision:** slot R3 with graded options; the full stage moves to V1 behind `salaryNegotiation`.

### D-016 · Keep the ATS game over
- **Status:** Proposed
- **Decision:** failing the ATS ends the run (`ATS_FAILED`), with a 70% threshold, recruiter bonus and balance targets (~80% first-run pass rate).

### D-017 · No negative points
- **Status:** Proposed
- **Decision:** a wrong answer = 0 points + a broken streak + CV damage + a slowdown, instead of "score −".

### D-018 · CV damage values: "all wrong = rejected"
- **Status:** Proposed
- **Decision:** Recruiter −10, Hiring Manager −15, Final −25 (sum 100); ATS −5 per irrelevant keyword (cap −20); obstacles −5 (bounded).

### D-019 · Score inputs classified as verifiable vs client-reported
- **Status:** Proposed
- **Decision:** verifiable components carry ~80% of the weight; client-reported ones are bounded. Race time is computed by the server.

### D-020 · Ranked post-run review without competitive answer keys
- **Status:** Proposed
- **Decision:** ranked reviews show results and topics for competitive questions; answer keys stay private until retirement. Job-derived explanations are shown.

### D-021 · Retired competitive questions graduate to community packs
- **Status:** Proposed

### D-022 · Bots: one daily field in ranked; no rubber-banding
- **Status:** Proposed
- **Decision:** bot outcomes never depend on the player, so position is a pure function of the player's race time.

### D-023 · Humor questions are casual-only
- **Status:** Proposed

### D-024 · LinkedIn and public profile only after delivered ranked runs; off by default; management link
- **Status:** Proposed

### D-025 · Portrait-first 4-lane runner; answers as doors with mirrored buttons
- **Status:** Proposed (the camera/perspective is validated by a prototype in the Phaser slice)

### D-026 · MVP content scope: 4 core tracks, other roles in early access
- **Status:** Proposed

### D-027 · North Star: Weekly Delivering Players; mission metric: profile discoveries
- **Status:** Proposed
