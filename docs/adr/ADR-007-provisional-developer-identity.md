# ADR-007: Provisional Developer identity and device credentials

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

Players must start in seconds (name, seniority, role, stack) without accounts, yet their progress (XP, level, history, rankings, titles) must persist and later attach to a real account without loss or duplication. Contact identifiers (email, LinkedIn) are optional and only asked after the first game; typing them proves nothing.

## Decision

- At light onboarding the server creates a **`Developer`** with a server-generated **UUIDv7**, status `provisional`. The Developer owns every fact.
- The browser is recognised by a **device credential**: 256 random bits in a `__Host-` cookie (`Secure`, `HttpOnly`, `SameSite=Lax`, ~400 days, sliding), stored server-side only as a SHA-256 hash, revocable. The Developer ID is never a credential.
- A **management link** (token in the URL fragment, hashed at rest, regenerable) restores access on another device.
- **Contact identifiers** (`contactEmail`, `linkedinIdentifier`) are optional, attached to the same Developer, stored with `unverified` status; they're never used for authentication or automatic merges.
- Accounts (Stage 2) **attach** to Developers via claims ([ADR-020](ADR-020-account-claim-and-merge.md)).

## Alternatives considered

| Alternative | Why not |
|---|---|
| Mandatory accounts from the start | Friction before showing value; conversion loss |
| Anonymous play with localStorage only | Progress lost easily; nothing server-side to attach later; forgeable |
| Email as the identity key | Unverified emails can be anyone's; email is private and optional |
| A JWT with the developer ID | Revocation is harder; no benefit over an opaque token with a server lookup |

## Consequences

- Positive: zero-friction start; durable server-side progress; clean path to accounts.
- Negative: progress is device-bound until an email (and later an account) exists, mitigated by the management link and the "Save your progress" prompt; cheap identities require rate limits and verification for titles.

## Related

[Identity and credentials](../architecture/06-identity-and-credentials.md), [identity and accounts (product)](../product/identity-and-accounts.md).
