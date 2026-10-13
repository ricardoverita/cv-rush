# ADR-006: i18n with locale-prefixed routing and semantic codes

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

The product is bilingual (es, en) from day one, with more languages possible. It needs SEO (indexable pages per language, `hreflang`), shareable URLs, server rendering without JavaScript, automatic detection with an `en` fallback, a manual switch that wins over detection, and no hardcoded copy in React, Phaser, backend errors, events, rankings or share cards.

## Decision

- **Locale-prefixed URLs** for every page: `/es/...`, `/en/...`. `/` redirects using `Accept-Language` (es-* → es, en-* → en, others → en). A manual choice sets a cookie that always wins; once a Developer exists, the preference is also stored server-side.
- **next-intl** for routing, middleware and ICU messages in the web app.
- **Message catalogs by namespace** in `packages/i18n`, validated in CI.
- **The backend never sends user-facing sentences**: errors, effects, failure reasons and events are semantic codes with parameters.
- **Phaser receives a translator function** from the host; the engine contains no catalogs.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Locale from cookie or `Accept-Language` only, unprefixed URLs | Poor SEO, ambiguous caching, non-shareable language-specific URLs |
| Subdomains (`es.`, `en.`) | More infrastructure and cookie scope complexity; no benefit for this product |
| Prefix only non-default locale | Inconsistent URLs; `x-default` handling becomes subtle |
| Backend-rendered messages | Couples the domain to languages |

## Consequences

- Positive: SEO-friendly, shareable, cache-friendly URLs; domain independent of language.
- Negative: every internal link must carry the locale (helpers handle it).

## Related

[i18n](../i18n/README.md), [ADR-009](ADR-009-question-localization.md).
