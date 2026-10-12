# 01 · Product definition: how the concept evolved

> Case-study notes · Recorded 2026-10-12, during Part 1 (product and game design)

## Summary

The brief described one game. Analysing it surfaced tensions that turned it into **two modes**, a **two-pool content model**, and a scoring design that only trusts what the server can verify. These notes record each turning point while it is fresh: the problem, the decision, and why it might interest other developers.

## Turning points

### 1. An open-source question bank breaks secrecy-based anti-cheat

- **Problem:** the brief rightly insisted that questions must not be downloaded to the browser in advance. But the project is open source. If the question bank with its answers lives in the public repository, anyone can build a lookup table. Hiding questions from DevTools protects nothing if they are on GitHub.
- **Insight:** keeping questions server-side is necessary but not sufficient. What matters is whether the **answer key** is secret, and in an open-source project the only secrets are the ones outside the repository.
- **Decision:** split content into **Community Question Packs** (open, for casual play, learning and contributors) and a **Competitive Question Pool** (private, for ranked), plus **job-derived** and **template** questions whose answers come from per-run data.
- **Twist:** retired competitive questions **graduate** into the open packs, so the private pool feeds the public bank over time.
- **Article angle:** "Security can't depend on code being secret, but it can depend on *data* being secret. Know which is which."

### 2. Self-declared seniority is an exploit

- **Problem:** the brief wanted difficulty adapted to seniority *and* a single fair ranking. Seniority is self-declared. If juniors get easier questions, everyone declares Trainee; if seniors get multipliers, everyone declares Principal.
- **Decision:** two modes. **Casual** adapts everything to the profile. **Ranked (Daily Challenge)** gives everyone the same job, the same blueprint and equivalent questions; the profile is identity only.
- **Framing that made it click:** *"In ranked, the job sets the bar, not your title."* That is also how real hiring works.
- **Article angle:** personalization vs fairness is a real product trade-off, and separating modes is often cleaner than balancing formulas.

### 3. The browser is an untrusted terminal, even for the fun parts

- **Problem:** the runner (dodging obstacles, collecting ATS keywords) happens in the browser. A cheater can simply never report a collision.
- **Decision:** classify every score input as **verifiable** (answers, server-measured timings, position against server-simulated bots) or **client-reported** (collisions, pickups, ATS movement). Client-reported inputs have **bounded** weight. Target for V1: the server re-simulates mechanics from input logs.
- **Related decision:** **race time is computed by the server**, not measured by the client.
- **Article angle:** "server-authoritative" is not all-or-nothing; it's a weighting decision.

### 4. Memory questions are open-book

- **Problem:** "memorize the job posting" can be defeated with a screenshot.
- **Decision:** accept it. Memory questions test *reading and understanding*, carry modest weight, and have short windows. Their logic can be public because the answers are in the posting the player just read.

### 5. "237 candidates applied" can be true

- **Idea:** in ranked, everyone applies to the same Daily Job, so the lobby can show the **real number of players** who started today's challenge. For honesty, small numbers are replaced by "Be one of the first candidates today". Never fake activity.

### 6. Comparing champions across days

- **Problem:** Candidate of the Week compares Daily Champions from different jobs.
- **Decision (MVP):** make days comparable by construction (the same blueprint, the same Mid–Senior level, the same maximum score) and use the raw score. Record daily distributions; switch to a field-relative index if the data shows bias.

### 7. Salary negotiation as a graded question first

- The full Salary Negotiation stage would stretch the 2–5 minute budget. The MVP keeps the joke and the lesson as a **graded** recruiter question (aligned, undersell, vague, out of range). The stage moves to V1 behind a feature flag.

### 8. The real play context is LinkedIn's in-app browser

- Most traffic will likely come from LinkedIn posts opened on phones. That pushed **portrait-first**, tap-to-answer, audio off by default, fast first load, and graceful degradation when storage is restricted.

### 9. No negative points

- The brief suggested "score −" for wrong answers. We replaced it with 0 points + a broken streak + CV damage + a slowdown: the mistake is felt in the world, and totals never go negative.

### 10. Improving the brief's own examples

- "Which hook would you use to manage local state? useState / useDocker / useSQL / useCache" became a question with plausible distractors and a single unambiguous answer. "Manage local state" also allows `useReducer`.
- "Which technology would you use to decouple async processes? Kafka / CSS / LocalStorage / FTP" was too trivial for the Senior level it targeted. It became a replay-and-fan-out scenario.

## Alternatives discarded (Part 1)

- One ranking with seniority-based difficulty (exploitable).
- Seniority multipliers (exploitable the other way).
- Seniority leagues (unverifiable eligibility; postponed).
- The same questions for everyone (shared in minutes).
- A ranked-only product (loses personalization and learning).
- Unlimited ranked attempts (grinding, harvesting).

## Predictions to check after launch

These are written down now so the "lessons learned" chapter can be honest:

1. An ATS game over will feel iconic, not frustrating (first-run pass rate ~80%).
2. 3 ranked attempts per day is the right number.
3. Juniors will still play ranked despite the Mid–Senior bar.
4. ≥ 30% of delivered ranked runs will opt into a public profile.
5. Reading questions while running on a phone will work with slow motion and 140-character prompts.
6. Runs will land at 2.5–4 minutes.
7. Most traffic will come from LinkedIn on mobile.

## Open questions handed to the maintainer for review

See [game modes › open questions](../product/game-modes.md#7-open-questions-for-review) and the "Proposed" entries in the [decision log](decision-log.md).
