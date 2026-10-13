# Design lab

Browser prototypes for the S2.5 design gate ([implementation plan](../docs/architecture/22-implementation-plan.md#s25--game-theme-and-visual-design-gate-before-s3), [D-085](../docs/case-study/decision-log.md#d-085--a-visual-design-gate-before-the-game-engine)): how CV Rush could look before any game-engine work.

**This is not production code.** Nothing here is imported by `apps/` or `packages/`, it isn't part of any build, and the art is exploratory. Once a direction is approved, its rules move to `docs/game-design/visual-bible.md` and the real assets are made for the game.

## What's here

| Path | |
|---|---|
| [`index.html`](index.html) | All directions side by side, with links to every prototype |
| [`round-1.md`](round-1.md) | Round 1: three art directions compared, with a recommendation |
| `a-corporate-arcade/`, `b-neon-pixel/`, `c-paper-trail/` | One folder per direction: `race.html`, `ats.html`, `recruiter.html`, plus its `style.css` and `sprites.js` |
| [`shared/scenario.js`](shared/scenario.js) | The one scenario every prototype renders (player, bots, CV state, questions, ATS keywords) |
| [`shared/frame.css`](shared/frame.css) | The common stage: full-viewport scene, HUD layer, phone controls, rotate prompt |
| [`tools/capture.mjs`](tools/capture.mjs) | Takes the screenshots with Playwright and the installed Chrome |
| `screenshots/` | Captured screenshots, one folder per round |

## Opening the prototypes

They are static pages: open `index.html` (or any page) straight from disk in a browser, no server needed. An internet connection is needed for the fonts.

- Phone layout: use the browser's device emulation at 844×390 (landscape).
- Portrait: at 390×844 the game asks you to rotate; add `?portrait=fit` to see what playing in portrait would look like.
- Reduced motion (`prefers-reduced-motion`) stops every animation.

## Screenshots

```bash
node design-lab/tools/capture.mjs round-1
```

Run it from the repository root after `pnpm install`. It uses the Playwright that `apps/web` already depends on, with the installed Chrome (no browser download). It writes `screenshots/round-1/<a|b|c>-<view>.jpg`; pass a letter to capture one direction (`… round-1 b`).

## Rules

- **Original assets only.** Every shape is drawn here in SVG/CSS; no downloaded sprites, icons or images. Nothing copies other games or franchises.
- **Fonts** come from Google Fonts under the SIL Open Font License 1.1, listed in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). The prototypes load them from Google's CDN; the game itself would self-host the chosen fonts.
- **Same scenario everywhere.** Prototypes read their text from `shared/scenario.js`, so directions differ in style, not in content.
- **Humor targets the hiring process, never people,** and stays in the background.
