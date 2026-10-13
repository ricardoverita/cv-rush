# @cv-rush/content

Open content and the tools that validate it.

| Path | Contents | License |
|---|---|---|
| `data/catalog/` | Tracks, technology categories, technologies (with aliases), roles (with core/allowed categories and recommendations) | CC BY 4.0 |
| `data/questions/` | Question packs in YAML. Today only a **sample** pack used for development and tests | CC BY 4.0 |
| `src/` | Zod schemas, loaders and validators | Apache-2.0 |

Commands (from the repository root):

```bash
pnpm content:validate     # catalogs: schema, ids, references, alias collisions
pnpm questions:validate   # question packs: schema, translations, options, ids, technologies, lengths
```

Questions in this repository are **public**, so they are never used in ranked play: ranked questions live in the private database (see [content strategy](../../docs/questions/content-strategy.md)). Guides: [adding questions](../../docs/contributing/adding-questions.md), [adding a technology](../../docs/contributing/adding-a-technology.md), [adding a role](../../docs/contributing/adding-a-role.md).
