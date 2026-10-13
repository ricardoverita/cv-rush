# ADR-009: Question localization with language-independent answers

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

Every question must exist in Spanish and English with the same technical meaning and the same correct answer. Ranked fairness requires that the language never changes difficulty or the answer. Logic must not be duplicated per language.

## Decision

- A `question_version` stores **one** set of language-independent option IDs, **one** correct option (or grades), difficulty, technologies and topics, plus per-locale content (`prompt`, option texts, `explanation`) in JSONB.
- A question is eligible for **ranked** only when **both** locales are present and validated; practice may serve any locale the question supports.
- A run's question locale is fixed at session creation.
- Option IDs sent to clients are per-attempt aliases after shuffling.
- Per-locale statistics flag translation issues (accuracy gaps between locales).

## Alternatives considered

| Alternative | Why not |
|---|---|
| One question row per language | Duplicated logic; answers could diverge; harder stats |
| Machine translation at runtime | Quality and consistency risks; latency; no review |
| English-only questions | Excludes a core audience |

## Consequences

- Positive: one source of truth per question; comparable stats across languages.
- Negative: generation and validation must produce both locales together (the AI pipeline does).

## Related

[Question Engine](../architecture/09-question-engine.md), [i18n](../i18n/README.md).
