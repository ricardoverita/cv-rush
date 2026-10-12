# Recruiter Screening

> Part 1 · Product & Game Design · Status: **Draft for review** · MVP

## Fantasy

The first call. A friendly, slightly overcaffeinated recruiter with a headset steps onto the track: "Hi {name}! Do you have 5 minutes?" The questions check whether you actually read the posting, and the recruiter's favorite topic: salary.

Feeling: quick judgment, light pressure, humor.

## Trigger

- After Segment 1, in both modes.
- Feature flags: the stage is always on; `salaryNegotiation` (V1) replaces slot R3 with the full stage.

## Presentation

- The race slows to screening pace. The recruiter walks alongside the field, with speech bubbles (localized lines).
- Three gates in sequence; each shows a prompt banner and four doors A–D, mirrored by answer buttons.
- After each answer, the recruiter reacts with a short line (correct: "Love it!"; wrong: "Hmm, interesting…"; timeout: "Hello? Are you still there?").

## Content (slots)

| Slot | Category | Source | Difficulty | Window |
|---|---|---|---|---|
| R1 | Job memory | Generated from the run's job posting | 2 | 10 s |
| R2 | Job memory or recruiter | Generated from the job posting | 2 | 10 s |
| R3 | Recruiter / salary (graded) | Salary template using the job's salary range | 2 | 10 s |

Casual: R1 or R2 can be replaced by a **humor question** (at most 1 per run, about 30% of runs; low stakes). Ranked: never.

### Example job-memory prompts

| English | Español |
|---|---|
| What salary range did the posting offer? | ¿Qué rango salarial ofrecía la vacante? |
| Which technology was **not** in the posting? | ¿Qué tecnología **no** aparecía en la vacante? |
| How many years of experience did they ask for? | ¿Cuántos años de experiencia pedían? |
| Which responsibility was mentioned? | ¿Qué responsabilidad mencionaba la oferta? |
| What was the work mode? | ¿Cuál era la modalidad de trabajo? |
| Where is the role based? | ¿Dónde está basado el puesto? |

Distractors come from plausible alternatives. For "which technology was **not** in the posting", the best distractors are technologies **the player selected in their stack** that the posting did *not* include: familiar to the player, so they must actually remember the posting.

### The salary question (R3, graded)

Example for a posting with **€50K–€60K**:

| Option | Grade | Recruiter reaction | Effects |
|---|---|---|---|
| €55K | `ALIGNED` (best) | "Perfect, that fits our band." | Full points, `ATS_BONUS`, small `SPEED_BOOST` |
| €30K | `UNDERSELL` | "Wow, great!" (too happy) | 25% of points, no damage, no ATS bonus |
| "Whatever you think is fair" | `VAGUE` | "Great, we'll go with the minimum then." | 25% of points, no damage, no ATS bonus |
| €80K | `OUT_OF_RANGE` | "That's… above our band." | 0 points, `CV_DAMAGE` 10, `SLOWDOWN` |

Generation: the aligned option is a value inside the range; undersell ≈ 60% of the minimum; out-of-range ≈ 130–140% of the maximum; amounts are rounded and formatted in the job's currency and the player's locale. Options are shuffled.

## Input

Steer into a door, tap an answer button, or press 1–4. See [gates](../run-structure.md#4-gates-how-questions-appear-in-the-world).

## Resolution and effects

| Outcome | Score | CV Health | Speed | Other |
|---|---|---|---|---|
| Correct | Points by slot difficulty + speed bucket | — | `SPEED_BOOST` (small) | `ATS_BONUS` +3% |
| Incorrect | 0 for the slot; breaks the streak | `CV_DAMAGE` 10 | `SLOWDOWN` | — |
| Timeout | Same as incorrect | `CV_DAMAGE` 10 | `SLOWDOWN` | — |
| Graded (R3) | As in the table above | As in the table above | As in the table above | — |

All values are tunables. Note that the brief suggested "score −" for wrong answers. This design uses **0 points + CV damage + a broken streak** instead, to avoid negative totals and confusing breakdowns; see [scoring principles](../scoring-principles.md#4-penalties).

## Bots

Each bot answers according to its memory skill and mistake probability (see [bots](../bots.md)). Bots who fail visibly stumble. After the stage, **1–2 bots are eliminated** ("We've decided to move forward with other candidates").

## Failure

The stage cannot end the run by itself, except through CV Health reaching 0.

## Telemetry (domain events)

`recruiter_challenge_started`, `question_answered` (slot, category, difficulty, correct or grade, response time bucket), `recruiter_challenge_completed`.

## Tunables

Window per question, damage per wrong answer, ATS bonus per correct answer, speed boost and slowdown magnitudes, humor probability (casual), number of bots eliminated, salary option generation ratios.
