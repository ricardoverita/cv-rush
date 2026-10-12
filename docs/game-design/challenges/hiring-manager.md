# Hiring Manager

> Part 1 · Product & Game Design · Status: **Draft for review** · MVP

## Fantasy

The technical interview. A busy hiring manager with a laptop and a coffee steps in: "I've got 15 minutes, let's go." The track turns into a whiteboard zone. This is where knowledge matters most.

Feeling: focused pressure, competence.

## Trigger

- After Segment 3, only for runs that passed the ATS. Both modes.

## Presentation

- The race slows to screening pace; the background turns into whiteboards with doodled diagrams.
- Three gates; longer prompts are allowed (still ≤ 140 characters).
- The hiring manager reacts briefly ("Solid." / "Let's move on.").

## Content (slots)

| Slot | Content | Ranked (by band: Junior / Mid / Senior+) | Casual (by exact seniority) | Window |
|---|---|---|---|---|
| H1 | **Stack**: one of the player's technologies | Calibrated stack family at level 1 / 2 / 3 | The seniority's lower level | 15 s |
| H2 | **Role (track) fundamentals** | The category's shared daily family at level 2 / 3 / 3 | The seniority's middle level | 15 s |
| H3 | **Seniority**: situational, architecture, trade-offs | The band's shared daily family at level 2 / 3 / 4, themed by the Daily Company | The seniority's upper level; **Lead** gets a leadership situational question | 15 s |

Levels are defined in [question strategy](../../questions/question-strategy.md#4-difficulty-scale-and-seniority-bands). Topics always respect the player's **topic boundaries**: their stack, their track's fundamentals, shared fundamentals. A Senior Fullstack developer with Node.js, PHP and React may get a Node.js question in H1, an API-design question in H2 and a scaling trade-off in H3, and never a Swift question.

### Examples

**Senior Backend, Node.js + Kafka (difficulty 4):**

> **EN:** Order events must reach 3 independent services and be replayable after a bug fix. Which fits best?
> A) A Kafka topic with one consumer group per service ✅ · B) Redis Pub/Sub · C) A cron job polling the orders table · D) Synchronous REST calls to each service
>
> **ES:** Los eventos de pedidos deben llegar a 3 servicios independientes y poder reprocesarse tras corregir un bug. ¿Qué encaja mejor?
> A) Un topic de Kafka con un consumer group por servicio ✅ · B) Redis Pub/Sub · C) Un cron que consulta la tabla de pedidos · D) Llamadas REST síncronas a cada servicio

**Junior Frontend, React (difficulty 1):**

> Which hook returns a state value and a function to update it?
> A) `useState` ✅ · B) `useEffect` · C) `useMemo` · D) `useRef`

**Mid DevOps, Docker (difficulty 3):**

> Your image is 1.2 GB because it includes build tools. What's the most effective fix?
> A) A multi-stage build ✅ · B) More RAM on the CI runner · C) Compressing the image with gzip · D) Adding `.dockerignore` only

(Option D is a plausible partial answer. Distractors must be plausible; see the [style rules](../../questions/question-strategy.md#7-option-rules).)

## Resolution and effects

| Outcome | Score | CV Health | Speed | Other |
|---|---|---|---|---|
| Correct | Points by slot difficulty + speed bucket; streak continues | — | `SPEED_BOOST` | — |
| Incorrect | 0 for the slot; streak broken | `CV_DAMAGE` 15 | `SLOWDOWN` | — |
| Timeout | Same as incorrect | `CV_DAMAGE` 15 | `SLOWDOWN` | — |

## Bots

Bots answer according to technical skill vs slot difficulty. **1–2 bots are eliminated** after the stage, leaving roughly 3–5 runners including the player.

## Failure

Only through CV Health reaching 0.

## Telemetry

`hiring_manager_started`, `question_answered` (with technology IDs and topic tags), `hiring_manager_completed`.

## Tunables

Window, damage, boost and slowdown magnitudes, slot difficulty per mode and seniority, bots eliminated.
