# MVP scope and explicit non-goals

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> The MVP is **Stage 1 (Game)** of the [product evolution](product-evolution.md), built so that Stages 2–4 don't require redoing the domain. V1, V2 and later items are in the [roadmap](../roadmap/README.md).

## 1. MVP goal

**Hypothesis to validate:** a 3-minute hiring-process runner, played as your own developer profile, is fun enough to **replay**, and **persistent progress** (XP, levels, history, rankings) makes developers **come back** and **keep their profile**.

It is a public product, not a demo: everything in scope is production quality, and everything out of scope has a prepared place in the domain.

## 2. In scope: the main journey

**Landing → Name → Seniority → Role → Stack → provisional Developer created → choose Ranked or Practice → Job Challenge generated → play → result → score → XP → level → Save your progress (optional email/LinkedIn) → My Profile → play again.**

| # | Item | Notes |
|---|---|---|
| 1 | **Landing** | Server-rendered, indexable, es/en, OpenGraph/Twitter metadata; today's company, leaders by category, countdown |
| 2 | Name | Moderated; the display name, never the email |
| 3 | Seniority | 7 levels |
| 4 | Role | 13 roles, 10 tracks |
| 5 | Stack | Role-adapted picker: recommendations, categories, search, aliases, suggestions, compatibility rules; 1–12 technologies |
| 6 | **Provisional Developer created** | Server-generated ID, secure device credential, management link; terms/privacy acknowledgement; visibility **private** by default. See [identity and accounts](identity-and-accounts.md). |
| 7 | **Choose Ranked or Practice** | Two explicit entries: **Play Ranked** (primary, "3 attempts remaining today") and **Practice** (secondary, unlimited). Ranked is never implicit. |
| 8 | **Generate a Job Challenge** | For the frozen profile snapshot; today's company in ranked, a random company in practice. A ranked attempt is committed server-side when the competitive session starts. |
| 9 | **2D race** | A side-scrolling platformer/runner (Phaser, confirmed by ADR in Part 2): run, jump, avoid obstacles, choose paths, collect boosts |
| 10 | **5–10 questions per run** from larger pools | 7 by default; questions appear in the world as A/B/C/D paths; ranked uses competitive rotation, practice uses retired/practice questions |
| 11 | Recruiter Screening | 3 questions, including the graded salary question |
| 12 | ATS Scan | The ATS 9000 conveyor; threshold; game over on failure |
| 13 | Hiring Manager | 3 technical questions (stack, role fundamentals, seniority) |
| 14 | Final Interview | 1 mixed question; Final Boost |
| 15 | Deliver CV | The delivery animation |
| 16 | **Result** | With competing context: "scored 18,492 points competing as a Senior Fullstack Developer" + stack |
| 17 | **Score** | Server-computed, explained breakdown |
| 18 | **XP** | Server-computed, append-only ledger; practice gives reduced XP; anti-farming rules |
| 19 | **Level** | The CV Rush Level, derived from XP; never confused with seniority |
| 20 | **Save your progress** | After the first completed game (and at meaningful moments): optional email and/or LinkedIn, both **unverified**, both on the same Developer; skipping keeps progress on the device, with an honest notice |
| 21 | **History saved** | Every run with its snapshot context, Job Challenge, result and XP |
| 22 | **Last active** | `lastActiveAt`; shown coarsely |
| 23 | **Rankings** | Category rankings (daily, weekly) from ranked runs only; Daily Champion per category; **Season 0 · Beta**, labeled as calibrating content |
| 24 | **Optional public LinkedIn** | Only if the developer added it, made their profile public **and** enabled `linkedinVisibility` (default off); normalized `/in/` username; unverified |
| 25 | **My Profile** | Private page: level, XP, games, best ranks, history, initial technology stats (minimum sample), visibility and contact settings |
| 26 | **Play again** | ≤ 2 taps; Play Ranked while attempts remain, Practice anytime |

### Also in scope (foundations)

- **Two explicit run types:** ranked (3 attempts/day, committed server-side, category blueprint, rankings) and practice (unlimited, exact-seniority difficulty, explanations, reduced XP). See [game modes](game-modes.md).
- **Profile snapshot per run** and the **ranked daily profile lock**.
- **Bots** (5 archetypes, elimination funnel), **CV Health**, obstacles and pickups.
- **Questions:** AI-generated, validated, stored pools (~20 per context when first needed) with a **lifecycle** (validated → competitive → retired → practice; invalidation and regeneration), verification tiers (AI generated, AI validated, later Human reviewed), job-derived templates, just-in-time serving, no answer keys on the client. See [content strategy](../questions/content-strategy.md).
- **Sharing:** a result page with an OpenGraph image; LinkedIn, X, WhatsApp, copy link (plain URLs, no SDKs).
- **Privacy pages:** privacy policy, terms, "What is public" (es/en); hide and delete via the management link.
- **i18n:** es/en, locale-prefixed URLs, detection with English fallback, a remembered manual switch, semantic codes from the backend.
- **Accessibility:** equivalent inputs (tap a path sign or press 1–4), non-color cues, contrast, large targets, reduced motion, relaxed timers in practice.
- **Integrity:** server-authoritative runs, a state machine, single-use challenges with expiry, rate limits, ranked attempt limits, automated champion verification, XP anti-farming.
- **Observability and analytics:** structured logs (with email masking), request and session IDs, error tracking, basic metrics, provider-agnostic analytics events including progression events.
- **Moderation and operations:** maintenance commands (hide a profile, invalidate a run and void its XP, revoke a title, quarantine a question), all audited.
- **Open source:** the repository foundations from Part 3, with a small **sample question pool** in the repository so contributors can run everything locally without AI keys.

## 3. Content targets (simplified)

| Content | MVP target |
|---|---|
| Roles / tracks / bands | 13 roles · 10 tracks · 3 bands |
| Official ranked categories | 9 (Frontend, Backend, Fullstack × Junior, Mid, Senior+); Platform in preview; others practice-only |
| Technologies in the catalog | ~120, with categories, aliases, role recommendations and compatibility rules |
| **Question pools** | **~20 validated questions per context** when first needed (technology × level, track fundamentals × level, seniority × band), bilingual, AI-generated and stored, moving through the competitive → retired → practice lifecycle, regenerated as rotation needs. Pre-generated for launch contexts; long-tail contexts generated asynchronously. |
| Job-derived templates | ~15 (memory, recruiter, salary) |
| Job generation | Templates for every role; ~30 fictional companies; ~12 locations |
| Daily Companies | A reviewed pool, scheduled ≥ 2 weeks ahead |
| Bots | 5 archetypes, name pools per locale, ~30 localized lines |

The large community question-pack system (open-source packs, curated competitive pools, calibration at scale) comes later. The MVP is designed so curated content can **gradually replace** AI-generated questions.

## 4. Not in the MVP

| Not now | Where it goes |
|---|---|
| Accounts (passwords, Google, GitHub, LinkedIn sign-in), email verification, profile claiming | V1 (Stage 2); designed now |
| Public developer pages (`/developers/{slug}`), portfolio, Open to Work, badges | V1–V2 (Stage 2); designed now |
| Weekly Top 7, Candidate of the Week, technology and XP rankings | V1 |
| Seasons (resets, season XP) | V2; Season 0 tagging from day one |
| Salary Negotiation stage, Ghosting | V1 |
| Community question packs at scale, curated competitive pool, calibration tooling | V1–V2 |
| Category cooldown | V1 |
| Admin panel | V1 (commands in the MVP) |
| **Jobs: companies, real postings, Play to Apply, applications** | Stage 3 |
| **Recruiter dashboard, company accounts, developer search, messaging, paid plans** | Stage 4 |
| Advanced skill certification | Never as a certification |
| Engineering Manager, Product Manager, UX/UI Designer roles | Later (non-technical content) |

## 5. Explicit non-goals

1. **No certification.** CV Rush results are gameplay statistics, never a measure of professional ability.
2. **No recruiter SaaS in the MVP.** No companies, jobs, applications, search or messaging.
3. **No mandatory accounts in the MVP.** A provisional identity that can be claimed later.
4. **No public email, ever.** The email is a private claim and contact identifier, never a username, a slug, a ranking label or an analytics property.
5. **No collection of CV files, location, age, gender** or other personal data beyond the profile, email and LinkedIn.
6. **No runtime LLM dependency on the request path.** Questions are generated ahead of time or asynchronously, validated and stored.
7. **No monetization, ads or tracking pixels** in the MVP.
8. **No real-time multiplayer.** Rivals are bots.
9. **No native mobile apps.**
10. **No microservices.** A modular monolith first.
11. **No pay-to-win and no sponsor influence** on rankings or questions. Levels give no gameplay advantage.
12. **No LinkedIn API integration or scraping.** We only store the username the developer gives us.
13. **No mocking of real companies or real people.**
14. **No copied game assets.** Original visual identity; no Nintendo or Mario assets, characters, sounds or levels.

## 6. Decisions taken at Part 1 approval

1. **Email and LinkedIn are asked after the first completed game** ("Save your progress"), never before playing. Conversion is measured as `first_game_completed` → `identity_contact_added`.
2. **Neither is required.** Email is the most important identifier (recovery, claim, merge, future authentication); LinkedIn is professional identity and never a credential.
3. **Ranked is explicit**, with its own primary CTA and a visible attempt counter.
4. **Season 0 rankings are labeled Beta**, stating that content is still being calibrated.

## 7. Definition of done for the MVP launch

- [ ] A complete run is playable on a mid-range Android phone in LinkedIn's in-app browser, on iOS Safari, and on desktop Chrome, Firefox and Safari.
- [ ] Median run length is between 2.5 and 4 minutes in playtests.
- [ ] No question or answer key reaches the client before its challenge starts, and no ranked answer key reaches it at all (verified by inspecting traffic).
- [ ] Scores, positions, XP and levels are computed server-side only (verified by tampering tests).
- [ ] A run's profile cannot change after creation; every result shows its snapshot context.
- [ ] The email never appears in any public surface, HTML, share card, analytics event or log (verified by automated checks).
- [ ] A provisional developer's history, XP and rankings survive across sessions on the same device and via the management link, with or without contact details.
- [ ] A ranked attempt is committed server-side at its defined moment; closing and reopening never returns an attempt (tampering tests).
- [ ] A question in competitive rotation never appears in a practice run (automated check).
- [ ] XP anti-farming rules hold (reduced practice XP, one-time discovery bonus, daily practice cap).
- [ ] Category rankings and Daily Champions work across UTC day and week boundaries (integration tests with time travel).
- [ ] AI-generated questions pass the validation pipeline; reported questions are quarantined.
- [ ] es/en complete, with no missing keys (CI validation).
- [ ] Privacy policy, terms and "What is public" published; legal review done (email processing included).
- [ ] Moderation commands work and are audited.
- [ ] At least 20 external playtesters completed runs; top issues fixed.
- [ ] Case-study notes up to date.
