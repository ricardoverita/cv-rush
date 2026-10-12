# Fairness strategy

> Part 1 · Product & Game Design · Status: **Draft for review**
>
> The *why* and the mode split are in [game modes](../product/game-modes.md). This document explains **how ranked fairness holds** and how we monitor it.

## 1. What "fair" means here

> Two players with the same skill, playing the same day's ranked challenge, on any device, in either language, should get approximately the same score, and **nothing they declare about themselves should change that**.

Casual mode optimizes for fun and personalization. Fairness there means "no frustrating unfairness", not comparability.

## 2. Sources of unfairness

| Source | Example |
|---|---|
| Self-declared data | Declaring Trainee to get easier questions |
| Content variance | One player gets an easy variant, another a hard one |
| Randomness | Lucky ATS streams, lucky bot fields |
| Latency | A player far from the server loses answer-speed points |
| Device | Keyboard vs touch; small screens |
| Language | One translation is easier or ambiguous |
| Accessibility | Reduced-motion or assistive settings change difficulty |
| Attempts | Unlimited retries reward grinding and luck |
| Cross-day | Monday's job is easier than Thursday's (weekly award) |

## 3. Ranked controls

| Source | Control |
|---|---|
| Self-declared data | The profile has **no input** into difficulty, content selection or score (see the [diagram](../product/game-modes.md#4-what-the-profile-affects)) |
| Content variance | A **Daily Blueprint** with fixed slots and difficulties; **question families** of calibrated equivalent variants |
| Randomness | A **randomness budget** (section 5): randomness only where it is fairness-neutral; constrained generators for ATS and obstacles; **one daily bot field** for everyone |
| Latency | Server-measured times with a small fixed tolerance; speed points in **coarse buckets** |
| Device | Equivalent inputs (tap, keys, steering); obstacles carry little weight; the same time windows |
| Language | Ranked questions must be validated in **both** locales; per-locale statistics |
| Accessibility | Accessibility options never change timers or content in ranked; reduced motion only changes presentation |
| Attempts | **3 ranked attempts per day**, best counts |
| Cross-day | The same blueprint, level and maximum every day; a field-relative index if data shows a bias (see [leaderboards](../product/leaderboards.md#5-candidate-of-the-week)) |
| Client-reported events | **Bounded** weight (obstacles, pickups, ATS movement) |

## 4. Content equivalence

A **question family** fills one blueprint slot. To be eligible for ranked, a family must satisfy:

1. **The same topic** (e.g. "Redis eviction and expiry"), at the same tag granularity.
2. **The same declared difficulty** (one level on the 1–5 scale).
3. **The same format:** single choice, 4 options, the same structure of distractors.
4. **Similar length:** prompts within ±20% characters; options within the general limits.
5. **At least N variants** (initial: 8) so that sharing a single answer is useless.
6. **Calibrated observed difficulty:** once a variant has enough attempts, its observed correct rate must stay within a tolerance of the family median (initial: ±15 percentage points). **Outliers are pulled from ranked** and reviewed. They are not adjusted automatically.
7. **Bilingual parity:** both translations validated, with the same option IDs and the same correct option.

New variants start in casual or in a **shadow** state (served in ranked only after calibration data exists, or flagged as "uncalibrated") to avoid surprising difficulty. The exact mechanism is in Part 2.

**Job-derived questions** are equivalent by construction: the same job, the same templates, different facts and distractors drawn from the same posting.

## 5. Randomness budget

| Element | Randomized per run? | Constraint |
|---|---|---|
| Daily Job | ❌ The same for all | — |
| Blueprint (stages, slots, difficulties, timers) | ❌ The same for all | — |
| Variant within a family | ✅ | Family equivalence rules |
| Job-derived question (which fact) | ✅ | All facts are equally visible in the posting |
| Option order | ✅ | Correct position balanced across a run |
| Question order within a stage | ✅ | Only among slots with equal difficulty |
| ATS stream | ✅ | Fixed counts, density and reachability; maximum lane-change demand |
| Obstacle layout | ✅ | Equivalent density per segment; never during gates |
| Bot field | ❌ The same daily field | — |
| Seed | ✅ Per run, server-side only | Never sent to the client |

## 6. Latency

- Answer times are measured **by the server**: from the moment the challenge content is sent to the moment the answer arrives.
- A small fixed tolerance (initial: 300 ms) is subtracted before bucketing.
- Coarse speed buckets mean a 100–200 ms network difference rarely changes points.
- Server region matters for a bilingual audience spanning Europe and the Americas. The hosting region choice (Part 2) considers both; time windows are generous relative to typical latency.

## 7. Device

- Answering by **tap** (mobile) or **keys 1–4** (desktop) is as fast as steering into a door.
- Obstacle and pickup effects are bounded, so steering skill matters little for ranked scores.
- Monitored: the ranked score distribution by device class. A persistent gap triggers a design review.

## 8. Language

- Ranked questions are active only when **both** translations are validated.
- Translators preserve technical meaning and keep option lengths comparable.
- Monitored: correct rate by locale for the same question. Significant gaps flag the question for review.

## 9. Accessibility

- Ranked timers are the same for everyone and generous for comfortable reading.
- Reduced motion, color-independent cues and direct answer input change presentation and input methods, never the content or the timing.
- "Relaxed timers" exist **only in casual**.

## 10. Monitoring

| Signal | What it would reveal |
|---|---|
| Correct-rate spread within a family | A variant is easier or harder than its siblings |
| Correct rate by locale | Translation issues |
| Score distribution by device class | Device advantage |
| Score distribution by daily track | Cross-day bias (Candidate of the Week) |
| Answer-speed distribution by region (coarse) | Latency disadvantage |
| Score gain from attempt 1 → 3 | How much grinding or memorizing helps |

Fairness reviews are manual and documented (decision log or ADR). Nothing is auto-adjusted in the MVP.
