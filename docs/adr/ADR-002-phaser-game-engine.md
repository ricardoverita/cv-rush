# ADR-002: Phaser as the game engine, decoupled from the web app

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The game is a 2D side-scrolling platformer/runner for mobile and desktop browsers: auto-run, jumping, dropping through platforms, obstacles, pickups, answer paths, a conveyor minigame, bots, a camera that follows, responsive scaling, touch and keyboard input, audio, and good performance in in-app browsers. The web app is Next.js/React. Requirements: performance, simplicity, responsiveness, animations, compatibility, maintainability.

## Decision

Use **Phaser** (the latest stable major at implementation time; validate v4 stability in the prototype, otherwise v3.x) inside a **framework-agnostic package** (`packages/game`) with a typed `createGame(container, options) → GameHandle` API, an injected `GameServerPort` for all network I/O, and an injected translator. React hosts it through a `GameHost` component; Phaser is loaded dynamically only for runs.

## Alternatives considered

| Alternative | Why not |
|---|---|
| PixiJS + custom logic | Excellent renderer, but physics, scenes, input, scale manager, tweens, audio and the loader would be ours to build and maintain |
| Kaplay (ex-Kaboom) | Simple and fun, but a smaller ecosystem and fewer production references for performance tuning |
| Custom canvas or DOM game | Maximum control, maximum cost; reinventing a platformer engine is out of scope |
| Unity/Godot web exports | Large bundles and slow loads in in-app browsers; a different language and toolchain for contributors |

## Consequences

- Positive: arcade physics fits a platformer; mature input and scaling for mobile; a large community; the game can be tested and embedded without Next.js; the web app stays light outside runs.
- Negative: Phaser's bundle size (mitigated by dynamic import); its scene lifecycle must be bridged carefully with React (destroy on unmount).
- Follow-ups: a prototype in slice S4 to validate camera, readability and fps on mid-range Android in LinkedIn's in-app browser.

## Related

[Game integration](../architecture/14-game-client-integration.md), [run structure](../game-design/run-structure.md).
