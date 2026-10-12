# Product risks and abuse risks

> Part 1 · Product & Game Design · Status: **Draft for review**
>
> This document covers risks from a **product and game-design** perspective. The technical threat model and anti-cheat design come in Part 2 (`docs/security/`, `docs/anti-cheat/`).

Scales: **L**ikelihood and **I**mpact are rated Low / Med / High.

## 1. Product risks

| # | Risk | L | I | Mitigation | Signal to watch |
|---|---|---|---|---|---|
| P1 | **Content bottleneck.** 16 roles × many technologies × 7 seniorities × 2 languages is far more content than one maintainer can write. | High | High | 4 core tracks at launch; "early access" roles; job-derived and template questions; contributor-friendly packs; AI-assisted drafting with human review (authoring only) | Repeat-question rate per track; coverage gaps per technology |
| P2 | **"Quiz with a skin."** Questions feel bolted onto a runner and the race feels pointless. | Med | High | The race has real effects (boosts, damage, position); answers are lanes in the world; tight pacing; playtest early with a graphics-free slice and then with Phaser | Session completion; qualitative feedback; replay rate |
| P3 | **Reading while running is hard on mobile.** | High | High | Slow motion at gates; short prompts (≤ 140 chars) and options (≤ 40 chars); tap-to-answer; readable type sizes | Timeout rate per device; accuracy gap between mobile and desktop |
| P4 | **Runs creep beyond 5 minutes.** | Med | Med | A pacing budget per stage (see [run structure](../game-design/run-structure.md#1-run-anatomy-and-pacing)); timing tunables | p50/p90 run duration |
| P5 | **Ranked feels dry compared to casual.** | Med | Med | Daily job flavor, real applicant count, the champion chase, humor in dialogue | Ranked vs casual replay rate |
| P6 | **Cold start:** empty leaderboards look dead; "3 candidates applied" looks sad. | High | Med | Positive empty states ("Be the first champion today"); hide small applicant counts; launch with a community push; **never fake players or champions** | Daily ranked players |
| P7 | **Low participation on some tracks.** Rotating tracks split the audience. | Med | Med | The general part of ranked (memory, ATS, salary) is accessible to everyone; schedule adjustable as data | Ranked players per track |
| P8 | **LinkedIn in-app browser constraints:** performance, storage and cookie restrictions, audio. | High | High | Early test matrix on real devices; graceful degradation without storage; audio off by default | Error rate and load time by user agent |
| P9 | **Humor misfires:** offending recruiters or candidates; jokes that don't cross cultures. | Med | High | Humor guardrails ([vision](vision.md#4-tone-and-identity)); localized jokes; review by people from both language communities | Reports; social sentiment |
| P10 | **Perceived as an assessment** ("CV Rush says I'm bad at Kafka"). | Med | High | Explicit wording everywhere; "How ranking works" page; no "skill scores" in the MVP | Feedback; press or social mentions |
| P11 | **Privacy or legal issues:** public names, consent, minors, impersonation. | Med | High | Privacy by design ([privacy UX](public-profile-and-privacy.md)); legal review before launch; report and takedown | Reports; takedown requests |
| P12 | **Trademark or IP:** the "CV Rush" name may be taken; resemblance to existing games; LinkedIn brand usage. | Med | Med | Trademark search before investing in branding; brand decoupled from domain; original assets; follow LinkedIn's guidelines for share links | Legal notices |
| P13 | **Leaderboard used as advertising or spam** ("Hire me — buy crypto"). | High | Med | Name rules (no URLs or handles); moderation; LinkedIn only via username | Rejected-name rate; reports |
| P14 | **Outdated content:** technology moves fast. | High | Med | "Outdated" report reason; version-sensitive tags; review cadence; prefer concepts over version trivia | Outdated reports per pack |
| P15 | **Solo maintainer bandwidth; contributors don't show up.** | High | Med | Scope discipline; contribution ladder; good first issues; validation tooling that reviews for us | Time to merge content PRs; contributor count |
| P16 | **Hosting costs spike if it goes viral** (server-authoritative traffic, share images). | Med | Med | Cache share images; keep request counts per run low; cost alerts; sponsors later | Cost per 1,000 runs |
| P17 | **Accessibility vs real-time gameplay.** | Med | Med | Equivalent input methods; reduced motion; relaxed timers in casual; ranked timers generous enough for everyone | Accessibility feedback |
| P18 | **Juniors feel excluded from ranked** (fixed Mid–Senior bar). | Med | Med | A significant non-technical share of the score; casual as the learning space; revisit leagues later | Ranked participation by declared seniority |

## 2. Abuse and cheating risks (game-design perspective)

**Assumption:** the attacker can read **all** the source code (frontend and backend), inspect and replay network traffic, script the browser, and create many anonymous identities. Integrity must rest on server-side state, runtime secrets and economics (**cheating should cost more than it is worth**), never on obscurity.

| # | Abuse | What it looks like | Design response | Residual risk |
|---|---|---|---|---|
| A1 | **Answer lookup from public packs** | A script matches prompts against the open-source packs | Ranked uses the private competitive pool + job-derived + templates; public packs power casual only | Low for ranked |
| A2 | **Harvesting the competitive pool** by replaying (correct/incorrect feedback reveals answers by elimination) | Many runs, recording questions and outcomes | 3 attempts per day; large families of equivalent variants; no answer keys revealed in ranked; retire exposed questions; template variants | Medium. A determined group can slowly harvest; monitored by exposure counts |
| A3 | **Sharing answers the same day** | A chat group posts today's answers | Equivalent but different content per run; shuffled options; the job's open-book facts give no advantage | Low–Medium |
| A4 | **Many identities** (clear cookies to get more attempts) | Many anonymous players from the same network or device | Rate limits; bot protection before ranked runs; verification heuristics; optional login (V1) to claim champion status | Medium in the MVP |
| A5 | **Automation** (a bot plays the run) | Inhumanly fast or consistent answers; perfect ATS | Plausibility floors on timing; ATS input checks; human-verification challenge on suspicion; manual review of champions | Medium. Sophisticated automation with human-like timing is hard to detect |
| A6 | **Seniority manipulation** | Declaring Trainee or Principal to change difficulty | Not possible in ranked: the profile has no competitive effect | None |
| A7 | **Refresh or re-roll** (reload to get a different question) | Reloading when a hard question appears | Server state persists; a question is fixed once served; its deadline keeps running; abandoning still consumes the attempt | None |
| A8 | **Timer exploits** (pause, hidden tab, slowed clock) | Gaining reading time | Server clock only; no pause in ranked; client timers are only a display | None |
| A9 | **Never reporting crashes or obstacle hits** | Perfect CV Health without skill | Client-reported events carry a **bounded** weight; V1 target: the server recomputes collisions from the input log | Low (bounded) |
| A10 | **Exploiting latency** ("lag" excuses) | Claiming network delays | Server timestamps; a small fixed tolerance; speed points awarded in coarse buckets | Low |
| A11 | **Language arbitrage** (one translation is easier or leaks the answer) | Players switch language for an advantage | Translation parity review; per-locale stats; ranked questions require both locales validated | Low |
| A12 | **Device arbitrage** | Keyboard players gain an advantage | Device-neutral scoring: answers by tap or key are equivalent; obstacles carry little weight | Low |
| A13 | **Offensive names or impersonation** on the leaderboard | Slurs, famous people's names, someone else's LinkedIn | Moderation, reports, hiding, audit | Medium (moderation load) |
| A14 | **Gaming Candidate of the Week** by winning easy days | — | The same blueprint and level every day; switch to a field-relative index if data shows a bias | Low |
| A15 | **Sponsors seeking advantage** | Pressure to promote candidates or alter questions | Written integrity rules; sponsors have no access to ranking or content pipelines | Low |
| A16 | **Spamming question reports** to get good questions removed | Coordinated reports | Reports never remove anything automatically; they feed a review queue | Low |

What we intentionally **do not** publish: verification thresholds, plausibility floors, and the competitive pool's answer keys. Everything else about how scoring and ranking work is public.

## 3. Assumptions to validate with real players

1. Players read a job posting carefully enough for memory questions to feel fair (or at least funny).
2. An ATS game over is iconic rather than frustrating (target first-run ATS pass rate around 80%).
3. 3 ranked attempts per day feel right.
4. Players opt in to public profiles at a meaningful rate (hypothesis: ≥ 30% of delivered ranked runs).
5. People share results on LinkedIn rather than only on private chats.
6. The fixed Mid–Senior ranked bar does not drive juniors away from ranked.
