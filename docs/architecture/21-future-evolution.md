# Future evolution: network, jobs and recruiters (not built)

> Part 2 · Technical architecture · Status: **Approved** (current decisions; they evolve through ADRs)
>
> How Stages 2–4 of the [product evolution](../product/product-evolution.md) attach to the MVP architecture **without changing its center**. Nothing here is implemented in the MVP.

## 1. What the MVP already provides

| Future need | Already in place |
|---|---|
| Durable identity | `developers` as the anchor; `account_id`, `claimed_at`, contact identifiers with verification status |
| Reputation | Immutable `game_results` with competing context; `xp_ledger`; `titles`; stats projections |
| Public profiles | Visibility fields; a single public-card mapper; projection-based reads |
| Jobs | `JobChallenge.source` (`job_posting` reserved); `companies.kind` and `owner_account_id`; `job_postings.origin` |
| Seasons | `season_id` on results, ledger and rankings |
| Analytics | Domain events and an allowlisted first-party event table |

## 2. Stage 2 · Developer Network

| Addition | Shape |
|---|---|
| Accounts | New module `accounts`: `user_accounts`, `account_identities`, email verification (one-time codes or magic links via an email provider in the worker), GitHub/Google OAuth |
| Claim and merge | The flows in [identity](06-identity-and-credentials.md#6-account-claim-and-merge-stage-2-designed-now); `developer_aliases` |
| Public developer pages | Module `public-profiles`: `public_profiles (developer_id, slug, sections jsonb, indexable)`, slug history for redirects; SSR pages in `apps/web` |
| Badges, Open to Work, portfolio | Columns or small tables owned by `public-profiles`; Open to Work is an explicit, voluntary flag with a timestamp |
| Seasons | Season rotation commands; season progression cache |

## 3. Stage 3 · Jobs

| Addition | Shape |
|---|---|
| Real companies | `companies.kind = real`, verification status, `owner_account_id`, company profile |
| Company users | `company_members (company_id, account_id, role)`: the first **multi-tenant** boundary. All company-scoped queries filter by `company_id` (enforced in repositories; consider PostgreSQL row-level security at this point) |
| Job postings | `job_postings.origin = published`, status, lifecycle, moderation |
| Play to Apply | `JobChallenge` instances with `source = job_posting`; the same sessions, scoring and results |
| Applications | Module `applications`: `applications (developer_id, job_posting_id, result_id, shared_fields jsonb, consent_id, status, created_at)`; the developer chooses what is shared; withdrawable |

The game session pipeline doesn't change: Play to Apply is a new Job Challenge source.

## 4. Stage 4 · Recruiter platform

| Addition | Shape |
|---|---|
| Recruiter accounts | Account roles within `company_members` |
| Discoverability | A separate consent `discoverable_by_recruiters` on the Developer; search **only** over discoverable public profiles |
| Search | Start with PostgreSQL (GIN on `technology_ids`, filters on band, track, last-active buckets, completed challenges); move to a search engine only if needed |
| Applicant views | Read models over applications + shared fields |
| Messaging | Opt-in, rate-limited, abuse-reportable; a separate module |
| Access logging | Every recruiter view of a profile is logged and visible to the developer |

## 5. Guardrails that become code

- No API returns a developer to a company unless the developer is discoverable or applied to that company.
- Recruiter-facing UIs show stats with sample size and the "gameplay statistics, not a certification" notice, enforced by the shared component.
- No automated decision endpoints (no "reject below score X").
- Data processing agreements, audit logs and a legal review before Stage 3 launches.

## 6. Extraction candidates

If scale or team structure demands it: `question-generation` (already isolated in the worker), `rankings` read paths, and `recruiters`/`applications` (different users, different load) are the natural first services. Contracts and the outbox already provide the seams.
