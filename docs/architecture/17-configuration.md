# Configuration, rulesets and feature flags

> Part 2 · Technical architecture · Status: **Approved** (current decisions; they evolve through ADRs) · Decision: [ADR-024](../adr/ADR-024-game-configuration-and-feature-flags.md)

## 1. Three kinds of configuration

| Kind | Examples | Where | Changes by |
|---|---|---|---|
| **Environment** | Database URL, Redis URL, encryption keys, HMAC secrets, question generation provider selection and credentials, public base URL | Environment variables (validated with Zod at boot); `.env.example` documents them; real values never in the repository | Deployment |
| **Rulesets** (game tunables) | Windows, damage values, ATS composition, XP rules, level curve, rotation targets, bands mapping, scoring weights | Versioned JSON/YAML in `packages/content/rulesets/`, validated with Zod | Pull request + deploy |
| **Feature flags** | `aiQuestions`, `salaryNegotiation`, `ghostingChallenge`, `weeklyTop7`, `publicProfiles`, `humanCheck` | A typed flags file with per-environment defaults, overridable by environment variables | Pull request or deployment config |

## 2. Rulesets

```
packages/content/rulesets/
  ruleset-2026.1.yaml        # active ruleset (season-0)
  scoring-v1.yaml
  progression-v1.yaml
  blueprints/…
```

- Each session records `ruleset_version` and `scoring_version`; results are explainable forever.
- Changing a value = a new ruleset version. Competitive-impacting changes (scoring weights, windows) should coincide with a period boundary or a new season.
- `pnpm content:validate` checks schema, ranges and cross-references (e.g. every blueprint slot kind has a strategy).
- Example values from Part 1 (damage −10/−15/−25, ATS 70%, XP 100 + score/50, practice 50%, cap 1,000) all live here, never in code.

## 3. Feature flags

- Plain typed configuration, no flag service (yet):

```ts
export const flags = defineFlags({
  aiQuestions:        { default: false, env: { production: true } },
  salaryNegotiation:  { default: false },
  ghostingChallenge:  { default: false },
  weeklyTop7:         { default: false },
  publicProfiles:     { default: false },
  humanCheck:         { default: false, env: { production: true } },
});
```

- Flags are read through one service; the web app receives only public flags (via `GET /catalog` or a config endpoint).
- Flags hide **features**, never security checks.

## 4. Secrets

| Secret | Purpose | Rotation |
|---|---|---|
| `EMAIL_ENCRYPTION_KEYS` (versioned) | AES-256-GCM for emails | New key version; lazy re-encryption |
| `EMAIL_LOOKUP_PEPPER` | HMAC for email lookup hashes | Rare (requires rehashing) |
| `DAILY_SEED_SECRET` | Daily category seeds | Per season |
| `LOG_PSEUDONYM_KEY` | `developerRef` in logs | Rare |
| Provider-specific credentials for the selected `QUESTION_GENERATION_PROVIDER` / `QUESTION_VERIFICATION_PROVIDER` (none needed for `fake`) | Worker only | Per provider policy |
| Database and Redis credentials | — | Per platform |

Secrets are only read by the server (API/worker), never bundled into the web app. Secret scanning runs in CI and on GitHub.
