# Replayability

> Part 1 · Product & Game Design · Status: **Draft for review**

## 1. Why players come back

| Lever | Loop | MVP | Later |
|---|---|---|---|
| **Variety** | Session | New jobs, questions, bots, ATS streams, obstacle layouts, recruiter lines per run | New maps (startup, bank, big tech), new stages |
| **Mastery** | Session | Personal bests per track; explanations in the casual review | Personal stats page; skill trends |
| **Competition** | Meta | Daily Challenge, 3 attempts, "did I hold #1?", Weekly Top 7, Candidate of the Week | Seasons; challenge a friend |
| **Social** | Meta | Share cards; discovering profiles on leaderboards | "Challenge a friend" links with the same job |
| **Collection** | Meta | — | Achievements, badges, skins, streaks (non-competitive) |
| **Freshness** | Meta | Community content; daily track rotation | Seasonal content drops |

## 2. Sources of variety per run

| Element | Casual | Ranked |
|---|---|---|
| Job posting | Generated per run | One per day |
| Questions | Packs + templates, avoiding recently seen ones | Equivalent families per slot |
| Option order | Shuffled | Shuffled |
| Bots | Random field | The daily field |
| ATS stream | Generated | Generated under fairness constraints |
| Obstacles and pickups | Generated | Generated with equivalent density |
| Recruiter, manager and bot lines | Random from localized pools | Random from localized pools |
| Humor question | ~30% of runs | Never scored |

## 3. "One more try" UX rules

- Restart in **≤ 2 taps** and **< 3 seconds** after a result or failure screen.
- The profile, mode and preferences are kept between runs.
- The failure screen always shows **how close you got** ("You were 6% away from passing the ATS").
- Ranked results show the **path to improve** ("Faster correct answers would have earned up to +1,200").
- Casual offers a **review** with explanations, so each run teaches something.

## 4. Repeat avoidance (casual)

- Don't repeat a question seen in the player's last **5** casual runs while the pool allows it.
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
- The Weekly Top 7 has a narrative: "4 days left this week; today is Backend day".
- No email or push notifications in the MVP (we don't collect contact data).
