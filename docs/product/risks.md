# Product risks and abuse risks

> Part 1 · Product & Game Design · Status: **Draft for review (revision 3: developer network)**
>
> This document covers risks from a **product and game-design** perspective. The technical threat model and anti-cheat design come in Part 2 (`docs/security/`, `docs/anti-cheat/`).

Scales: **L**ikelihood and **I**mpact are rated Low / Med / High.

## 1. Product risks

| # | Risk | L | I | Mitigation | Signal to watch |
|---|---|---|---|---|---|
| P1 | **Content quality and volume.** 13 roles × many technologies × levels × 2 languages. The MVP relies on AI-generated pools, which may contain wrong or ambiguous questions. | High | High | Validation pipeline (schema, rules, dedupe, independent cross-check); quarantine on reports and outlier stats; ranked uses cross-checked questions only; Season 0 (Beta) rankings; gradual replacement by curated content | Report rate; cross-check rejection rate; accuracy outliers |
| P2 | **"Quiz with a skin."** Questions feel bolted onto a runner and the race feels pointless. | Med | High | The race has real effects (boosts, damage, position); answers are physical paths in the level; tight pacing; playtest early with a graphics-free slice and then with Phaser | Session completion; qualitative feedback; replay rate |
| P3 | **Reading while running is hard on mobile.** | High | High | Slow motion at gates; short prompts (≤ 140 chars) and options (≤ 40 chars); tap-to-answer; readable type sizes | Timeout rate per device; accuracy gap between mobile and desktop |
| P4 | **Runs creep beyond 5 minutes.** | Med | Med | A pacing budget per stage (see [run structure](../game-design/run-structure.md#1-run-anatomy-and-pacing)); timing tunables | p50/p90 run duration |
| P5 | **Ranked feels dry compared to practice.** | Med | Med | Daily Company flavor, real applicant counts, the champion chase, XP for every run | Ranked vs practice replay rate |
| P6 | **Cold start:** empty leaderboards look dead; "3 candidates applied" looks sad. | High | Med | Positive empty states ("Be the first champion today"); hide small applicant counts; launch with a community push; **never fake players or champions** | Daily ranked players |
| P7 | **Fragmentation into many small boards.** Categories split a small early audience; empty boards look dead. | High | Med | Only active categories are listed; the board opens on the player's category; a minimum field for titles; content-gated activation; a spotlight instead of empty grids; bands and tracks split only when fields are large | Daily runs per category; share of categories meeting the minimum field |
| P8 | **LinkedIn in-app browser constraints:** performance, storage and cookie restrictions, audio. | High | High | Early test matrix on real devices; graceful degradation without storage; audio off by default | Error rate and load time by user agent |
| P9 | **Humor misfires:** offending recruiters or candidates; jokes that don't cross cultures. | Med | High | Humor guardrails ([vision](vision.md#4-tone-and-identity)); localized jokes; review by people from both language communities | Reports; social sentiment |
| P10 | **Perceived as an assessment** ("CV Rush says I'm bad at Kafka"). | Med | High | Explicit wording everywhere; "How ranking works" page; no "skill scores" in the MVP | Feedback; press or social mentions |
| P11 | **Privacy or legal issues:** public names, consent, minors, impersonation. | Med | High | Privacy by design ([privacy UX](public-profile-and-privacy.md)); legal review before launch; report and takedown | Reports; takedown requests |
| P12 | **Trademark or IP:** the "CV Rush" name may be taken; resemblance to existing games; LinkedIn brand usage. | Med | Med | Trademark search before investing in branding; brand decoupled from domain; original assets; follow LinkedIn's guidelines for share links | Legal notices |
| P13 | **Leaderboard used as advertising or spam** ("Hire me — buy crypto"). | High | Med | Name rules (no URLs or handles); moderation; LinkedIn only via username | Rejected-name rate; reports |
| P14 | **Outdated content:** technology moves fast. | High | Med | "Outdated" report reason; version-sensitive tags; review cadence; prefer concepts over version trivia | Outdated reports per pack |
| P15 | **Solo maintainer bandwidth; contributors don't show up.** | High | Med | Scope discipline; contribution ladder; good first issues; validation tooling that reviews for us | Time to merge content PRs; contributor count |
| P16 | **Hosting costs spike if it goes viral** (server-authoritative traffic, share images). | Med | Med | Cache share images; keep request counts per run low; cost alerts; sponsors later | Cost per 1,000 runs |
| P17 | **Accessibility vs real-time gameplay.** | Med | Med | Equivalent inputs (tap a path sign, keys 1–4); reduced motion; relaxed timers in practice; generous ranked timers | Accessibility feedback |
| P18 | **Comparability between technologies within a category** ("PHP questions are easier than Go"). | Med | Med | Calibration per technology and level; a bounded stack share of the score; excluding outlier families; public explanation | Score distribution by declared stack within a category |
| P19 | **Players don't understand categories** ("why am I #3 and someone else #1 with fewer points?") | Med | Med | The category is shown everywhere ("#1 in Fullstack · Senior+"); the spotlight copy says scores aren't comparable across categories; "How ranking works" | Support questions; feedback |
| P20 | **Friction at the identity step** (email or LinkedIn before the first run) reduces activation. | High | High | Clear "keep your progress" value; minimal fields; email private; measure drop-off; ready alternative: ask after the first result | Identity step drop-off |
| P21 | **Personal data responsibility.** Storing emails raises legal obligations and breach impact. | Med | High | Minimization; protection at rest; masking in logs; retention policy; deletion; legal review before launch | Security reviews; incidents |
| P22 | **AI cost and vendor dependency.** | Med | Med | Batch generation per context, caching, budgets, feature flag, a provider abstraction; the game works with stored pools if the AI provider is down | Cost per validated question |
| P23 | **Scope creep toward a recruiter SaaS** before the game is fun. | High | High | Staged evolution with explicit gates; MVP non-goals; recruiter features only in Stage 4 | Roadmap reviews |
| P24 | **CV Rush Level or stats misread as skill or seniority.** | Med | High | "CV Rush Level" wording; stats with sample size and "gameplay statistics, not a certification"; never "X% good at" | Feedback; social mentions |
| P25 | **Recruitment use is regulated** (Stages 3–4): employment law, anti-discrimination, automated decisions, AI regulation for recruitment. | Med (later) | High | A legal review as a hard gate before Stages 3–4; no automated decisions; explicit per-application consent | Legal sign-off |
| P26 | **Scraping of public profiles** by third parties. | Med | Med | Rate limits; no indexing of provisional profiles; minimal public data; no email ever public | Scraping detection |
| P27 | **Two-sided marketplace cold start** (Stage 3: no jobs without developers, no developers without jobs). | High (later) | Med | Build the developer side first (Stages 1–2); start jobs with a few partner companies | Active public profiles per category |

## 2. Abuse and cheating risks (game-design perspective)

**Assumption:** the attacker can read **all** the source code (frontend and backend), inspect and replay network traffic, script the browser, and create many anonymous identities. Integrity must rest on server-side state, runtime secrets and economics (**cheating should cost more than it is worth**), never on obscurity.

| # | Abuse | What it looks like | Design response | Residual risk |
|---|---|---|---|---|
| A1 | **Answer lookup from public content** | A script matches prompts against the repository | MVP pools live in the private database; the repository only has a fake sample pool; future community packs only feed practice | Low for ranked |
| A2 | **Harvesting or memorizing small pools** by replaying (correct/incorrect feedback reveals answers by elimination) | Many runs recording questions and outcomes | 3 ranked runs per day; ranked/practice partitions (practice answers never come from the ranked partition); unseen-first selection; asynchronous pool refills on exposure; no ranked answer keys revealed | Medium in the MVP (pools of ~20); decreases as pools grow |
| A3 | **Sharing answers the same day** | A chat group posts today's answers | Equivalent but different content per run; shuffled options; the job's open-book facts give no advantage | Low–Medium |
| A4 | **Many identities** (clear cookies to get more attempts) | Many anonymous players from the same network or device | Rate limits; bot protection before ranked runs; verification heuristics; optional login (V1) to claim champion status | Medium in the MVP |
| A5 | **Automation** (a bot plays the run) | Inhumanly fast or consistent answers; perfect ATS | Plausibility floors on timing; ATS input checks; human-verification challenge on suspicion; manual review of champions | Medium. Sophisticated automation with human-like timing is hard to detect |
| A6 | **Smurfing** (declaring a lower seniority) | A Senior competes in a Junior board | Categories (no advantage against higher bands); results publicly labeled "competing as Junior…" next to name and LinkedIn; daily lock; category cooldown; "misrepresented profile" reports; audited exclusion from titles | Medium: cannot be verified, only made unattractive and visible |
| A6b | **Category hopping** | Playing several categories in a day, or jumping into empty ones for free titles | Daily ranked profile lock; 7-day category cooldown; minimum field of 3 for titles | Low |
| A6c | **Stack shopping** | Choosing the technology with the easiest questions | Calibration per technology and level; a bounded stack share; topic boundaries; the daily lock | Low |
| A6d | **Profile tampering mid-run** | The client sends "Junior" after receiving Senior questions | The profile snapshot is frozen server-side; later requests carry no profile; profile fields sent later are ignored and logged | None |
| A7 | **Refresh or re-roll** (reload to get a different question) | Reloading when a hard question appears | Server state persists; a question is fixed once served; its deadline keeps running; abandoning still consumes the attempt | None |
| A8 | **Timer exploits** (pause, hidden tab, slowed clock) | Gaining reading time | Server clock only; no pause in ranked; client timers are only a display | None |
| A9 | **Never reporting crashes or obstacle hits** | Perfect CV Health without skill | Client-reported events carry a **bounded** weight; V1 target: the server recomputes collisions from the input log | Low (bounded) |
| A10 | **Exploiting latency** ("lag" excuses) | Claiming network delays | Server timestamps; a small fixed tolerance; speed points awarded in coarse buckets | Low |
| A11 | **Language arbitrage** (one translation is easier or leaks the answer) | Players switch language for an advantage | Translation parity review; per-locale stats; ranked questions require both locales validated | Low |
| A12 | **Device arbitrage** | Keyboard players gain an advantage | Device-neutral scoring: answers by tap or key are equivalent; obstacles carry little weight | Low |
| A13 | **Offensive names or impersonation** on the leaderboard | Slurs, famous people's names, someone else's LinkedIn | Moderation, reports, hiding, audit | Medium (moderation load) |
| A14 | **Gaming Candidate of the Week** by winning on easier days | — | The same category blueprint every day; only themed families vary; a field-relative index if data shows a bias | Low |
| A15 | **Sponsors seeking advantage** | Pressure to promote candidates or alter questions | Written integrity rules; sponsors have no access to ranking or content pipelines | Low |
| A16 | **Spamming question reports** to get good questions removed | Coordinated reports | Reports never remove anything automatically; they feed a review queue | Low |
| A17 | **XP farming** (scripts or endless runs to inflate levels) | Many runs per day, inhuman timings | XP only from server results; diminishing returns after 10 runs/day; voided XP on failed verification; rate limits and bot protection | Medium; matters more once levels are public |
| A18 | **Identity squatting** (typing someone else's email or LinkedIn) | A provisional profile with a famous person's LinkedIn | Unverified status; no merges on unverified data; reports; provisional public pages not indexed; the real owner can decline matches when claiming | Low–Medium |
| A19 | **Claim hijacking** (taking over someone's history) | Claiming a profile without owning its identifiers | Claims require proof of control (verified email, device credential, management link); audited merges | Low |

What we intentionally **do not** publish: verification thresholds, plausibility floors, and the competitive pool's answer keys. Everything else about how scoring and ranking work is public.

## 3. Assumptions to validate with real players

1. Players read a job posting carefully enough for memory questions to feel fair (or at least funny).
2. An ATS game over is iconic rather than frustrating (target first-run ATS pass rate around 80%).
3. 3 ranked attempts per day feel right.
4. Players opt in to public profiles at a meaningful rate (hypothesis: ≥ 30% of delivered ranked runs).
5. People share results on LinkedIn rather than only on private chats.
6. Players understand and accept category boards, and don't miss a single global champion.
7. The 9 launch categories gather enough runs per day for meaningful boards (otherwise: fewer, broader categories).
8. Developers accept giving an email or LinkedIn before the first run.
9. XP and levels make developers come back (D7 and 4-week retention).
10. AI-generated pools are good enough that reports stay below 1%.
