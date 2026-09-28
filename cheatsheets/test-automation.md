---
title: "Test Automation Cheat Sheet"
description: "A beginner-to-advanced reference for UI and API test automation with Playwright and TypeScript — locators, assertions, page objects, fixtures, data, config, tags, CI, saved logins, network mocking, visual tests and flaky-test control."
level: beginner
tags: [test-automation, playwright, typescript, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Test automation cheatsheet

Learn to automate tests step by step, from your first script to a framework
that runs in CI. Examples use **Playwright with TypeScript** on the
[practice app](/cheatsheets/manual-testing#practice-app); the ideas carry over
to Selenium, Cypress and WebdriverIO. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — code with a comment saying what each line does or checks.
- **Try it** — a small exercise.

Every example on this page was run and passes. Want the longer story? The
framework implementation guide
builds a complete framework, and the [Playwright cheat sheet](/cheatsheets/playwright)
covers the tool's API.

<a class="topic-crosslink" href="/docs/sdet-skills/qa-services-delivery/automation-framework-implementation">📖 Full guide: Framework implementation →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Test automation learning sections">
  <a class="button button--primary" href="/docs/learning-path/test-automation/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/test-automation/test-automation-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/test-automation/best-practices">Best Practices</a>
</nav>

:::tip How to use this page

Go through **Part 1** in order — it gets you writing real tests. **Part 2**
turns scripts into a framework. **Part 3** is for making a suite fast and
trustworthy at scale. Type the examples yourself and run them — a test you've
seen fail is a test you understand. You need [Node.js](https://nodejs.org) 20
or newer. New to deciding *what* to test? Start with the
[manual testing cheat sheet](/cheatsheets/manual-testing).

:::

## Contents {#contents}

**[Part 1 — Beginner](#part-1)**:
[What automation is](#what-is-automation) ·
[Set-up](#setup) ·
[Your first test](#first-test) ·
[Finding elements](#locators) ·
[Actions](#actions) ·
[Assertions](#assertions) ·
[Running & debugging](#running) ·
[Grouping & hooks](#hooks)

**[Part 2 — Core](#part-2)**:
[Page objects](#page-objects) ·
[Fixtures](#fixtures) ·
[Test data](#test-data) ·
[Config & environments](#config) ·
[API calls in tests](#api-in-tests) ·
[Tags & tiers](#tags) ·
[Parallel & independent](#parallel) ·
[Reports & traces](#reports) ·
[Running in CI](#ci) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Saved logins](#saved-login) ·
[Network mocking](#mocking) ·
[Visual testing](#visual) ·
[Flaky tests](#flaky) ·
[Known bugs](#known-bugs) ·
[Sharding](#sharding) ·
[Other tools](#other-tools) ·
[Words you'll meet](#glossary)

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. What automation is {#what-is-automation}

**In short:** test automation is code that drives the product and checks the
results, so the same checks run in minutes on every change.

| Automate | Keep manual |
|---|---|
| Regression checks that repeat every release | New features still changing |
| Smoke checks on every build | Exploratory testing |
| Many data combinations | "Does this look and feel right?" |
| API and contract checks | One-off checks |
| Cross-browser runs of the same flow | Hardware, real payments, captchas |

Automation doesn't think — it only checks what you told it to. Deciding *what*
to check is still testing work.

**Try it:** take your regression pack from the
[manual testing milestones](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-5)
(or any checklist) and mark each line "automate" or "keep manual".

</div>

<div class="cheat-card">

#### 2. Set-up {#setup}

**In short:** one command creates a Playwright project with a config file, an
example test and the browsers.

```bash
mkdir my-tests && cd my-tests
npm init playwright@latest          # answer: TypeScript, tests folder "tests", add GitHub Actions: yes
npx playwright test                 # runs the example test in 3 browsers
npx playwright show-report          # opens the HTML report
```

```text
my-tests/
├── playwright.config.ts            # runner settings: browsers, retries, reports
├── tests/example.spec.ts           # a sample test
├── .github/workflows/playwright.yml
└── package.json
```

**Playwright** is both the **runner** (finds and runs tests) and the
**browser driver** (controls Chromium, Firefox and WebKit — the engine behind Safari).

**Try it:** run the set-up, then run `npx playwright test --project=chromium`
to use only one browser. How much faster is it?

</div>

<div class="cheat-card">

#### 3. Your first test {#first-test}

**In short:** a test is an `async` function that gets a `page` (a browser tab),
does something, and checks the result with `expect`.

```ts title="tests/first.spec.ts"
// tests/first.spec.ts
import { test, expect } from '@playwright/test';

test('login page has the right title', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');   // open the page
  await expect(page).toHaveTitle('Swag Labs');      // passes: the tab title is "Swag Labs"
});
```

```bash
npx playwright test tests/first.spec.ts
# ✓ login page has the right title
```

`await` means "wait for this step to finish before the next line". Forget it
and steps run out of order — the most common beginner bug.

**Try it:** change `'Swag Labs'` to `'Swag Lab'` and run again. Read the
failure message: it shows expected vs received.

</div>

<div class="cheat-card">

#### 4. Finding elements {#locators}

**In short:** a **locator** describes how to find an element; prefer what a
user sees (role and name, label, text) over page structure.

```ts title="tests/locators.spec.ts"
// tests/locators.spec.ts
import { test, expect } from '@playwright/test';

test('ways to find elements', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  page.getByRole('button', { name: 'Login' });   // 1st choice: role + visible name
  page.getByPlaceholder('Username');             // placeholder text of an input
  page.getByText('Accepted usernames are:');     // visible text
  page.getByTestId('username');                  // data-testid="username" (see note below)
  page.locator('[data-test="password"]');        // any CSS selector — last resort

  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();   // passes
});
```

| Priority | Locator | Why |
|---|---|---|
| 1 | `getByRole` | How users and screen readers find things; survives restyling |
| 2 | `getByLabel`, `getByPlaceholder`, `getByText` | Visible to users |
| 3 | `getByTestId` | Stable ids added for tests |
| 4 | `locator('css')`, XPath | Tied to page structure — breaks when layout changes |

Note: `getByTestId` looks for `data-testid` by default. Sauce Demo uses
`data-test`, so set `use: { testIdAttribute: 'data-test' }` in the config, or
use `locator('[data-test="…"]')` as this page does.

**Try it:** run `npx playwright codegen https://www.saucedemo.com` — click
around and watch Playwright suggest locators for you.

</div>

<div class="cheat-card">

#### 5. Actions {#actions}

**In short:** locators have action methods — `click`, `fill`, `press`,
`selectOption`, `check` — and each one waits until the element is ready.

```ts title="tests/actions.spec.ts"
// tests/actions.spec.ts
import { test, expect } from '@playwright/test';

test('common actions', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');   // type into a field (clears it first)
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByPlaceholder('Password').press('Enter');          // press a key

  await page.locator('[data-test="product-sort-container"]').selectOption('hilo');   // pick from a <select>
  await page.getByRole('button', { name: 'Add to cart' }).first().click();           // click the first match
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByText('Logout').click();                        // no role here: this <a> has no href

  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();   // back on the login page
});
```

`.first()` picks the first match when several elements match — without it,
Playwright stops with a *strict mode violation* rather than guess.

**Try it:** add a step that sorts by `'az'` and checks the first product is
`Sauce Labs Backpack`.

</div>

<div class="cheat-card">

#### 6. Assertions {#assertions}

**In short:** `await expect(locator)` assertions **retry** until they pass or
time out (5 s by default); plain `expect(value)` checks once.

```ts title="tests/assertions.spec.ts"
// tests/assertions.spec.ts
import { test, expect } from '@playwright/test';

test('assertions that wait', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory\.html/);                                   // URL matches
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);         // exactly 6 products
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');         // exact text
  await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();                // on screen
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();     // empty cart: no badge

  const count = await page.locator('[data-test="inventory-item"]').count();         // a plain number...
  expect(count).toBe(6);                                                             // ...checked once, no waiting
});
```

| Assertion | Checks |
|---|---|
| `toBeVisible()` / `toBeHidden()` | Shown / not shown |
| `toHaveText('…')` / `toContainText('…')` | Exact / partial text |
| `toHaveCount(n)` | Number of matches |
| `toHaveValue('…')` | Value of an input |
| `toHaveURL(/…/)` / `toHaveTitle('…')` | Page URL / tab title |
| `toBeEnabled()` / `toBeChecked()` | State |

Because of the retrying, you never need `waitForTimeout(3000)` sleeps. Use
web-first assertions and the test waits exactly as long as needed.

**Try it:** add an assertion that the cart badge shows `1` after adding one item.

</div>

<div class="cheat-card">

#### 7. Running & debugging {#running}

**In short:** run headless and fast by default; switch to UI mode, headed
mode or the inspector when a test fails.

```bash
npx playwright test                         # all tests, all projects, headless
npx playwright test tests/cart.spec.ts      # one file
npx playwright test -g "counts one item"    # tests whose title matches
npx playwright test --headed                # watch the browser
npx playwright test --ui                    # UI mode: time-travel through every step
npx playwright test --debug                 # step line by line with the inspector
npx playwright show-report                  # HTML report of the last run
```

When a test fails, read the error first: it says which locator, what it
expected, and what it received. Then open the trace (section 16).

**Try it:** break a locator on purpose (`'Login'` → `'Log in'`) and run with
`--ui`. Find the failing step and the page snapshot at that moment.

</div>

<div class="cheat-card">

#### 8. Grouping & hooks {#hooks}

**In short:** `test.describe` groups tests; `beforeEach` runs set-up before
every test in the group, so each test starts from the same state.

```ts title="tests/hooks.spec.ts"
// tests/hooks.spec.ts
import { test, expect } from '@playwright/test';

test.describe('cart', () => {                         // group related tests
  test.beforeEach(async ({ page }) => {               // runs before EACH test in this group
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('starts empty', async ({ page }) => {
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toBeHidden();
  });

  test('counts one item', async ({ page }) => {
    await page.getByRole('button', { name: 'Add to cart' }).first().click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });
});
```

Each test gets a **fresh browser context** (like a new private window) — no
cookies or storage leak between tests. That's why both tests log in.

**Try it:** add a third test to the group, "removes the item", that adds then
removes one product and checks the badge is hidden.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 9. Page objects {#page-objects}

**In short:** a **page object** is a class for one screen; it keeps that
screen's locators and actions in one place, so tests read like user steps.

```ts title="src/pages/LoginPage.ts"
// src/pages/LoginPage.ts
import { type Page, type Locator, expect } from '@playwright/test';
import type { User } from '../data/users';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async open() {
    await this.page.goto('/');
  }

  async loginAs(user: User) {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }

  async expectError(text: string) {
    await expect(this.error).toContainText(text);
  }
}
```

In a test: `await loginPage.loginAs(users.standard)`. When the login screen
changes, you fix `LoginPage.ts` once instead of every test.

**Try it:** write an `InventoryPage` with `addToCart(name)` and `cartBadge()`.
Compare with the one in the framework guide.

</div>

<div class="cheat-card">

#### 10. Fixtures {#fixtures}

**In short:** fixtures create what a test needs and pass it in as a
parameter — `page` and `request` are built-in fixtures; you can add your own.

```ts title="src/fixtures/test.ts"
// src/fixtures/test.ts — tests import `test` from here, so pages and clients arrive ready-made
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BookingClient } from '../api/BookingClient';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  checkoutPage: CheckoutPage;
  bookingClient: BookingClient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  bookingClient: async ({ request }, use) => use(new BookingClient(request)),
});

export { expect } from '@playwright/test';
```

Tests then import `test` from this file and ask for what they need:
`async ({ loginPage, inventoryPage }) => { … }`. Code before `use()` is
set-up, code after it is clean-up — and it runs even if the test fails.

**Try it:** add a `checkoutPage` fixture for your own `CheckoutPage` class.

</div>

<div class="cheat-card">

#### 11. Test data {#test-data}

**In short:** keep test data in one place, and use **builders** that return
valid data with defaults so each test overrides only what it's about.

```ts title="src/data/bookingBuilder.ts"
// src/data/bookingBuilder.ts — builds valid test data; override only what a test cares about
export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

export function aBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = Date.now().toString(36);          // unique name, so parallel runs don't clash
  return {
    firstname: `Test-${unique}`,
    lastname: 'Automation',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-10-01', checkout: '2026-10-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
```

`aBooking({ totalprice: 0 })` — the reader sees immediately that price is
what this test is about. The unique name stops tests running in parallel
from reading each other's data.

**Try it:** add a builder `aCustomer()` that returns first name, last name and
postal code for the checkout form.

</div>

<div class="cheat-card">

#### 12. Config & environments {#config}

**In short:** `playwright.config.ts` holds runner settings; environment
values (URLs, users) come from environment variables through one file.

```ts title="src/config/env.ts"
// src/config/env.ts — one place for every environment-specific value
const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
};

export const env = {
  uiBaseUrl: required('UI_BASE_URL', 'https://www.saucedemo.com'),
  apiBaseUrl: required('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
  apiUser: required('API_USER', 'admin'),           // demo credentials, public
  apiPassword: required('API_PASSWORD', 'password123'),
};
```

```bash
UI_BASE_URL=https://staging.example.com npx playwright test   # same tests, another environment
```

Set `baseURL` in the config and tests use short paths: `page.goto('/')`.
Never commit real passwords — in CI they come from the secret store.

**Try it:** set `UI_BASE_URL` to a wrong address and run. How quickly does it
fail, and is the message clear?

</div>

<div class="cheat-card">

#### 13. API calls in tests {#api-in-tests}

**In short:** the built-in `request` fixture sends HTTP requests — use it for
API tests, and to create test data fast in UI tests.

```ts title="tests/request.spec.ts"
// tests/request.spec.ts
import { test, expect } from '@playwright/test';

test('API call inside a test', async ({ request }) => {
  const res = await request.get('https://restful-booker.herokuapp.com/ping');   // no browser needed
  expect(res.status()).toBe(201);                                              // this API answers ping with 201
});
```

Creating data through the API and testing only the part you care about
through the UI makes tests many times faster. More in the
[API testing cheat sheet](/cheatsheets/api-testing).

**Try it:** send `GET https://restful-booker.herokuapp.com/booking` and check
the response is a list with at least one item.

</div>

<div class="cheat-card">

#### 14. Tags & tiers {#tags}

**In short:** tag tests (`@smoke`, `@regression`) and run a different tier at
different times — smoke on every change, regression nightly.

```ts title="tests/tags.spec.ts"
// tests/tags.spec.ts
import { test, expect } from '@playwright/test';

test('login page loads', { tag: '@smoke' }, async ({ page }) => {   // tag option
  await page.goto('https://www.saucedemo.com/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('title is Swag Labs @regression', async ({ page }) => {          // tag in the title works too
  await page.goto('https://www.saucedemo.com/');
  await expect(page).toHaveTitle('Swag Labs');
});
```

```bash
npx playwright test --grep @smoke                 # only smoke
npx playwright test --grep-invert @quarantine     # everything except quarantined tests
```

**Try it:** tag three of your tests `@smoke` and run only them.

</div>

<div class="cheat-card">

#### 15. Parallel & independent {#parallel}

**In short:** Playwright runs test files in parallel **workers**; tests must
never depend on each other or on shared data.

```ts
// playwright.config.ts (excerpt)
export default defineConfig({
  fullyParallel: true,                        // tests inside one file run in parallel too
  workers: process.env.CI ? 4 : undefined,    // undefined = half your CPU cores
});
```

| Makes tests depend on each other | Fix |
|---|---|
| Test B uses data test A created | Each test creates its own data (builders + API) |
| Tests share one user account that they change | One account per worker, or read-only shared accounts |
| Order of tests matters | Set-up in hooks/fixtures, never in "the previous test" |

**Try it:** run your suite with `--workers=1` and then with `--workers=4`.
If results differ, you have a dependency to find.

</div>

<div class="cheat-card">

#### 16. Reports & traces {#reports}

**In short:** the HTML report lists every test; a **trace** records every
step, the page, the network and the console, so you can replay a failure.

```ts
// playwright.config.ts (excerpt)
reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]],
use: {
  trace: 'on-first-retry',          // record a trace when a failed test is retried
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

```bash
npx playwright show-report                               # open the HTML report
npx playwright show-trace test-results/<test>/trace.zip  # replay one test step by step
```

The **JUnit XML** file is for other tools: CI dashboards and test management
tools can import it.

**Try it:** run one test with `--trace on`, open its trace and find the network
request made when the page loaded.

</div>

<div class="cheat-card">

#### 17. Running in CI {#ci}

**In short:** CI (Continuous Integration) runs the tests on every pull request,
so a change that breaks something is caught before it's merged.

```yaml
# .github/workflows/tests.yml (the essential steps)
- uses: actions/checkout@v5
- uses: actions/setup-node@v5
  with:
    node-version: 22
- run: npm ci                               # install exact versions from package-lock.json
- run: npx playwright install --with-deps   # browsers + the Linux libraries they need
- run: npx playwright test --grep @smoke
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}                   # keep the report even when tests fail
  with:
    name: playwright-report
    path: playwright-report/
```

The full, tested workflow (with nightly regression and sharding) is in the
framework guide.

**Try it:** push a project with this workflow to GitHub and open a pull
request. Where do you download the report from?

</div>

<div class="cheat-card">

#### 18. Common mistakes {#gotchas}

**In short:** most broken suites fail for the same few reasons.

| Mistake | Symptom | Fix |
|---|---|---|
| Missing `await` | Steps out of order, random failures | `await` every action and web-first assertion |
| `waitForTimeout(3000)` | Slow *and* still flaky | Web-first assertions wait for the real condition |
| CSS/XPath tied to layout | Breaks on every redesign | Role, label, text or test-id locators |
| Tests share data | Pass alone, fail together | Unique data per test |
| Huge end-to-end tests | One failure hides ten checks | Short tests with one purpose |
| Assertions inside page objects for everything | Tests hide what they check | Keep main assertions in the test |
| Importing one test file from another | *"test file should not import test file"* | Move shared code to `src/` |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 19. Saved logins {#saved-login}

**In short:** log in **once** in a set-up project, save the session to a
file, and start every other test already logged in.

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
// playwright.config.ts (excerpt) — run "setup" before the browser projects
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  { name: 'chromium', dependencies: ['setup'], use: { ...devices['Desktop Chrome'] } },
],
```

The file path lives in `src/data/authState.ts`, because a test file may not
import another test file. Add `.auth/` to `.gitignore` — it contains live sessions.

**Try it:** time your cart tests before and after using the saved login.

</div>

<div class="cheat-card">

#### 20. Network mocking {#mocking}

**In short:** `page.route` intercepts requests the page makes, so a test can
return fake data, change real data, or simulate a server error.

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

Use mocking to test states that are hard to create for real (errors, empty
lists, huge lists) and to cut out slow or flaky third parties. Keep some
tests un-mocked — mocks can hide real integration bugs.

**Try it:** add a test where the API returns an empty list `[]`. What should
the page show?

</div>

<div class="cheat-card">

#### 21. Visual testing {#visual}

**In short:** `toHaveScreenshot` compares the page with an approved
**baseline** image and fails if too many pixels differ.

```ts title="tests/visual/login.visual.spec.ts"
// tests/visual/login.visual.spec.ts — Milestone 6: compare against an approved screenshot
import { test, expect } from '@playwright/test';

test('login page looks the same as the approved baseline @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.01 });
});
```

```bash
npx playwright test tests/visual --update-snapshots   # create or approve the baseline
npx playwright test tests/visual                       # compare against it
```

Baselines are saved per browser **and operating system**
(`login-chromium-darwin.png` on a Mac). Fonts render differently on Linux, so
create CI baselines on the CI OS — for example inside the official Playwright
Docker image.

**Try it:** log in as `visual_user` and `standard_user` and screenshot the
product list for each. Does the visual test catch the layout bugs?

</div>

<div class="cheat-card">

#### 22. Flaky tests {#flaky}

**In short:** a **flaky** test passes and fails on the same code; it teaches
the team to ignore red builds, so treat it as a bug with an owner.

| Cause | Fix |
|---|---|
| Racing the page | Web-first assertions, never sleeps |
| Shared or leftover data | Unique data per test; clean up in fixtures |
| Slow environment | Longer timeout for *that* check only: `toBeVisible({ timeout: 15_000 })` |
| Animations | `page.emulateMedia({ reducedMotion: 'reduce' })` or disable in test mode |
| Third-party widgets | Mock them (section 20) |

```ts
// playwright.config.ts (excerpt)
retries: process.env.CI ? 2 : 0,                            // a pass on retry is reported as "flaky"
grepInvert: process.env.CI ? /@quarantine/ : undefined,     // quarantined tests don't block CI
```

**Quarantine** a flaky test with a `@quarantine` tag and a ticket with an
owner and a deadline — don't just delete or ignore it.

</div>

<div class="cheat-card">

#### 23. Known bugs {#known-bugs}

**In short:** `test.fail()` marks a test that is **expected** to fail
because of a known bug — the run stays green, and you're told when the bug is fixed.

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

When the bug is fixed, the "expected to fail" test suddenly passes — and
Playwright reports **that** as a failure, reminding you to remove `test.fail`.
The second test shows the fix for a slow page: more time for one check, not a sleep.

**Try it:** write a `test.fail` test for `problem_user`'s last-name bug in checkout.

</div>

<div class="cheat-card">

#### 24. Sharding {#sharding}

**In short:** **sharding** splits the suite across several machines that run at
the same time, cutting wall-clock time.

```bash
npx playwright test --shard=1/3     # machine 1 runs the first third
npx playwright test --shard=2/3     # machine 2
npx playwright test --shard=3/3     # machine 3
```

In GitHub Actions, a `matrix: { shard: [1, 2, 3] }` runs the three commands on
three machines. Merge the reports afterwards with
`npx playwright merge-reports` using the `blob` reporter.

</div>

<div class="cheat-card">

#### 25. Other tools {#other-tools}

**In short:** the ideas on this page are the same in every tool; only the names change.

| Idea | Playwright | Selenium (Java) | Cypress | WebdriverIO |
|---|---|---|---|---|
| Find element | `page.getByRole(…)` | `driver.findElement(By.…)` | `cy.get(…)` / `cy.contains(…)` | `$('…')` |
| Click / type | `.click()` / `.fill()` | `.click()` / `.sendKeys()` | `.click()` / `.type()` | `.click()` / `.setValue()` |
| Wait | Built in | `WebDriverWait` + `ExpectedConditions` | Built in | Built in on `$()` |
| Assert | `expect(locator)` | JUnit/TestNG + AssertJ | `.should(…)` | `expect(el)` |
| Runner | Playwright Test | JUnit / TestNG | Cypress | Mocha / Jasmine |
| Browsers | Chromium, Firefox, WebKit | All major (via drivers) | Chromium family, Firefox, WebKit (experimental) | All major |
| Mobile apps | ✗ | Via Appium | ✗ | Via Appium |

Tool guides: [Selenium](/docs/sdet-skills/selenium/selenium-guide) ·
[Playwright](/docs/sdet-skills/playwright/playwright-guide) ·
[Appium](/docs/sdet-skills/appium/appium-guide) ·
[Robot Framework](/docs/sdet-skills/robot-framework/robot-framework-guide).

</div>

<div class="cheat-card">

#### 26. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **Runner** | The tool that finds, runs and reports tests (Playwright Test, JUnit, pytest) |
| **Locator** | A description of how to find an element |
| **Web-first assertion** | An assertion that retries until true or timeout |
| **Page object** | A class for one screen that hides its locators |
| **Fixture** | Something a test needs, created and cleaned up for it |
| **Headless** | The browser runs without a visible window |
| **Browser context** | An isolated browser session, like a private window |
| **Worker** | A separate process that runs tests in parallel |
| **Trace** | A recording of a run you can replay step by step |
| **Baseline** | The approved screenshot a visual test compares against |
| **Flaky** | Passes and fails on the same code |
| **Quarantine** | Taking a flaky test out of blocking runs while it's fixed |
| **Shard** | One slice of the suite, run on its own machine |
| **CI** | Continuous Integration — builds and tests every change automatically |

For the full framework, see the
framework implementation guide.

</div>

</div>
