# Progression: score, XP, levels, history and stats

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> Progression turns single runs into a **persistent developer profile**. All numbers are initial values (tunables); every value is computed by the server.

## 1. Four different things

| Concept | Scope | Example | Meaning |
|---|---|---|---|
| **Game Score** | One run | 18,492 points | How well this run went (see [scoring principles](scoring-principles.md)) |
| **XP** | Cumulative, per developer | 8,420 XP | How much the developer has played and achieved in CV Rush |
| **CV Rush Level** | Derived from XP | Level 17 | A progression milestone |
| **Seniority** | Declared by the developer | Senior | Their professional seniority |

> **CV Rush Level is not professional seniority.** A Junior Backend Developer can be CV Rush Level 30 because they play a lot. The UI always says "CV Rush Level 17", never just "Level 17" next to a job title, so the two are never confused.

## 2. XP

### Earning XP (initial rules)

XP and competitive score are **separate concepts**: the score ranks a run, XP rewards playing and improving over time. Practice is rewarded, but less than ranked, and farming is bounded.

| Source | Ranked run | Practice run |
|---|---|---|
| Delivered run | **100** + score ÷ 50 (max +500) | **50%** of the ranked amount |
| Failed run (`ATS_FAILED`, `CV_DESTROYED`) | **25** + partial score ÷ 50 | 50% of the ranked amount |
| Abandoned run | 0 | 0 |
| **Discovery bonus**: first time the developer answers a given question correctly | **+5 × difficulty level** (1–5) | The same |
| First delivered run of the UTC day (any type) | **+50** | — (counted once per day) |
| Daily Champion title (category) | **+250** | — |

Examples: a delivered ranked run with 18,000 points earns 100 + 360 = **460 XP** (+50 if it's the first of the day, + discovery bonuses). The same performance in practice earns **230 XP** + discovery bonuses.

### Anti-farming (simple, from day one)

The goal is to make "repeat an easy question 10,000 times and become Level 100" impossible, without designing a complex economy:

| Mechanism | Rule (initial) | What it prevents |
|---|---|---|
| **Reduced practice XP** | Practice = 50% of ranked XP | Unlimited practice outpacing competitive play |
| **Discovery bonus only once** | A question's bonus is paid only the first time it's answered correctly | Repeating known (easy) questions for XP |
| **Diminishing returns** | After the 10th run in a UTC day, run XP × 0.25 | Marathon grinding |
| **Daily practice cap** | At most **1,000 practice XP** per UTC day | Unbounded farming; level growth stays tied to activity over **time** |
| **Server-only XP** | XP comes only from server-computed results; the client never sends XP | Forged XP |
| **Voiding** | Runs that fail verification get a compensating ledger entry (audited) | Automated or tampered runs |
| **Rate limits and bot protection** | On starting runs | Scripted farming |

A difficulty multiplier on run XP was considered and **rejected**: in practice, difficulty follows the declared seniority, so a multiplier would reward declaring a higher seniority. Difficulty is rewarded through the discovery bonus instead, which is bounded by the number of distinct questions.

With these rules, the maximum XP per day is bounded (three ranked runs + capped practice + bonuses ≈ 3,000–3,500 XP), so very high levels require weeks or months of regular play, which is what a level should mean.

### The XP ledger

- XP is recorded as an **append-only ledger**: one entry per award, with its source (a game result, a title, a correction), amount, timestamp and season.
- **Idempotent:** a result awards XP exactly once, which matters for retries, merges and account claims.
- Totals and levels are **derived** from the ledger and can always be recomputed.
- During a run, "+XP" popups after correct answers are **feedback only**. The authoritative XP is awarded with the result.

## 3. Levels

**XP needed to go from level *k* to *k + 1* = 300 + 25·*k*** (Level 1 at 0 XP).

| Level | Total XP required | Typical runs (~460 XP) |
|---|---|---|
| 5 | 1,450 | ~3 |
| 10 | 3,825 | ~8 |
| 17 | 8,200 | ~18 |
| 23 | 12,925 | ~28 |
| 30 | 19,575 | ~43 |
| 50 | 45,325 | ~99 |

Example: **8,420 XP → CV Rush Level 17** (Level 18 at 8,925 XP).

- Level-ups are celebrated on the results screen ("Level up! CV Rush Level 18").
- Levels have no gameplay advantage: no easier questions, no score multiplier. Progression never buys competitive advantage.
- Level names or cosmetic rewards (badges, CV skins) are later additions.

### Seasons (later)

- Every result and XP entry is tagged with a season from day one (**Season 0 · Beta** at launch).
- When Seasons arrive, the profile can show **Lifetime XP / Level** and **Season XP / rank** side by side. Competitive rankings reset per season; lifetime progression and history never reset.

## 4. History

Every run is kept in the developer's history, with its frozen context:

```
Game #42 · Ranked · Season 0
Senior Fullstack Developer · Node.js · PHP · React
Company: Kestrel Pay (Daily Challenge)
Result: Delivered · 17,980 pts · #4 of 9 runners
Recruiter 3/3 · ATS 88% · Technical 3/4 · CV Health 70%
+460 XP
Played: 2026-10-12
```

- History is **private** in the MVP (the developer's own profile page). With a public developer page (Stage 2), the developer chooses whether recent games are shown.
- History never changes when the profile changes: each entry shows the context it was played with.
- Practice and ranked runs are both kept, labeled.

## 5. Skill stats (gameplay statistics)

Per developer, aggregated from answered questions:

```
Node.js challenges · 84 answers · 69 correct · 82% accuracy
Redis challenges   · 34 answers · 26 correct · 76% accuracy
APIs               · 22 answers · 20 correct · 91% accuracy
```

Rules:

- **Wording:** always "Redis challenges: 76% accuracy (34 answers)". Never "76% good at Redis", never a "skill level", never a comparison with professional ability. A footnote: "CV Rush gameplay statistics, not a certification."
- **Minimum sample:** a technology or topic stat is shown only after ≥ 10 answers, and labeled with its sample size.
- **Difficulty context:** later versions can split stats by difficulty level, since 80% at level 1 and 80% at level 4 are different things.
- **Private by default.** Shown publicly only if the developer enables them on their public page (Stage 2).
- They are **projections** rebuilt from per-question attempts, so they can evolve without losing data.

## 6. Last activity

- `lastActiveAt` is updated when the developer starts or finishes a run (not on page views).
- Publicly, it is shown **coarsely**: "Active today", "Active this week", "Active 3 weeks ago", "Active 2 months ago". Exact timestamps are never public.
- **Last active ≠ looking for a job.** A separate, voluntary **Open to Work** status may come in Stage 2.

## 7. Where progression appears

| Surface | Shows |
|---|---|
| Results screen | Score, XP earned (with breakdown), level progress bar, level-up |
| My profile (MVP, private) | Name, declared seniority, role, stack, CV Rush Level, XP, games played, best ranks, history, initial technology stats, last active |
| Ranking rows | Context + score; level optional (decided in UI design) |
| Public developer page (Stage 2) | The sections the developer enables |
| Share card | Optionally "CV Rush Level 17" |

## 8. Tunables

XP per outcome, practice multiplier, score-to-XP divisor, discovery bonus per level, first-of-day bonus, title bonus, diminishing-returns threshold and multiplier, daily practice cap, level curve constants, minimum sample for stats, activity buckets.
