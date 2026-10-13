# ADR-012: Next.js web app and NestJS API on one origin

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

The product needs SEO-friendly server rendering (landing, rankings, share pages, OG images) and a rich client (the game). Business rules must live in one place, separated from the UI. Most traffic comes from in-app browsers (LinkedIn), where third-party cookies and cross-origin requests are fragile.

## Decision

- **apps/web**: Next.js (App Router) for pages, SSR, metadata, OG images, i18n routing, and hosting the game. **No business rules.**
- **apps/api**: NestJS (Fastify adapter) for all business rules, with an HTTP entrypoint and a worker entrypoint.
- **One origin**: a reverse proxy serves the web at `/` and the API at `/api` on the same domain, so the device-credential cookie is first-party, there's no CORS, and CSRF protection is simpler.
- The web's server components call the API over the internal network for public data.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Next.js only (route handlers + server actions) | Business rules in the UI app; the worker would need a second home for the same rules; weaker module structure |
| API on a separate subdomain | Cookie scope and CORS complexity; third-party-cookie risks in in-app browsers |
| SPA (no SSR) | Poor SEO and share previews |
| Next.js rewrites as the proxy | Adds latency and load to the web app; a reverse proxy is simpler and faster |

## Consequences

- Positive: clean separation; first-party cookies; SEO; the API is reusable by future clients (public API, mobile wrappers).
- Negative: two Node apps to deploy plus a proxy; local development needs the proxy too (provided via Docker Compose or a dev proxy).

## Related

[Overview](../architecture/01-overview.md), [web app](../architecture/19-web-app.md), [identity](../architecture/06-identity-and-credentials.md).
