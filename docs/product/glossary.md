# Glossary (ubiquitous language)

> Part 1 · Product & Game Design · Status: **Draft for review (revision 2: profile-first)**
>
> These terms are used across docs, code and conversations. Domain terms are **brand-agnostic**: none of them contain "CV Rush".

## Players and profiles

| Term | Meaning |
|---|---|
| **Player** | A person playing. Identified by an anonymous player identity in the MVP (an account later). |
| **Candidate** | Any runner in a run: the player's candidate or a bot. Also the player's in-game persona. |
| **Profile** | The player's *current* self-declared name, seniority, role and stack. Editable (subject to the ranked lock and cooldown). |
| **Profile snapshot** | The validated, **immutable** copy of the profile that a run is played as. Created server-side when the run starts; every server decision uses it; it stays attached to the result forever. |
| **Competing context** | What a result was achieved *as*: exact seniority, role, stack (and category), taken from the snapshot. Shown with every result: "competing as a Senior Fullstack Developer · Node.js · PHP · React". |
| **Role** | A catalog profession (e.g. Fullstack Developer). Defines core and allowed technology categories and allowed seniorities. |
| **Seniority** | Trainee, Junior, Mid, Senior, Lead, Staff, Principal. Always displayed exactly as declared. |
| **Stack** | The technologies a player selects (1–12), validated against the role's compatibility rules. |
| **Topic boundaries** | The rule that technical questions only come from the player's stack, their track's fundamentals and shared fundamentals. |
| **Bot** | A simulated rival candidate with an archetype and stats. Never on leaderboards. |
| **Field** | The set of candidates in a run (player + bots). Also the number of players in a category's daily leaderboard. |

## Competition structure

| Term | Meaning |
|---|---|
| **Mode** | **Casual** (personalized) or **Ranked** (Daily Challenge). Both are played as a profile snapshot. |
| **Track** | A competitive family of roles compared with the same kind of content (Frontend, Backend, Fullstack, Platform…). |
| **Seniority band** | A group of seniorities sharing a ranked difficulty curve: Junior (Trainee, Junior), Mid, Senior+ (Senior, Lead, Staff, Principal). |
| **Category** | Track × band, e.g. **Fullstack · Senior+**. The unit of ranked competition. |
| **Category lifecycle** | Casual only → Ranked preview (boards, no titles, calibration) → Ranked (official). Splits and merges create new ruleset versions. |
| **Ranked profile lock** | After a player's first ranked run of a UTC day, their ranked profile can't change until the day ends. |
| **Category cooldown** | The minimum time between ranked track or band changes (proposal: 7 days). |
| **Daily Challenge** | The ranked mode on a UTC day: a personal job at the **Daily Company**, inside the **category blueprint**. |
| **Daily Company** | The fictional company, with a domain theme, that is "hiring across every track and level" on a UTC day. Secret until 00:00 UTC. |
| **Category blueprint** | The structure shared by every ranked run of a category on a day: stages, slots, band difficulty curve, timers, shared families, ATS composition, bot field, scoring rules. |
| **Attempt** | A ranked run start. 3 per player per UTC day. |

## Runs and challenges

| Term | Meaning |
|---|---|
| **Run** | One playthrough from applying to delivery or failure. Technically a *game session*. |
| **Job posting** | The fictional job a run applies to, generated from the snapshot. The source of truth for job-derived questions. |
| **Stage** | A part of the hiring process: Recruiter Screening, ATS Scan, Hiring Manager, Final Interview (Salary Negotiation, Ghosting later). |
| **Segment** | A race stretch between stages. |
| **Challenge** | A stage instance that the server opens when the runner reaches it, with ephemeral IDs and deadlines. |
| **Slot** | One question position in a blueprint (e.g. H2: role fundamentals, difficulty 3). |
| **Shared slot** | A ranked slot filled from the category's (or band's) daily shared family (H2, H3, F1 scenario). |
| **Stack slot** | A ranked slot filled from a calibrated family for one of the player's technologies (H1, part of F1). |
| **Gate** | The in-world presentation of a question: options shown as lanes or doors. |
| **CV Health** | The run's health bar (0–100). At 0 the application is rejected. |
| **ATS Match** | The percentage computed in the ATS Scan. Below the threshold, the application is rejected. |
| **Effect** | A semantic outcome: `SPEED_BOOST`, `SLOWDOWN`, `CV_DAMAGE`, `CV_REPAIR`, `ATS_BONUS`, `FINAL_BOOST`, `APPLICATION_REJECTED`… |
| **Reason code** | A semantic failure code: `ATS_FAILED`, `CV_DESTROYED`, `ABANDONED`. Translated by the client. |
| **Delivered run** | A run that reached the company and delivered the CV. Only delivered ranked runs can be ranked. |

## Content

| Term | Meaning |
|---|---|
| **Question** | A single-choice item with language-independent options and correct answer, plus translations. Versioned. |
| **Graded options** | Options with outcome grades instead of a single correct answer (e.g. the salary question). |
| **Question family** | A set of equivalent variants (same topic, difficulty, format and similar length). |
| **Job-derived question** | A question generated from facts in the run's job posting (memory, recruiter, salary). |
| **Template** | A parameterized question generator whose answer is computed, or a scenario filled with job facts. |
| **Community Question Pack** | An open-source, public question collection (answers public). Powers casual mode, learning, local development and tests. |
| **Competitive Question Pool** | A private collection of verified, calibrated question families (answer keys never public) used for ranked slots. |
| **Calibration** | Checking a family's observed correct rate against its declared level (and, for stack families, against the band-wide target for that level). |
| **Retirement** | Removing a competitive question after its exposure limit or age, typically before publishing it to a community pack. |

## Leaderboards

| Term | Meaning |
|---|---|
| **Category leaderboard** | The daily ranking of a category: provisional during the day, with competing context on every row. |
| **Provisional** | A ranking or leader before the day's verification. |
| **Verification** | Automated checks on top ranked runs after the day closes. |
| **Daily Champion** | The best verified ranked run of a UTC day **in a category** (minimum field: 3 runs). |
| **Weekly Top 7** | A category's seven Daily Champions of an ISO week (Monday to Sunday, UTC). |
| **Candidate of the Week** | The best of a category's Daily Champions of the week (MVP: highest score). |
| **Spotlight** | A cross-category showcase of champions, ordered by field size, never by score. Not a ranking. |
| **Competition period** | A time window a leaderboard is defined over: day, week, later season. |
| **Public profile** | The opt-in public representation of a player: name, optional LinkedIn, and their results with competing context. |
| **Anonymous Candidate** | The public label for a player who did not opt in. |
| **Management link** | A private link that lets a player edit or remove their public profile without an account. |
| **Server canonical time** | UTC time used by the server for every rule. |
| **Player display time** | The player's local time, used only for presentation. |
| **Season** *(future)* | A long competition period that resets long-term leaderboards without deleting history. |
| **Skill Passport** *(future)* | A voluntary public profile aggregating a player's results with their context. Not a certification. |
