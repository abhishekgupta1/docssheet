---
title: "Test Automation Quick Reference"
description: "Copy-paste test automation reference for Playwright + TypeScript — CLI, locators, actions, assertions, annotations, config options, fixtures, network routes, CI snippets, error messages and fixes, and Selenium/Cypress/WebdriverIO equivalents."
sidebar_position: 1
level: beginner
tags: [test-automation, playwright, fundamentals, cheat-sheet]
---

# Test Automation Quick Reference

A lookup page for writing and running automated tests with Playwright and
TypeScript, plus the equivalent names in other tools.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
automation? Start with the [test automation cheat sheet](/cheatsheets/test-automation),
which explains each idea with an exercise. For the ordered plan with projects,
see the [test automation learning path](/docs/learning-path/test-automation/implementation-roadmap).

:::

## Quick Navigation

**Writing tests:** [Locators](#locators) · [Actions](#actions) · [Assertions](#assertions) · [Annotations](#annotations) · [Hooks](#hooks) · [Page methods](#page-methods) · [Network](#network)

**Framework:** [Folder layout](#folder-layout) · [Config options](#config-options) · [Fixture pattern](#fixture-pattern) · [Environment variables](#environment-variables)

**Running:** [CLI](#cli) · [CI snippets](#ci-snippets) · [Errors and fixes](#errors-and-fixes)

**Other tools:** [Selenium / Cypress / WebdriverIO](#other-tools)

---

## Locators {#locators}

| Locator | Example | Finds |
|---|---|---|
| `getByRole` | `page.getByRole('button', { name: 'Login' })` | By ARIA role + accessible name |
| `getByLabel` | `page.getByLabel('Email')` | Input by its `<label>` |
| `getByPlaceholder` | `page.getByPlaceholder('Username')` | Input by placeholder |
| `getByText` | `page.getByText('Products')` | By visible text (substring by default) |
| `getByAltText` | `page.getByAltText('Sauce Labs Backpack')` | Image by alt text |
| `getByTitle` | `page.getByTitle('Close')` | By `title` attribute |
| `getByTestId` | `page.getByTestId('checkout')` | `data-testid` (change with `testIdAttribute`) |
| `locator` | `page.locator('[data-test="error"]')` | CSS or `xpath=…` |

| Refine | Example |
|---|---|
| Exact text | `getByText('Products', { exact: true })` |
| Filter by text | `locator('.card').filter({ hasText: 'Backpack' })` |
| Filter by child | `locator('.card').filter({ has: page.getByRole('button') })` |
| Inside another | `card.getByRole('button', { name: 'Add to cart' })` |
| Nth / first / last | `.nth(2)`, `.first()`, `.last()` |
| Either one | `a.or(b)` |
| Both | `a.and(b)` |

Common roles: `button`, `link`, `textbox`, `checkbox`, `radio`, `combobox`
(select), `heading`, `listitem`, `row`, `cell`, `dialog`, `img`, `tab`.

## Actions {#actions}

| Action | Example |
|---|---|
| Click / double / right | `.click()`, `.dblclick()`, `.click({ button: 'right' })` |
| Type (replace) | `.fill('text')` |
| Type key by key | `.pressSequentially('text', { delay: 50 })` |
| Key | `.press('Enter')`, `.press('Control+A')` |
| Clear | `.clear()` |
| Select | `.selectOption('hilo')`, `.selectOption({ label: 'Price (high to low)' })` |
| Checkbox | `.check()`, `.uncheck()`, `.setChecked(true)` |
| Hover / focus | `.hover()`, `.focus()` |
| Upload | `.setInputFiles('files/photo.jpg')` |
| Drag | `.dragTo(target)` |
| Read | `.textContent()`, `.innerText()`, `.inputValue()`, `.getAttribute('href')`, `.allTextContents()`, `.count()` |

## Assertions {#assertions}

Retrying (`await expect(locator)…`, default timeout 5 s):

| Assertion | Use |
|---|---|
| `toBeVisible()` / `toBeHidden()` | Shown / not shown |
| `toBeEnabled()` / `toBeDisabled()` | Can / can't interact |
| `toBeChecked()` | Checkbox/radio state |
| `toBeFocused()` | Has keyboard focus |
| `toHaveText(t)` / `toContainText(t)` | Exact / partial text (string, regex or array) |
| `toHaveValue(v)` | Input value |
| `toHaveCount(n)` | Number of matches |
| `toHaveAttribute(name, v)` / `toHaveClass(c)` | Attributes |
| `toHaveURL(u)` / `toHaveTitle(t)` | On `page` |
| `toHaveScreenshot(name)` | Visual comparison |

Non-retrying (plain values): `toBe`, `toEqual`, `toMatchObject`, `toContain`,
`toBeGreaterThan`, `toBeTruthy`, `toMatch(/regex/)`, `toHaveLength(n)`.

Modifiers: `expect(x).not.toBe…`, `expect.soft(x)…` (keep going after a
failure), `expect(locator).toBeVisible({ timeout: 15_000 })`,
`await expect.poll(() => fetchCount()).toBe(3)` (retry any function).

## Annotations {#annotations}

| Annotation | Effect |
|---|---|
| `test.only(...)` | Run only this test (blocked in CI by `forbidOnly`) |
| `test.skip(condition, 'reason')` | Skip, e.g. `test.skip(browserName === 'webkit', 'not supported')` |
| `test.fixme('reason')` | Skip and mark "needs fixing" |
| `test.fail(true, 'BUG-101')` | Expected to fail — reported as failure if it passes |
| `test.slow()` | Triple the timeout |
| `{ tag: '@smoke' }` / `@smoke` in title | Filter with `--grep` |
| `test.describe.serial(...)` | Run tests in a group in order (avoid; prefer independent tests) |

## Hooks {#hooks}

```ts
test.beforeAll(async () => { /* once per worker, before the tests in this file */ });
test.beforeEach(async ({ page }) => { /* before each test */ });
test.afterEach(async ({ page }, testInfo) => { /* after each; testInfo.status tells pass/fail */ });
test.afterAll(async () => { /* once per worker, after */ });
```

## Page methods {#page-methods}

| Method | Use |
|---|---|
| `page.goto('/path')` | Open a URL (relative to `baseURL`) |
| `page.reload()`, `page.goBack()`, `page.goForward()` | Navigation |
| `page.waitForURL(/checkout/)` | Wait for navigation |
| `page.waitForResponse('**/api/cart')` | Wait for a network response |
| `page.screenshot({ path, fullPage: true })` | Screenshot |
| `page.setViewportSize({ width: 375, height: 812 })` | Change size |
| `page.on('dialog', d => d.accept())` | Handle `alert`/`confirm` |
| `page.on('console', m => …)` | Read console messages |
| `page.context().storageState({ path })` | Save cookies + storage |
| `page.evaluate(() => localStorage.clear())` | Run code in the page |

## Network {#network}

```ts
await page.route('**/api/v1/fruits', r => r.fulfill({ json: [{ name: 'Mango', id: 1 }] }));   // fake response
await page.route('**/api/v1/fruits', r => r.fulfill({ status: 500, body: 'boom' }));          // fake error
await page.route('**/*.{png,jpg}', r => r.abort());                                           // block images
await page.route('**/api/**', async r => {                                                    // change real data
  const response = await r.fetch();
  const json = await response.json();
  await r.fulfill({ response, json: { ...json, extra: true } });
});
```

---

## Folder layout {#folder-layout}

```text
project/
├── playwright.config.ts
├── src/
│   ├── config/env.ts          # environment values
│   ├── fixtures/test.ts       # custom fixtures; tests import test from here
│   ├── pages/                 # page objects
│   ├── api/                   # API clients
│   └── data/                  # users, builders, auth-state paths
├── tests/
│   ├── auth.setup.ts          # saved login
│   ├── ui/  api/  a11y/  visual/  mock/
└── .github/workflows/tests.yml
```

## Config options {#config-options}

| Option | Example | Purpose |
|---|---|---|
| `testDir` | `'./tests'` | Where tests live |
| `timeout` | `30_000` | Per-test timeout (ms) |
| `expect.timeout` | `{ timeout: 5_000 }` | Web-first assertion timeout |
| `fullyParallel` | `true` | Parallel inside files too |
| `workers` | `4` / `'50%'` | Parallel processes |
| `retries` | `process.env.CI ? 2 : 0` | Retries (a pass on retry = flaky) |
| `forbidOnly` | `!!process.env.CI` | Fail if `test.only` is left in |
| `grep` / `grepInvert` | `/@smoke/` | Filter by title/tag |
| `reporter` | `[['html'], ['junit', { outputFile }]]` | Reports |
| `use.baseURL` | `'https://www.saucedemo.com'` | Base for `goto('/')` |
| `use.trace` | `'on-first-retry'` | When to record traces |
| `use.screenshot` / `use.video` | `'only-on-failure'` / `'retain-on-failure'` | Evidence |
| `use.testIdAttribute` | `'data-test'` | Attribute for `getByTestId` |
| `use.storageState` | `'.auth/user.json'` | Start logged in |
| `projects` | `[{ name: 'chromium', use: devices['Desktop Chrome'] }]` | Browsers/devices/suites |
| `projects[].dependencies` | `['setup']` | Run another project first |
| `webServer` | `{ command: 'npm start', url: 'http://localhost:3000' }` | Start the app before tests |

## Fixture pattern {#fixture-pattern}

```ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ thing: Thing }>({
  thing: async ({ page }, use) => {
    const thing = await createThing(page);   // set-up
    await use(thing);                        // the test runs here
    await thing.cleanUp();                   // clean-up, runs even if the test failed
  },
});
export { expect } from '@playwright/test';
```

## Environment variables {#environment-variables}

| Variable | Meaning |
|---|---|
| `CI` | Set by CI systems; used to switch retries, workers, `forbidOnly` |
| `PWDEBUG=1` | Run with the inspector (same as `--debug`) |
| `DEBUG=pw:api` | Log every Playwright call |
| Your own (e.g. `UI_BASE_URL`) | Read in `src/config/env.ts` |

---

## CLI {#cli}

| Command | Does |
|---|---|
| `npm init playwright@latest` | Create a project |
| `npx playwright install [--with-deps]` | Download browsers (+ Linux libraries) |
| `npx playwright test` | Run everything |
| `npx playwright test path/file.spec.ts:12` | One file / one line |
| `-g "title"` / `--grep @smoke` / `--grep-invert @quarantine` | Filter |
| `--project=chromium` | One project |
| `--headed` / `--ui` / `--debug` | Watch / UI mode / inspector |
| `--workers=1` | No parallelism |
| `--repeat-each=10` | Run each test 10 times (find flakiness) |
| `--retries=2` | Override retries |
| `--shard=1/3` | Run one third of the suite |
| `--last-failed` | Re-run only the tests that failed last time |
| `--update-snapshots` | Accept new visual baselines |
| `--list` | List tests without running |
| `npx playwright show-report` | Open HTML report |
| `npx playwright show-trace trace.zip` | Open a trace |
| `npx playwright codegen <url>` | Record actions into code |
| `npx playwright merge-reports --reporter html ./blob-report` | Merge sharded reports |

## CI snippets {#ci-snippets}

GitHub Actions — see the full, tested workflow in the
framework guide.

GitLab CI and Jenkins below follow the same four steps (install, install
browsers, run, keep the report). They are shown for structure and were not run
for this page.

```yaml
# .gitlab-ci.yml
tests:
  image: mcr.microsoft.com/playwright:v1.63.0-noble   # browsers pre-installed; match your Playwright version
  script:
    - npm ci
    - npx playwright test --grep @smoke
  artifacts:
    when: always
    paths: [playwright-report/]
```

```groovy
// Jenkinsfile
pipeline {
  agent { docker { image 'mcr.microsoft.com/playwright:v1.63.0-noble' } }
  stages {
    stage('Test') {
      steps {
        sh 'npm ci'
        sh 'npx playwright test --grep @smoke'
      }
    }
  }
  post { always { archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true } }
}
```

## Errors and fixes {#errors-and-fixes}

| Error | Usual cause | Fix |
|---|---|---|
| `strict mode violation: … resolved to 3 elements` | Locator matches several elements | Make it specific (`name`, `filter`) or use `.first()` on purpose |
| `Timeout … waiting for getByRole(…)` | Wrong locator, element not there yet, or wrong role | Check in `--ui` / codegen; an `<a>` without `href` has no `link` role |
| `Test timeout of 30000ms exceeded` | Waiting on something that never happens | Read which step; raise the timeout only for known-slow steps |
| `Cannot find name 'process'` (TypeScript) | Node types missing | `npm i -D @types/node` and `"types": ["node"]` in tsconfig |
| `test file "a.spec.ts" should not import test file "b.ts"` | Sharing code between test files | Move shared code to `src/` |
| `browserType.launch: Executable doesn't exist` | Browsers not installed | `npx playwright install` |
| `A snapshot doesn't exist … writing actual` | First visual run | Review, then `--update-snapshots` |
| Passes locally, fails in CI | Timing, screen size, fonts, data, secrets missing | Trace from CI; same viewport; env variables set |

---

## Other tools {#other-tools}

| Task | Playwright (TS) | Selenium (Java) | Cypress | WebdriverIO |
|---|---|---|---|---|
| Open page | `await page.goto(url)` | `driver.get(url)` | `cy.visit(url)` | `await browser.url(url)` |
| Find by CSS | `page.locator('#id')` | `driver.findElement(By.cssSelector("#id"))` | `cy.get('#id')` | `$('#id')` |
| Find by text | `page.getByText('Hi')` | `By.xpath("//*[text()='Hi']")` | `cy.contains('Hi')` | `$('span=Hi')` (tag + text) |
| Type | `.fill('x')` | `.sendKeys("x")` | `.type('x')` | `.setValue('x')` |
| Click | `.click()` | `.click()` | `.click()` | `.click()` |
| Wait for visible | `await expect(l).toBeVisible()` | `wait.until(ExpectedConditions.visibilityOf(el))` | `.should('be.visible')` | `await el.waitForDisplayed()` |
| Assert text | `await expect(l).toHaveText('x')` | `assertEquals("x", el.getText())` | `.should('have.text', 'x')` | `await expect(el).toHaveText('x')` |
| Screenshot | `page.screenshot()` | `((TakesScreenshot) driver).getScreenshotAs(…)` | `cy.screenshot()` | `browser.saveScreenshot(path)` |
| Mock network | `page.route` | Proxy / DevTools (BiDi) | `cy.intercept` | `browser.mock` |

**Need more detail?** [Cheat sheet](/cheatsheets/test-automation) ·
[Best practices](/docs/fundamentals/test-automation/best-practices) ·
[Learning path](/docs/learning-path/test-automation/implementation-roadmap) ·
Framework guide
