# CV Health

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**

## 1. Concept

The runner physically carries their CV. **CV Health** (0–100%) is the run's health bar, and the most literal expression of the fantasy: **protect your CV**. At 0%, the application is rejected.

## 2. Visual states

The CV visibly degrades. Every state changes the **shape and texture**, not just the color, and always shows the percentage.

| CV Health | State | Visual |
|---|---|---|
| 100–76 | **Crisp** | Clean, flat sheet |
| 75–51 | **Coffee-stained** | Coffee ring, slight fold |
| 50–26 | **Crumpled** | Wrinkles, torn corner |
| 25–1 | **Barely holding** | Taped together, smoking edges, flapping |
| 0 | **Destroyed** | Shredded; rejection screen |

## 3. Damage and repair (initial values)

| Event | Change | Verifiable by the server? |
|---|---|---|
| Wrong or timed-out **Recruiter** answer | −10 | ✅ Yes |
| Salary answer `OUT_OF_RANGE` | −10 | ✅ Yes |
| Wrong or timed-out **Hiring Manager** answer | −15 | ✅ Yes |
| Wrong or timed-out **Final Interview** answer | −25 | ✅ Yes |
| Irrelevant keyword collected in the **ATS** | −5 each (max −20 per scan) | ⚠️ Input-based, bounded |
| **Obstacle** hit | −5 (max one hit per obstacle, max −20 per segment) | ⚠️ Client-reported, bounded |
| **Proofreading** pickup | +5 (max 100; only if spawned by the server) | ⚠️ Client-reported, bounded |

**Design goal:** a player who answers *every* question wrong does not reach the company. 3 × 10 + 3 × 15 + 25 = **100**. Wrong answers alone are enough to be rejected, while one or two mistakes are survivable.

## 4. At 0%: rejection

The run ends immediately with reason code `CV_DESTROYED`. The screen parodies a template rejection email:

| English | Español |
|---|---|
| **APPLICATION REJECTED** | **CANDIDATURA RECHAZADA** |
| Thank you for your interest in {company}. After careful consideration, we've decided to move forward with other candidates. We'll keep your CV on file for future opportunities.* | Gracias por tu interés en {company}. Tras una cuidadosa evaluación, hemos decidido continuar con otros candidatos. Guardaremos tu CV para futuras oportunidades.* |
| *We won't. | *No lo haremos. |
| **TRY AGAIN** | **INTENTAR DE NUEVO** |

It is followed by how far the player got, their stats so far, and the one-tap retry. ATS failures (`ATS_FAILED`) use a variant ("Your CV did not match our requirements"), also in a template-email voice.

## 5. CV Health and score

CV Health at delivery is a score component (~10%; see [scoring principles](scoring-principles.md)). Because some damage and repair events are client-reported, the CV Health component is **bounded**. A cheater who never reports a hit gains at most that bounded share.

## 6. Tunables

Initial health (100), damage per event type, damage caps, repair amount, state thresholds.
