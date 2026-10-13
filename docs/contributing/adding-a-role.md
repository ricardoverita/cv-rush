# Adding a role

Roles live in `packages/content/data/catalog/roles.yaml`. Each role belongs to a **track** (`tracks.yaml`), the competitive family used for rankings (see [competitive identity](../product/competitive-identity.md)).

```yaml
- id: site_reliability_engineer
  track: platform
  labels: { en: Site Reliability Engineer, es: Site Reliability Engineer }
  minSeniority: mid                 # optional
  coreCategories: [infrastructure]  # the stack must include at least one technology from each
  allowedCategories: [cloud, backend, databases, messaging, security]
  recommended: [kubernetes, terraform, aws, go, python]
```

Rules checked by `pnpm content:validate`: unique id, existing track, existing categories, recommended technologies exist and belong to the role's categories.

A new role usually needs content too (questions for its track). Ranked play for a track is enabled only when there is enough validated content; until then the role is practice-only. Open a "New question pack" issue to coordinate.
