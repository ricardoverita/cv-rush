# ADR-020: Future account claim and merge by proof of control

- **Status:** Accepted (design approved 2026-10-12; implemented in Stage 2)
- **Date:** 2026-10-12

## Context

Developers will play for months as provisional identities, possibly on several devices, accumulating XP, titles and history. When accounts arrive, they must be able to claim everything once, without duplication, and nobody must be able to claim someone else's history by typing an identifier.

## Decision

- **Claims require proof of control** of at least one of: a verified email (code or magic link) whose keyed hash matches `email_lookup_hash`; a verified provider email (OAuth); the device credential present in the browser; the management link.
- Claiming sets `developers.account_id` and `claimed_at`, marks the matching identifier as verified, and is audited. "This isn't me" detaches a mismatched email.
- **Merges** re-point facts (sessions, results, attempts, titles, ledger entries) to a survivor Developer in one transaction, keep the best ranking entry per period and scope, rebuild projections, mark the others `merged` with aliases for old links. Facts are never rewritten, only re-pointed, so merges are reversible.
- **Unverified identifiers never trigger merges.** No uniqueness on unverified emails.

## What the MVP must do now

Server-generated Developer IDs as the owner of every fact; `account_id` and `claimed_at` columns; email lookup hashes; verification-status fields; idempotent ledger keys; projections that can be rebuilt.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Merge automatically on matching (unverified) emails | Anyone could absorb anyone's history |
| Create a new Developer per account and copy data | Duplicates, broken links, double XP |
| Require accounts from day one | Friction (rejected product-wise) |

## Consequences

- Positive: "We found an existing CV Rush profile: 34 games, Level 17, 8,420 XP. Claim it?" works without data migration.
- Negative: merge logic is non-trivial and must be well tested (Stage 2).

## Related

[Identity and credentials §6](../architecture/06-identity-and-credentials.md#6-account-claim-and-merge-stage-2-designed-now), [identity and accounts (product)](../product/identity-and-accounts.md).
