# Question strategy

> Part 1 · Product & Game Design · Status: **Draft for review**
>
> Product-level rules for questions. The Question Engine (selection strategies, interfaces, storage, schemas) is designed in Part 2.

## 1. Purpose

Questions are a **mechanic of the race**, not the product. They must be fast to read, fair, fun to get right, educational to get wrong, and tied to the fantasy: the recruiter asks about the posting, the hiring manager asks technical questions, the final panel asks you to combine both.

## 2. Question model (product view)

| Attribute | Purpose |
|---|---|
| `id`, `version` | Stable identity; edits create new versions |
| `category` | A–G (section 3) |
| `tracks` / `roles` | Which disciplines it fits |
| `technologies[]` | Catalog technology IDs (e.g. `redis`) |
| `topics[]` / `tags[]` | A finer taxonomy for selection, equivalence and analytics (e.g. `caching.expiry`) |
| `seniority.min` / `seniority.max` | The casual eligibility range |
| `difficulty` | 1–5 (section 4) |
| `format` | `single_choice` (4 options) or `graded` |
| `options[]` | Language-independent option IDs |
| `correctOptionId` or grades | **Never sent to the client** |
| `translations.{es,en}` | Prompt, option texts, explanation |
| `source` | `community`, `competitive`, `job_derived` or `template` |
| `family` | Its equivalence family (competitive) |
| `author` | For attribution (community) |
| `status` | Draft, in review, active, retired, deprecated |

The exact schema, IDs and storage are defined in Part 2.

## 3. Categories

| Cat. | Name | Used in | Modes | Source | Example |
|---|---|---|---|---|---|
| A | **Job memory / understanding** | Recruiter, Final (partially) | Both | Job-derived | "What salary range did the posting offer?" |
| B | **Stack** | Hiring Manager | Both | Packs / pool | "Which Redis feature fits a leaderboard?" |
| C | **Technical (general)** | Hiring Manager | Both | Packs / pool | "Which HTTP status fits a validation error?" |
| D | **Situational** | Hiring Manager, Final | Both | Packs / pool / scenario templates | "Your API traffic doubles overnight. What do you check first?" |
| E | **Architecture** | Hiring Manager H3, Final | Mid+ in casual; ranked H3/F1 | Packs / pool | "Process millions of events without blocking APIs?" |
| F | **Recruiter** | Recruiter | Both | Templates (graded) | "The band was €50K–€60K. Your expectation?" |
| G | **Humor / trick** | Recruiter (replacing R1 or R2) | **Casual only** | Packs | "The posting asks for 10 years of a 2-year-old framework. Best reply?" |

Humor questions: at most 1 per run, in about 30% of casual runs. Low stakes (correct = small bonus, wrong = no damage). The intended answer must be obvious once you get the joke. Never in ranked.

## 4. Difficulty scale and seniority bands

| Level | Name | What it tests | Example |
|---|---|---|---|
| 1 | **Fundamentals** | Definitions, basic syntax and concepts | "Which hook returns a state value and a setter?" |
| 2 | **Applied basics** | Choosing the right tool in common, simple situations | "Where should a session token live: cookie or URL?" |
| 3 | **Implementation and decisions** | Correct usage, debugging, pitfalls, local trade-offs | "Why does this effect run in an infinite loop?" |
| 4 | **Architecture and reliability** | System-level trade-offs, performance, scaling, failure handling | "Process events for 3 services with replay?" |
| 5 | **Distributed and organizational scale** | Consistency models, multi-region, platform-wide trade-offs | "Exactly-once semantics across services: what do you actually get?" |

### Casual bands (Hiring Manager slots H1 / H2 / H3 · Final F1)

| Seniority | H1 | H2 | H3 | F1 | Notes |
|---|---|---|---|---|---|
| Trainee | 1 | 1 | 2 | 2 | Fundamentals |
| Junior | 1 | 2 | 2 | 2 | Fundamentals + simple situations |
| Mid | 2 | 3 | 3 | 3 | Implementation + technical decisions |
| Senior | 3 | 3 | 4 | 4 | Architecture, trade-offs, performance, reliability |
| Lead | 3 | 4 | 4 (leadership situational) | 4 | Architecture + teams + decisions |
| Staff | 3 | 4 | 5 | 5 | Distributed systems, scalability, complex trade-offs |
| Principal | 4 | 4 | 5 | 5 | The same, with organization-wide scope |

Recruiter slots (R1–R3) are difficulty 2 for every seniority: they test reading, not seniority.

### Ranked curve (identical for everyone)

R1–R3: 2 · H1: 2 · H2: 3 · H3: 4 · F1: 4. See the [Daily Blueprint](../product/game-modes.md#33-the-daily-blueprint-same-structure-equivalent-content).

## 5. Selection rules

**Both modes**

- Fill each blueprint slot with a question matching its category, difficulty and topics.
- No repeats within a run; diverse topics within a stage.
- Shuffle options per run; balance the correct position across the run.
- Select at the moment the challenge starts (just-in-time), never in advance on the client.

**Casual**

- Topics = the player's stack ∩ the generated job's stack (falling back to role-general topics).
- Difficulty from the seniority band; mild adaptivity (after 2 consecutive technical misses, the next technical slot drops one level, never below the band floor).
- Avoid questions seen in the player's last 5 casual runs.
- An optional humor question (category G).

**Ranked**

- Topics = the Daily Job's stack and track.
- Technical slots draw a variant from an eligible **question family** (see [fairness](../game-design/fairness.md#4-content-equivalence)).
- No adaptivity, no humor, no influence from the player's profile.
- Avoid serving the same variant to the same player across attempts on the same day.

## 6. Templates and job-derived questions

**Job-memory templates (examples):** salary range · a technology NOT in the posting · years of experience · a mentioned responsibility · work mode · location · company sector · a perk · a nice-to-have.

Each template defines how to pick the fact, how to generate **plausible distractors** (shifted ranges, the player's own technologies missing from the posting, responsibilities from other role templates), and how to phrase the prompt in es/en.

**Salary template:** graded options from the job range (see [Recruiter Screening](../game-design/challenges/recruiter-screening.md#the-salary-question-r3-graded)).

**Parameterized technical templates (examples):**

- "A cache key has a TTL of {ttl} s and is read every {interval} s. How many misses per hour?" The answer is computed.
- "A service handles {rps} requests/s with {latency} ms average latency. Roughly how many requests are in flight?" (Little's law.)

Parameters come from the run's seed, so a lookup table of answers doesn't help.

**Scenario templates** (Final Interview): an authored scenario with slots filled by facts from the job ("At {company}, {responsibility}…").

## 7. Option rules

- **4 options** (lanes A–D) for single choice; graded questions also use 4.
- **Exactly one correct option** (single choice), or explicit grades (graded).
- **Plausible distractors** of similar length and style. A partially correct distractor is allowed only if the correct option is clearly better and the explanation says why.
- No "all of the above" or "none of the above". No joke distractors outside humor questions.
- ≤ 40 characters per option; technology names untranslated; code styled as code.
- The correct answer's position is randomized per run. Its position in the source file carries no meaning.

## 8. Feedback and review policy

| | During the run | Post-run review |
|---|---|---|
| Casual | Correct or incorrect + effects | Prompt, all options, the correct answer, the explanation, attribution |
| Ranked, job-derived and templates | Correct or incorrect + effects | Prompt, the player's answer, the correct answer and the explanation (the facts are public anyway) |
| Ranked, competitive pool | Correct or incorrect + effects | Prompt, the player's answer, correct or incorrect, the topic. **No answer key** until the question retires. |

## 9. Localization

- The prompt, options and explanation are translated; **option IDs and the correct option are language-independent**.
- A run's question language is fixed at run start.
- Ranked requires both translations to be validated; casual can serve a question in the locales it supports.
- Validation tooling checks: missing translations, mismatched option sets, length limits per locale.

## 10. Reporting questions

- **Only after the run**, from the review screen. Never during a challenge, where a report button could be abused to skip or probe questions.
- Reasons: **Incorrect answer · Ambiguous · Bad translation · Outdated technology · Too difficult · Too easy · Other** (with optional text).
- A report references `questionId@version`, the locale and the run.
- Reports **never auto-remove** questions. They feed a review queue. Report counts and rates are question stats.

## 11. Quality signals and balancing

Per question version and locale:

| Stat | Use |
|---|---|
| attempts | Statistical confidence |
| correct / incorrect / timeout | Observed difficulty |
| average and percentile response time | Readability, length issues |
| report rate (by reason) | Flaws |
| expected difficulty vs observed difficulty | Mislabelled difficulty or a badly worded question |
| correct rate by locale | Translation issues |
| correct rate per option | Which distractor is "too attractive" (possible ambiguity) |

Example flag: a question labeled **Junior / difficulty 1** with an **18% correct rate** may be badly worded, misclassified, ambiguous, or genuinely harder than labeled. A person decides. **No automatic adjustment** in the MVP; tools show the outliers.

## 12. Versioning and audit

- Any change to the prompt, options, correct answer or translations creates a **new version**; IDs are stable.
- Every served question is recorded as `questionId@version` + locale + option order + answer + timings + result.
- Past runs can always show exactly what the player saw, even after the question changed. This matters for audits, Daily Champion disputes and debugging.

## 13. AI-generated questions (future)

Hybrid by design, not in the MVP:

- **Offline generation** to produce drafts; never on the request path of a run.
- **Structured output** (question, options, correct option, explanation, difficulty, technology, seniority), validated against the schema.
- **Server-side validation** plus **human review** before anything becomes active; competitive questions also need calibration.
- Valid generated questions are **stored and reused** like authored ones (with a `source: ai_assisted` marker).
- Ranked prioritizes verified questions. Unreviewed AI output never reaches ranked.

## 14. Example (illustrative format, not the final schema)

```yaml
id: react.usestate.state-and-setter
version: 1
category: stack
technologies: [react]
topics: [react.hooks.state]
difficulty: 1
seniority: { min: trainee, max: mid }
format: single_choice
options: [a, b, c, d]
correctOptionId: a
translations:
  en:
    prompt: Which hook returns a state value and a function to update it?
    options: { a: useState, b: useEffect, c: useMemo, d: useRef }
    explanation: useState returns the current state and a setter that triggers a re-render.
  es:
    prompt: ¿Qué hook devuelve un valor de estado y una función para actualizarlo?
    options: { a: useState, b: useEffect, c: useMemo, d: useRef }
    explanation: useState devuelve el estado actual y un setter que provoca un nuevo render.
```

Note how this improves the brief's original example ("useState / useDocker / useSQL / useCache"): the distractors are now plausible React hooks, and the prompt has a single unambiguous answer. "Manage local state" could also be answered with `useReducer`.
