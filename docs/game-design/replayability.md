# Replayability

> Part 1 · Product & Game Design · Status: **Draft for review**

## 1. Why players come back

| Lever | Loop | MVP | Later |
|---|---|---|---|
| **Variety** | Session | New jobs, questions, bots, ATS streams, obstacle layouts, recruiter lines per run | New maps (startup, bank, big tech), new stages |
| **Progression** | Meta | **XP, CV Rush Levels, level-ups, history, technology stats, Daily Champion titles** on My profile | Badges, season XP, public developer page |
| **Mastery** | Session | Personal bests; explanations in practice reviews | Skill trends by difficulty |
| **Competition** | Meta | Daily Challenge in your category, 3 attempts, "did I hold #1?", Weekly Top 7 and Candidate of the Week per category | Seasons; challenge a friend; category splits as fields grow |
| **Social** | Meta | Share cards; discovering profiles on leaderboards | "Challenge a friend" links with the same company and category |
| **Collection** | Meta | — | Achievements, badges, skins, streaks (non-competitive) |
| **Freshness** | Meta | Community content; a new **Daily Company** and theme every day | Seasonal content drops |

## 2. Sources of variety per run

| Element | Practice | Ranked |
|---|---|---|
| Job posting | Generated per run for the profile | Generated per run for the profile, at today's company |
| Questions | Packs + templates, avoiding recently seen ones | Shared daily families per category + calibrated stack families |
| Option order | Shuffled | Shuffled |
| Bots | Random field | The category's daily field |
| ATS stream | Generated | Generated under fairness constraints |
| Obstacles and pickups | Generated | Generated with equivalent density |
| Recruiter, manager and bot lines | Random from localized pools | Random from localized pools |
| Humor question | ~30% of runs | Never scored |

## 3. "One more try" UX rules

- Restart in **≤ 2 taps** and **< 3 seconds** after a result or failure screen.
- The profile, mode and preferences are kept between runs.
- The failure screen always shows **how close you got** ("You were 6% away from passing the ATS").
- Ranked results show the **path to improve** ("Faster correct answers would have earned up to +1,200").
- Practice offers a **review** with explanations, so each run teaches something.
- Every result shows **XP earned and progress to the next level**; level-ups are celebrated.

## 4. Repeat avoidance

- Prefer questions the developer hasn't seen; don't repeat a question seen in their last **5** practice runs while the pool allows it.
- When a developer has seen most of a context's pool, a refill is generated asynchronously (see [content strategy](../questions/content-strategy.md#3-ai-generated-questions-the-mvp-pipeline)).
- Prefer topics not seen recently within the same technology.
- Track the repeat rate as a content-quality metric (see [success metrics](../product/success-metrics.md)).

## 5. Anti-patterns we avoid

- Grinding that is required to compete.
- Pay-to-win, or any purchasable advantage.
- Dark-pattern FOMO (fake timers, "your streak will die!" guilt).
- Streak mechanics that punish taking a day off (if streaks come, they are forgiving).
- Fake activity (fake players, fake champions, fake applicant counts in ranked).

## 6. Return triggers

- The provisional #1 is told when the day closes and invited to come back and check.
- The landing page shows yesterday's result to returning players.
- Each day has a new company to apply to ("Today Kestrel Pay is hiring"), and each category's Weekly Top 7 has a narrative: "4 days left this week".
- No push notifications in the MVP, and no emails unless the developer opted in to email communication (off by default).
