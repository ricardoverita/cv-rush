# CV Rush

*Read this in [English](README.md).*

[![CI](https://github.com/ricardoverita/cv-rush/actions/workflows/ci.yml/badge.svg)](https://github.com/ricardoverita/cv-rush/actions/workflows/ci.yml)

**CV Rush** (nombre provisional) es un juego web 2D open source sobre el proceso de selección, pensado como puerta de entrada a una red de developers. Eliges tu seniority, rol y stack, tomas tu CV y atraviesas recruiters, una máquina ATS y entrevistas para entregarlo en la empresa. Cada partida está pensada para construir tu perfil de developer: score, XP, niveles, historial y rankings.

> **The game creates engagement. The profile accumulates value. Jobs create opportunity.**

## Estado actual

**Slice S1: ya puedes crear tu perfil de developer. Todavía no hay un juego jugable.**

| Hecho | Todavía no |
|---|---|
| Diseño de producto y de juego ([Parte 1](docs/README.md)) y arquitectura técnica con 24 ADRs ([Parte 2](docs/architecture/README.md)) | El juego en sí (runner en Phaser, retos, preguntas en partida) |
| Un monorepo que compila, pasa los tests y se levanta en local | Historial, XP, niveles, rankings, compartir |
| Identidad de developer y onboarding (S1): un perfil de developer provisional (nombre, seniority, rol y stack del catálogo) que se reconoce en el mismo dispositivo, en inglés y español | Generación de preguntas con IA |
| Una API con health y readiness, y un worker con un job de heartbeat | Cuentas, empleos y funcionalidades para recruiters (etapas posteriores) |
| Validación de contenido con un pack de preguntas de ejemplo; CI | |

Siguiente paso: S2, un Job Challenge completo jugado sin motor gráfico, y después S3, la primera carrera jugable. Ver el [plan de implementación](docs/architecture/22-implementation-plan.md) (en inglés).

## La arquitectura en un minuto

- **El servidor es el árbitro:** el navegador renderiza y envía intenciones; el servidor decide respuestas, puntuación, XP y rankings. Las respuestas correctas nunca llegan al cliente.
- **Monolito modular:** una API NestJS con un punto de entrada HTTP y otro para el worker, PostgreSQL (Prisma) como fuente de verdad, y Redis para rate limiting, locks, colas y cachés.
- **App web en Next.js** en el mismo origen que la API, con rutas por idioma (`/en`, `/es`).
- **Paquetes compartidos:** contratos (esquemas Zod), simulación determinista, contenido abierto, catálogos de i18n y el contrato del motor de juego.

```
apps/
  web/         Next.js: páginas, i18n, SEO y (más adelante) el host del juego
  api/         NestJS: API HTTP + worker, esquema y migraciones de Prisma
packages/
  contracts/   Esquemas Zod y tipos compartidos por todas las apps
  simulation/  Lógica pura y determinista (RNG con semilla)
  content/     Catálogos y preguntas de ejemplo (YAML) + validadores
  i18n/        Catálogos de mensajes (en, es) + validador
  game/        Contratos del motor de juego (Phaser llega en el slice S3)
  config/      Presets compartidos de TypeScript
docs/          Producto, diseño de juego, arquitectura, ADRs, case study
```

Más: [visión general de la arquitectura](docs/architecture/01-overview.md) · [ADRs](docs/adr/README.md) · [visión de producto](docs/product/vision.md) (en inglés).

## Levantarlo en local

Requisitos: **Node.js 24** (ver `.nvmrc`), **Docker** con Compose v2 y Corepack (incluido en Node).

```bash
git clone https://github.com/ricardoverita/cv-rush.git
cd cv-rush
corepack enable
pnpm install
docker compose up -d --wait
pnpm db:migrate
pnpm dev
```

- Web: http://localhost:3000 (redirige a `/en` o `/es`); crea tu perfil en `/es/play`
- API: http://localhost:4000/api/health y http://localhost:4000/api/ready

Para desarrollo local no hace falta un archivo `.env`; [`.env.example`](.env.example) muestra lo que se puede sobrescribir. Detalles y todos los scripts: [desarrollo local](docs/contributing/local-development.md) (en inglés).

## Comandos útiles

```bash
pnpm verify               # formato, lint, typecheck, tests unitarios, validación, build
pnpm test:integration     # tests de la API contra PostgreSQL y Redis reales
pnpm questions:validate   # valida los packs de preguntas
pnpm translations:validate
```

## Roadmap

**Juego → Red de developers → Empleos → Plataforma para recruiters**, una etapa cada vez. Ver el [roadmap](docs/roadmap/README.md) y la [evolución del producto](docs/product/product-evolution.md).

## Contribuir

Preguntas, tecnologías y traducciones se pueden aportar sin tocar el código del juego. Empieza por [CONTRIBUTING.md](CONTRIBUTING.md) y las [guías para contributors](docs/contributing/README.md). Respeta el [Código de Conducta](CODE_OF_CONDUCT.md); las vulnerabilidades se reportan en privado como explica [SECURITY.md](SECURITY.md).

## Licencia

- **Código:** [Apache License 2.0](LICENSE) (ver [NOTICE](NOTICE)).
- **Contenido** en `docs/` y `packages/content/data/`: [CC BY 4.0](docs/LICENSE).
- **Nombre y logos:** no están licenciados; ver [TRADEMARKS.md](TRADEMARKS.md).

Motivación: [ADR-010](docs/adr/ADR-010-licensing.md).
