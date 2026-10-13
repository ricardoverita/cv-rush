# Developer profile

> Part 1 · Product & Game Design · Status: **Approved (revision 4)**
>
> The persistent developer profile is the asset that CV Rush builds over time. The game is how it grows. This document defines what the profile contains, what is private or public, and how it evolves from the MVP's private profile page to a public developer page.

## 1. Three layers

| Layer | What it is | Changes over time? |
|---|---|---|
| **Developer** (identity) | Who plays: server-generated ID, claim identifiers, consents, visibility. See [identity and accounts](identity-and-accounts.md). | Rarely |
| **Current professional profile** | Name, declared seniority, role, stack, links (LinkedIn, later portfolio) | Yes, editable (with the ranked daily lock) |
| **Profile snapshot** (per run) | The frozen copy a run was played as. See [competitive identity](competitive-identity.md). | Never |

Progression (XP, level), history, stats and ranks are **derived from results**; see [progression](../game-design/progression.md).

## 2. Field classification

| Field | Private | Public with consent | Never public |
|---|---|---|---|
| Developer ID | ✅ | | (internal only) |
| Display name | | ✅ | |
| Declared seniority, role | | ✅ | |
| Stack | | ✅ | |
| **Email** (`contactEmail`, optional) | ✅ | | ✅ **never**, and no option to make it public: not in rankings, public pages, HTML, share cards, the public API, analytics or logs |
| LinkedIn identifier (`linkedinIdentifier`, optional) | ✅ by default | ✅ only if `linkedinVisibility` is enabled **and** the profile is public | |
| LinkedIn visibility (`linkedinVisibility`) | ✅ setting | | |
| Portfolio URL *(Stage 2)* | | ✅ | |
| CV Rush Level, XP | ✅ by default | ✅ | |
| Games played, best ranks | ✅ by default | ✅ | |
| History (recent games) | ✅ by default | ✅ (Stage 2, per section) | |
| Technology stats | ✅ by default | ✅ (Stage 2, per section, minimum sample) | |
| Last active | ✅ | ✅ coarse only ("Active this week") | exact timestamps |
| Open to Work *(Stage 2)* | | ✅ voluntary | never inferred |
| Consents, verification statuses, device credentials | ✅ | | ✅ |
| Answers to individual questions | ✅ (own history) | | ✅ |

## 3. My profile (MVP, private)

A private page for the developer, available from the menu and the results screen:

```
Ricardo Vera                               [Edit profile]
Senior Fullstack Developer
Node.js · PHP · React · PostgreSQL · Redis
CV Rush Level 17 · 8,420 XP  ███████░░ 220 / 725 to Level 18
Games played: 21 · Delivered: 17 · Best daily rank: #1 (Fullstack · Senior+)
Last active: today

Technology challenges (≥ 10 answers)
Node.js 82% (34) · React 79% (19) · PostgreSQL 73% (11)
CV Rush gameplay statistics, not a certification.

Recent games
#21 · Ranked · Kestrel Pay · Delivered · 18,492 pts · #1 · 12 Oct
#20 · Practice · Lumen Retail · ATS rejected · 6,120 pts · 12 Oct
…

Visibility: Private  [Show me publicly]
LinkedIn: linkedin.com/in/ricardovera · Show on public rankings: No  [Change]
Email: r••••@example.com (private, never shown)    [Manage / delete data]

(Without an email:)
⚠ Your progress is saved on this device for now. [Add an email] to keep it safe.
```

## 4. Public developer page (Stage 2, designed now)

`/developers/ricardo-vera`, shown only when the developer makes their profile public, with **per-section toggles**:

```
Ricardo Vera
Senior Fullstack Developer · CV Rush Level 23
Node.js · PHP · React · PostgreSQL · Redis
Challenges played: 38 · Best daily rank: #1 · Active today
Technology challenges: Node.js 82% (84 answers) · Redis 76% (34) · APIs 91% (22)
[LinkedIn] [Portfolio]  · Open to Work (voluntary)
Badges · Recent games · Best results
CV Rush gameplay statistics, not a certification.
```

Rules:

- The **slug** comes from the display name, is unique, can change (old slugs redirect), and never contains the email.
- **Provisional (unclaimed) public pages are not indexed** by search engines; claimed ones may be indexed with consent.
- Every number has its context (sample size, period, category).
- "Report this profile" on every public page.
- Rate-limited and protected against scraping.

## 5. Editing the profile

- Name, seniority, role, stack and links can be edited at any time, except that the **ranked profile is locked for the rest of the UTC day** after the first ranked run (see [competitive identity](competitive-identity.md#6-ranked-profile-lock)).
- Past results keep their snapshot context. If Ricardo becomes a Backend Developer, his past Fullstack results still say Fullstack.
- Name changes are re-moderated. Frequent changes can be rate-limited.

## 6. Later additions (not MVP)

Portfolio link · Open to Work · badges · season stats · public history and stats sections · "discoverable by recruiters" (Stage 4, separate consent) · verified identifiers after claiming.
