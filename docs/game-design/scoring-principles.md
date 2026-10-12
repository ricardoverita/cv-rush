# Scoring principles (product level)

> Part 1 · Product & Game Design · Status: **Draft for review (revision 3)**
>
> This document defines **what the score rewards and why**. The exact formula, its configuration and its versioning are designed in Part 2 (Scoring Engine + ADR "score calculation server-side").

## 1. Principles

1. **One central scoring module.** Score logic never lives in UI components or game scenes.
2. **The server computes everything.** The client never sends a score, time, position or correctness. It sends actions.
3. **Explainable.** Every result has a breakdown the player can read ("why did I get 18,492?"). No hidden factors.
4. **Comparable within a category.** Every ranked run of a day in the same category (track × band) uses the same blueprint, so the same performance yields approximately the same score. Scores from **different categories are not compared**.
5. **Verifiable signals weigh most.** Components the server can verify (answers, server-measured timings, position against simulated bots) carry most of the weight. Client-reported signals (obstacles, pickups, ATS movement) are **bounded**.
6. **Device-neutral and language-neutral.** No component favors keyboard over touch, or one language over another.
7. **Versioned.** Every run records the scoring version it was computed with, so old results stay explainable after rule changes.
8. **No negative totals.** Mistakes cost opportunity (0 points, a broken streak, CV damage, slowdown), not negative points.

## 2. Components and weight intent

Maximum score per run: **25,000** (initial).

| Component | Weight | Max | What it rewards | Verifiable |
|---|---|---|---|---|
| **Answers** | 45% | 11,250 | Correct answers, weighted by slot difficulty | ✅ |
| **Answer speed** | 15% | 3,750 | Answering correctly early in the window (server-measured, **bucketed**) | ✅ |
| **Final position** | 12% | 3,000 | Finishing ahead of the field | ✅ (server simulation) |
| **ATS match** | 10% | 2,500 | Match % at the end of the ATS Scan | ⚠️ input-based, bounded |
| **CV Health** | 10% | 2,500 | Health at delivery | ⚠️ partly client-reported, bounded |
| **Streak** | 8% | 2,000 | Longest run of consecutive correct answers | ✅ |

### Details (initial values)

- **Difficulty weights distribute points within a run; they do not inflate the total.** A difficulty-4 slot is worth twice a difficulty-2 slot, but the answers component always sums to 11,250 when everything is correct. So declaring a higher seniority never inflates a score, and ranked runs within a category share the same weights by construction.
- **Speed buckets** (correct answers only): answered within the first 25% of the window → 100%; within 50% → 75%; within 75% → 50%; later → 25%. Buckets absorb small latency differences.
- **Position:** #1 → 100%, #2 → 75%, #3 → 55%, #4 → 40%, #5 or lower → 25%.
- **Graded options** (salary): `ALIGNED` 100%, `UNDERSELL` and `VAGUE` 25%, `OUT_OF_RANGE` 0% of the slot's points.

## 3. Illustrative breakdown

A ranked run in **Fullstack · Senior+**: Recruiter 3/3, ATS 92%, Technical 3/4 (missed H3), CV Health 75%, finished #2. The result is presented with its context: *"scored 19,479 points competing as a Senior Fullstack Developer · Node.js · PHP · React"*.

| Component | Calculation (illustrative) | Points |
|---|---|---|
| Answers | Senior+ slot weights R1–R3 = 2 each, H1 = 3, H2 = 3, H3 = 4, F1 = 4 (20 units). Missed H3 → 16 / 20 × 11,250 | 9,000 |
| Answer speed | Average bucket 70% | 2,625 |
| Final position | #2 → 75% | 2,250 |
| ATS match | 92% | 2,300 |
| CV Health | 75% | 1,875 |
| Streak | Longest streak 5 of 7 | 1,429 |
| **Total** | | **19,479** |

## 4. Penalties

The brief suggested "score −" for wrong answers. This design replaces negative points with:

- **0 points** for the slot (lost opportunity);
- a **broken streak**;
- **CV damage** (which lowers the CV Health component and risks rejection);
- a **slowdown** (which can cost final position).

Reasons: totals never go negative, breakdowns stay readable, and the cost of a mistake is felt in the game world (the CV gets damaged, the runner slows down) rather than only in a number.

## 5. Failed runs

- Failed runs (`ATS_FAILED`, `CV_DESTROYED`) show the stats reached and a **partial score labeled "not ranked"**, which keeps the "one more try" motivation.
- Failed and abandoned runs are never ranked.

## 6. Tie-breakers (ranked)

1. Higher score
2. Higher accuracy (correct answers ÷ questions)
3. Lower race time
4. Earlier delivery timestamp

## 7. Transparency

The public **"How scoring works"** page (es/en) lists the components, their approximate weights, what improves each one, and what the score does **not** mean: it is not a measure of professional ability. It does **not** publish verification thresholds or anti-cheat heuristics.

## 8. Score and XP

The score measures **one run**; XP measures **progress over time**. XP is derived from the result (completion + score-based XP + bonuses) by the progression rules in [progression](progression.md#2-xp). Rankings use scores; levels use XP. In-run "+XP" popups after correct answers are feedback only; the authoritative XP comes with the result.

## 9. Tunables

Maximum score, component weights, slot difficulty weights, speed bucket boundaries, position table, graded option percentages, streak scaling. Changes to any of these create a **new scoring version**.
