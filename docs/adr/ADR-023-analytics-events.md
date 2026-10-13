# ADR-023: Provider-agnostic analytics events

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The product needs funnel, progression and content-quality analytics from day one (e.g. `first_game_completed → identity_contact_added`), with privacy by design, without coupling to Google Analytics, PostHog or any provider, and without analytics influencing game logic.

## Decision

- An **event catalog** in `packages/contracts` (name, version, allowlisted properties).
- **Server events** are recorded by use cases in the same transaction into a first-party `analytics_events` table; **client events** go through an allowlisted, rate-limited endpoint and are never used for business logic.
- Pseudonymous developer references; no personal data in properties.
- Provider adapters (PostHog, Plausible, OpenTelemetry, a warehouse) can be added later as export jobs without changing the catalog.

## Alternatives considered

| Alternative | Why not |
|---|---|
| A third-party analytics SDK in the browser | Tracking concerns, cookie banners, ad blockers, vendor lock-in |
| Analytics derived from logs | Fragile parsing; mixes operational and product data |
| Domain events as analytics events | Different audiences and privacy needs; analytics events are a filtered, stable subset |

## Consequences

- Positive: privacy control; no vendor lock-in; reliable server-side funnels.
- Negative: dashboards must be built (SQL first, provider later).

## Related

[Analytics](../analytics/README.md), [success metrics](../product/success-metrics.md).
