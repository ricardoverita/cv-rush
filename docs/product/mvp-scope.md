# MVP scope and explicit non-goals

> Part 1 · Product & Game Design · Status: **Draft for review (revision 2: profile-first)**
>
> V1, V2, ideas and deliberately postponed features are in the [roadmap](../roadmap/README.md).

## 1. MVP goal

**Hypothesis to validate:** a 3-minute hiring-process race is fun enough to **replay** and **share**, and a fair **Daily Challenge** creates **return visits**.

The MVP is the smallest product that can test this hypothesis **in public** without compromising the foundations: server authority, fairness, privacy and contributability. It is not a demo. Everything in scope is built to production quality, and everything out of scope has a place prepared for it.

## 2. In scope

### Experience

- **Landing page:** server-rendered, indexable, es/en, with OpenGraph and Twitter metadata. Shows today's company, today's champions by category (spotlight) and the Daily Challenge countdown.
- **Profile-first onboarding:** name, seniority (7 levels), role (13 roles), a stack picker adapted to the role (recommendations, role categories, search, aliases, progressive suggestions, role rules, 1–12 selections), and a **"Competing as"** card. See [competitive identity](competitive-identity.md).
- **Server-side profile validation and a frozen profile snapshot per run**, including the ranked daily profile lock.
- **Two modes, both profile-based:** Daily Challenge (ranked, by category) and Personalized run (casual). See [game modes](game-modes.md).
- **Job posting screen** (a personal job; in ranked at today's company) with a reading timer and **APPLY**; a lobby with "N candidates applied" and 3-2-1-GO.
- **Results screen with competing context** ("Ricardo scored 18,492 points competing as a Senior Fullstack Developer" + stack + category rank) and the explained score breakdown.
- **Failure screen** (rejection email parody) and one-tap retry.
- **Post-run review** (casual: full; ranked: results and topics) and **question reporting**.

### Run

- A 2D race in Phaser (the engine choice is confirmed in a Part 2 ADR). **Portrait-first** on mobile; landscape and desktop supported.
- **4 lanes**, auto-run, lane switching and jumping. Keyboard (arrows/WASD, Space, 1–4) and touch (swipe, tap) controls.
- **4 race segments + final sprint**; the company HQ visible on the horizon and growing with progress.
- **2 obstacle types** and **2 pickup types** (see [run structure](../game-design/run-structure.md#3-race-layer)).
- **Bot field** of 9 bots with 5 archetypes and an elimination funnel (see [bots](../game-design/bots.md)).
- **CV Health** with visual damage states (see [CV Health](../game-design/cv-health.md)).

### Stages

- **Recruiter Screening:** 3 questions, including a graded **salary expectation** question (the full Salary Negotiation stage is V1).
- **ATS Scan:** the ATS 9000 conveyor, match meter, threshold and game over on failure.
- **Hiring Manager:** 3 technical questions.
- **Final Interview:** 1 mixed question and the Final Boost.

### Content

| Content | MVP target |
|---|---|
| Roles in the catalog | 13, mapped to 10 tracks (see [competitive identity](competitive-identity.md#22-tracks-competitive-families)) |
| Seniority bands | 3: Junior (Trainee, Junior), Mid, Senior+ (Senior, Lead, Staff, Principal) |
| **Official ranked categories** | **9**: Frontend, Backend, Fullstack × Junior, Mid, Senior+. Platform (DevOps & Cloud) × 3 in **preview** |
| Tracks with full casual coverage | 4: Frontend, Backend, Fullstack, Platform |
| Other tracks | Casual only: job-derived, recruiter and shared-fundamentals questions, plus a "Help us unlock ranked for {role}" call to action |
| Technologies in the catalog | ~120, with categories, aliases, role recommendations and role compatibility rules (core and allowed categories) |
| Community question packs (public, bilingual) | ≥ 300 questions across the 4 casual tracks and 3 levels |
| Competitive question pool (private, bilingual) | **≈ 500 questions** (estimate): track fundamentals families per track × band (Fullstack reuses Frontend + Backend), seniority families per band, and stack families for ~12 priority technologies × 3 levels; plus ~24 scenario templates |
| Job-derived question templates | ~15 (memory, recruiter, salary) |
| Job generation | Templates for every role (rich for the 4 casual tracks), ~30 fictional companies, ~12 locations |
| Daily Companies | A reviewed pool, scheduled at least 2 weeks ahead, secret until published |
| Bots | 5 archetypes, name pools per locale, ~30 localized lines |

### Leaderboards

- **Category leaderboards** (track × band): daily, provisional, top 20 + own position, with competing context on every row.
- **Daily Champion per category** with automated verification and a minimum field of 3 runs.
- **Weekly Top 7 per category.**
- **Candidate of the Week per category** (raw score within the category; see [leaderboards](leaderboards.md#7-candidate-of-the-week-per-category)).
- **Spotlight** of champions across categories (not a ranking). **No global ranking** in the MVP.
- **3 ranked attempts per day**, best counts; ranked profile locked for the day; category cooldown.

### Profile, privacy and sharing

- Public profile opt-in (off by default), live preview, optional LinkedIn with normalization, private management link, hide and delete.
- Display name moderation (es/en) and "report this profile".
- **Share:** a result page with an OpenGraph image; LinkedIn, X, WhatsApp and copy-link buttons (plain URLs, no SDKs).
- Privacy policy, terms and the "What is public" page (es/en).

### Platform qualities

- **i18n:** es/en with locale-prefixed URLs, automatic detection with English fallback, a manual switch that is remembered, and no hardcoded copy. Backend errors and events use semantic codes.
- **Accessibility:** direct answer input (tap or keys 1–4), non-color cues, contrast, large targets, `prefers-reduced-motion`, optional relaxed timers in casual.
- **Integrity:** server-authoritative runs, a session state machine, single-use challenges with expiry, rate limiting, attempt limits, automated champion verification. See [risks](risks.md) here; the technical design is in Part 2.
- **Observability and analytics:** structured logs with request and session IDs, error tracking, basic metrics, a provider-agnostic analytics event layer with a first-party sink.
- **Moderation and operations:** no admin UI. Internal maintenance commands (scripts or CLI) to hide a profile, invalidate a run, revoke a champion and deactivate a question, all audited.
- **Open source:** the repository foundations from Part 3 (docs, contribution guides, validation tooling, CI, seeds, Docker for local services).

## 3. Cut from the brief for the MVP (and where they went)

| Brief item | MVP decision | Moved to |
|---|---|---|
| Salary Negotiation as its own stage | A graded recruiter question | V1 (`salaryNegotiation` flag) |
| Ghosting and other extra obstacles or challenges | Not included | V1 |
| AI-generated questions | Not included; no runtime LLM dependency | V2 (offline generation with validation) |
| Login (Google, GitHub) | Anonymous identity + management link | V1 |
| A global ranking across categories | Spotlight only; per-category boards | V1 (experimental normalized view) |
| Engineering Manager, Product Manager, UX/UI Designer roles | Not in the catalog | Later (they need non-technical content) |
| Admin panel | Maintenance commands only | V1 |
| Public champion pages | Not included | V1 |
| Achievements, streaks, levels, skins, badges | Not included | V1/V2 |
| Seasons, Skill Passport | Not included; domain prepared | V2 |
| Recruiter features, sponsors page | Not included | V2+ |
| PR preview deployments | Prepared for, not set up | V1 |

## 4. Definition of done for the MVP launch

- [ ] A complete run is playable on a mid-range Android phone in LinkedIn's in-app browser, on iOS Safari, and on desktop Chrome, Firefox and Safari.
- [ ] Median run length is between 2.5 and 4 minutes in playtests.
- [ ] No question or answer key reaches the client before its challenge starts, and no answer key reaches it at all (verified by inspecting traffic).
- [ ] Scores, times and positions are computed server-side only (verified by tampering tests).
- [ ] Daily Champions and Weekly Top 7 work per category across UTC day and week boundaries (tested with time travel in integration tests).
- [ ] A run's profile cannot be changed after creation, and every result shows its snapshot context (verified by tampering tests).
- [ ] es/en complete, with no missing keys (CI validation).
- [ ] Content targets met, and every question passes `questions:validate`.
- [ ] Privacy policy, terms and "What is public" are published; the legal review is done.
- [ ] Moderation commands work and are audited.
- [ ] At least 20 external playtesters have completed runs; top issues are fixed.
- [ ] Case-study notes are up to date.

## 5. Explicit non-goals

These are product-wide positions, not just MVP cuts:

1. **No hiring assessment or certification.** CV Rush never claims to measure professional ability or predict job performance.
2. **No real-time multiplayer** in the MVP. Rivals are bots.
3. **No mandatory accounts** in the MVP.
4. **No runtime dependency on an LLM** to serve a question.
5. **No monetization, ads or tracking pixels** in the MVP.
6. **No collection of email, CV files, location, age, gender** or other personal data beyond the profile described.
7. **No B2B recruiter product** in the MVP.
8. **No native mobile apps.** It is a web product.
9. **No microservices.** A modular monolith first.
10. **No pay-to-win, and no sponsor influence on rankings or questions.** Ever.
11. **No LinkedIn API integration or scraping.** We only store a username the player gives us.
12. **No mocking of real companies or real people.**
13. **No AAA graphics.** Readable, fast and charming beats detailed.
