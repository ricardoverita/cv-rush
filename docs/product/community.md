# Open-source and community strategy (product level)

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> Licensing is decided in a Part 2 ADR (direction under study: Apache-2.0 for code, CC BY 4.0 for content packs, branding not licensed). Repository mechanics (templates, CI, guides) come in Part 3.

## 1. Why open source

| Goal | How openness helps |
|---|---|
| **Trust** in a competitive game | Anyone can read how runs are refereed and how scores are computed |
| **Content supply** | Hundreds of contributors can each add a few questions about the technologies they know |
| **Learning value** | The project is a real-world reference: server-authoritative web game, i18n from the domain, Phaser + Next.js |
| **Portfolio for contributors** | A visible, fun project to contribute to |
| **Discovery** | Contributors are also players and sharers |

## 2. What is open and what stays private

The repository is public. Some things must never be in it.

| Open (in the repository) | Private (never in the repository) |
|---|---|
| Game client, web app, API, domain, tooling | Runtime secrets, credentials, tokens |
| Community question packs (later, with answers) and a **fake sample pool** for local development | **Question pools** (AI-generated in the MVP, curated later) and their answer keys |
| Question **templates and generators** (logic) | Server-side seeds and per-run state |
| Catalogs: roles, seniorities, technologies | Scheduled future **Daily Companies** |
| Translations | Developer data: **emails**, LinkedIn usernames, consent records, device credentials, results, logs |
| Docs, ADRs, case study | Moderation review data |
| Example and seed data (fictional only) | Brand assets beyond what the brand policy allows |

Security never relies on the code being secret. The private items are private because they are **secrets or data**, not because the code that uses them is hidden.

## 3. Contribution ladder

Each step should be possible without understanding the steps above it.

| Level | Contribution | Needs to know | Example |
|---|---|---|---|
| 0 | Report a question in-game | Nothing | "Ambiguous" report after a run |
| 1 | Fix a translation or typo | Markdown or YAML | Fix a Spanish option |
| 2 | **Add questions to a pack** | The question format and `pnpm questions:validate` | "Add 30 Redis questions" |
| 3 | Add a technology or a role | Catalog files | Add "Elixir" with aliases and category |
| 4 | Add a language | The i18n catalogs | Add Portuguese |
| 5 | Art, animation, sound | Asset conventions | A new obstacle animation |
| 6 | A new challenge or mechanic | The challenge contract (Part 2) | A Ghosting challenge |
| 7 | Core (engine, API, scoring) | Architecture docs and ADRs | A performance improvement |

**Content contributions never require touching game code.** A pull request called "Add 30 Redis questions" changes only files in a question pack directory, and CI validates it automatically (schema, translations, duplicates, known technologies, answer consistency).

## 4. Recognition

- **In-game attribution:** community questions show "Question by @handle" in the practice post-run review. This motivates contributors and honors the attribution requirement of a CC BY license.
- A **contributors page** on the site and in the repository.
- **Changelog credits** for content and code.
- "Top contributor of the month" may come later. It is recognition only; it never affects game results.

## 5. Content flow between the open and private worlds

- Community contributions are **public by nature**, so they feed **practice runs**.
- **Unlocking ranked for a track is a community goal:** tracks that are practice-only show "Ranked coming soon for {role} — help us unlock it", linking to the content needed (e.g. "Mobile · Mid needs more validated questions"). Contributions to community packs prove demand and help authors join the trusted reviewers who prepare competitive content.
- **In the MVP**, the private pools are AI-generated, validated and stored (see [content strategy](../questions/content-strategy.md)). Community packs and human curation arrive in V1–V2 and gradually replace AI content.
- Later, the curated competitive pool is authored and reviewed privately (by the maintainer at first; trusted reviewers later).
- **Retired competitive questions graduate to the open packs** after their competitive life: exposure limits reached or age. The open bank keeps growing with tested questions, and the private pool stays fresh.
- A private submission path for competitive questions (from trusted contributors) is a V1 idea. Its licensing and contributor terms are part of the Part 2 license ADR.

## 6. Governance (lightweight)

- Maintainer-led in the beginning. Decisions on direction, rankings and moderation rest with the maintainer.
- **Proposals** for mechanics or big changes start as issues ("Game Mechanic Proposal" template) and become ADRs if accepted.
- **Style guides** for questions, translations and humor keep quality without endless review discussions.
- A **Code of Conduct** applies to the repository and the community spaces.
- `CODEOWNERS` and module owners only when there are enough regular contributors.

## 7. Sponsorship and integrity

Sponsorship (GitHub Sponsors, companies, hosting or cloud credits, communities, possibly recruiting companies) may come later. Some rules are fixed **now**:

- Sponsors can **never**: manipulate rankings, buy positions, favor candidates, edit or choose competitive questions, or access personal data without the player's explicit consent.
- A sponsor may sponsor an **experience** (e.g. "Backend Challenge of the Week, sponsored by X") under rules that are public and identical to every other challenge.
- Sponsored content is always labeled.
- Sponsorship terms are public.

## 8. Good first issues at launch

Seed the repository with clearly scoped, well-described issues, for example:

- Add translations for a list of UI keys.
- Add 10 questions to a thin pack (e.g. Vue, Go).
- Add a technology with its aliases and category.
- Improve the explanation of a reported question.
- Create a small animation (e.g. a coffee-cup pickup).
- Add test coverage for a validator rule.
- Improve a contribution guide.

## 9. Community metrics

Contributors per month, merged content PRs, translations, time to first review, and good-first-issue conversion. See [success metrics](success-metrics.md).
