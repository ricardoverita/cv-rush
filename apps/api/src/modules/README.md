# API modules

The API is a **modular monolith** (ADR-001). Each module lives in `src/modules/<name>/`, owns its tables and exposes its public API through `index.ts`. Other modules import **only** from that `index.ts`.

Core modules (identity, profiles, game-sessions, questions, progression, rankings, scoring) use a light layering:

```
modules/<name>/
  domain/          entities, value objects, policies — pure TypeScript, no Nest, no Prisma
  application/     use cases, transaction boundaries, ports
  infrastructure/  Prisma repositories, Redis adapters, queue producers
  interfaces/      HTTP controllers, DTO mapping, job processors
  index.ts         public API of the module
```

Simple modules (like `health`) don't need the layers. Shared technical building blocks live in `src/platform/` (config, database, Redis, logging, queues).

See [backend modules](../../../../docs/architecture/03-backend-modules.md).
