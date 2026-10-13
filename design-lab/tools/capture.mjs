// Captures the S2.5 prototypes with the installed Google Chrome (via the web app's Playwright).
// Usage: node design-lab/tools/capture.mjs [round-1] [filter]
import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');

const round = process.argv[2] ?? 'round-1';
const filter = process.argv[3] ?? '';
const out = `${root}screenshots/${round}`;
mkdirSync(out, { recursive: true });

const directions = ['a-corporate-arcade', 'b-neon-pixel', 'c-paper-trail'];
const shots = [
  { page: 'race', name: 'race-desktop', width: 1440, height: 810 },
  { page: 'ats', name: 'ats-desktop', width: 1440, height: 810 },
  { page: 'recruiter', name: 'recruiter-desktop', width: 1440, height: 810 },
  { page: 'race', name: 'race-mobile-landscape', width: 844, height: 390, mobile: true },
  {
    page: 'race',
    name: 'race-mobile-portrait-fit',
    width: 390,
    height: 844,
    mobile: true,
    query: '?portrait=fit',
  },
  { page: 'race', name: 'race-mobile-portrait-rotate', width: 390, height: 844, mobile: true },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const direction of directions) {
  if (filter && !direction.startsWith(filter)) continue;
  for (const shot of shots) {
    if (!existsSync(`${root}${direction}/${shot.page}.html`)) continue;
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 2,
      isMobile: Boolean(shot.mobile),
      hasTouch: Boolean(shot.mobile),
    });
    const page = await context.newPage();
    const url = pathToFileURL(`${root}${direction}/${shot.page}.html`).href + (shot.query ?? '');
    await page.goto(url);
    // Evaluated in the page (a string, since this file runs on Node).
    await page.evaluate('document.fonts.ready');
    await page.waitForTimeout(900);
    const file = `${out}/${direction.slice(0, 1)}-${shot.name}.jpg`;
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log('saved', file.replace(root, 'design-lab/'));
    await context.close();
  }
}
await browser.close();
