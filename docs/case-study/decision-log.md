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
- **Status:** Accepted; reframed by D-043 as **ranked runs and practice runs**, both profile-based
- **Decision:** Casual / Personalized (personalization and fun) and Ranked / Daily Challenge (fairness). Self-declared seniority must not affect ranked difficulty.

### D-008 · Community packs vs competitive pool
- **Status:** Accepted (product level; technical design in Part 2)
- **Decision:** open Community Question Packs for practice, casual, learning, contributors and tests; a private Competitive Question Pool for ranked, plus templates, job-derived questions and (later) validated AI.

### D-009 · "First a good game, later a talent platform"
- **Status:** **Superseded** by D-038 (staged evolution: Game → Developer Network → Jobs → Recruiter Platform)
- **Decision:** keep future analytics, recruiter features, Skill Passport and Seasons possible, without building them or polluting the MVP. Privacy by design.

## 2026-10-12 · Part 1: product and game design proposals

### D-010 · Ranked design: "the job sets the bar"
- **Status:** **Superseded** by D-028–D-033 (rejected in review: one global job ignores the player's profile)
- **Decision:** one Daily Job per UTC day for everyone; a Daily Blueprint (fixed stages, slots, difficulty curve 2-2-2 / 2-3-4 / 4, timers, ATS composition, bot field); equivalent question families; shuffled options; a server-side seed; the profile is identity only.
- **Alternatives:** seniority-based difficulty, multipliers, leagues, Elo-like rating, identical questions, ranked-only. See [game modes](../product/game-modes.md#6-alternatives-considered).

### D-011 · Fixed Mid–Senior level for Daily Jobs (MVP)
- **Status:** **Superseded** by D-029 (difficulty now follows the category's band)
- **Context:** keeps scores comparable across days (Candidate of the Week).
- **Consequence:** favors experienced players; juniors compete on memory, ATS and speed; casual is their space.

### D-012 · Daily track rotation as content
- **Status:** **Superseded** by D-031 (Daily Company instead of a track rotation)
- **Decision:** the daily track rotates by a configured schedule (e.g. Mon Frontend · Tue Backend · Wed Fullstack · Thu DevOps & Cloud · Fri Backend · Sat Frontend · Sun Fullstack). The Weekly Top 7 then showcases diverse disciplines.

### D-013 · 3 ranked attempts per day, best counts
- **Status:** Accepted
- **Alternatives:** 1 (Wordle tension), unlimited (grinding, harvesting).

### D-014 · Candidate of the Week by raw score (MVP)
- **Status:** **Superseded** by D-034 (Candidate of the Week per category)
- **Decision:** the highest raw score among the 7 verified Daily Champions, made fair by D-010/D-011. Switch to a field-relative index if data shows bias.

### D-015 · Salary as a graded recruiter question in the MVP
- **Status:** Accepted
- **Decision:** slot R3 with graded options; the full stage moves to V1 behind `salaryNegotiation`.

### D-016 · Keep the ATS game over
- **Status:** Accepted
- **Decision:** failing the ATS ends the run (`ATS_FAILED`), with a 70% threshold, recruiter bonus and balance targets (~80% first-run pass rate).

### D-017 · No negative points
- **Status:** Accepted
- **Decision:** a wrong answer = 0 points + a broken streak + CV damage + a slowdown, instead of "score −".

### D-018 · CV damage values: "all wrong = rejected"
- **Status:** Accepted
- **Decision:** Recruiter −10, Hiring Manager −15, Final −25 (sum 100); ATS −5 per irrelevant keyword (cap −20); obstacles −5 (bounded).

### D-019 · Score inputs classified as verifiable vs client-reported
- **Status:** Accepted
- **Decision:** verifiable components carry ~80% of the weight; client-reported ones are bounded. Race time is computed by the server.

### D-020 · Ranked post-run review without competitive answer keys
- **Status:** Accepted, **amended** by D-052: practice reveals answers only for questions retired from (or never in) competitive rotation
- **Decision:** ranked reviews show results and topics for competitive questions; answer keys stay private until retirement. Job-derived explanations are shown.

### D-021 · Retired competitive questions graduate to community packs
- **Status:** Deferred: applies to the later curated content system (D-045)

### D-022 · Bots: one daily field in ranked; no rubber-banding
- **Status:** Accepted, **amended** by D-031: one daily bot field **per category**
- **Decision:** bot outcomes never depend on the player, so position is a pure function of the player's race time.

### D-023 · Humor questions are casual-only
- **Status:** Accepted

### D-024 · LinkedIn and public profile only after delivered ranked runs; off by default; management link
- **Status:** **Superseded** by D-041 (email and/or LinkedIn at onboarding; visibility private by default)

### D-025 · Portrait-first 4-lane runner; answers as doors with mirrored buttons
- **Status:** **Superseded** by D-048 (side-scrolling platformer with in-world answer junctions)

### D-026 · MVP content scope: 4 core tracks, other roles in early access
- **Status:** **Superseded** by D-045 (AI-generated pools instead of hand-written volume targets)

### D-027 · North Star: Weekly Delivering Players; mission metric: profile discoveries
- **Status:** **Superseded** by D-047 (Weekly Active Developers + retention)

## 2026-10-12 · Part 1, revision 2: profile-first ranked (after maintainer review)

### D-028 · Compete as who you are (central principle)
- **Status:** Accepted (direction from the maintainer); details accepted
- **Context:** revision 1 (D-010) forced every ranked player into one global daily job. The maintainer rejected it: anyone must be able to compete from their own professional profile.
- **Decision:** every run (both modes) is played as a validated, **frozen profile snapshot** (seniority, role, stack). It shapes the job, the questions and the competition, and stays attached to the result forever. See [competitive identity](../product/competitive-identity.md).
- **Article angle:** the right fairness is "comparable challenges among comparable people", not "identical challenges for everyone".

### D-029 · Categories = track × seniority band
- **Status:** Accepted
- **Decision:** 10 tracks (role families) × 3 bands: Junior (Trainee, Junior), Mid, Senior+ (Senior, Lead, Staff, Principal). 9 official categories at launch (Frontend, Backend, Fullstack × 3 bands); Platform in preview; others casual-only with a "help unlock ranked" call to action.
- **Alternatives:** 7 bands (empty boards), 2 bands (unfair), 4 bands (a future split); one track per role; super-families; dynamic pooling.

### D-030 · Profile validation, snapshot and ranked lock
- **Status:** Accepted; the **category cooldown is deferred to V1** (D-043); validation, snapshot and daily lock stay
- **Decision:** server validation (role, seniority, technologies, role compatibility rules, 1–12 technologies). An immutable snapshot per run; later requests carry no profile. Ranked profile locked for the UTC day after the first ranked run; ranked track or band changes at most every 7 days (tunable).

### D-031 · Daily Challenge = Daily Company + Category Blueprint + personal job
- **Status:** Accepted, **amended** by D-039: the Daily Challenge is a feature on top of Job Challenges, not the center
- **Decision:** one fictional Daily Company with a domain theme per UTC day, hiring across every track and level (secret until 00:00 UTC). A daily blueprint per category (band difficulty curve, shared families, ATS composition, bot field). Each player's job is generated on demand from their snapshot.
- **Alternatives:** a global daily job (rejected); a curated daily job per category (ignores the individual stack, heavy curation); on-demand generation only (no daily element, weaker fairness).

### D-032 · Content mix and topic boundaries
- **Status:** Accepted
- **Decision:** each run mixes job, stack, role-fundamentals, seniority and shared-fundamentals questions. Technical questions never target technologies outside the player's stack, track fundamentals or shared fundamentals. Ranked: H1 = stack (calibrated per technology and level), H2 = track fundamentals (shared daily family), H3 = seniority (shared daily family per band), F1 = scenario + stack. Coverage fallback to track fundamentals.

### D-033 · Bounded stack personalization in ranked
- **Status:** Accepted
- **Decision:** stack-influenced slots ≤ ~35% of answer points (≈ 16% of the total score) in Senior+, less in lower bands; per-technology calibration targets; outlier families excluded.

### D-034 · Category-first leaderboards; no global ranking in the MVP
- **Status:** Accepted, **amended** by D-046: MVP has daily and weekly category rankings + Daily Champion; Weekly Top 7 and Candidate of the Week move to V1
- **Decision:** category daily leaderboards; Daily Champion, Weekly Top 7 and Candidate of the Week per category; a minimum field of 3 runs for titles; a cross-category spotlight (not a ranking); a normalized global view as a V1 experiment at most.
- **Alternatives:** a raw global ranking (never), a normalized index (later), a long-term rating (V2+).

### D-035 · Competing context everywhere
- **Status:** Accepted
- **Decision:** results, leaderboard rows, champion cards, Weekly Top 7, share cards, history and future seasons always show "competing as {seniority} {role}" + stack chips (up to 5 + "+N"). The name and LinkedIn are current and revocable; the context is historical. Anonymous entries show only "Anonymous Candidate" and the score.

### D-036 · Smurfing: make it unattractive and visible, not impossible
- **Status:** Accepted
- **Decision:** categories (no advantage against higher bands), public context labels, the daily lock, the category cooldown, the minimum field, "misrepresented profile" reports, audited exclusion from titles.

### D-037 · MVP role catalog: 13 roles
- **Status:** Accepted (follows the maintainer's revised list)
- **Decision:** Engineering Manager, Product Manager and UX/UI Designer leave the MVP catalog (they need non-technical content); Software Architect is restricted to Senior and above (proposal).

## 2026-10-12 · Part 1, revision 3: developer network (after the second maintainer review)

### D-038 · Staged product evolution
- **Status:** Accepted (maintainer direction)
- **Decision:** Game → Developer Network → Jobs → Recruiter Platform. "First build a fun developer game. Then a developer network. Then jobs. Then recruiter features." Each stage has gates. See [product evolution](../product/product-evolution.md).

### D-039 · The domain is centered on the Developer and their progress
- **Status:** Accepted (direction); details accepted
- **Decision:** Developer → profile → game session → game result → XP → history → rankings; later job → job challenge → application → recruiter. The Daily Challenge (Daily Company) is a feature; rankings, history and stats are projections over immutable results. **Job Challenge is source-agnostic** (generated, daily, later a real job posting). See [domain concepts](../product/domain-concepts.md).

### D-040 · Provisional Developer identity before accounts
- **Status:** Accepted (direction); details accepted
- **Decision:** a server-generated Developer ID created at onboarding; recognised by a device credential and a management link; accounts attach later. See [identity and accounts](../product/identity-and-accounts.md).

### D-041 · Email and/or LinkedIn at onboarding, as unverified claim identifiers
- **Status:** **Superseded** by D-050 and D-055 (identifiers asked after the first game, both optional; LinkedIn visibility separate)
- **Decision:** `contactEmail` (private, always; never in public surfaces, analytics or logs), `linkedinUsername` (public only with consent) and `profileVisibility` (private by default) are separate. Both identifiers carry a verification status (`unverified` in the MVP). This supersedes the earlier non-goal of collecting no email.

### D-042 · Account claim and merge strategy
- **Status:** Accepted
- **Decision:** claims require proof of control (verified email, provider email, device credential, management link). No merges on unverified data. Several provisional Developers can merge into one: results re-associated, XP ledger entries moved (awarded once per result), projections rebuilt, one ranking entry per period, aliases for old links. "This isn't me" detaches a mismatched email.

### D-043 · Run types: ranked and practice
- **Status:** **Superseded** by D-051 (ranked is an explicit choice; attempts committed server-side)
- **Decision:** ranked = the first 3 runs per UTC day (category blueprint, rankings, daily profile lock); practice = unlimited (exact-seniority difficulty, explanations, XP). The category cooldown moves to V1.

### D-044 · Progression model
- **Status:** Accepted, **amended** by D-054 (practice XP and anti-farming)
- **Decision:** Game Score ≠ XP ≠ CV Rush Level ≠ declared seniority. An append-only XP ledger; XP = completion + score/50 + bonuses; diminishing returns after 10 runs/day; level step = 300 + 25·k. History with frozen context; skill stats as gameplay statistics with minimum samples and strict wording; `lastActiveAt` shown coarsely. See [progression](../game-design/progression.md).

### D-045 · MVP questions: AI-generated, validated, stored pools
- **Status:** Accepted, **amended** by D-052 and D-053 (question lifecycle instead of partitions; verification tiers)
- **Decision:** ~20 questions per context (technology × level, track fundamentals × level, seniority × band); structured output; schema and rule validation, dedupe, independent cross-check; versioned storage in the private database; ranked and practice partitions; asynchronous refills on exposure; never on the request path; gradual replacement by curated and community content. Rankings run as **Season 0 (Beta)**.

### D-046 · Rankings as a progression feature
- **Status:** Accepted
- **Decision:** MVP: category daily and weekly rankings, Daily Champion per category (+250 XP), Season 0 tagging. V1: Weekly Top 7, Candidate of the Week, technology and XP rankings, an experimental normalized global view. V2: Seasons with resets and season XP.

### D-047 · Metrics re-centered on developers
- **Status:** Accepted
- **Decision:** North Star = Weekly Active Developers; health = 4-week retention; mission = profile discoveries; network readiness = developers with an email and with public profiles. Progression events (`xp_awarded`, `level_up`…) and no personal data in analytics.

### D-048 · Side-scrolling platformer with in-world answer junctions
- **Status:** Accepted (direction); details accepted
- **Decision:** auto-run, jump, drop, choose paths, boosts; questions delivered by in-world characters; the level splits into four paths A–D with option signs; the runner physically enters the answer (tapping a sign or pressing 1–4 moves the runner there). Original visual identity: no Nintendo/Mario assets, characters, blocks, sounds or levels.

### D-049 · Private profile page in the MVP; public developer pages designed for Stage 2
- **Status:** Accepted
- **Decision:** "My profile" (private) ships in the MVP. `/developers/{slug}` with per-section toggles comes with accounts; provisional public pages are not indexed by search engines.

## 2026-10-12 · Part 1, revision 4: approval adjustments

**Part 1 approved** by the maintainer with the adjustments below. Every Part 1 entry not marked Superseded or Deferred is now **Accepted**.

### D-050 · "Save your progress" after the first game
- **Status:** Accepted
- **Decision:** light onboarding (name, seniority, role, stack) creates the provisional Developer and its device credential. Email and LinkedIn are asked **after the first completed game**, when XP, a level, a result and history exist. **Neither is required**; skipping keeps progress on the device with an honest notice. Conversion is measured as `first_game_completed` → `identity_contact_added`.
- **Alternatives:** identifiers before the first run (revision 3; a barrier before showing value).

### D-051 · Ranked is an explicit choice; attempts are committed server-side
- **Status:** Accepted (the exact commitment point is designed in Part 2)
- **Decision:** two entries: **Play Ranked** (primary CTA, "3 attempts remaining today") and **Practice** (secondary, unlimited). A ranked attempt is committed at a clear server-side moment when the competitive session starts, so "enter, see questions, close, retry" can't re-roll attempts.
- **Alternatives:** the first 3 runs of the day ranked by default (revision 3; players could burn attempts while learning).

### D-052 · Question lifecycle instead of fixed ranked/practice partitions
- **Status:** Accepted (states and storage designed in Part 2)
- **Decision:** generated → validated → competitive → retired → practice, plus invalidation, expiration, regeneration and controlled reuse. A question active in competitive rotation never appears in practice; practice can show answers, explanations and learning material for retired questions.
- **Alternatives:** a permanent 10/10 split per pool (would run out fast).

### D-053 · Verification tiers; the AI second check is not proof
- **Status:** Accepted
- **Decision:** tiers AI generated → AI validated → Human reviewed → (later) Curated. Season 0 (Beta) accepts AI validated for competitive use, with source, confidence and batch metadata, and invalidation (also by batch). Rankings say explicitly that content is still being calibrated.

### D-054 · XP in practice and anti-farming
- **Status:** Accepted
- **Decision:** practice earns 50% of ranked XP; a one-time discovery bonus per question (+5 × difficulty); diminishing returns after 10 runs/day; a daily practice cap of 1,000 XP; server-only XP; voiding on failed verification. A difficulty multiplier on run XP was rejected because practice difficulty follows declared seniority.

### D-055 · LinkedIn identifier vs LinkedIn visibility
- **Status:** Accepted
- **Decision:** `linkedinIdentifier` (optional, unverified, never a credential) is separate from `linkedinVisibility` (hidden by default; shown only with explicit consent and a public profile). The email has no public option at all. Both identifiers belong to the same provisional Developer.

### D-056 · Product principle and architectural north
- **Status:** Accepted
- **Decision:** "The game creates engagement. The profile accumulates value. Jobs create opportunity." Today we build mainly the first two lines. Architectural north: Developers → Games → Progress → Reputation inside CV Rush → Jobs → Applications → Recruiters.

### D-057 · No blanket queue for projections
- **Status:** Accepted (analysis in Part 2)
- **Decision:** don't assume BullMQ for every derived view. Part 2 must justify where a queue adds value (AI generation, asynchronous work, ranking close and verification, retries) and where XP, basic stats and result updates can stay transactional or in-process without unnecessary eventual consistency.

## 2026-10-12 · Part 2: architecture (draft)

Architecture decisions are recorded as ADRs in [`docs/adr/`](../adr/README.md) (ADR-001 to ADR-024). Highlights: modular monolith (ADR-001), Phaser decoupled from Next.js (ADR-002), server-authoritative gameplay (ADR-003), provisional Developer identity with device credentials (ADR-007), rankings as projections (ADR-008), licensing split (ADR-010), one origin for web and API (ADR-012), BullMQ only where it pays (ADR-015), immutable results and XP ledger (ADR-016), Job Challenge abstraction (ADR-017), AI pipeline (ADR-018), ranked attempt committed at apply (ADR-019), claim and merge by proof of control (ADR-020), personal data handling (ADR-021).

## 2026-10-12 · Part 2 approved

All ADRs (001–024) are **Accepted**, with these approval notes:

### D-058 · Provider-agnostic AI integration
- **Status:** Accepted
- **Decision:** a `QuestionGenerationProvider` contract with independent adapters selected by configuration; a fake provider for contributors, tests, CI and keyless development. No concrete provider until the slice that integrates AI (ADR-018).

### D-059 · Hosting region and provider deferred
- **Status:** Accepted
- **Decision:** the app must be deployable in the EU or the US without domain changes. The choice (users, latency, privacy/GDPR, cost, PostgreSQL, Redis, workers, storage, AI provider) is made at the deployment slice and recorded in an ADR.

### D-060 · Ranked attempt consumed at apply, server-authoritative
- **Status:** Accepted (ADR-019)
- **Decision:** after apply, closing, abandoning, disconnecting or leaving never returns the attempt. Telling technical failures apart from abandonment may be revisited with real data.

### D-061 · Licensing direction confirmed
- **Status:** Accepted (ADR-010)
- **Decision:** Apache-2.0 for code, CC BY 4.0 for content, branding excluded, no CLA, an authorship/origin attestation in the PR template. Legal files arrive in Part 3.

### D-062 · LinkedIn example
- **Status:** Accepted
- **Decision:** documentation keeps "Ricardo Vera" as the real example; normalized `linkedinUsername = ricardo-vera`; canonical URL `https://www.linkedin.com/in/ricardo-vera/` (built with a trailing slash).

## 2026-10-13 · Part 3: repository foundations

### D-063 · Respect pnpm's supply-chain policies
- **Status:** Accepted
- **Decision:** keep pnpm 12's minimum release age and install-script allowlist (`allowBuilds`). Pin the newest versions older than the policy window rather than adding exclusions.

### D-064 · Version choices at foundation time
- **Status:** Accepted
- **Decision:** NestJS 11.2.7 (12 released the same day), TypeScript 6.0.x (typescript-eslint doesn't support 7 yet), ESLint 9.39.x (Next.js plugins' peers), PostgreSQL 17 and Redis 8 images for local development and CI. Revisit through Dependabot updates.

### D-065 · Structure kept from Part 2
- **Status:** Accepted
- **Decision:** the worker is a second entrypoint of `apps/api` (not a separate `apps/worker`), the domain stays inside `apps/api` (no shared `packages/domain`), and `packages/game` contains only the engine contracts until slice S4.

### D-066 · Zero-config local development
- **Status:** Accepted
- **Decision:** the API, Prisma and the seed fall back to local defaults matching `compose.yaml` when no `.env` exists (development only; production fails without explicit values). The documented flow needs no manual environment step.
