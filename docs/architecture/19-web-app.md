# Web app (Next.js)

> Part 2 · Technical architecture · Status: **Approved** (current decisions; they evolve through ADRs) · Decisions: [ADR-006](../adr/ADR-006-i18n-routing.md), [ADR-012](../adr/ADR-012-web-and-api-applications.md)

## 1. Responsibilities

Pages, accessible UI, i18n routing, SEO metadata, share pages and OG images, and hosting the game. **No business rules**: the web app calls the API and renders.

## 2. Routes

| Route (per locale `/es`, `/en`) | Rendering | Notes |
|---|---|---|
| `/{locale}` (landing) | SSR + revalidate (short) | Indexable; today's company, champions spotlight, countdown (hydrated) |
| `/{locale}/play` | Client (after a small SSR shell) | Onboarding (if needed), "Competing as", Play Ranked / Practice |
| `/{locale}/play/run` | Client; Phaser loaded dynamically | The run; React overlays for the posting, results, Save your progress, review |
| `/{locale}/me` | Client (private, `noindex`) | My Profile: level, XP, history, stats, visibility, contact |
| `/{locale}/rankings/[period]/[scope]` | SSR + short revalidate | Public category rankings; `me` highlighted client-side |
| `/{locale}/r/[resultId]` | SSR | Share page + OG image; respects current visibility |
| `/{locale}/manage` | Client (`noindex`) | Management link exchange (token in the fragment) |
| `/{locale}/how-ranking-works`, `/what-is-public`, `/privacy`, `/terms` | Static | Indexable legal and transparency pages |
| `/{locale}/developers/[slug]` *(Stage 2)* | SSR | Public developer pages (indexable only once claimed) |

`/` redirects to the detected locale. See [i18n](../i18n/README.md).

## 3. Data access

- **Server components** fetch public data (rankings, spotlight, share pages) from the API over the internal network, forwarding no credentials, and cache by URL.
- **Client components** call `/api/v1/*` on the same origin with the device cookie (`credentials: 'same-origin'`) through a small typed client generated from `packages/contracts` schemas.
- No client-side global store beyond what the UI needs. The server is the state; the UI reflects it.

## 4. Onboarding UX implementation notes

- The stack picker loads the catalog once (`GET /catalog`, cached), shows the role's recommended technologies, categories collapsed, a local search with aliases, and role rules inline. Validation errors from the API map to messages by code.
- "Competing as" shows the category computed by the API (never computed client-side for anything that matters).

## 5. Accessibility

- Forms and menus are semantic HTML, keyboard-navigable, labeled, with visible focus.
- The answer overlay mirrors canvas options as buttons (see [game integration](14-game-client-integration.md#3-lifecycle-in-nextjs)).
- `prefers-reduced-motion` and an in-app setting propagate to the game.
- Color tokens are checked for contrast; states never rely on color alone.
- Automated checks (axe) in Playwright runs; manual screen-reader passes before launch.

## 6. SEO and sharing

- Locale-specific metadata, canonical URLs, `hreflang` alternates (`es`, `en`, `x-default`).
- OpenGraph and Twitter cards for the landing, rankings and share pages; OG images rendered by the web app (cached), with the competing context and **no email ever**.
- Private pages (`/me`, `/manage`, `/play/run`) are `noindex`.

## 7. Performance

- The landing is light (no game bundle).
- Phaser and assets load only on `/play/run`, prefetched after the player chooses Ranked or Practice.
- Fonts self-hosted and subset; images optimized; the CDN caches static assets and public SSR pages briefly.
