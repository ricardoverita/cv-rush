# ADR-021: Personal data handling — encrypted email, no PII in logs or analytics

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

Developers may add an email (private, always) and a LinkedIn username (public only with consent). The repository is public, logs and analytics are operational data, and a breach must expose as little as possible. The email must never appear in rankings, public pages, HTML, share cards, the public API, analytics or logs.

## Decision

- **Email:** normalized, then stored as AES-256-GCM ciphertext (application-level, versioned keys from secret storage) plus an HMAC-SHA256 lookup hash (server pepper) for future claims. No plaintext column. Owners see a masked form only.
- **No visibility field for email**, so there's nothing to toggle by mistake.
- **LinkedIn:** the normalized username only; `linkedinVisibility` defaults to hidden; shown only for public profiles.
- **Public DTOs** come from a single allowlist mapper; contract tests assert no public schema contains email fields.
- **Logs:** pino redaction (emails, tokens, cookies, contact payloads), pseudonymous developer references; an alert if an email pattern ever appears in logs.
- **Analytics:** pseudonymous references and allowlisted properties only; never names, emails, LinkedIn usernames or free text.
- **IP addresses:** not stored; a short-lived keyed hash for rate limiting and abuse signals.
- **Deletion:** removes contact data and the profile, revokes credentials, anonymizes results.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Plaintext email with database-level access control | A single leak exposes every email |
| Database-native encryption (e.g. `pgcrypto`) with keys in SQL | Keys would travel in queries and logs; application-level encryption keeps keys out of the database |
| Hash-only email (no ciphertext) | Can't recover or contact the developer (with consent) or show the masked value |

## Consequences

- Positive: minimal exposure in a breach; strong guarantees backed by tests.
- Negative: key management and rotation must be operated; emails can't be queried with SQL by design.

## Related

[Security and privacy engineering](../security/README.md), [identity](../architecture/06-identity-and-credentials.md).
