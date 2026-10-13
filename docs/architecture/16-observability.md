# Observability

> Part 2 · Technical architecture · Status: **Approved** (current decisions; they evolve through ADRs)

## 1. Goals

Be able to answer, for any run: **why it failed, why it got its score, which questions it saw, how long each step took and what the player answered**, without storing personal data in logs.

## 2. Logs

- **pino**, structured JSON, one line per event.
- **Context on every line:** `requestId` (from `X-Request-Id` or generated), `developerRef` (pseudonymous: a keyed hash of the Developer ID, so logs can be correlated without exposing the ID), `sessionId` (game session), `route`, `module`, `rulesetVersion`.
- **Redaction (enforced in the logger config, tested):** cookies, `Authorization`, management tokens, emails (any field named `email*` and any string that matches an email pattern), LinkedIn usernames in request bodies, question content and correct options.
- Levels: `info` for state transitions (session created, applied, stage changed, completed), `warn` for rejected client events, late answers and anomalies, `error` for failures.

## 3. Audit trail per run

The database already holds what's needed to reconstruct a run, so logs don't have to:

| Question | Where |
|---|---|
| What job and blueprint did it get? | `game_sessions` + `job_challenges` + `job_postings` (+ versions) |
| Which questions, in what order, what was answered and when? | `question_attempts` (version, option order, served/answered times) |
| Which client events were accepted or dropped? | `client_event_logs` + anomaly counters |
| How was the score computed? | `game_results.breakdown` + `scoring_version` |
| What XP was awarded and why? | `xp_ledger` entries with idempotency keys |
| Was it verified? | `result_verifications.findings` |

A CLI command `cli explain-run <sessionId>` prints the whole story for support and disputes.

## 4. Errors

Error tracking through an SDK compatible with Sentry's protocol (Sentry or a self-hosted GlitchTip), behind configuration (off by default in local development). The same redaction rules apply. Release tagging with the git SHA.

## 5. Metrics

OpenTelemetry metrics (exported to Prometheus-compatible storage when deployed; optional locally):

| Metric | Why |
|---|---|
| HTTP latency and errors by route | p95 targets |
| Sessions created, applied, completed, failed, abandoned (by run type) | Funnel health |
| Answer latency (server-measured) distribution | Fairness and UX |
| Rejected client events, `CHECKPOINT_TOO_EARLY`, late answers | Cheating or bugs |
| Queue depth, job durations, failures | Worker health |
| AI: items generated, accepted, rejected by reason, cost | Content pipeline |
| Daily close duration and status | Rankings health |

Tracing (OpenTelemetry) can be enabled later; request IDs already connect logs.

## 6. Health and alerts

- `GET /api/health` (liveness) and `/api/ready` (database and Redis checks).
- Alerts (initial): error rate spike, p95 above target for 10 minutes, daily close not completed by 01:00 UTC, AI budget reached, queue dead-letter growth, email-pattern detected in logs (should never happen).
