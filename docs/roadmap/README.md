# Roadmap

> Part 1 · Product & Game Design · Status: **Draft for review (revision 2: profile-first)**
>
> No dates on purpose. Phases are ordered by dependency and by what we learn from players. GitHub milestones will mirror these phases once the repository is public.

## How to read this

- **MVP**: the smallest public product that tests the core hypothesis. Exact scope: [MVP scope](../product/mvp-scope.md).
- **V1**: improvements we expect to need soon after launch, prioritized by data.
- **V2**: bigger bets that need an audience, content volume or identity first.
- **Ideas**: interesting, unscheduled.
- **Deliberately postponed**: things from the original brief that we chose *not* to do yet, with the reason and the trigger to revisit.

## MVP (summary)

Landing (SSR, es/en) · profile-first onboarding (name, seniority, role, stack) with server-side validation and a frozen snapshot per run · Casual and Ranked modes · personal job generation and the Daily Company · 9 official ranked categories (Frontend, Backend, Fullstack × Junior, Mid, Senior+) · a 2D runner (Phaser) with 4 stages: Recruiter Screening (incl. a graded salary question), ATS Scan, Hiring Manager, Final Interview · bots · CV Health · server-authoritative scoring · results and failure screens · public profile opt-in + LinkedIn · category leaderboards with competing context, Daily Champion, Weekly Top 7 and Candidate of the Week per category, a cross-category spotlight · share pages and cards · question reports · accessibility basics · first-party analytics · moderation commands · open-source foundations.

## V1

| Item | Why |
|---|---|
| **Salary Negotiation stage** (`salaryNegotiation`) | Deepen the most relatable joke into a mechanic |
| **Ghosting** challenge or hazard (`ghostingChallenge`) | A signature hiring-process moment |
| **Optional login** (GitHub, Google) | Cross-device identity, verified champions, more attempts protection |
| **Admin panel v1** | Questions, reports, runs, moderation, champions, through a UI instead of commands |
| **Question stats dashboard** | Balancing with data (expected vs observed difficulty) |
| **Public champion pages** (opt-in, indexable) | SEO and showcase value |
| **"Challenge a friend"** links | Social replay: the same profile and company, equivalent questions |
| **More ranked categories** (Platform official; then Mobile, Quality, Data, Security, Architecture) | Content-gated activation, helped by community packs |
| **Experimental normalized global view** (percentile within category) | A cross-category "top performers" view, never a champion title |
| **Server-side re-simulation** of ATS and collisions from input logs | Tighter integrity for client-side mechanics |
| **Private submission path** for competitive questions | Scale the competitive pool with trusted contributors |
| **Personal stats page** | Mastery loop |
| **Light achievements** (non-competitive) | Collection loop |
| **New maps or themes** (startup, bank, big tech) | Variety |
| **Music and sound polish** | Game feel |
| **PR preview deployments** | Easier review of UI, mechanics and translations |
| **Casual "personal track" leaderboards** (if validated) | Recognition for casual play, separate from champions |

## V2

| Item | Why |
|---|---|
| **AI-assisted question pipeline** (offline, structured output, validation, human review) | Scale content without a runtime LLM dependency |
| **Seasons** | Long-term competition and content drops without losing history |
| **Skill Passport** (opt-in) | Long-term player identity; "CV Rush results, not a certification" |
| **Sponsored challenges** under public integrity rules | Sustainability |
| **Public read-only API** | Leaderboards, champions, aggregated stats |
| **Talent insights** (aggregated, anonymized reports) | "State of the Stack" style content |
| **More languages** | Reach (e.g. Portuguese) |
| **Ghost runs** of real top players | Competitive replay against real timelines |
| **Recruiter challenges exploration** (opt-in candidates) | Only after the game is loved; see [future platform](../product/future-platform.md) |

## Ideas (unscheduled)

Real-time multiplayer races · company or university leagues · event mode for meetups and hackathons · a streamer mode · a seasonal "Hiring Freeze" event · cosmetic skins for the CV · "Hall of Fame" of all-time champions · Technical Assignment, Culture Fit and Referral Boost challenges.

## Deliberately postponed

| Postponed | Why not now | Revisit when |
|---|---|---|
| AI-generated questions | Cost, latency, trust; needs a validation pipeline | Content coverage gaps are measured and the review capacity exists |
| Login | Friction for the first run; not needed to validate fun | Champion disputes, cross-device demand, abuse through many identities |
| Salary Negotiation stage | The pacing budget; the graded question delivers the joke | MVP playtests show the run has room and players love the salary question |
| Ghosting and other hazards | Scope | The core loop is validated |
| Splitting bands or tracks (e.g. Senior+ → Senior \| Lead+) | Small fields at launch | The median daily field of a category stays above ~200 for 4 weeks |
| A global ranking across categories | Raw scores are not comparable; normalization needs data | Several categories regularly reach the minimum field (then: experimental V1 view) |
| Engineering Manager, Product Manager, UX/UI Designer | They need non-technical content of a different kind | A content plan and contributors for those roles |
| Skill rating (Elo-like) | Needs identity, volume and calibrated content | After seasons and login |
| Seasons | Needs history worth resetting | After a few months of data |
| Skill Passport | Needs identity and enough runs per player | After login |
| Recruiter features | "First a good game, later a talent platform" | Clear player demand and an ethical framework in place |
| Sponsors page | Nothing to sponsor yet | Meaningful traffic or community |
| Achievements, streaks, skins | Not needed to validate the hypothesis | Retention data suggests they help |
| Public API | No consumers yet | External interest |
| Real multiplayer | Huge complexity; bots deliver the feeling | Strong demand and a stable core |
| Native apps | The web reaches everyone through links | Never, unless distribution data says otherwise |

## Non-goals

See [MVP scope › explicit non-goals](../product/mvp-scope.md#5-explicit-non-goals).
