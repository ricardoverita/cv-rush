# Glossary (ubiquitous language)

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> These terms are used across docs, code and conversations. Domain terms are **brand-agnostic**: none of them contain "CV Rush" (the "CV Rush Level" label is UI copy, not a domain name).

## Developers and identity

| Term | Meaning |
|---|---|
| **Developer** | The anchor of the domain: a person's identity in the product, created by the server with its own ID before any account exists. Owns profile, sessions, results, XP, history and rankings. Status: provisional → claimed (merged, deleted). |
| **Provisional developer** | A Developer without an account, recognised by a device credential or management link |
| **Device credential** | A secret in a secure cookie that proves "this browser is this Developer". Not the Developer ID. |
| **Management link** | A private, regenerable link to access and manage a provisional Developer from another device |
| **Contact / claim identifier** | An **optional** identifier added after the first game or later: `contactEmail`, `linkedinIdentifier`. Always carries a verification status (`unverified` in the MVP). Never a credential. |
| **Save your progress** | The post-game prompt (after the first completed game) to add an email and/or LinkedIn |
| **contactEmail** | The optional, private email of a Developer. No public option exists; never in analytics or logs. The most important identifier for recovery, claiming, merges and future authentication; communication only with consent. |
| **linkedinIdentifier** | The optional, normalized LinkedIn `/in/` username. Unverified; not proof of ownership. |
| **linkedinVisibility** | Whether LinkedIn is shown on public surfaces: hidden (default) or shown, and only when the profile is public |
| **Profile visibility** | `private` (default) or `public` in the MVP; more levels later (public page sections, Open to Work, discoverable by recruiters) |
| **Consent** | A recorded decision per purpose, with text version and timestamp |
| **User account** *(Stage 2)* | Login credentials that attach to a Developer through a claim |
| **Account claim** *(Stage 2)* | Linking an account to one or more provisional Developers after proving control of an identifier |
| **Merge** *(Stage 2)* | Combining several provisional Developers of the same person into one, without duplicating results or XP |

## Profiles

| Term | Meaning |
|---|---|
| **Developer profile** | The *current*, editable name, declared seniority, role, stack and links |
| **Profile snapshot** | The validated, immutable copy of the profile that a game session is played as. Every server decision uses it; it stays attached to the result. |
| **Competing context** | What a result was achieved *as*: declared seniority, role, stack (and category), from the snapshot |
| **Role** | A catalog profession, with core and allowed technology categories and allowed seniorities |
| **Seniority** | Trainee, Junior, Mid, Senior, Lead, Staff, Principal: declared, displayed exactly, **never confused with the CV Rush Level** |
| **Stack** | 1–12 technologies, validated against the role's compatibility rules |
| **Topic boundaries** | Technical questions only come from the developer's stack, their track's fundamentals and shared fundamentals |

## Games

| Term | Meaning |
|---|---|
| **Job Challenge** | What a run is played against: a job posting + the challenge blueprint + its context. Source: `generated`, `daily`, later `job_posting` (Play to Apply). |
| **Company** | The employer of a job posting: fictional in the MVP (generated or the Daily Company), real in Stage 3 |
| **Job posting** | A job description: generated for the profile in the MVP; published by a company later |
| **Game session (run)** | One playthrough of a Job Challenge as a profile snapshot, of a run type |
| **Run type** | Chosen explicitly: **Ranked** ("Play Ranked", 3 attempts per UTC day, category blueprint, counts for rankings) or **Practice** (unlimited, exact-seniority difficulty, explanations, reduced XP) |
| **Ranked attempt** | One of 3 daily ranked attempts, committed server-side when the competitive session starts; never returned |
| **Ranked profile lock** | After the first ranked run of a UTC day, the profile can't change until the day ends |
| **Category cooldown** *(V1)* | A minimum time between ranked track or band changes |
| **Stage** | Recruiter Screening, ATS Scan, Hiring Manager, Final Interview (Salary Negotiation, Ghosting later) |
| **Segment** | A race stretch between stages |
| **Challenge** | A stage instance opened just in time, with ephemeral IDs and deadlines |
| **Slot** | A question position in a blueprint (e.g. H2: role fundamentals, level 3) |
| **Answer junction** | The in-world presentation of a question: the level splits into four paths A–D with option signs; the runner physically takes one |
| **Bot**, **field** | Simulated rival candidates; the set of runners in a run (or players in a ranking) |
| **CV Health** | The run's health bar (0–100); at 0 the application is rejected |
| **ATS Match** | The ATS Scan percentage; below the threshold the application is rejected |
| **Effect** | A semantic outcome: `SPEED_BOOST`, `SLOWDOWN`, `CV_DAMAGE`, `CV_REPAIR`, `ATS_BONUS`, `FINAL_BOOST`, `XP_GAIN`, `COMBO_LOST`, `APPLICATION_REJECTED`… |
| **Reason code** | `ATS_FAILED`, `CV_DESTROYED`, `ABANDONED`; translated by the client |
| **Game result** | The immutable outcome of a session: status, score breakdown, position, accuracy, competing context, season |
| **Delivered run** | A run that reached the company and delivered the CV |

## Progression

| Term | Meaning |
|---|---|
| **Game Score** | Points of a single run (e.g. 18,492) |
| **XP** | Cumulative progress of a developer (e.g. 8,420 XP), awarded by the server from results |
| **XP ledger** | The append-only record of XP awards and corrections; totals and levels derive from it |
| **CV Rush Level** | A level derived from XP (e.g. Level 17). **Not professional seniority.** |
| **History** | The developer's list of game results with their context (a projection) |
| **Skill stats** | Per-technology and per-topic gameplay statistics (e.g. "Redis challenges: 76% accuracy (34 answers)"). Never a certification. |
| **Last active** | `lastActiveAt`; shown publicly only in coarse buckets. Not "looking for a job". |
| **Season** | A competition period results and XP are tagged with. **Season 0 (Beta)** at launch; resets and season XP later. |
| **Title** | A recorded award, e.g. Daily Champion of a category on a date |

## Competition

| Term | Meaning |
|---|---|
| **Track** | A competitive family of roles (Frontend, Backend, Fullstack, Platform…) |
| **Seniority band** | Junior (Trainee, Junior), Mid, Senior+ (Senior, Lead, Staff, Principal) |
| **Category** | Track × band, e.g. **Fullstack · Senior+** |
| **Category lifecycle** | Practice only → Ranked preview → Ranked (official) |
| **Category blueprint** | The structure shared by every ranked run of a category on a day |
| **Daily Challenge** | A feature: on each UTC day, ranked Job Challenges are generated at the **Daily Company** |
| **Daily Company** | The fictional company "hiring across every track and level" on a UTC day; secret until 00:00 UTC |
| **Ranking** | A projection of results over a scope: period (day, week, season, all-time) × dimension (category, technology, XP) |
| **Provisional / Verification** | A ranking before / the automated checks after the day closes |
| **Daily Champion** | The best verified ranked result of a UTC day in a category (minimum field: 3) |
| **Weekly Top 7**, **Candidate of the Week** *(V1)* | A category's 7 Daily Champions of an ISO week; the best of them |
| **Spotlight** | A cross-category showcase of champions, never a ranking |
| **Server canonical time / player display time** | UTC for rules / local time for presentation |

## Content

| Term | Meaning |
|---|---|
| **Question** | A versioned single-choice item (4 options) with translations, source, verification level and tags |
| **Question context / pool** | The questions available for a context (e.g. Redis × level 3): ~20 generated when first needed, then rotated and regenerated |
| **Question lifecycle** | Generated → Validated → Competitive → Retired → Practice (or Invalidated, Archived). A question in competitive rotation never appears in practice. |
| **AI-generated question** | Generated ahead of time or asynchronously with structured output, validated, second-checked and stored with source and confidence metadata. Never generated on the request path. |
| **Verification tier** | AI generated → AI validated → Human reviewed → Curated. The independent AI check detects problems; it doesn't prove correctness. |
| **Job-derived question** | Generated from facts in the run's job posting (memory, recruiter, salary) |
| **Template** | A parameterized or scenario question generator |
| **Graded options** | Options with outcome grades (e.g. the salary question) |
| **Community Question Pack** *(later)* | An open-source question collection (answers public), for practice, learning and contributors |
| **Curated competitive pool** *(later)* | Reviewed, calibrated question families for ranked |

## Public presence and future stages

| Term | Meaning |
|---|---|
| **Public card** | How a public developer appears next to results (name, seniority, role, stack, optional level and LinkedIn) |
| **Anonymous Candidate** | How a private developer appears in rankings |
| **Public developer page** *(Stage 2)* | `/developers/{slug}`, with per-section toggles |
| **Open to Work** *(Stage 2)* | A voluntary status; never inferred |
| **Play to Apply** *(Stage 3)* | Playing a Job Challenge derived from a real job posting, then optionally applying with the result |
| **Application** *(Stage 3)* | A voluntary submission of a result to a company for a job |
| **Company account, recruiter account, developer search** *(Stage 4)* | Recruiter-side features over **discoverable** profiles only |
