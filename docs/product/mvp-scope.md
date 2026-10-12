# MVP scope and explicit non-goals

> Part 1 · Product & Game Design · Status: **Draft for review**
>
> V1, V2, ideas and deliberately postponed features are in the [roadmap](../roadmap/README.md).

## 1. MVP goal

**Hypothesis to validate:** a 3-minute hiring-process race is fun enough to **replay** and **share**, and a fair **Daily Challenge** creates **return visits**.

The MVP is the smallest product that can test this hypothesis **in public** without compromising the foundations: server authority, fairness, privacy and contributability. It is not a demo. Everything in scope is built to production quality, and everything out of scope has a place prepared for it.

## 2. In scope

### Experience

- **Landing page:** server-rendered, indexable, es/en, with OpenGraph and Twitter metadata. Shows today's live leader, yesterday's champion and the Daily Challenge countdown.
- **Onboarding:** name, seniority (7 levels), role (16 roles), stack picker (recommendations, categories, search, aliases, progressive suggestions, 1–15 selections).
- **Two modes:** Daily Challenge (ranked) and Personalized run (casual). See [game modes](game-modes.md).
- **Job posting screen** with a reading timer and **APPLY**; a lobby with "N candidates applied" and 3-2-1-GO.
- **Results screen** with the explained score breakdown.
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
| Roles in the catalog | 16 (all selectable) |
| Core tracks with full casual coverage | **4**: Frontend, Backend, Fullstack, DevOps & Cloud |
| Other roles | "Early access": job-derived, recruiter and general professional questions, plus a "Help us write questions for this role" call to action |
| Technologies in the catalog | ~120, with categories, aliases and role recommendations |
| Community question packs (public, bilingual) | ≥ 240 questions across the core tracks |
| Competitive question pool (private, bilingual) | ≥ 200 questions in families for the 4 daily tracks |
| Job-derived question templates | ~15 (memory, recruiter, salary) |
| Job generation | Templates for the 4 core tracks + a generic template; ~30 fictional companies; ~12 locations |
| Daily jobs | A rotation schedule across the 4 core tracks, prepared at least 2 weeks ahead |
| Bots | 5 archetypes, name pools per locale, ~30 localized lines |

### Leaderboards

- Daily leaderboard (provisional, top 20 + own position).
- **Daily Champion** with automated verification.
- **Weekly Top 7.**
- **Candidate of the Week** (raw-score rule; see [leaderboards](leaderboards.md#5-candidate-of-the-week)).
- **3 ranked attempts per day**, best counts.

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
- [ ] The Daily Champion and Weekly Top 7 work across UTC day and week boundaries (tested with time travel in integration tests).
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
