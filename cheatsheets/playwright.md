---
title: "Playwright Cheat Sheet"
description: "Quick reference for Playwright — install, locators, waiting, assertions, fixtures, mocking, and debugging."
sidebar_position: 2
tags: [playwright, sdet, test-automation, e2e, cheat-sheet]
hide_table_of_contents: true
---

# Playwright cheatsheet

A one-page reference for Playwright. For the full walkthrough — architecture,
POM, CI setup, interview Q&A — see the [complete guide](/docs/sdet-skills/playwright/playwright-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/playwright/playwright-guide">📖 Full guide: Playwright →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Install & config

```bash
npm init playwright@latest
npx playwright install
npx playwright test
```

```ts
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,
  use: { trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
});
```

</div>

<div class="cheat-card">

#### Anatomy of a test

```ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('valid creds redirect', async ({ page }) => {
    await page.getByLabel('Username').fill('abhishek');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

</div>

<div class="cheat-card">

#### Locators — priority order

```ts
page.getByRole('button', { name: 'Submit' });
page.getByLabel('Username');
page.getByPlaceholder('Search…');
page.getByText('Welcome');
page.getByTestId('user-menu');  // last resort: CSS/XPath
```

```ts
// chaining / filtering
page.getByRole('row', { name: 'Invoice #1042' })
  .getByRole('button', { name: 'Delete' });
page.getByRole('listitem').filter({ hasText: 'A' });
page.getByRole('listitem').nth(2);
```

</div>

<div class="cheat-card">

#### Waiting

```ts
// auto-waits before every action — no sleeps needed
await page.waitForURL('**/dashboard');
await locator.waitFor({ state: 'visible' });
await page.waitForResponse(r => r.url().includes('/api/orders'));
```

Anti-pattern: `page.waitForTimeout(3000)` — never commit a hard sleep.

<span class="cheat-see">See: Auto-Waiting & Actionability</span>

</div>

<div class="cheat-card">

#### Assertions (web-first, auto-retry)

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Order confirmed');
await expect(locator).toHaveCount(3);
await expect(page).toHaveURL(/\/orders\/\d+/);
await expect(page).toHaveScreenshot('dash.png');

expect.soft(locator).toHaveText('X');       // collects, doesn't stop
await expect.poll(async () => n()).toBeLessThan(5);
```

</div>

<div class="cheat-card">

#### Fixtures (DI)

```ts
export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  authedPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: 'auth/user.json' });
    await use(await ctx.newPage());
    await ctx.close();
  },
});
```

Built-ins: `page`, `context`, `browser`, `request`.

</div>

<div class="cheat-card">

#### Network mocking

```ts
await page.route('**/api/orders', route =>
  route.fulfill({ status: 200, body: JSON.stringify([{ id: 1 }]) })
);
await page.route('**/*.{png,jpg}', r => r.abort());       // block assets
await page.route('**/api/payment', r => r.abort('failed')); // sim. failure
```

</div>

<div class="cheat-card">

#### Auth: reuse a session

```ts
// once, in setup
await page.context().storageState({ path: 'auth/user.json' });
```

```ts
// playwright.config.ts
use: { storageState: 'auth/user.json' }
```

Avoids re-running UI login for every test.

</div>

<div class="cheat-card">

#### Real-world UI

```ts
page.frameLocator('#payment-iframe').getByLabel('Card');
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: 'Open' }).click(),
]);
await page.getByLabel('Upload').setInputFiles('f.pdf');
page.on('dialog', d => d.accept());
```

</div>

<div class="cheat-card">

#### Debugging toolkit

| Tool | Command |
|---|---|
| UI Mode | `--ui` |
| Trace Viewer | `show-trace trace.zip` |
| Codegen | `codegen example.com` |
| Debug mode | `--debug` |
| Inline pause | `page.pause()` |

</div>

<div class="cheat-card">

#### CI

```bash
npx playwright install --with-deps
npx playwright test --shard=1/4
npx playwright show-trace trace.zip
```

`forbidOnly: !!process.env.CI` blocks a stray `.only` from shipping.

</div>

<div class="cheat-card">

#### Rules of thumb

- Prefer `getByRole`/`getByLabel` over CSS/XPath.
- No hard sleeps, ever.
- One assertion concept per test.
- Tests independent — no shared UI-chain state.
- Tag tests (`@smoke`) and wire to CI via `--grep`.

</div>

</div>
