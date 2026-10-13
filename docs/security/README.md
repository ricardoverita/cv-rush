# Security and privacy engineering

> Part 2 · Status: **Approved** (current decisions; they evolve through ADRs) · Decisions: [ADR-021](../adr/ADR-021-personal-data-handling.md), [ADR-007](../adr/ADR-007-provisional-developer-identity.md), [ADR-012](../adr/ADR-012-web-and-api-applications.md)
>
> Anti-cheat is in [anti-cheat](../anti-cheat/README.md). Vulnerability disclosure (SECURITY.md) comes with the repository foundations (Part 3).

## 1. Threat model (summary)

| Threat | Asset | Control |
|---|---|---|
| **XSS** (stored via names, LinkedIn, AI content) | Sessions, other players | React escaping; no `dangerouslySetInnerHTML` for user or model content; strict CSP with nonces; display-name character allowlist; AI text rendered as plain text with an inline-code allowlist |
| **CSRF** | State-changing actions | `SameSite=Lax` cookie, required custom header, `Origin`/`Sec-Fetch-Site` checks, no state change on GET |
| **SQL injection** | Database | Prisma parameterized queries; raw SQL only through typed, parameterized statements |
| **Credential theft** | Developer accounts | HTTP-only, Secure, `__Host-` cookie; hashed tokens at rest; revocation; management token in the URL fragment (never logged) |
| **Session fixation / guessing** | Developer accounts | 256-bit random tokens; the Developer ID is never a credential |
| **Open redirect** | Phishing | No redirect parameters; locale redirects are internal |
| **LinkedIn URL abuse** (`javascript:`, lookalikes, redirects) | Players clicking links | Strict normalization to `/in/{username}`; we build the URL; never fetched server-side |
| **SSRF** | Internal network | The server never fetches user-provided URLs; the only outbound calls are to configured providers |
| **Replay / double submission** | Game integrity | Idempotency, conditional updates, unique constraints |
| **Invalid state transitions** | Game integrity | Domain state machine; `INVALID_TRANSITION` |
| **Leaderboard abuse** (names, impersonation, spam) | Reputation | Name moderation, reports, audited hiding, no indexing of provisional pages |
| **Scraping** of public data | Players' privacy | Rate limits, minimal public fields, `noindex` where appropriate |
| **Prompt injection** in the AI pipeline | Content integrity | No user text in prompts; output treated as data; validation stages |
| **Secrets leakage** | Everything | Secrets only in server environment; `.env` git-ignored; GitHub secret scanning and push protection; CI scanning |
| **Dependency vulnerabilities** | Everything | Dependabot (or Renovate), `pnpm audit` in CI, minimal dependencies, lockfile |
| **Admin abuse** | Integrity, privacy | No HTTP admin surface in the MVP; CLI on the server only; every action audited |
| **DoS** | Availability | Rate limits, request size limits, timeouts, CDN for static content |

## 2. Personal data handling

| Data | Storage | Exposure rules |
|---|---|---|
| Email | AES-256-GCM ciphertext + key version; HMAC lookup hash; never plaintext at rest | Masked to the owner only; excluded from every public schema, log line and analytics event (tests enforce it) |
| LinkedIn username | Plaintext (it's public by nature when shown), with verification status and visibility | Shown only if the profile is public and `linkedinVisibility = shown` |
| Display name | Plaintext, moderated | Public only if the profile is public |
| IP address | Not stored; a keyed hash with daily rotation for rate limiting and abuse signals, kept for a short time | Never exposed |
| User agent | Family only (e.g. "Chrome Android") on device credentials | Never exposed |

**Logs:** structured, redacted (emails, tokens, cookies, contact payloads, question content), with pseudonymous developer references.

**Deletion** (`DELETE /me`): deletes contact identifiers, display name and profile; revokes credentials; anonymizes results (kept for aggregates and ranking integrity); writes an audit entry. The management link can trigger the same flow from another device.

**Data subject requests** (export, deletion) through the app or a documented contact; responses within legal deadlines.

## 3. Web security headers

See [deployment §4](../architecture/18-deployment.md#4-security-headers-at-the-proxy-and-in-nextjs).

## 4. Supply chain and repository hygiene

- Lockfile committed; installs with `--frozen-lockfile` in CI.
- New dependencies require a short justification in the PR (maintenance, size, license, necessity), per the project principles.
- GitHub: secret scanning + push protection, Dependabot alerts and updates, CodeQL for TypeScript, branch protection on `main` with required CI checks (set up in Part 3).
- No production data, real emails or real LinkedIn profiles in seeds or fixtures.

## 5. What stays private even though the repository is public

Server secrets and keys · database contents (developers, contact data, results, question pools and answer keys, generation batches) · the Daily Company schedule for future days · verification thresholds and plausibility floors · moderation lists that would help evade filters (if any are kept private) · logs and analytics data.
