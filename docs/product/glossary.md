# Glossary (ubiquitous language)

> Part 1 · Product & Game Design · Status: **Draft for review**
>
> These terms are used across docs, code and conversations. Domain terms are **brand-agnostic**: none of them contain "CV Rush".

| Term | Meaning |
|---|---|
| **Player** | A person playing. Identified by an anonymous player identity in the MVP (an account later). |
| **Candidate** | Any runner in a run: the player's candidate or a bot. Also the player's in-game persona ("Create your candidate"). |
| **Candidate profile** | The player's self-declared name, seniority, role and stack. Identity, never a competitive input in ranked. |
| **Profile snapshot** | A copy of the profile stored with each run, so history stays correct when the profile changes. |
| **Bot** | A simulated rival candidate with an archetype and stats. Never on leaderboards. |
| **Field** | The set of candidates in a run (player + bots). |
| **Run** | One playthrough from applying to delivery or failure. Technically a *game session*. |
| **Mode** | **Casual** (personalized) or **Ranked** (Daily Challenge). |
| **Daily Challenge** | The ranked mode for a given UTC day: one Daily Job and one Daily Blueprint for everyone. |
| **Track** | A discipline family used for content and the daily rotation (Frontend, Backend, Fullstack, DevOps & Cloud…). |
| **Job posting** | The fictional job a run applies to. Generated (casual) or scheduled (ranked). The source of truth for job-derived questions. |
| **Daily Job** | The job posting shared by all ranked runs on a UTC day. |
| **Blueprint** | The structure of a run: stages, slots, difficulty per slot, timers, ATS composition, bot field, scoring rules. |
| **Stage** | A major part of the hiring process: Recruiter Screening, ATS Scan, Hiring Manager, Final Interview (Salary Negotiation, Ghosting later). |
| **Segment** | A race stretch between stages. |
| **Challenge** | A stage instance that the server opens when the runner reaches it, with ephemeral IDs and deadlines. |
| **Slot** | One question position in a blueprint (e.g. H2: technical, difficulty 3). |
| **Gate** | The in-world presentation of a question: options shown as lanes or doors. |
| **Question** | A single-choice item with language-independent options and correct answer, plus translations. Versioned. |
| **Graded options** | Options with outcome grades instead of a single correct answer (e.g. the salary question). |
| **Question family** | A set of equivalent variants (same topic, difficulty, format and similar length) used to fill a slot fairly. |
| **Job-derived question** | A question generated from facts in the run's job posting (memory, recruiter, salary). |
| **Template** | A parameterized question generator whose answer is computed. |
| **Community Question Pack** | An open-source, public question collection (answers public). Powers casual mode, learning, local development and tests. |
| **Competitive Question Pool** | A private collection of verified questions (answer keys never public) used for ranked slots. |
| **Retirement** | Removing a competitive question after its exposure limit or age, typically before publishing it to a community pack. |
| **CV Health** | The run's health bar (0–100). At 0 the application is rejected. |
| **ATS Match** | The percentage computed in the ATS Scan. Below the threshold, the application is rejected. |
| **Effect** | A semantic outcome of an action: `SPEED_BOOST`, `SLOWDOWN`, `CV_DAMAGE`, `CV_REPAIR`, `ATS_BONUS`, `FINAL_BOOST`, `APPLICATION_REJECTED`… |
| **Reason code** | A semantic failure code: `ATS_FAILED`, `CV_DESTROYED`, `ABANDONED`. Translated by the client. |
| **Delivered run** | A run that reached the company and delivered the CV. Only delivered ranked runs can be ranked. |
| **Attempt** | A ranked run start. Limited per player per UTC day. |
| **Provisional** | A ranking or leader before the day's verification. |
| **Verification** | Automated checks on top ranked runs after the day closes. |
| **Daily Champion** | The best verified ranked run of a UTC day. |
| **Weekly Top 7** | The seven Daily Champions of an ISO week (Monday to Sunday, UTC). |
| **Candidate of the Week** | The selected Daily Champion of the week (MVP: highest score). |
| **Competition period** | A time window a leaderboard is defined over: day, week, later season. |
| **Public profile** | The opt-in public representation of a player: name, role, seniority, optional LinkedIn. |
| **Anonymous Candidate** | The public label for a player who did not opt in. |
| **Management link** | A private link that lets a player edit or remove their public profile without an account. |
| **Server canonical time** | UTC time used by the server for every rule. |
| **Player display time** | The player's local time, used only for presentation. |
| **Season** *(future)* | A long competition period that resets long-term leaderboards without deleting history. |
| **Skill Passport** *(future)* | A voluntary public profile aggregating a player's CV Rush results. Not a certification. |
