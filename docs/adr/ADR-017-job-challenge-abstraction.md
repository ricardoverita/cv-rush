# ADR-017: Job Challenge as a source-agnostic abstraction

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

Today every run plays against a fictional job generated for the developer's profile (practice: a random company; ranked: the Daily Company). In Stage 3, companies will publish real jobs and developers will **Play to Apply**. The game, scoring, XP and history must not be redesigned for that.

## Decision

Every game session plays against a **`JobChallenge`** = `JobPosting` + `ChallengeBlueprint` + context, with `source ∈ {generated, daily, job_posting}`. Everything downstream (sessions, Question Engine, scoring, XP, history, stats) depends on the Job Challenge interface, not on its source. `companies.kind` (`fictional`, `real`) and `job_postings.origin` (`generated`, `published`) exist from day one.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Model the Daily Challenge as the core entity | The Daily Challenge is a feature; the model would need redesigning for real jobs |
| Add real jobs later as a separate game mode | Duplicates the pipeline; results wouldn't be comparable |

## Consequences

- Positive: Play to Apply becomes a new source plus an `Application` aggregate; the game is untouched.
- Negative: a small amount of generality today (a `source` field and a blueprint reference).

## Related

[Job Challenges](../architecture/08-job-challenges.md), [future evolution](../architecture/21-future-evolution.md).
