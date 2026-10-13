# ADR-024: Versioned rulesets and simple feature flags

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The game has many tunables (windows, damage, ATS composition, XP rules, level curve, rotation targets, scoring weights). Balancing must not require code changes, and every result must remain explainable with the values it was played under. Some features roll out progressively (AI questions, Salary Negotiation, Weekly Top 7, public profiles).

## Decision

- **Rulesets** are versioned files in `packages/content/rulesets/`, validated with Zod at CI time and at boot. Sessions record `ruleset_version` and `scoring_version`.
- Competitive-impacting changes coincide with a period boundary or a new season.
- **Feature flags** are a typed configuration with per-environment defaults and environment overrides. No flag service yet. Flags hide features, never security checks.
- **Environment configuration** (URLs, secrets) is validated with Zod at boot; `.env.example` documents it.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Constants in code | Magic numbers; results not explainable after changes |
| Rulesets in the database with an admin UI | Useful later; files + PR review are enough and auditable now |
| A hosted flag service | Unneeded dependency and cost at this stage |

## Consequences

- Positive: balancing through reviewed pull requests; exact reproducibility of past runs.
- Negative: changing a tunable requires a deploy (acceptable for the MVP).

## Related

[Configuration](../architecture/17-configuration.md).
