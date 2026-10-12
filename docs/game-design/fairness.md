# Fairness strategy

> Part 1 · Product & Game Design · Status: **Draft for review (revision 3)**
>
> The *why* is in [competitive identity](../product/competitive-identity.md) and [game modes](../product/game-modes.md). This document explains **how ranked fairness holds within a category** and how we monitor it.

## 1. What "fair" means here

> Two players **in the same category** (track × band), with the same skill, on the same day, should get approximately the same score, whatever their device, their language, or the technologies they chose. **Players in different categories are not compared.**

Practice runs optimize for personalization. Fairness there means "no frustrating unfairness", not comparability.

## 2. Sources of unfairness

| Source | Example |
|---|---|
| Self-declared seniority | A Senior declares Junior to win the Junior board ("smurfing") |
| Category hopping | Playing several categories in a day to collect titles; hopping into empty categories |
| Stack choice | One technology's questions are easier than another's at the same nominal level |
| Stack coverage | Some technologies have fewer or no ranked questions |
| Content variance | One player gets an easier variant of a shared family |
| Randomness | Lucky ATS streams or obstacle layouts |
| Latency | A player far from the server loses answer-speed points |
| Device | Keyboard vs touch |
| Language | One translation is easier or ambiguous |
| Accessibility | Settings change difficulty |
| Attempts | Unlimited retries reward grinding |
| Cross-day | One Daily Company theme is easier than another (Candidate of the Week) |
| Cross-category | Comparing a Junior Frontend score with a Senior+ Backend score |

### 2.1 Controls at a glance

| Source | Control |
|---|---|
| Self-declared seniority, category hopping | Categories, daily ranked profile lock, category cooldown, minimum field for titles, public context (section 3) |
| Stack choice and coverage | Calibration per technology and level; bounded stack weight; coverage fallback; topic boundaries (section 4) |
| Content variance | Category blueprint; shared daily families of calibrated equivalent variants (section 4) |
| Randomness | A randomness budget; constrained generators; the same daily bot field per category (section 5) |
| Client-reported events (obstacles, pickups, ATS movement) | **Bounded** weight; server re-simulation from input logs as the V1 target |
| Latency, device, language, accessibility | Sections 6–9 |
| Attempts | 3 per day, best counts |
| Cross-day, cross-category | Section 10 |

## 3. Smurfing and category hopping

**What categories already solve:** declaring a lower seniority no longer lets anyone beat players of a *higher* band. It only moves the player into a different competition.

**What remains:** a Senior who declares Junior can win the Junior board. We cannot verify seniority (neither can a CV, LinkedIn or a login). The design makes it **unattractive and visible** rather than impossible:

| Control | Effect |
|---|---|
| **The result always carries its context** | "#1 competing as Junior Frontend Developer" appears next to the name and LinkedIn. The leaderboard's reward is professional visibility, and misrepresentation is visible to the same audience. |
| **Daily ranked profile lock** | One category and one stack per player per UTC day |
| **Category cooldown** (proposal: 7 days) | No hopping between bands or tracks every day |
| **Minimum field for titles** (3 verified runs) | No free titles in empty categories |
| **Report: "Misrepresented profile"** | Community reports go to review; obvious cases (e.g. a linked profile showing 10+ years in a Junior board) can be excluded from titles by an audited admin action |
| **Attempts** (3 per day) | Limits farming |
| **Anonymous titles carry no showcase value** | An anonymous smurf gains nothing but a number |

Declaring a **higher** seniority is not an exploit: it means harder questions and stronger competitors.

Residual risk: accepted and monitored (e.g. score distributions per band; Junior boards dominated by near-perfect runs).

## 4. Content equivalence

> **MVP note (revision 3):** question pools are AI-generated, validated and cross-checked, with ~20 questions per context, and rankings run as **Season 0 (Beta)**. Shared slots draw **the same daily selection** of a pool for everyone in the category. The full family and calibration rules below are the **target** for curated content, applied progressively as data and curation grow.

### Shared daily families (H2 track fundamentals, H3 seniority, F1 scenario)

The same family for everyone in the category (or band) that day. To be eligible for ranked, a family must have:

1. **The same topic** at the same tag granularity (e.g. "API idempotency").
2. **The same declared difficulty** (one level on the 1–5 scale).
3. **The same format:** single choice, 4 options, comparable distractor structure.
4. **Similar length:** prompts within ±20% characters; options within the general limits.
5. **At least N variants** (initial: 6), so sharing a single answer is useless.
6. **Calibrated observed difficulty:** once a variant has enough attempts, its correct rate must stay within a tolerance of the family median (initial: ±15 percentage points). Outliers are **pulled from ranked and reviewed**, never auto-adjusted.
7. **Bilingual parity:** both translations validated, with the same option IDs and correct option.

### Stack families (H1, the stack part of F1)

Different players get different technologies at the **same difficulty level**. Extra requirements:

- **Calibration per technology and level:** the observed correct rate of a technology's level-*n* family must stay within a tolerance of the **band-wide target for level *n*** (initial targets: level 1 ≈ 75–85% correct, level 2 ≈ 65–75%, level 3 ≈ 55–65%, level 4 ≈ 45–55%, among players of that band). Families outside the range are excluded from ranked until fixed.
- **Bounded weight:** stack-influenced slots are at most ~35% of answer points (≈ 16% of the total score) in Senior+, and less in lower bands (see [game modes › bounded personalization](../product/game-modes.md#35-bounded-personalization)).
- **Coverage fallback:** without an eligible family for any of the player's technologies, the slot uses the track fundamentals pool at the same difficulty.
- **Topic boundaries:** never a technology outside the player's stack, track fundamentals or shared fundamentals.

### New content

New questions start in practice partitions, or in a **ranked preview** category, to gather calibration data before they count for titles. The exact mechanism is in Part 2.

### Job-derived questions

These are equivalent by construction: the same templates for everyone, applied to each player's own posting. Every fact is equally visible to its reader.

## 5. Randomness budget (ranked)

| Element | Randomized per run? | Constraint |
|---|---|---|
| Daily Company and theme | ❌ The same for everyone | — |
| Category Blueprint (slots, band difficulties, timers, ATS composition) | ❌ The same within the category | — |
| Shared family per slot (H2, H3, F1) | ❌ The same within the category (or band) that day | — |
| Variant within a family | ✅ | Family equivalence rules |
| Stack technology for H1 | ✅ Among the player's eligible technologies | Calibrated per technology and level |
| Job posting | ✅ Personal (from the snapshot) | Generator quality rules |
| Job-derived question (which fact) | ✅ | All facts equally visible |
| Option order | ✅ | Correct position balanced across the run |
| Question order within a stage | ✅ | Only among equal-difficulty slots |
| ATS stream | ✅ | Fixed counts, density, reachability, maximum level-change demand |
| Obstacle layout | ✅ | Equivalent density; never during gates |
| Bot field | ❌ The same daily field per category | — |
| Seed | ✅ Per run, server-side only | Never sent to the client |

## 6. Latency

- Answer times are measured **by the server**, from the moment the content is sent to the moment the answer arrives.
- A small fixed tolerance (initial: 300 ms) is subtracted before bucketing; coarse speed buckets mean that 100–200 ms network differences rarely change points.
- The hosting region (Part 2) considers both Europe and the Americas; time windows are generous relative to typical latency.

## 7. Device

- Answering by **tapping a path sign** or **keys 1–4** is as fast as platforming into the path.
- Obstacle and pickup effects are bounded.
- Monitored: score distribution by device class per category.

## 8. Language

- Ranked questions are active only when **both** translations are validated.
- Monitored: correct rate by locale for the same question; gaps flag the question.

## 9. Accessibility

- Ranked timers are identical within a category and generous for comfortable reading.
- Reduced motion, color-independent cues and direct answer input change presentation and input methods only.
- "Relaxed timers" exist **only in practice runs**.

## 10. Cross-day and cross-category

- **Within a category, across days** (Candidate of the Week): the blueprint is identical every day; only themed families vary. Monitored, with the field-relative index as the fallback (see [leaderboards](../product/leaderboards.md#7-candidate-of-the-week-per-category--v1)).
- **Across categories:** **no comparison** in the MVP. The spotlight shows champions side by side, never ranked against each other. A normalized global view (percentile within category) is an experimental V1 option (see [leaderboards › global comparison](../product/leaderboards.md#3-global-comparison-alternatives)).

## 11. Monitoring

| Signal | What it would reveal |
|---|---|
| Correct-rate spread within a shared family | A variant is easier or harder than its siblings |
| Correct rate per technology and level within a band | A stack is easier than others |
| Score distribution by declared stack within a category | Stack shopping advantage |
| Score distribution per band (e.g. Junior boards full of near-perfect runs) | Smurfing |
| Category changes per player | Category hopping |
| Correct rate by locale | Translation issues |
| Score distribution by device class | Device advantage |
| Score distribution by Daily Company theme within a category | Cross-day bias |
| Score gain from attempt 1 → 3 | How much replaying helps |

Fairness reviews are manual and documented in the decision log or an ADR. Nothing is auto-adjusted in the MVP.
