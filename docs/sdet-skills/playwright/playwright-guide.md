---
title: "Playwright: The Complete Guide"
description: "End-to-end reference for Playwright — architecture, locators, waiting, fixtures, network mocking, CI, debugging, and interview-ready Q&A."
sidebar_position: 1
tags: [playwright, sdet, test-automation, e2e]
---

# Playwright — The Complete Guide

A single-read, end-to-end reference for Playwright: enough to onboard onto a new
automation codebase, design a framework from scratch, or walk into an SDET
interview. Organized so you can jump to any section as a lookup, or read
top-to-bottom as a course.

<a class="topic-crosslink" href="/cheatsheets/playwright">📋 Quick reference: Playwright →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-pw-title mm-pw-desc">
<title id="mm-pw-title">How Playwright executes a test</title>
<desc id="mm-pw-desc">Fixtures set up context and feed test code, which asks a locator to find an element, which auto-waits until the element is actionable, then acts on it through a browser engine, which can have its network layer intercepted.</desc>
<defs>
  <marker id="mm-pw-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n5" x="215" y="16" width="170" height="52" rx="10"/>
<text class="mm-node-title" x="300" y="38" text-anchor="middle">Fixtures</text>
<text class="mm-node-sub" x="300" y="54" text-anchor="middle">inject browser / page / context</text>
<path class="mm-arrow" d="M300,68 L300,104" marker-end="url(#mm-pw-arrow)"/>

<rect class="mm-n3" x="20" y="104" width="150" height="70" rx="10"/>
<text class="mm-node-title" x="95" y="134" text-anchor="middle">Test code</text>
<text class="mm-node-sub" x="95" y="151" text-anchor="middle">describes intent</text>

<path class="mm-arrow" d="M170,139 L206,139" marker-end="url(#mm-pw-arrow)"/>

<rect class="mm-n2" x="210" y="104" width="150" height="70" rx="10"/>
<text class="mm-node-title" x="285" y="134" text-anchor="middle">Locator</text>
<text class="mm-node-sub" x="285" y="151" text-anchor="middle">finds the element</text>

<path class="mm-arrow" d="M360,139 L396,139" marker-end="url(#mm-pw-arrow)"/>

<rect class="mm-n4" x="400" y="104" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="485" y="134" text-anchor="middle">Auto-wait</text>
<text class="mm-node-sub" x="485" y="151" text-anchor="middle">retries until actionable</text>

<path class="mm-arrow" d="M570,139 L606,139" marker-end="url(#mm-pw-arrow)"/>

<rect class="mm-n1" x="610" y="104" width="150" height="70" rx="10"/>
<text class="mm-node-title" x="685" y="128" text-anchor="middle">Browser</text>
<text class="mm-node-sub" x="685" y="145" text-anchor="middle">Chromium / Firefox</text>
<text class="mm-node-sub" x="685" y="159" text-anchor="middle">WebKit — via CDP</text>

<path class="mm-arrow" d="M685,174 L685,210" marker-end="url(#mm-pw-arrow)"/>

<rect class="mm-n6" x="600" y="214" width="170" height="60" rx="10"/>
<text class="mm-node-title" x="685" y="240" text-anchor="middle">Network layer</text>
<text class="mm-node-sub" x="685" y="256" text-anchor="middle">route() intercepts / mocks</text>
</svg>

<p class="mental-model__caption">Everything Playwright does routes through one loop: fixtures hand a test its browser context, a locator finds an element by role or text, auto-waiting retries until that element is truly actionable, and only then does the action fire against the real browser engine — with the network layer sitting underneath, ready to intercept or mock any request the page makes.</p>
</div>

## 1. What Playwright Is and Why It Exists

Playwright is a Microsoft-built, open-source framework for reliable end-to-end
testing of web applications. It automates **Chromium, Firefox, and WebKit**
through a single API, in JavaScript/TypeScript, Python, Java, or .NET.

It was built to fix the pain points of Selenium-era automation:

| Old pain (Selenium-era) | Playwright's fix |
|---|---|
| Flaky tests from manual waits/sleeps | **Auto-waiting** built into every action |
| Slow WebDriver protocol round-trips | Talks to browsers over **CDP / native protocols**, much faster |
| Hard to test iframes, shadow DOM, multiple tabs | First-class support for frames, shadow DOM piercing, multiple contexts/pages |
| No native network interception | Built-in **request/response interception & mocking** |
| Painful debugging | **Trace Viewer**, **Codegen**, **UI Mode**, video/screenshot capture out of the box |
| One browser engine per driver binary | One API drives **all three engines** |
| Test isolation required manual cleanup | **Browser Contexts** = cheap, isolated "incognito" sessions per test |

### Core architecture

- **Browser** — a single browser process (Chromium/Firefox/WebKit binary Playwright downloads and manages).
- **BrowserContext** — an isolated, incognito-like session within a browser (own cookies, storage, cache). Cheap to create — this is Playwright's unit of test isolation.
- **Page** — a tab within a context. Most of your API surface (`page.click`, `page.goto`, `page.locator`) hangs off this.
- **Playwright Test Runner (`@playwright/test`)** — the test framework layered on top: fixtures, parallelization, retries, reporters, trace/video capture, assertions (`expect`).

```
Playwright process
 └─ Browser (Chromium)
     ├─ BrowserContext (test 1) — isolated cookies/storage
     │    └─ Page (tab)
     └─ BrowserContext (test 2) — isolated cookies/storage
          └─ Page (tab)
```

Each test gets a fresh `BrowserContext` by default in `@playwright/test`, so tests
are isolated without needing to clear cookies/localStorage manually.

---

## 2. Installation & Project Setup

```bash
npm init playwright@latest
# scaffolds: playwright.config.ts, tests/, tests-examples/, package.json script, GitHub Actions workflow (optional)
```

This installs `@playwright/test` and downloads browser binaries
(`npx playwright install`). Key config file — `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,       // fail build if `.only` left in code
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['github']],
  use: {
    baseURL: 'https://staging.example.com',
    trace: 'on-first-retry',          // capture trace only when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
```

`projects` is how you fan a single test suite out across browsers, viewports,
or device emulations without duplicating test code.

---

## 3. Anatomy of a Test

```ts
import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await page.getByLabel('Username').fill('abhishek');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('invalid credentials show an error', async ({ page }) => {
    await page.getByLabel('Username').fill('bad');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });
});
```

- `test`, `test.describe`, `test.beforeEach/afterEach`, `test.beforeAll/afterAll` mirror Jest/Mocha conventions.
- The `page` fixture is injected automatically — you never instantiate a browser yourself in normal test code.
- `test.only`, `test.skip`, `test.fixme`, and annotations like `{ tag: '@smoke' }` control selective execution.

---

## 4. Locators — the Right Way to Find Elements

Playwright's **Locator** is a lazy, auto-retrying reference to an element (or
set of elements). It does *not* resolve to a DOM node until an action is
performed — this is central to why Playwright avoids "stale element" errors
that plague Selenium.

### Preferred locator strategies (in priority order)

1. **`getByRole`** — matches how assistive tech/users perceive the page. Most resilient to markup changes.
   ```ts
   page.getByRole('button', { name: 'Submit' });
   page.getByRole('checkbox', { name: 'Remember me', checked: true });
   ```
2. **`getByLabel`** — form fields by associated `<label>`.
3. **`getByPlaceholder`**, **`getByText`**, **`getByAltText`**, **`getByTitle`**.
4. **`getByTestId`** — for elements with `data-testid`, when semantic locators aren't practical. Configurable via `testIdAttribute` in config.
5. **CSS / XPath** (`page.locator('css=...')`, `page.locator('xpath=...')`) — last resort; brittle against markup/style refactors.

### Chaining and filtering

```ts
const row = page.getByRole('row', { name: 'Invoice #1042' });
await row.getByRole('button', { name: 'Delete' }).click();

// filter() narrows a locator by another locator or text
page.getByRole('listitem').filter({ hasText: 'Product A' });

// nth / first / last
page.getByRole('listitem').nth(2);
```

### Locators vs. old-style ElementHandles

`page.$()` / `ElementHandle` resolve immediately and go stale — **avoid them**
in new code. `page.locator()` (and `getBy*`) re-query the DOM on every action,
which is what makes Playwright resilient to re-renders (React/Angular/Vue
reconciliation, dynamic content).

---

## 5. Auto-Waiting & Actionability — Why Playwright Doesn't Need `sleep()`

Before performing any action (`click`, `fill`, `check`, …), Playwright
automatically waits for the element to be:

1. **Attached** to the DOM
2. **Visible** (not `display:none`, not zero-size)
3. **Stable** (not animating — two consecutive frames at the same bounding box)
4. **Enabled** (not `disabled`)
5. **Receiving events** (not obscured by another element, e.g. a modal overlay)
6. For inputs: **Editable**

This is called an **actionability check**. If it doesn't pass within the
timeout, the test fails with a precise error explaining *which* check failed —
a huge debugging advantage over generic "element not found" errors.

### Explicit waiting when you actually need it

```ts
await page.waitForURL('**/dashboard');
await page.waitForLoadState('networkidle'); // use sparingly — see below
await locator.waitFor({ state: 'visible' });
await page.waitForResponse(resp => resp.url().includes('/api/orders') && resp.status() === 200);
await page.waitForRequest('**/api/session');
```

**Anti-pattern:** `page.waitForTimeout(3000)` (hard sleep). It's the #1 source
of flaky *and* slow suites. Use it only as a last-resort debugging aid, never
committed.

**`networkidle` caution:** modern apps with polling, websockets, or analytics
beacons may never go "idle." Prefer waiting for a specific response or UI
state instead of `networkidle`.

---

## 6. Assertions (`expect`)

Playwright's `expect` is **web-first**: assertions like `toBeVisible()` or
`toHaveText()` retry automatically until the timeout, instead of failing on
the first check. This eliminates most race-condition flakiness.

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Order confirmed');
await expect(locator).toContainText('confirmed');
await expect(locator).toHaveValue('abhishek@example.com');
await expect(locator).toHaveCount(3);
await expect(locator).toBeEnabled();
await expect(locator).toBeChecked();
await expect(page).toHaveTitle(/Dashboard/);
await expect(page).toHaveURL(/\/orders\/\d+/);
await expect(page).toHaveScreenshot('dashboard.png'); // visual regression

// Soft assertions — collect failures, don't stop the test immediately
expect.soft(locator).toHaveText('X');

// Negation
await expect(locator).not.toBeVisible();

// Custom polling for non-locator conditions
await expect.poll(async () => await getQueueDepth()).toBeLessThan(5);
```

Never use plain Node `assert` or manual `if` checks for UI state — you lose
auto-retry and get flaky tests.

---

## 7. Fixtures — Playwright's Dependency Injection System

Fixtures are how Playwright Test provides setup/teardown and shared context to
tests, replacing `beforeEach`-with-shared-variables patterns.

### Built-in fixtures
`page`, `context`, `browser`, `browserName`, `request` (API context).

### Custom fixtures

```ts
// fixtures.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Worker-scoped, auto-used, reusable authenticated session
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth/user.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
```

```ts
// test file
import { test, expect } from '../fixtures';

test('user can update profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile');
  // already logged in — no login steps needed here
});
```

Fixtures can be **test-scoped** (default, fresh per test) or **worker-scoped**
(`{ scope: 'worker' }`, shared across all tests on a worker — useful for
expensive setup like spinning up a test DB connection).

---

## 8. Page Object Model (POM)

POM encapsulates locators and page-specific actions behind a class, so tests
read like business language and locator changes require editing one file.

```ts
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }
}
```

```ts
test('login works', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('abhishek', 'secret123');
  await expect(page).toHaveURL(/dashboard/);
});
```

**Modern variant:** many teams now prefer combining POM with fixtures (inject
page objects as fixtures, as in Section 7) rather than instantiating `new
LoginPage(page)` in every test — less boilerplate, same benefits.

---

## 9. Handling Real-World UI Complexity

### iframes
```ts
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Card number').fill('4242 4242 4242 4242');
```

### Shadow DOM
Playwright pierces **open** shadow DOM automatically with normal locators —
no special syntax needed.

### New tabs / popups
```ts
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: 'Open in new tab' }).click(),
]);
await popup.waitForLoadState();
```

### File upload / download
```ts
await page.getByLabel('Upload file').setInputFiles('data/sample.pdf');

const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export CSV' }).click(),
]);
await download.saveAs('/tmp/export.csv');
```

### Dialogs (`alert`, `confirm`, `prompt`)
```ts
page.on('dialog', async dialog => {
  await dialog.accept();
});
```

### Keyboard / mouse
```ts
await page.keyboard.press('Enter');
await locator.hover();
await page.mouse.wheel(0, 500);
await locator.dragTo(otherLocator);
```

---

## 10. Network Interception & Mocking

This is one of Playwright's biggest advantages over legacy tools — full
control over network traffic without a proxy.

```ts
// Mock an API response entirely (no backend call made)
await page.route('**/api/orders', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, item: 'Widget' }]),
  });
});

// Modify a real response (e.g. inject an error to test error handling)
await page.route('**/api/orders', async route => {
  const response = await route.fetch();
  const json = await response.json();
  json.push({ id: 999, item: 'Injected' });
  await route.fulfill({ response, json });
});

// Block resources (speed up tests / test offline states)
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());

// Simulate network failure
await page.route('**/api/payment', route => route.abort('failed'));

// Assert on network calls (spy)
const responsePromise = page.waitForResponse('**/api/orders');
await page.getByRole('button', { name: 'Load orders' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

Use cases: testing error/empty states without backend cooperation, testing
slow-network UX (`route.continue()` with artificial delay), avoiding flaky
third-party dependencies (payment gateways, analytics), and contract-style
checks on request payloads.

---

## 11. Authentication Strategies

**Storage State (recommended)** — log in once, reuse the session across all
tests to avoid repeating slow UI login:

```ts
// global-setup.ts (or a dedicated auth.setup.ts project)
import { chromium } from '@playwright/test';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://app.example.com/login');
  await page.getByLabel('Username').fill('abhishek');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'auth/user.json' });
  await browser.close();
}
```

```ts
// playwright.config.ts
globalSetup: require.resolve('./global-setup'),
use: { storageState: 'auth/user.json' },
```

The modern recommended pattern is a **setup project** (`projects: [{ name:
'setup', testMatch: /.*\.setup\.ts/ }]`) with dependent test projects
declaring `dependencies: ['setup']` — this integrates with the test report and
retries better than `globalSetup`.

For multi-role apps (admin/user/guest), create separate storage-state files
per role and pick the fixture per test file.

---

## 12. API Testing

Playwright ships a full HTTP client (`request` fixture / `APIRequestContext`),
useful for pure API tests or for fast test-data setup that bypasses the UI.

```ts
test('create order via API then verify in UI', async ({ request, page }) => {
  const response = await request.post('/api/orders', {
    data: { item: 'Widget', qty: 3 },
  });
  expect(response.ok()).toBeTruthy();
  const order = await response.json();

  await page.goto(`/orders/${order.id}`);
  await expect(page.getByText('Widget')).toBeVisible();
});
```

This is the backbone of **hybrid testing**: seed/verify state via API (fast,
stable), assert user-facing behavior via UI (what actually matters to users).

---

## 13. Component Testing

Playwright can mount and test individual UI components (React, Vue, Svelte)
in a real browser, without a full app shell:

```ts
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('button click fires handler', async ({ mount }) => {
  let clicked = false;
  const component = await mount(<Button onClick={() => (clicked = true)}>Go</Button>);
  await component.click();
  expect(clicked).toBe(true);
});
```

This sits between unit tests (jsdom, no real browser) and full E2E — real
rendering/CSS/events, but fast and isolated from backend dependencies.

---

## 14. Parallelization, Sharding & Retries

- **Workers** — parallel OS processes running test *files* concurrently (`workers: 4`). Tests within one file run sequentially unless `fullyParallel: true`.
- **Sharding** — split the whole suite across CI machines: `npx playwright test --shard=1/4`, `--shard=2/4`, etc. Each shard runs a subset; combine reports afterward (`merge-reports`).
- **Retries** — `retries: 2` reruns failed tests to absorb transient flakiness, but should be paired with root-causing genuinely flaky tests, not used to mask them permanently.
- **Test isolation** — because each test gets its own `BrowserContext`, tests can safely run in parallel without shared-state collisions, *as long as* they don't share mutable backend state (e.g. two tests both creating a user named "test").

---

## 15. Debugging Toolkit

| Tool | Command | Use for |
|---|---|---|
| **UI Mode** | `npx playwright test --ui` | Interactive time-travel debugging, watch mode, pick locators |
| **Trace Viewer** | `npx playwright show-trace trace.zip` | Post-mortem debugging of CI failures — DOM snapshots, network, console, per-action screenshots |
| **Codegen** | `npx playwright codegen example.com` | Record actions, generate locators/code by clicking through the app |
| **Debug mode** | `npx playwright test --debug` | Step through a test with Playwright Inspector, pause on each action |
| **VS Code extension** | — | Run/debug individual tests from the editor, set breakpoints |
| `page.pause()` | inline in code | Drop into Inspector at that exact point |

**Trace on CI** is the highest-leverage debugging setup: `trace:
'on-first-retry'` captures a full trace only when a test fails and gets
retried, giving you a scrubbable timeline without bloating storage for
passing runs.

---

## 16. Visual Regression Testing

```ts
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixelRatio: 0.02,
  mask: [page.locator('.timestamp')], // hide dynamic content
});
```

Baselines are platform-specific (rendering differs by OS) — generate/update
with `--update-snapshots`, and typically run visual tests in CI on one
consistent OS/Docker image to avoid cross-machine diffs.

---

## 17. CI Integration

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

Best practices for CI:
- `forbidOnly: !!process.env.CI` so a stray `.only` never silently skips coverage.
- Cache `~/.cache/ms-playwright` (or use `--with-deps` fresh) to speed up installs.
- Upload the HTML report + traces as artifacts — the report is useless if you can't retrieve it after the job ends.
- Run smoke tests on every PR; full regression on a schedule/merge-to-main, especially for large suites.

---

## 18. Framework Design Best Practices

- **Prefer role/label locators over CSS/XPath** — survives markup refactors.
- **No hard sleeps.** Ever.
- **One assertion concept per test** — narrow, fast-failing tests are easier to triage than mega-tests.
- **Independent tests** — no test should depend on another test's side effects; use fixtures/API setup instead of UI chains.
- **Tag tests** (`@smoke`, `@regression`, `@critical`) and wire tags to CI stages via `--grep`.
- **Centralize environment config** (`baseURL`, credentials) — never hardcode URLs per test.
- **Fail fast on infra issues** — distinguish "app bug" failures from "test environment down" failures in reporting/alerting.
- **Keep POM/fixtures thin** — page objects should expose actions and locators, not assertions; assertions belong in tests.
- **Review flaky tests weekly** — a suite that's ignored because "it's just flaky" stops providing signal, which defeats the purpose of automation.

---

## 19. Playwright vs. Other Tools (Quick Comparison)

| | Playwright | Selenium | Cypress |
|---|---|---|---|
| Browser engines | Chromium, Firefox, WebKit | Chromium, Firefox, WebKit, Safari (via drivers) | Chromium-family (+ experimental Firefox/WebKit) |
| Protocol | CDP / native (fast) | WebDriver (HTTP, slower) | Runs inside the browser |
| Auto-wait | Yes, built-in | No — manual waits | Yes, built-in |
| Multi-tab/window | Native support | Clunky | Not supported (single tab) |
| Network interception | Native | Needs proxy tools | Native (`cy.intercept`) |
| Languages | JS/TS, Python, Java, .NET | Almost any | JS/TS only |
| Parallelization | Built-in (workers/sharding) | Needs Selenium Grid | Needs Cypress Cloud/3rd-party |
| Test runner | Own (`@playwright/test`) | Needs external (JUnit/pytest/etc.) | Own |

---

## 20. Interview-Ready Q&A

**Q: How does Playwright avoid flaky tests compared to Selenium?**
A: Auto-waiting/actionability checks before every action, web-first
assertions that retry until timeout, and a fast native browser protocol
instead of WebDriver's HTTP round-trips — most flakiness in Selenium suites
comes from race conditions these features eliminate by design.

**Q: What's the difference between `page.locator()` and `page.$()`?**
A: `locator()` returns a lazy, re-queryable reference re-evaluated on every
action (no staleness); `$()` returns an `ElementHandle` resolved immediately,
which can go stale after DOM re-renders. Always prefer locators.

**Q: How do you speed up a suite where every test logs in through the UI?**
A: Authenticate once in a setup step, persist `storageState` (cookies +
localStorage) to a file, and reuse it via `context.storageState` — reduces
login from every test to once per suite run (or per role).

**Q: How would you test that an API failure shows the right error UI, if the
backend rarely fails?**
A: `page.route()` to intercept the specific endpoint and `route.fulfill()`
with a 500/4xx mock response, or `route.abort()` to simulate a network
failure — no backend cooperation required.

**Q: Why use `BrowserContext` instead of restarting the browser per test?**
A: Contexts are cheap (milliseconds) and give full isolation — no shared
cookies/storage — so you get Selenium-grade isolation without the cost of a
fresh browser process per test.

**Q: What causes a test to time out even though the element is clearly
visible in the screenshot?**
A: An actionability check other than visibility is failing — commonly an
overlay/modal intercepting pointer events, or the element being mid-animation
(stability check). The error message names the exact failed check; the trace
viewer shows the DOM state at that moment.

**Q: How do you structure a suite for both smoke and full regression runs?**
A: Tag tests (`test('...', { tag: '@smoke' }, ...)`), then run `npx
playwright test --grep @smoke` on every PR and the full suite on a merge/
nightly schedule — keeps PR feedback fast while preserving full coverage
cadence.

---

## 21. One-Line Summary

**Playwright wins by removing the two biggest sources of E2E pain — flaky
waits and slow/limited browser control — with auto-waiting actionability
checks, a fast native protocol, and first-class network/context/debugging
tooling built directly into the test runner.**
