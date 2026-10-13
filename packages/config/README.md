# @cv-rush/config

Shared TypeScript presets. Every package and app extends one of them:

| Preset | For |
|---|---|
| `tsconfig.base.json` | Strict options shared by everything |
| `tsconfig.library.json` | Packages compiled to ESM with declarations (`packages/*`) |
| `tsconfig.nest.json` | The NestJS API (decorators with metadata) |
| `tsconfig.nextjs.json` | The Next.js web app |

ESLint and Prettier configuration live at the repository root (`eslint.config.mjs`, `.prettierrc.json`).
