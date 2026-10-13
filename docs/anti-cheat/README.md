# Anti-cheat design

> Part 2 · Status: **Draft for review** · Decisions: [ADR-003](../adr/ADR-003-server-authoritative-gameplay.md), [ADR-019](../adr/ADR-019-ranked-attempt-commitment.md)
>
> Game-design risks are in [risks](../product/risks.md#2-abuse-and-cheating-risks-game-design-perspective). This document is the technical design.

## 1. Assumptions

The attacker:

- has **read all the source code** (frontend and backend) and all these documents;
- can inspect, modify, replay and script every HTTP request;
- can run a headless browser or write a bot client;
- can create many provisional Developers (clear cookies, multiple browsers, IPs).

The attacker does **not** have: server secrets (seed secrets, HMAC keys, encryption keys), database contents (question pools and answer keys, daily schedules, other developers' data), or verification thresholds.

> **Integrity rests on server state, server secrets and private data, never on hiding code.** Thresholds are kept out of the repository not because the system depends on them being secret, but because publishing them would make tuning attacks trivial.

## 2. Controls that hold even with the source code public

| Control | What it prevents | Why publishing the code doesn't weaken it |
|---|---|---|
| **Server-authoritative outcomes** (correctness, score, time, position, XP, rank) | Forged results | No endpoint accepts outcomes; there's nothing to forge |
| **Answer keys never leave the server** (ranked) | Reading answers from DevTools or the network | They are data in a private database, not code |
| **Just-in-time questions** with ephemeral attempt IDs | Prefetching or enumerating questions | The next question doesn't exist until the previous one resolves |
| **State machine** with server-side transitions | Skipping stages, replaying stages | Transitions are checked against stored state |
| **Server-measured time** with deadlines and a fixed tolerance | Slowing the clock, pausing, "lag" excuses | The client clock is display-only |
| **Minimum segment durations** from the race model | Racing ahead instantly | Physics is enforced on the server |
| **Single-use answers** (conditional updates, idempotent replays) | Answering twice, brute-forcing options | Database constraints |
| **Ranked attempt commitment at apply** + unique attempt numbers | Re-rolling attempts by abandoning | Atomic allocation in the database |
| **Daily ranked profile lock** | Category hopping in a day | Stored server-side |
| **Seeds are server secrets** (per session; daily per category via HMAC) | Predicting questions, streams, bots | Knowing the algorithm doesn't reveal the secret |
| **ATS re-simulation** from the input log | Claiming impossible pickups | The server computes pickups itself |
| **Bounded client-reported events** | Ignoring collisions, inventing pickups | Capped effect; only server-spawned entities |
| **Question lifecycle** (competitive questions never in practice) | Learning ranked answers in practice | Enforced by queries |
| **Limited attempts + retirement by exposure + regeneration** | Harvesting pools over time | Cost grows with pool rotation |
| **Rate limits** (per Developer, credential, IP hash, endpoint) | Floods, scripted creation of Developers | Server-side counters |
| **Verification before titles** | Automated or anomalous champions | Thresholds are configuration, not code |

## 3. Ranked attempt commitment

See [GameSession §3](../architecture/07-game-session.md#3-ranked-attempt-commitment). Summary: committed atomically at **apply** (race start); nothing competitive (questions, ATS stream, bot outcomes) is revealed before; at most one open session and 10 uncommitted ranked creations per day; abandonment after apply always consumes the attempt.

## 4. Plausibility signals (recorded per run)

| Signal | Example of anomaly |
|---|---|
| Answer speed vs prompt length | Consistently below a human reading floor for the prompt and options length |
| Answer-time variance | Unnaturally constant response times across questions |
| Accuracy pattern | Perfect accuracy combined with sub-floor timings |
| ATS input log | Impossible level-change frequency, perfect anticipation of tokens |
| Checkpoint timing | Repeated `CHECKPOINT_TOO_EARLY` rejections |
| Client events | Dropped events (unspawned IDs, over caps) |
| Session pattern | Many Developers created from the same IP hash; many uncommitted ranked sessions |
| Device signals (coarse) | The user-agent family changes mid-session |

Signals produce **flags**, not automatic bans. They feed verification and moderation.

## 5. Verification (daily close)

For each category's top results, in rank order, until one passes:

1. Session complete and consistent (every transition legal, every question attempt resolved).
2. Every answer within its window; no duplicate submissions recorded.
3. No sub-floor timing pattern beyond the configured tolerance.
4. ATS log valid and consistent with the re-simulation.
5. Wall-clock duration ≥ the race model's minimum.
6. Attempt limits and the profile lock respected; the snapshot passed validation.
7. The display name passes moderation.

Failing results get `result_verifications.status = disqualified` with findings; XP from a disqualified run is voided by a compensating ledger entry. Manual review (CLI) can override, and every override is audited.

## 6. Human verification (optional)

A privacy-respecting challenge (configurable provider) may be required on **developer creation** and **ranked session creation** when risk signals exceed a threshold (`HUMAN_CHECK_REQUIRED`). It's off by default in development and controlled by the `humanCheck` flag.

## 7. Multiple identities

Provisional identities are cheap by design (low friction). Mitigations: rate limits per IP hash for Developer creation; ranked attempts per Developer; verification signals across Developers sharing an IP hash on the same day; titles require a verified run. Accounts (Stage 2) enable stronger rules for titles (e.g. champions must have a verified email).

## 8. What we deliberately don't do

- No client-side obfuscation as a "security" layer.
- No invasive device fingerprinting.
- No trust in anything computed by the client.
