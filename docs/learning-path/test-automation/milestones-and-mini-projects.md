---
title: "Test Automation Milestones & Mini-Projects"
description: "What to build in each of the six test automation milestones — login tests, page objects, fixtures and saved logins, an API layer, CI with tiers, and mocking, visual and known-bug tests — with tested solutions."
sidebar_position: 2
level: beginner
tags: [test-automation, playwright, learning-path, projects]
---

# Test Automation Milestones & Mini-Projects

**In short:** one framework, grown milestone by milestone. Each milestone lists
tasks and a **check** command; the solution is folded away. Every solution on
this page was run: the finished project passes **46 tests** across the API,
Chromium, Firefox and mobile Safari projects.

:::tip How to use this page

First read the milestone in the [Roadmap](/docs/learning-path/test-automation/implementation-roadmap)
and the cheat-sheet sections it links to. Then build it yourself and run the
check. Open the solution only after your check passes (or after an honest
hour stuck) — and compare *designs*, not just whether it passes.

:::

## Contents

- [Milestone 1: First tests](#milestone-1)
- [Milestone 2: Page objects](#milestone-2)
- [Milestone 3: Fixtures & saved logins](#milestone-3)
- [Milestone 4: API layer](#milestone-4)
- [Milestone 5: Config, tags & CI](#milestone-5)
- [Milestone 6: Resilience](#milestone-6)
- [Final project](#final-project)

The targets are free practice sites: [Sauce Demo](https://www.saucedemo.com)
(UI), [Restful Booker](https://restful-booker.herokuapp.com) (API) and
Playwright's [API-mocking demo](https://demo.playwright.dev/api-mocking/).

---

## Milestone 1: First tests {#milestone-1}

**Practises:** set-up, locators, actions, web-first assertions, hooks.

```bash
mkdir qa-framework && cd qa-framework
npm init playwright@latest        # TypeScript, "tests" folder, GitHub Actions: yes
```

Set `use: { baseURL: 'https://www.saucedemo.com' }` in `playwright.config.ts`
so tests can call `page.goto('/')`.

| # | Task | Check |
|---|---|---|
| 1 | Test: `standard_user` logs in and sees "Products" | Passes |
| 2 | Test: `locked_out_user` sees the exact locked-out message | Passes |
| 3 | Test: clicking Login with an empty form asks for a username | Passes |
| 4 | Move the shared `page.goto('/')` into `beforeEach` | Tests still pass |
| 5 | Break test 2's expected text on purpose | It fails and shows expected vs received — then fix it |

**Check:** `npx playwright test tests/m1` — all 3 tests pass in every browser project.

<details>
<summary>Solution</summary>

```ts title="tests/m1/login.spec.ts"
// tests/m1/login.spec.ts — Milestone 1: plain Playwright, no framework yet
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('valid user reaches the products page', async ({ page }) => {
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
});

test('locked-out user sees an error', async ({ page }) => {
  await page.getByPlaceholder('Username').fill('locked_out_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('[data-test="error"]')).toHaveText(
    'Epic sadface: Sorry, this user has been locked out.',
  );
});

test('empty form asks for a username', async ({ page }) => {
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required');
});
```

</details>

**Watch out for:** asserting `toBeVisible()` on the error box instead of its
text — it would pass with the wrong message. Step 5 proves your test can fail.

**Try it:** add a fourth test for "wrong password" using the exact message from the
[manual testing answer key](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-1).

---

## Milestone 2: Page objects {#milestone-2}

**Practises:** page objects, a users file, reading lists of values.

| # | Task | Check |
|---|---|---|
| 1 | Create `src/data/users.ts` with the users you need | No passwords typed in tests any more |
| 2 | Create `src/pages/LoginPage.ts` (`open`, `loginAs`, `expectError`) | M1 tests rewritten with it still pass |
| 3 | Create `src/pages/InventoryPage.ts` with `addToCart`, `removeFromCart`, `cartBadge`, `sortBy`, `prices` | Compiles: `npx tsc -p .` |
| 4 | Test: sorting "Price (low to high)" gives ascending prices, starting at $7.99 | Passes |

**Check:** `npx tsc -p . && npx playwright test tests/ui/sorting.spec.ts` passes.

<details>
<summary>Solution</summary>

`LoginPage.ts` is shown in the [cheat sheet](/cheatsheets/test-automation#page-objects).

```ts title="src/data/users.ts"
// src/data/users.ts — test users for the Sauce Demo practice site
export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },          // has deliberate bugs
  glitch: { username: 'performance_glitch_user', password: 'secret_sauce' }, // slow login
} as const;

export type User = (typeof users)[keyof typeof users];
```

```ts title="src/pages/InventoryPage.ts"
// src/pages/InventoryPage.ts
import { type Page, expect } from '@playwright/test';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByText('Products')).toBeVisible();
  }

  async addToCart(productName: string) {
    const card = this.page.locator('[data-test="inventory-item"]').filter({ hasText: productName });
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.page.locator('[data-test="product-sort-container"]').selectOption(option);
  }

  async prices(): Promise<number[]> {
    const texts = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
    return texts.map(t => Number(t.replace('$', '')));      // "$29.99" -> 29.99
  }

  async removeFromCart(productName: string) {
    const card = this.page.locator('[data-test="inventory-item"]').filter({ hasText: productName });
    await card.getByRole('button', { name: 'Remove' }).click();
  }

  cartBadge() {
    return this.page.locator('[data-test="shopping-cart-badge"]');
  }

  async openCart() {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
  }
}
```

```ts title="tests/ui/sorting.spec.ts"
// tests/ui/sorting.spec.ts — Milestone 2
import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

test('price low to high sorts ascending @regression', async ({ loginPage, inventoryPage }) => {
  await loginPage.open();
  await loginPage.loginAs(users.standard);

  await inventoryPage.sortBy('lohi');

  const prices = await inventoryPage.prices();
  expect(prices).toEqual([...prices].sort((a, b) => a - b));   // same list, sorted = already sorted
  expect(prices[0]).toBe(7.99);
});
```

</details>

**Watch out for:** the product card contains more than one element with the
role `button`, so `card.getByRole('button')` fails with a strict mode
violation — give it a `name`.

**Try it:** run the sorting test as `problem_user`. It fails — that's the
sorting bug from the [manual testing bug hunt](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-2).
You'll handle it properly in Milestone 6.

---

## Milestone 3: Fixtures & saved logins {#milestone-3}

**Practises:** custom fixtures, set-up projects, `storageState`, test independence.

| # | Task | Check |
|---|---|---|
| 1 | Create `src/fixtures/test.ts` that provides `loginPage` and `inventoryPage` | Tests import `test` from it |
| 2 | Create a `setup` project that logs in once and saves `.auth/standard_user.json` | File appears after a run |
| 3 | Make the browser projects depend on `setup` | `setup` runs first |
| 4 | Test: add two items, remove both, badge goes 2 → 1 → hidden — **with no login steps** | Passes |
| 5 | Add `.auth/` to `.gitignore` | `git status` doesn't show it |

**Check:** `npx playwright test tests/ui/cart.spec.ts --workers=4 --repeat-each=3` passes.

<details>
<summary>Solution</summary>

The fixtures file is shown in the [cheat sheet](/cheatsheets/test-automation#fixtures).

```ts title="src/data/authState.ts"
// src/data/authState.ts — where saved sessions live (test files may not import each other)
export const STANDARD_USER_STATE = '.auth/standard_user.json';
```

```ts title="tests/auth.setup.ts"
// tests/auth.setup.ts — Milestone 3: log in once, save the session for every UI test
import { test as setup, expect } from '@playwright/test';
import { users } from '../src/data/users';
import { STANDARD_USER_STATE } from '../src/data/authState';

setup('log in as standard_user', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(users.standard.username);
  await page.getByPlaceholder('Password').fill(users.standard.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: STANDARD_USER_STATE });   // cookies + localStorage
});
```

```ts title="tests/ui/cart.spec.ts"
// tests/ui/cart.spec.ts — Milestone 3: starts already logged in, thanks to the saved session
import { test, expect } from '../../src/fixtures/test';
import { STANDARD_USER_STATE } from '../../src/data/authState';

test.use({ storageState: STANDARD_USER_STATE });

test('adding and removing updates the cart badge @regression', async ({ page, inventoryPage }) => {
  await page.goto('/inventory.html');                 // no login steps needed

  await inventoryPage.addToCart('Sauce Labs Backpack');
  await inventoryPage.addToCart('Sauce Labs Bike Light');
  await expect(inventoryPage.cartBadge()).toHaveText('2');

  await inventoryPage.removeFromCart('Sauce Labs Backpack');
  await expect(inventoryPage.cartBadge()).toHaveText('1');

  await inventoryPage.removeFromCart('Sauce Labs Bike Light');
  await expect(inventoryPage.cartBadge()).toBeHidden();   // badge disappears at zero
});
```

```ts
// playwright.config.ts (projects excerpt)
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  { name: 'chromium', testIgnore: /api\//, dependencies: ['setup'], use: { ...devices['Desktop Chrome'] } },
],
```

</details>

**Watch out for:** exporting the path from `auth.setup.ts` and importing it in
the cart test. Playwright stops with *test file "ui/cart.spec.ts" should not
import test file "auth.setup.ts"* — shared values belong in `src/`.

**Try it:** add a second saved login for `problem_user` and a test that uses it.

---

## Milestone 4: API layer {#milestone-4}

**Practises:** an API client, data builders, positive and negative API tests.

| # | Task | Check |
|---|---|---|
| 1 | Add an `api` project with `baseURL` = Restful Booker | `--project=api` runs only API tests |
| 2 | Create `src/data/bookingBuilder.ts` (`aBooking(overrides)`) | Unique first name each call |
| 3 | Create `src/api/BookingClient.ts` with `token`, `create`, `get`, `update`, `delete` | Compiles |
| 4 | Test: create, then read back the same booking | Passes |
| 5 | Test: update changes only what we sent, and it's really saved | Passes |
| 6 | Test: update and delete without a valid token are refused (403) | Passes |

**Check:** `npx playwright test --project=api` — all API tests pass.

<details>
<summary>Solution</summary>

`bookingBuilder.ts` is in the [cheat sheet](/cheatsheets/test-automation#test-data);
the create/read/delete tests are in the
framework guide.

```ts title="src/api/BookingClient.ts"
// src/api/BookingClient.ts — the API layer: tests call methods, never raw URLs
import { type APIRequestContext, expect } from '@playwright/test';
import type { Booking } from '../data/bookingBuilder';

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async token(username: string, password: string): Promise<string> {
    const res = await this.request.post('/auth', { data: { username, password } });
    expect(res.status()).toBe(200);
    return (await res.json()).token;
  }

  async create(booking: Booking): Promise<{ bookingid: number; booking: Booking }> {
    const res = await this.request.post('/booking', {
      data: booking,
      headers: { Accept: 'application/json' },
    });
    expect(res.status()).toBe(200);
    return res.json();
  }

  async get(id: number) {
    return this.request.get(`/booking/${id}`, { headers: { Accept: 'application/json' } });
  }

  async update(id: number, booking: Booking, token: string) {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Accept: 'application/json', Cookie: `token=${token}` },
    });
  }

  async delete(id: number, token: string) {
    return this.request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
  }
}
```

```ts title="tests/api/booking.update.spec.ts"
// tests/api/booking.update.spec.ts — Milestone 4
import { test, expect } from '../../src/fixtures/test';
import { aBooking } from '../../src/data/bookingBuilder';
import { env } from '../../src/config/env';

test('updating a booking changes only what we sent @regression', async ({ bookingClient }) => {
  const { bookingid, booking } = await bookingClient.create(aBooking());
  const token = await bookingClient.token(env.apiUser, env.apiPassword);

  const changed = { ...booking, totalprice: 999, additionalneeds: 'Late checkout' };
  const res = await bookingClient.update(bookingid, changed, token);

  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual(changed);
  expect(await (await bookingClient.get(bookingid)).json()).toEqual(changed);   // really saved
});

test('update without a token is refused @regression', async ({ bookingClient }) => {
  const { bookingid, booking } = await bookingClient.create(aBooking());

  const res = await bookingClient.update(bookingid, booking, 'not-a-real-token');

  expect(res.status()).toBe(403);
});
```

</details>

**Watch out for:** the practice API returns **201** for a successful delete
and **200** for a wrong password — your tests must assert what the API does,
and your bug reports must say what it *should* do. See the
[API testing milestones](/docs/learning-path/api-testing/milestones-and-mini-projects).

**Try it:** add a test that reads a booking id that doesn't exist and expects 404.

---

## Milestone 5: Config, tags & CI {#milestone-5}

**Practises:** projects per browser, retries, reporters, tiers, a pipeline.

| # | Task | Check |
|---|---|---|
| 1 | Projects: `setup`, `api`, `chromium`, `firefox`, `mobile-safari` | `--list` shows all five |
| 2 | Retries 2 and `forbidOnly` in CI only; traces on first retry | `CI=1 npx playwright test --list` works |
| 3 | HTML + JUnit reporters | `results/junit.xml` exists after a run |
| 4 | Tag tests `@smoke` / `@regression`; skip `@quarantine` in CI | `--grep @smoke --list` shows only smoke |
| 5 | GitHub Actions: smoke on pull requests, everything nightly, 2 shards, report as artifact | Workflow passes `actionlint`; a PR runs smoke only |

**Check:** `npx playwright test --grep @smoke` passes locally, and the pipeline is green on a pull request.

<details>
<summary>Solution</summary>

```ts title="playwright.config.ts"
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // fail CI if someone left test.only
  retries: process.env.CI ? 2 : 0,       // retry only in CI, and report it as "flaky"
  grepInvert: process.env.CI ? /@quarantine/ : undefined,   // quarantined tests never block CI
  workers: process.env.CI ? 4 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]],
  use: {
    baseURL: env.uiBaseUrl,
    trace: 'on-first-retry',             // full trace only when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'api', testDir: './tests/api', use: { baseURL: env.apiBaseUrl } },
    { name: 'chromium', testIgnore: /api\//, dependencies: ['setup'], use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: /api\/|visual\//, dependencies: ['setup'], use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-safari', testIgnore: /api\/|visual\//, dependencies: ['setup'], use: { ...devices['iPhone 15'] } },
  ],
});
```

The tested workflow is in the
framework guide.

</details>

**Watch out for:** visual tests in every browser project. Baselines differ per
browser, so this config runs `tests/visual` in Chromium only (`testIgnore` on the others).

**Try it:** add a `webkit` desktop project and compare suite time with and without it.

---

## Milestone 6: Resilience {#milestone-6}

**Practises:** network mocking, visual comparison, slow steps, known bugs.

| # | Task | Check |
|---|---|---|
| 1 | Mock the fruits API: return only Mango and Jackfruit | The page shows them; Strawberry is hidden |
| 2 | Change the real response: add Tamarind | Real fruits **and** Tamarind show |
| 3 | Simulate a 500 from the API | The page shows no fruits and doesn't crash |
| 4 | Visual test of the login page; create the baseline | Second run passes |
| 5 | `performance_glitch_user` login test without any sleep | Passes (takes ~5 s) |
| 6 | Known-bug test: `problem_user` sorting, marked with `test.fail` | Reported as *expected to fail* |

**Check:** `npx playwright test` — the whole suite passes (46 tests in the finished project).

<details>
<summary>Solution</summary>

```ts title="tests/mock/fruits.spec.ts"
// tests/mock/fruits.spec.ts — Milestone 6: control what the back end returns
import { test, expect } from '@playwright/test';

const APP = 'https://demo.playwright.dev/api-mocking/';

test('shows exactly the fruits the API returns @regression', async ({ page }) => {
  await page.route('**/api/v1/fruits', route =>
    route.fulfill({ json: [{ name: 'Mango', id: 1 }, { name: 'Jackfruit', id: 2 }] }),
  );

  await page.goto(APP);

  await expect(page.getByText('Mango')).toBeVisible();
  await expect(page.getByText('Jackfruit')).toBeVisible();
  await expect(page.getByText('Strawberry')).toBeHidden();      // a real fruit, not in our mock
});

test('keeps working when we add to the real response @regression', async ({ page }) => {
  await page.route('**/api/v1/fruits', async route => {
    const response = await route.fetch();                        // call the real API
    const fruits = await response.json();
    fruits.push({ name: 'Tamarind', id: 999 });
    await route.fulfill({ response, json: fruits });
  });

  await page.goto(APP);

  await expect(page.getByText('Tamarind')).toBeVisible();
  await expect(page.getByText('Strawberry')).toBeVisible();
});

test('shows no fruits when the API fails @regression', async ({ page }) => {
  await page.route('**/api/v1/fruits', route => route.fulfill({ status: 500, body: 'boom' }));

  await page.goto(APP);

  await expect(page.getByText('Strawberry')).toBeHidden();
});
```

```ts title="tests/visual/login.visual.spec.ts"
// tests/visual/login.visual.spec.ts — Milestone 6: compare against an approved screenshot
import { test, expect } from '@playwright/test';

test('login page looks the same as the approved baseline @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.01 });
});
```

```ts title="tests/ui/known-bugs.spec.ts"
// tests/ui/known-bugs.spec.ts — Milestone 6: document known bugs without breaking the build
import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

test('problem_user can sort by price @known-bug', async ({ loginPage, inventoryPage }) => {
  test.fail(true, 'BUG-101: sorting does nothing for problem_user');   // expected to fail for now

  await loginPage.open();
  await loginPage.loginAs(users.problem);
  await inventoryPage.sortBy('lohi');

  expect((await inventoryPage.prices())[0]).toBe(7.99);
});

test('performance_glitch_user still reaches products @regression', async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.loginAs(users.glitch);

  // this login takes about 5 s; give this one check more time instead of adding a sleep
  await expect(page.getByText('Products')).toBeVisible({ timeout: 15_000 });
});
```

</details>

**Watch out for:** creating visual baselines on your Mac and running them in
Linux CI — fonts render differently and the test fails. Create CI baselines in
CI (or in the Playwright Docker image).

**Try it:** mock the fruits API to return 500 fruits. Does the page stay usable?

---

## Final project {#final-project}

Build a framework from scratch for a new target, without looking at your
solutions. Suggested target: Playwright's [TodoMVC demo](https://demo.playwright.dev/todomvc/).

**Done when:**

- [ ] Page object for the to-do page; fixtures provide it
- [ ] Tests: add, complete, edit, delete, filter (All/Active/Completed), clear completed, counter text
- [ ] Every test independent and parallel-safe (`--repeat-each=5 --workers=4` passes)
- [ ] Smoke and regression tags; smoke runs in under 30 seconds
- [ ] Runs in 3 browsers and a phone viewport
- [ ] GitHub Actions pipeline with report artifact
- [ ] README: set-up, how to run each tier, how to add a test
- [ ] Public repo — add it to your portfolio as proof you can deliver the
      test automation service
