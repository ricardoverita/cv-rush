# 01 · Product definition: how the concept evolved

> Case-study notes · Recorded 2026-10-12, during Part 1 (product and game design)

## Summary

The brief described one game. Analysing it surfaced tensions that turned it into **two modes**, a **two-pool content model**, and a scoring design that only trusts what the server can verify. Then the maintainer's review **rejected the first ranked design** (one global daily job). That produced the central principle of the product: **compete as who you are**, with profile snapshots, categories (track × seniority band) and results that always carry their context (turning point 11). A second review (revision 3) **changed the north star**: CV Rush is no longer only a game with a daily leaderboard but the entry point to a **developer network**, which can later grow into jobs and recruiter features. The domain is now centered on the developer and their persistent progress (turning points 12–15). These notes record each turning point while it is fresh: the problem, the decision, and why it might interest other developers.

## Turning points

### 1. An open-source question bank breaks secrecy-based anti-cheat

- **Problem:** the brief rightly insisted that questions must not be downloaded to the browser in advance. But the project is open source. If the question bank with its answers lives in the public repository, anyone can build a lookup table. Hiding questions from DevTools protects nothing if they are on GitHub.
- **Insight:** keeping questions server-side is necessary but not sufficient. What matters is whether the **answer key** is secret, and in an open-source project the only secrets are the ones outside the repository.
- **Decision:** split content into **Community Question Packs** (open, for casual play, learning and contributors) and a **Competitive Question Pool** (private, for ranked), plus **job-derived** and **template** questions whose answers come from per-run data.
- **Twist:** retired competitive questions **graduate** into the open packs, so the private pool feeds the public bank over time.
- **Article angle:** "Security can't depend on code being secret, but it can depend on *data* being secret. Know which is which."

### 2. Self-declared seniority is an exploit (first answer, later revised)

- **Problem:** the brief wanted difficulty adapted to seniority *and* a fair ranking. Seniority is self-declared. If juniors get easier questions in one global ranking, everyone declares Trainee; if seniors get multipliers, everyone declares Principal.
- **First decision (revision 1):** two modes. Casual adapted to the profile; ranked gave everyone **the same global daily job**, with the profile as identity only ("the job sets the bar, not your title").
- **What happened next:** the maintainer rejected it. See turning point 11.

### 3. The browser is an untrusted terminal, even for the fun parts

- **Problem:** the runner (dodging obstacles, collecting ATS keywords) happens in the browser. A cheater can simply never report a collision.
- **Decision:** classify every score input as **verifiable** (answers, server-measured timings, position against server-simulated bots) or **client-reported** (collisions, pickups, ATS movement). Client-reported inputs have **bounded** weight. Target for V1: the server re-simulates mechanics from input logs.
- **Related decision:** **race time is computed by the server**, not measured by the client.
- **Article angle:** "server-authoritative" is not all-or-nothing; it's a weighting decision.

### 4. Memory questions are open-book

- **Problem:** "memorize the job posting" can be defeated with a screenshot.
- **Decision:** accept it. Memory questions test *reading and understanding*, carry modest weight, and have short windows. Their logic can be public because the answers are in the posting the player just read.

### 5. "237 candidates applied" can be true

- **Idea:** in ranked, every player applies to the same **Daily Company**, so the lobby can show the **real number of players** who applied today (in total and in their category). Small numbers are replaced by "Be one of the first candidates today". Never fake activity.

### 6. Comparing champions across days

- **Problem:** Candidate of the Week compares Daily Champions from different days.
- **Decision:** compare only within a category, where the blueprint is identical every day; raw score in the MVP; a field-relative index if the data shows bias.

### 7. Salary negotiation as a graded question first

- The full Salary Negotiation stage would stretch the 2–5 minute budget. The MVP keeps the joke and the lesson as a **graded** recruiter question (aligned, undersell, vague, out of range). The stage moves to V1 behind a feature flag.

### 8. The real play context is LinkedIn's in-app browser

- Most traffic will likely come from LinkedIn posts opened on phones. That pushed **portrait-first**, tap-to-answer, audio off by default, fast first load, and graceful degradation when storage is restricted.

### 9. No negative points

- The brief suggested "score −" for wrong answers. We replaced it with 0 points + a broken streak + CV damage + a slowdown: the mistake is felt in the world, and totals never go negative.

### 10. Improving the brief's own examples

- "Which hook would you use to manage local state? useState / useDocker / useSQL / useCache" became a question with plausible distractors and a single unambiguous answer. "Manage local state" also allows `useReducer`.
- "Which technology would you use to decouple async processes? Kafka / CSS / LocalStorage / FTP" was too trivial for the Senior level it targeted. It became a replay-and-fan-out scenario.

### 11. Revision: competing as who you are

- **Date:** 2026-10-12, during the review of Part 1.
- **What was wrong:** revision 1 solved fairness by making ranked **impersonal**: one global daily job, and the profile reduced to a label. The maintainer's verdict: Andrea (Junior Frontend) should never have to compete in a Senior Backend job just because that was the global challenge of the day. The original idea of the product is that anyone can **compete from their own professional profile**.
- **Lesson:** I had optimized for the *easiest* fairness (everyone identical) instead of the *right* fairness (comparable people compared with each other). Fairness doesn't require identical challenges, only **comparable challenges among comparable people**.
- **New design:**
  - **Profile-first:** name → seniority → role → stack, validated by the server and frozen into a **profile snapshot** per run. Every decision uses the snapshot; the client never says "who it is" again.
  - **Categories = track × seniority band** (Junior = Trainee + Junior; Mid; Senior+ = Senior, Lead, Staff, Principal). 9 official categories at launch, others activated progressively when content allows. No hundreds of empty boards.
  - **Daily Challenge = Daily Company + Category Blueprint + personal job:** everyone applies to the same fictional company that day (a shared story), each with a job built for their profile, inside a blueprint that keeps difficulty identical within the category.
  - **Bounded personalization:** the stack changes *which* topics some questions are about (≤ ~16% of the total score in Senior+), never *how hard* they are; stack families are calibrated per technology and level.
  - **Context everywhere:** "Ricardo scored 18,492 points competing as a Senior Fullstack Developer · Node.js · PHP · React". Results never appear without their context, and history keeps the context even if the profile changes.
  - **No global ranking in the MVP:** raw scores from different challenges aren't comparable. A cross-category spotlight shows champions side by side; a normalized global view may come later.
- **New problem it creates:** smurfing (a Senior declaring Junior) can't be verified. Mitigation by design: the reward of the leaderboard is visibility, and the result is publicly labeled "competing as Junior…" next to the name and LinkedIn. **The showcase is the reward, and the showcase is also the deterrent.** Plus a daily profile lock, a category cooldown, a minimum field for titles, and reports.
- **Cost:** about 2.5× more competitive content than revision 1, mitigated by content reuse across tracks and bands, coverage fallbacks and content-gated activation.
- **Article angle:** "My first fairness design was technically clean and wrong for the product." It's a good example of how a product principle ("compete as who you are") should drive the architecture, not the other way around.

### 12. Revision 3: from a game to a developer network

- **Date:** 2026-10-12, second review of Part 1.
- **What changed:** the maintainer reframed the product: *Game → Developer Network → Jobs → Recruiter Platform*. The game stays the entry point, with all its theme (CV, runner, recruiters, ATS, interviews, bots, humor), but the **asset is the persistent developer profile**: results, XP, levels, history, stats, visibility.
- **Domain consequence:** the center moves from `DailyChallenge` to `Developer → profile → game session → result → XP → history → rankings`, later `job → job challenge → application → recruiter`. The Daily Challenge becomes a **feature** (a Daily Company for ranked runs). Rankings become **projections** over results.
- **Key abstraction:** the **Job Challenge** is source-agnostic: a generated job today, a real company's posting tomorrow ("Play to Apply"). That single decision is what lets jobs arrive later without redesigning the game.
- **Article angle:** "Design the domain for the product you'll have in two years, build only the part you need now." The MVP still builds only the game, but its center of gravity is the developer.

### 13. Developer before account

- **Problem:** start fast (no accounts) *and* never lose progress when accounts arrive.
- **Decision:** a server-generated **Developer** owns everything from the first run; accounts **attach** later through a claim backed by proof of control (verified email, device credential, management link). Typed email and LinkedIn are stored as **unverified claim identifiers**, never as proof, never merged on, and the email is never public.
- **Article angle:** "Your user table is not your identity model." Separating the persistent actor from the authentication method makes "sign up later" trivial and safe.

### 14. Score, XP and level are different things, and so is seniority

- **Decision:** Game Score (one run), XP (append-only ledger), CV Rush Level (derived from XP), and declared seniority (never derived). "Junior Backend, CV Rush Level 30" is a valid and honest profile.
- **Ranked vs practice runs:** XP for every run, rankings only for the first 3 ranked runs a day, because pools of ~20 questions per context would make unlimited ranked runs a memorization contest.

### 15. AI-generated pools instead of 500 hand-written questions

- **Problem:** revision 2 required ~500 private, calibrated questions before launch, which is unrealistic for a first version.
- **Decision:** ~20 questions per context, **AI-generated with structured output**, validated server-side (schema, rules, dedupe, independent cross-check), stored, versioned and served just in time, with ranked and practice partitions. Generation happens ahead of time or asynchronously, never on the request path. Rankings run as **Season 0 (Beta)** while curated content gradually replaces AI content.
- **Side effect that helps security:** AI pools live in the private database, not in the public repository, so the "open-source answer key" problem from turning point 1 doesn't affect the MVP.
- **Article angle:** how to use an LLM as an offline content pipeline with validation, instead of a runtime dependency.

## Alternatives discarded (Part 1)

- One ranking with seniority-based difficulty (exploitable).
- One global daily job for everyone (revision 1; impersonal, rejected by the maintainer).
- A curated daily job per category (doesn't respect the individual stack; heavy curation).
- A raw global ranking across categories (compares different challenges).
- Dynamic pooling of small categories (titles would change meaning daily).
- The Daily Challenge as the center of the domain (revision 2; reframed as a feature in revision 3).
- Mandatory accounts in the MVP (too much friction) and anonymous-only play (progress would be lost).
- An LLM call per question at runtime (latency, cost, dependency).
- Unlimited ranked runs with small pools (memorization).
- Seniority multipliers (exploitable the other way).
- The same questions for everyone (shared in minutes).
- A ranked-only product (loses personalization and learning).
- Unlimited ranked attempts (grinding, harvesting).

## Predictions to check after launch

These are written down now so the "lessons learned" chapter can be honest:

1. An ATS game over will feel iconic, not frustrating (first-run pass rate ~80%).
2. 3 ranked attempts per day is the right number.
3. Players will understand category boards and won't miss a single global champion.
4. ≥ 30% of delivered ranked runs will opt into a public profile.
5. Reading questions while running on a phone will work with slow motion and 140-character prompts.
6. Runs will land at 2.5–4 minutes.
7. Most traffic will come from LinkedIn on mobile.
8. The 9 launch categories will each get enough daily runs to feel alive.
9. Smurfing will be rare, because results are publicly labeled with their context.
10. Most new developers will accept giving an email or LinkedIn before the first run.
11. XP and levels will measurably improve D7 and 4-week retention.
12. AI-generated, cross-checked questions will keep the report rate below 1%.

## Open questions handed to the maintainer for review

See [game modes › open questions](../product/game-modes.md#7-open-questions-for-review) and the "Proposed" entries in the [decision log](decision-log.md).
