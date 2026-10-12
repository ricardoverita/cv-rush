# ATS Scan

> Part 1 · Product & Game Design · Status: **Draft for review** · MVP

## Fantasy

The **ATS 9000**: a huge, humming machine with a scanner eye and a paper shredder. Every runner is pulled onto its conveyor belt. Keywords fly toward you, and the machine only cares whether your CV matches. It is satire of keyword-based filtering, and the most visual, arcade-like moment of the run.

Feeling: absurdity, frantic fun, "beat the machine".

## Trigger

- After Segment 2, in both modes. Always on.

## Presentation

- The track turns into a 4-lane conveyor belt inside the machine.
- **Keyword tokens** come down the lanes: technology names and buzzwords ("Synergy", "Rockstar", "Ninja", "10x").
- A large **ATS MATCH** meter (for example "82%") with a visible **threshold marker** (70%).
- At the end, a stamp: **ATS APPROVED** or **APPLICATION REJECTED** (the CV goes through the shredder, in a comic way).

## Mechanic

- Move between lanes to **collect relevant keywords** and **avoid irrelevant ones**.
- **Relevant** = keywords in the run's job posting (stack and key requirements), including catalog aliases ("Postgres" counts as PostgreSQL).
  - Casual: the job was generated from the player's profile, so job keywords overlap with the player's stack.
  - Ranked: only the Daily Job's keywords count. The player's profile is irrelevant.
- **Irrelevant** = other technologies and buzzword traps.
- **Composition (initial):** 18 tokens in ~25 s, of which 11 are relevant and 7 irrelevant. Speed ramps up slightly. Generation guarantees that every relevant token is reachable (no two must-collect tokens in far-apart lanes at the same moment).

## Match formula (initial, product level)

```
match = clamp( recruiterBonus + 100 × relevantCollected / relevantTotal − 8 × irrelevantCollected , 0, 100 )
```

- `recruiterBonus` is +3% per correct Recruiter Screening answer (max +9%), which links the stages: a good screening helps you pass the ATS.
- **Threshold: 70%.** The same in both modes and for every seniority.
- Example: 9 of 11 relevant (81.8) + 6 bonus − 1 irrelevant (8) = **79.8% → APPROVED**.

The final formula is defined in the Scoring Engine (Part 2).

## Resolution and effects

| Outcome | Effects |
|---|---|
| Each irrelevant keyword collected | `CV_DAMAGE` 5 (max −20 per scan) |
| Match ≥ threshold | `ATS APPROVED`, ATS score component proportional to match, small `SPEED_BOOST` |
| Match < threshold | `APPLICATION_REJECTED` with reason `ATS_FAILED`. **Game over.** |

The brief suggested −10 CV per ATS mistake. This design uses −5 per irrelevant keyword with a cap, because a scan can include several mistakes and the match penalty already punishes them; −10 each would make the ATS end most runs through CV damage alone.

## Integrity

- The server **generates the token stream** at the start of the scan (from the run's seed) and sends it then. Knowing the stream gives little advantage: it is a reflex task, and the relevant keywords are in the job posting anyway.
- The client reports the player's **inputs**. The MVP validates token IDs, timing windows, duplicates and physical plausibility (no collecting tokens in two lanes at once). The **target** (V1) is for the server to **re-simulate the scan from the input log** and compute pickups itself.
- A perfect script can still reach 100%. That is why the ATS weight in the score is **bounded (~10%)** and the ATS acts mainly as a gate. Perfect ATS runs combined with inhumanly fast answers are flagged for verification.

## Bots

Bots run their own scans by archetype (the "Keyword Stuffer" excels here). **2–4 bots are rejected** with the shredder animation, the biggest elimination moment of the run.

## Balance targets

- **First-run pass rate around 80%**; overall pass rate around 85%.
- If the ATS causes more than 30% of all failures for first-time players, tune the composition, speed or threshold.

## Accessibility

- Tokens carry text and an icon; relevance is never signaled by color. The player must judge relevance, which is the skill.
- Reduced motion: no camera shake, simplified shredder animation. Token speed is unchanged (fairness).
- Tap a lane directly, or swipe, or use the keys.

## Telemetry

`ats_started`, `ats_passed` / `ats_failed` (match bucket, relevant and irrelevant counts), `ats_input_anomaly` (internal).

## Tunables

Token count, relevant ratio, speed curve, recruiter bonus per answer, penalty per irrelevant token, damage per irrelevant token, damage cap, threshold, bots eliminated.
