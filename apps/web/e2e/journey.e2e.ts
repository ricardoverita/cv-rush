import { CatalogResponseSchema } from '@cv-rush/contracts';
import { expect, type Page, test } from '@playwright/test';

// The main journey (slice S2): onboarding → Ranked → offer → Apply → every challenge → result,
// plus a refresh and two tampering attempts over HTTP. Answers are not known to the browser,
// so the test picks options blindly: the run reaches a result either way.

const SHOTS = process.env.E2E_SCREENSHOTS_DIR;
const API = { 'x-cvr-client': 'web', 'content-type': 'application/json' };

async function shot(page: Page, name: string): Promise<void> {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

test('onboarding, a complete ranked run and its result', async ({ page, baseURL }) => {
  const origin = { origin: baseURL ?? 'http://localhost:3000' };

  // --- Onboarding: Ricardo, Senior Fullstack Developer, Node.js · PHP · React · PostgreSQL · Redis
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await page.getByRole('link', { name: 'Create your developer profile' }).click();
  await page.getByLabel('What should we call you?').fill('Ricardo');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('label', { hasText: /^Senior$/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('label', { hasText: /^Fullstack Developer$/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  for (const name of ['Node.js', 'PHP', 'React']) {
    await page.getByRole('button', { name, exact: true }).first().click();
  }
  await page.getByLabel('Search technologies').fill('postgres');
  await page.getByRole('button', { name: 'PostgreSQL', exact: true }).first().click();
  await page.getByRole('button', { name: 'Redis', exact: true }).first().click();
  await page.getByRole('button', { name: 'Create my profile' }).click();
  await expect(page.getByText('Competing as')).toBeVisible();
  await expect(page.getByTestId('ranked-attempts')).toHaveText('3 attempts remaining today');
  await shot(page, '01-play-choice');

  // --- Ranked: an offer for the profile; nothing is used yet
  await page.getByRole('button', { name: /Play Ranked/ }).click();
  await expect(page).toHaveURL(/\/en\/play\/run\/[0-9a-f-]{36}$/);
  const sessionId = page.url().split('/').at(-1) as string;
  await expect(page.getByRole('heading', { name: 'Senior Fullstack Developer' })).toBeVisible();
  const stack = page.getByTestId('job-stack');
  for (const name of ['Node.js', 'PHP', 'React', 'PostgreSQL', 'Redis']) {
    await expect(stack.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(stack.locator('li')).toHaveCount(5);
  for (const name of ['Swift', 'Kotlin']) await expect(page.getByText(name)).toHaveCount(0);
  const offered = await stack.locator('li').allInnerTexts();
  await shot(page, '02-offer');

  // --- Apply: the ranked attempt is committed by the server
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByTestId('attempt')).toHaveText('Attempt 1 of 3');
  await expect(page.getByRole('heading', { name: 'Next: Recruiter' })).toBeVisible();

  // Tampering: skipping straight to the final interview is refused.
  const skip = await page.request.post(
    `/api/v1/game-sessions/${sessionId}/challenges/final/start`,
    {
      headers: { 'x-cvr-client': 'web', ...origin },
    },
  );
  expect(skip.status()).toBe(409);
  expect((await skip.json()).error.code).toBe('INVALID_TRANSITION');

  // ATS keywords: the offer's technologies, also when the ATS shows an alias ("Postgres").
  const catalog = CatalogResponseSchema.parse(
    await (await page.request.get('/api/v1/catalog?locale=en')).json(),
  );
  const relevant = new Set(
    catalog.technologies
      .filter((t) => offered.includes(t.name))
      .flatMap((t) => [t.name, ...t.aliases])
      .map((label) => label.toLowerCase()),
  );

  // --- Play every challenge until the result
  const result = page.getByTestId('result');
  let tampered = false;
  for (let step = 0; step < 60 && !(await result.isVisible()); step++) {
    const next = page.getByRole('button', { name: /^Continue to the / });
    const atsSubmit = page.getByRole('button', { name: 'Submit to the ATS' });
    const optionA = page.getByRole('button', { name: /^Option A:/ });
    if (await next.isVisible()) {
      await Promise.all([page.waitForResponse((r) => r.url().endsWith('/start')), next.click()]);
    } else if (await atsSubmit.isVisible()) {
      await shot(page, '04-ats');
      for (const token of await page.locator('button[aria-pressed]').all()) {
        if (relevant.has((await token.innerText()).trim().toLowerCase())) await token.click();
      }
      await Promise.all([page.waitForResponse((r) => r.url().endsWith('/ats')), atsSubmit.click()]);
    } else if (await optionA.isVisible()) {
      if (!tampered) {
        // Tampering: a client claiming its answer is correct is rejected by the schema.
        await shot(page, '03-question');
        const forged = await page.request.post(
          `/api/v1/game-sessions/${sessionId}/challenges/00000000-0000-4000-8000-000000000000/answer`,
          {
            headers: { ...API, ...origin },
            data: {
              questionAttemptId: '00000000-0000-4000-8000-000000000000',
              selectedOptionId: 'a',
              correct: true,
            },
          },
        );
        expect(forged.status()).toBe(400);
        tampered = true;
      }
      await Promise.all([
        page.waitForResponse((r) => r.url().endsWith('/answer')),
        optionA.click(),
      ]);
    } else {
      await page.waitForTimeout(200);
    }
  }
  expect(tampered).toBe(true);
  await expect(result).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /APPLICATION (DELIVERED|REJECTED)/ }),
  ).toBeVisible();
  await expect(result).toContainText('competing as a Senior Fullstack Developer');
  const score = await page.getByTestId('result-score').innerText();
  await shot(page, '05-result');

  // --- Refreshing keeps showing the same result
  await page.reload();
  await expect(page.getByTestId('result-score')).toHaveText(score);

  // --- Back on the profile: two ranked attempts left today
  await page.goto('/en/play');
  await expect(page.getByTestId('ranked-attempts')).toHaveText('2 attempts remaining today');
  await shot(page, '06-attempts-left');
});
