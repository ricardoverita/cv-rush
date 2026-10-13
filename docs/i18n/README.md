# Internationalization (es, en)

> Part 2 · Status: **Draft for review** · Decisions: [ADR-006](../adr/ADR-006-i18n-routing.md), [ADR-009](../adr/ADR-009-question-localization.md)

## 1. Locales

- Supported: `es`, `en`. Global fallback: `en`.
- Designed for more: adding a locale = message catalogs + content fragments + question translations + one entry in the locale list.

## 2. Routing and detection (web)

| Rule | Behavior |
|---|---|
| URLs | Always locale-prefixed: `/es/...`, `/en/...` |
| First visit to `/` | Detect from `Accept-Language` (`es-*` → `es`, `en-*` → `en`, anything else → `en`) and redirect |
| Manual choice | The language switch sets a `NEXT_LOCALE` cookie; **a manual choice always wins** over detection |
| Persistence | The cookie; and the Developer's `locale` preference (stored server-side) once a Developer exists |
| SEO | `hreflang` alternates for `es`, `en` and `x-default` (→ `en`); canonical per locale; no duplicate content without locale |
| Without JavaScript | Server-rendered pages work in both locales |

Implemented with **next-intl** middleware and routing (App Router).

## 3. Message catalogs

```
packages/i18n/messages/
  es/ common.json onboarding.json job.json game.json recruiter.json ats.json
      technicalInterview.json results.json progression.json leaderboard.json
      profile.json privacy.json errors.json share.json
  en/ (same files)
```

- ICU MessageFormat (plurals, numbers, dates).
- Keys are semantic: `results.competingAs` → "{name} scored {score, number} points competing as a {seniority} {role}." / "{name} consiguió {score, number} puntos compitiendo como {seniority} {role}."
- `pnpm translations:validate`: missing keys, extra keys, ICU syntax, placeholder parity between locales.

## 4. No hardcoded copy anywhere

| Layer | How |
|---|---|
| React components | `useTranslations(namespace)` |
| Phaser scenes | A translator function injected by the host (`t(key, params)`); the engine has no catalogs |
| Backend errors | `{ code, params }` → `errors.<code>` in the client |
| Game events and effects | Semantic codes (`ATS_FAILED`, `CV_DAMAGE`) → `game.effects.*` |
| Rankings, share cards, OG images | Rendered by the web app with catalogs; the API returns data, not sentences |
| Emails *(Stage 2)* | Templates per locale in the worker |

## 5. Content localization

- **Job postings:** facts are language-independent; texts come from per-locale fragments in `packages/content` (authored, not machine-translated at runtime). Different jokes per language are allowed; different facts are not.
- **Questions:** per-locale prompt, options and explanation with **shared option IDs and correct option** ([ADR-009](../adr/ADR-009-question-localization.md)). A run's question locale is fixed at creation.
- **Catalogs:** role names, categories and seniority labels have translations; technology names are never translated.
- **Formatting:** `Intl` for numbers, currencies (from the job's location) and dates (local time for display, UTC canonical).

## 6. Adding a language (summary for the future guide)

1. Add the locale to the supported list.
2. Copy catalogs and translate; run `pnpm translations:validate`.
3. Add content fragments for job generation.
4. Add question translations (AI generation can produce them; validation requires parity).
5. Ranked eligibility for that locale only when its question translations pass validation.
