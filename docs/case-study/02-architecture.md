# 02 · Architecture: first draft

> Case-study notes · Recorded 2026-10-12, during Part 2 (architecture). Working notes, not the article.

## Context

Part 1 was approved after four revisions. Its final principle shaped the architecture: *the game creates engagement, the profile accumulates value, jobs create opportunity.* The architectural north became **Developers → Games → Progress → Reputation → Jobs → Applications → Recruiters**.

## Decisions worth telling

1. **The domain's center is the Developer, not the game.** A server-generated identity exists before any account and owns every fact; accounts will attach later through proof-of-control claims. ("Your user table is not your identity model.")
2. **Immutable facts, rebuildable views.** Game results and an append-only XP ledger are the facts; history, stats, rankings and profiles are projections. That one choice makes audits, disputes, merges and new ranking scopes cheap.
3. **Consistency where the player is looking.** The result, XP, level, stats and ranking entry are committed in one transaction, so the result screen never lies. Queues (BullMQ) are kept for work that's long, scheduled or retryable: AI generation, the daily close, sweepers. This was a direct answer to the maintainer's request not to add infrastructure "because we can".
4. **Commit the ranked attempt at race start.** Before apply, the player has only seen an open-book job posting; after apply, every exit consumes the attempt. That removes the "peek and re-roll" exploit without punishing accidental opens.
5. **Job Challenge as a source-agnostic abstraction.** Generated jobs today, the Daily Company for ranked runs, and real postings later ("Play to Apply"), without touching the game pipeline.
6. **The AI as an offline content pipeline, not a runtime dependency.** Ports and adapters, structured output, validation stages, an independent second check (which detects problems but proves nothing), tiers, budgets and batch invalidation, with fake adapters so contributors never need keys.
7. **Security that survives a public repository.** Answer keys, seeds and thresholds are data and secrets, not code. Everything else can be read by an attacker without weakening integrity.
8. **One origin for web and API.** First-party cookies in LinkedIn's in-app browser, no CORS, simpler CSRF.
9. **Licensing split.** Apache-2.0 for code (patent grant, NOTICE for recognition, explicit trademark exclusion), CC BY 4.0 for content (questions, docs), branding not licensed.

## Alternatives discarded (Part 2)

Microservices · Next.js-only backend · queueing every projection · Redis as a source of truth · event sourcing for everything · MIT for everything · a CLA · a runtime LLM call per question · committing ranked attempts at creation or at completion · email as the identity key.

## Open questions handed to the maintainer

See the Part 2 summary in the conversation and the [architecture README](../architecture/README.md); ADRs remain **Proposed** until review.

## To record during implementation

Prototype findings for the Phaser camera and readability (S3); the AI provider benchmark (S6); real latency from Latin America and Spain to the chosen region; the first tampering-suite failures and fixes; the cost per 1,000 runs.
