# Question strategy

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> Product-level rules for questions. The Question Engine (selection strategies, interfaces, storage, schemas) is designed in Part 2.

## 1. Purpose

Questions are a **mechanic of the race**, not the product. They must be fast to read, fair, fun to get right, educational to get wrong, and tied to the fantasy: the recruiter asks about the posting, the hiring manager asks technical questions, the final panel asks you to combine both.

**They must correspond to what the player declared.** Every run's questions come from the player's frozen profile snapshot (seniority, role, stack) and their personal job posting. See [competitive identity](../product/competitive-identity.md).

### 1.1 Content ingredients and topic boundaries

Every run combines five ingredients:

| Ingredient | Example for a Senior Fullstack (Node.js, PHP, React) | Typical slots |
|---|---|---|
| **Job** questions | "Which technology was NOT in the posting?" | R1–R3, part of F1 |
| **Stack** questions | A Node.js event-loop question; a PHP question; a React question | H1, part of F1 |
| **Role (track) fundamentals** | API design, data modeling, browser/server boundaries | H2 |
| **Seniority** questions | Trade-offs, architecture, incidents, scaling | H3, F1 |
| **Shared fundamentals** | HTTP, Git, testing, security basics | Inside role and seniority pools |

**Topic boundaries:** technical questions only come from (a) the player's stack ∩ technologies with eligible content, (b) their track's fundamentals and (c) shared fundamentals. **Never an arbitrary technology:** no Swift, Kotlin or machine learning for a Fullstack web profile, unless it is part of their stack. Not every question is about a selected technology; role, seniority and shared fundamentals keep the run balanced and comparable.

## 2. Question model (product view)

| Attribute | Purpose |
|---|---|
| `id`, `version` | Stable identity; edits create new versions |
| `category` | A–G (section 3) |
| `tracks` / `roles` | Which disciplines it fits |
| `technologies[]` | Catalog technology IDs (e.g. `redis`) |
| `topics[]` / `tags[]` | A finer taxonomy for selection, equivalence and analytics (e.g. `caching.expiry`) |
| `seniority.min` / `seniority.max` | The practice eligibility range |
| `difficulty` | 1–5 (section 4) |
| `format` | `single_choice` (4 options) or `graded` |
| `options[]` | Language-independent option IDs |
| `correctOptionId` or grades | **Never sent to the client** |
| `translations.{es,en}` | Prompt, option texts, explanation |
| `source` | `ai_generated`, `curated`, `community`, `job_derived` or `template` |
| `verificationTier` | AI generated · AI validated · Human reviewed · Curated |
| `lifecycle` | Generated → Validated → Competitive → Retired → Practice (or Invalidated, Archived); see the [lifecycle](content-strategy.md#5-question-lifecycle) |
| Generation metadata | Generator and prompt version, second-check result, confidence, batch |
| `context` | The pool it belongs to (e.g. Redis × level 3) |
| `family` | Its equivalence family (later, for curated competitive content) |
| `author` | For attribution (community) |
| `status` | Draft, in review, active, retired, deprecated |

The exact schema, IDs and storage are defined in Part 2.

## 3. Categories

| Cat. | Name | Used in | Modes | Source | Example |
|---|---|---|---|---|---|
| A | **Job memory / understanding** | Recruiter, Final (partially) | Both | Job-derived | "What salary range did the posting offer?" |
| B | **Stack** | Hiring Manager | Both | Pools | "Which Redis feature fits a leaderboard?" |
| C | **Technical (general)** | Hiring Manager | Both | Pools | "Which HTTP status fits a validation error?" |
| D | **Situational** | Hiring Manager, Final | Both | Pools / scenario templates | "Your API traffic doubles overnight. What do you check first?" |
| E | **Architecture** | Hiring Manager H3, Final | Mid+ in practice; ranked H3/F1 | Pools | "Process millions of events without blocking APIs?" |
| F | **Recruiter** | Recruiter | Both | Templates (graded) | "The band was €50K–€60K. Your expectation?" |
| G | **Humor / trick** | Recruiter (replacing R1 or R2) | **Practice only** | Pools | "The posting asks for 10 years of a 2-year-old framework. Best reply?" |

Humor questions: at most 1 per run, in about 30% of practice runs. Low stakes (correct = small bonus, wrong = no damage). The intended answer must be obvious once you get the joke. Never in ranked.

## 4. Difficulty scale and seniority bands

| Level | Name | What it tests | Example |
|---|---|---|---|
| 1 | **Fundamentals** | Definitions, basic syntax and concepts | "Which hook returns a state value and a setter?" |
| 2 | **Applied basics** | Choosing the right tool in common, simple situations | "Where should a session token live: cookie or URL?" |
| 3 | **Implementation and decisions** | Correct usage, debugging, pitfalls, local trade-offs | "Why does this effect run in an infinite loop?" |
| 4 | **Architecture and reliability** | System-level trade-offs, performance, scaling, failure handling | "Process events for 3 services with replay?" |
| 5 | **Distributed and organizational scale** | Consistency models, multi-region, platform-wide trade-offs | "Exactly-once semantics across services: what do you actually get?" |

### Practice runs: difficulty by exact seniority (H1 stack · H2 role · H3 seniority · F1 mixed)

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

### Ranked runs: difficulty by band (identical within a category)

| Band | R1–R3 | H1 (stack) | H2 (role) | H3 (seniority) | F1 (mixed) |
|---|---|---|---|---|---|
| Junior (Trainee, Junior) | 2 | 1 | 2 | 2 | 2 |
| Mid | 2 | 2 | 3 | 3 | 3 |
| Senior+ (Senior, Lead, Staff, Principal) | 2 | 3 | 3 | 4 | 4 |

See the [Category Blueprint](../product/game-modes.md#33-the-category-blueprint).

## 5. Selection rules

**All runs**

- Fill each blueprint slot with a question matching its category, difficulty and topics.
- No repeats within a run; diverse topics within a stage.
- Shuffle options per run; balance the correct position across the run.
- Select at the moment the challenge starts (just-in-time), never in advance on the client.
- Draw from the **context's pool**, preferring higher verification tiers, never invalidated questions.
- Prefer questions the developer **hasn't seen** (per-developer exposure); a low unseen count triggers an asynchronous pool refill.

- Respect the **topic boundaries** (section 1.1); the profile always comes from the server-side snapshot, never from the request.

**Practice runs**

- Stack slots: the player's stack ∩ the generated job's stack (falling back to role fundamentals).
- Difficulty from the exact seniority; mild adaptivity (after 2 consecutive technical misses, the next technical slot drops one level, never below the seniority's floor).
- Use questions in the **Practice** lifecycle state (retired from competition, or practice-only); never a question currently in competitive rotation. Avoid questions seen in the developer's last 5 practice runs.
- An optional humor question (category G).

**Ranked runs**

- Difficulty from the **category's band curve**, identical for everyone in the category.
- Use questions in **competitive rotation** only, at tier **AI validated** or higher (Season 0 · Beta); later seasons may require Human reviewed or Curated.
- **Shared slots** (H2 role fundamentals, H3 seniority, F1 scenario) draw from **the same daily selection** of the category's (or band's) pool for everyone in the category, themed by the Daily Company.
- **Stack slot** (H1, and the stack part of F1) draws from the pool of **one of the developer's technologies** at the band's level, chosen by the seed among technologies with a usable pool. Coverage fallback: the track fundamentals pool at the same level.
- No adaptivity, no humor.
- Avoid serving the same variant to the same player across attempts on the same day.
- Equivalence rules: see [fairness](../game-design/fairness.md#4-content-equivalence).

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

- **4 options** (paths A–D) for single choice; graded questions also use 4.
- **Exactly one correct option** (single choice), or explicit grades (graded).
- **Plausible distractors** of similar length and style. A partially correct distractor is allowed only if the correct option is clearly better and the explanation says why.
- No "all of the above" or "none of the above". No joke distractors outside humor questions.
- ≤ 40 characters per option; technology names untranslated; code styled as code.
- The correct answer's position is randomized per run. Its position in the source file carries no meaning.

## 8. Feedback and review policy

| | During the run | Post-run review |
|---|---|---|
| Practice run | Correct or incorrect + effects | Prompt, all options, the correct answer, the explanation and learning notes (retired or practice-only questions; attribution for community questions later) |
| Ranked run, job-derived and templates | Correct or incorrect + effects | Prompt, the developer's answer, the correct answer and the explanation (the facts are public anyway) |
| Ranked run, competitive questions | Correct or incorrect + effects | Prompt, the developer's answer, correct or incorrect, the topic. **No answer key** while the question is in competitive rotation. |

The **lifecycle** is what lets practice teach (by revealing answers) without exposing questions that are active in ranked.

## 9. Localization

- The prompt, options and explanation are translated; **option IDs and the correct option are language-independent**.
- A run's question language is fixed at run start.
- Ranked requires both translations to be validated; practice can serve a question in the locales it supports.
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

## 13. AI-generated questions

**In the MVP**, most pool questions are AI-generated, validated and stored (see the [content strategy pipeline](content-strategy.md#3-ai-generated-questions-the-pipeline)):

- Generated **ahead of time or asynchronously per context**, never on the request path of a run, and never per frame or per challenge.
- **Structured output** (question, options A–D, correct option, explanation, technology, difficulty, seniority, role, es + en), validated against the schema.
- **Server-side validation:** rules, heuristics, deduplication and an independent second check. The second check **detects problems but doesn't prove correctness**; questions can always be invalidated (individually or by batch).
- **Stored and reused**, versioned, with `source = ai_generated` and a verification level.
- **Ranked** uses **AI validated** or better, and its rankings are **Season 0 (Beta)**, clearly labeled as calibrating content.
- **Gradually replaced** by curated and community content with higher verification levels.

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
