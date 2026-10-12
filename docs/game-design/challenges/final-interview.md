# Final Interview

> Part 1 · Product & Game Design · Status: **Draft for review** · MVP

## Fantasy

The last round. The company HQ fills the horizon; a small interview panel waits at the entrance. Only a few candidates are left. One question decides who sprints to the door with momentum.

Feeling: climax.

## Trigger

- After Segment 4, in both modes.

## Presentation

- The camera frames the HQ entrance; the remaining runners (about 3–5 including the player) slow down in front of the panel.
- One gate with a scenario prompt and four doors.
- A dramatic beat: a short pause before the result.

## Content (slot)

| Slot | Ranked | Casual | Window |
|---|---|---|---|
| F1 | **Mixed** question, difficulty 4: combines the job context (memory) with the stack and architecture | Mixed, at the top of the seniority band | 20 s |

A mixed question references the job posting, so it rewards both reading and knowledge. Example for a job mentioning event-driven services and Redis caching:

> **EN:** At this company, checkout latency spikes when the product cache expires under peak load. What should you try first?
> A) Stagger expirations and refresh hot keys ahead of expiry ✅ · B) Disable the cache during peaks · C) Double the database instance size · D) Move the cache into each browser's LocalStorage

Sources: competitive pool (ranked), community packs (casual), or **scenario templates** that inject facts from the job into an authored scenario.

## Resolution and effects

| Outcome | Score | CV Health | Speed |
|---|---|---|---|
| Correct | Highest slot points + speed bucket | — | **`FINAL_BOOST`** (large sprint boost) |
| Incorrect | 0; streak broken | `CV_DAMAGE` 25 | No boost |
| Timeout | Same as incorrect | `CV_DAMAGE` 25 | No boost |

If CV Health is still above 0, the run proceeds to the **final sprint**. Whoever reaches the reception first delivers first. The player's **final position** is computed by the server from the player's race time and the bots' simulated times (see [bots](../bots.md#5-position)).

## Delivery

- The runner hands the CV over at reception: **APPLICATION DELIVERED**.
- Then the results screen: race time, Recruiter x/3, ATS %, Technical x/4 (H1–H3 + F1), CV Health, position, score.

## Telemetry

`final_interview_started`, `question_answered`, `game_finished` (outcome, position, duration bucket).

## Tunables

Window, damage, Final Boost magnitude and duration, final sprint length.
