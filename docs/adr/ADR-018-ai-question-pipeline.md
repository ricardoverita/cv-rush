# ADR-018: AI question pipeline — asynchronous, validated, provider-agnostic

- **Status:** Accepted (Part 2 approved 2026-10-12; the concrete provider is chosen later in its own ADR)
- **Date:** 2026-10-12

## Context

The MVP needs ~20 bilingual questions per context when a context is first needed, and continuous rotation. Writing them by hand doesn't scale for a first version. AI output can be wrong, ambiguous or duplicated; a second model agreeing with the first detects problems but doesn't prove correctness. Players must never wait for an LLM, and costs must be bounded.

## Decision

- Generation runs **only in the worker**, as idempotent BullMQ jobs per context (launch seeding, missing contexts, low rotation, high exposure). Never on a request path.
- **Provider-agnostic contract:** a `QuestionGenerationProvider` interface (`generate`, `verify`) with independent adapters (e.g. `OpenAIQuestionProvider`, `AnthropicQuestionProvider`, `GeminiQuestionProvider`), none of which the domain depends on. The active providers are selected by configuration (`QUESTION_GENERATION_PROVIDER`, `QUESTION_VERIFICATION_PROVIDER`). A **`FakeQuestionProvider`** (deterministic, offline) is the default for contributors, tests, CI and development without API keys. **No concrete provider is chosen yet**: that happens in the slice that integrates AI, with a benchmark and its own ADR.
- **Structured output** validated with Zod, followed by rules and heuristics, deduplication, and an **independent second check** (a different model or configuration answering without the key).
- **Verification tiers** (AI generated, AI validated, Human reviewed, Curated) and **metadata** (provider, models, prompt version, checker agreement, batch, cost) on every question; invalidation by question or batch.
- **Budgets and limits:** a daily budget, per-context caps, provider rate limiting, retries with backoff.
- Model output is **untrusted data**: plain text rendering, length caps, no user text in prompts.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Hand-written banks only | Too slow for launch; kept as the long-term curation path |
| Runtime generation per question | Latency, cost, dependency, unvalidated content in front of players |
| Trust single-model output | Known failure modes; no quality signal |
| Lock into one provider's SDK across the codebase | Hard to switch; the contract isolates it |
| Choose a provider now | No data yet; the choice belongs to the slice that integrates AI |

## Consequences

- Positive: fast content coverage; bounded cost; traceable quality; easy invalidation; contributors run everything without keys.
- Negative: AI-validated content may still contain errors, handled by Season 0 (Beta) labeling, reports, statistics and human review in V1.

## Related

[AI question pipeline](../architecture/10-ai-question-pipeline.md), [ADR-004](ADR-004-question-engine-and-lifecycle.md).
