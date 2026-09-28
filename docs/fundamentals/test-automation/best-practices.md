---
title: "Test Automation Best Practices"
description: "Habits that keep automated test suites fast, readable and trusted — what to automate, test design, locators, waiting, assertions, data, page objects, fixtures, config and secrets, CI, flaky tests, reporting, code review, and a pre-merge checklist."
sidebar_position: 2
level: intermediate
tags: [test-automation, playwright, fundamentals, best-practices]
---

# Test Automation Best Practices

This page lists good habits for writing and running automated tests. They
keep a suite fast, easy to read and — most important — **trusted**: a red
build should always mean a real problem. They apply to SDETs, developers and
anyone writing UI or API tests, in any tool.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- A bad-vs-good example, where it helps. Examples use Playwright + TypeScript
  on the [practice app](/cheatsheets/manual-testing#practice-app).

:::tip How to use this page

Read it once after you finish Part 2 of the [test automation cheat sheet](/cheatsheets/test-automation),
then use [the checklist at the end](#14-short-checklist-before-you-merge) on
every pull request that adds or changes tests.

:::

---

## Contents

1. [Choose What to Automate](#1-choose-what-to-automate)
2. [Design Each Test](#2-design-each-test)
3. [Locators](#3-locators)
4. [Waiting](#4-waiting)
5. [Assertions](#5-assertions)
6. [Test Data](#6-test-data)
7. [Page Objects and Fixtures](#7-page-objects-and-fixtures)
8. [Config and Secrets](#8-config-and-secrets)
9. [Speed](#9-speed)
10. [CI](#10-ci)
11. [Flaky Tests](#11-flaky-tests)
12. [Reporting](#12-reporting)
13. [Code Review and Maintenance](#13-code-review-and-maintenance)
14. [Short Checklist Before You Merge](#14-short-checklist-before-you-merge)

---

## 1. Choose What to Automate

**In short:** automate stable, repeated, valuable checks — and put each check
at the lowest level that can catch the bug.

- **Do** start with the smoke tier: the few journeys that must always work.
  **Why:** that's where automation pays back fastest — it runs on every change.
- **Do** test business rules through the API and keep a few UI tests for the journey.
  **Why:** API tests are faster and far less flaky; 40 price rules don't need 40 browser tests.
- **Don't** automate features that are still changing every sprint.
  **Why:** you'll rewrite the tests more often than they catch bugs.
- **Do** add an automated test for every production bug you fix.
  **Why:** it can never come back unnoticed.

---

## 2. Design Each Test

**In short:** one behaviour per test, independent, with a name that says what it proves.

- **Do** name tests as behaviours: `locked-out user sees a clear error`.
  **Why:** the report reads like a list of what works and what doesn't.
- **Do** keep each test independent — it creates its own state and can run alone, in any order.
  **Why:** dependent tests fail in groups and hide the real cause.
- **Do** follow arrange → act → assert, with a blank line between them.
  **Why:** a reader sees set-up, action and check at a glance.
- **Don't** write one giant end-to-end test that checks 20 things.
  **Why:** the first failure stops it, hiding the other 19 results.

```ts
// Weak — one test, many purposes, no clear failure
test('shop works', async ({ page }) => { /* login, sort, cart, checkout, logout … */ });

// Strong — each test proves one thing
test('price low to high sorts ascending', async ({ loginPage, inventoryPage }) => { /* … */ });
test('adding and removing updates the cart badge', async ({ page, inventoryPage }) => { /* … */ });
```

---

## 3. Locators

**In short:** find elements the way users do; never by page structure.

- **Do** prefer `getByRole` with a name, then label/placeholder/text, then test ids.
  **Why:** they survive redesigns and match what users (and screen readers) experience.
- **Do** ask developers for `data-testid` (or `data-test`) on elements with no stable name.
  **Why:** a test id is a contract: "don't change this without telling the tests".
- **Don't** use long CSS or XPath paths.
  **Why:** `div > div:nth-child(3) > button` breaks when anyone adds a wrapper `div`.

```ts
// Weak
page.locator('#root > div > div.inventory_list > div:nth-child(1) button');
// Strong
page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Backpack' })
  .getByRole('button', { name: 'Add to cart' });
```

---

## 4. Waiting

**In short:** wait for conditions, never for time.

- **Do** use web-first assertions (`await expect(locator).toBeVisible()`); they retry automatically.
  **Why:** they wait exactly as long as needed — fast on a fast day, patient on a slow one.
- **Don't** use `page.waitForTimeout(3000)` in tests.
  **Why:** fixed sleeps make suites slow *and* still flaky when the app takes 3.1 seconds.
- **Do** give a longer timeout only to the one step that is known to be slow.
  **Why:** a global timeout increase hides real hangs everywhere else.

```ts
// Weak
await page.waitForTimeout(6000);
// Strong — performance_glitch_user's login really takes ~5 s
await expect(page.getByText('Products')).toBeVisible({ timeout: 15_000 });
```

---

## 5. Assertions

**In short:** assert what matters to the user, precisely, in the test itself.

- **Do** assert outcomes users see or depend on (text, count, URL, saved data).
  **Why:** tests that only check "no error was thrown" pass while the feature is wrong.
- **Do** make assertion messages or data specific: `toHaveText('Epic sadface: Username is required')`.
  **Why:** a vague check (`toBeVisible()` on an error box) passes with the wrong message.
- **Do** keep the main assertions in the test, not hidden inside page objects.
  **Why:** a reader should see what the test proves without opening other files.
- **Do** use `expect.soft` when several independent checks on one page are all worth reporting.
  **Why:** you see every failure in one run instead of fixing them one by one.

---

## 6. Test Data

**In short:** each test makes the data it needs, unique and minimal; nothing depends on leftovers.

- **Do** use builders with defaults and override only what the test is about.
  **Why:** `aBooking({ totalprice: 0 })` tells the reader what matters.
- **Do** make data unique (timestamp or random suffix).
  **Why:** parallel tests and repeated runs don't collide.
- **Do** create data through the API, not the UI.
  **Why:** seconds instead of minutes, and fewer places to fail.
- **Do** clean up in fixtures (after `use()`), or use data that expires.
  **Why:** environments stay usable and fast.
- **Don't** use real customer data.
  **Why:** privacy law, and you'd be storing it in logs, traces and screenshots.

---

## 7. Page Objects and Fixtures

**In short:** page objects hide *how*; tests say *what*; fixtures hand tests what they need.

- **Do** create one page object per screen (or component), holding its locators and actions.
  **Why:** one UI change → one file to fix.
- **Do** return data or nothing from page objects, not raw locators everywhere.
  **Why:** tests stay readable and don't depend on page structure.
- **Don't** put `if`/loops over test data in page objects.
  **Why:** logic in helpers hides what the test actually does.
- **Do** provide page objects and clients through fixtures.
  **Why:** tests don't repeat set-up; clean-up always runs.

---

## 8. Config and Secrets

**In short:** one config file for environment values; secrets only from the environment.

- **Do** read all URLs and credentials in one place (`src/config/env.ts`).
  **Why:** switching environment is one variable, not a search-and-replace.
- **Don't** commit passwords, tokens or `.auth/` session files.
  **Why:** anything in Git is effectively public forever. Add them to `.gitignore`.
- **Do** fail fast when a required variable is missing.
  **Why:** a clear "Missing API_PASSWORD" beats 200 confusing test failures.

---

## 9. Speed

**In short:** fast suites get run; slow suites get skipped.

- **Do** reuse logins with saved `storageState` instead of logging in through the UI in every test.
- **Do** run tests in parallel (`fullyParallel`) and shard in CI.
- **Do** block things tests don't need (analytics, ads, big images) with `page.route`.
- **Do** measure: record suite time per run and watch the trend.
  **Why (all):** a smoke tier that takes minutes, not an hour, can run on every pull request.

---

## 10. CI

**In short:** tests protect the team only when they run automatically and block bad changes.

- **Do** run the smoke tier on every pull request and the full suite nightly.
  **Why:** fast feedback where it matters, full coverage every day.
- **Do** make a failing smoke run block the merge.
  **Why:** a check nobody has to respect is a check nobody will respect.
- **Do** keep reports, traces and videos as CI artifacts, even on failure.
  **Why:** you need them exactly when something went wrong.
- **Do** set `forbidOnly: !!process.env.CI`.
  **Why:** a forgotten `test.only` would silently skip the rest of the suite.

---

## 11. Flaky Tests

**In short:** a flaky test is a bug — give it an owner, fix it or quarantine it, never ignore it.

- **Do** use retries in CI only, and read the "flaky" list in the report.
  **Why:** retries separate "flaky" from "broken", but hide the problem if nobody looks.
- **Do** reproduce with `--repeat-each=20 --workers=4`.
  **Why:** most flakiness appears only under repetition and parallel load.
- **Do** quarantine with a `@quarantine` tag, a ticket, an owner and a deadline.
  **Why:** the build stays trusted while the test is being fixed.
- **Do** use `test.fail()` for a known product bug, not `test.skip()`.
  **Why:** you'll be told the moment the bug is fixed.

---

## 12. Reporting

**In short:** engineers need traces; managers need trends.

- **Do** attach traces, screenshots and videos to failures.
  **Why:** most failures can be diagnosed without re-running anything.
- **Do** export JUnit XML for CI dashboards and test management tools.
- **Do** report pass rate, flaky count and suite time over time.
  **Why:** trends show whether the suite is getting healthier — single runs don't.

---

## 13. Code Review and Maintenance

**In short:** test code is production code for the team's confidence — review and refactor it the same way.

- **Do** review test pull requests with the same rules as product code.
- **Do** type-check (`npx tsc`) and lint tests in CI.
- **Do** delete tests that never fail and protect nothing important.
  **Why:** every test has a running and maintenance cost.
- **Do** keep the README current: set-up, how to run each tier, how to add a test.
  **Why:** a framework only one person can run is a risk, not an asset.

---

## 14. Short Checklist Before You Merge

- [ ] Each new test proves one behaviour and its name says which
- [ ] Runs alone and in parallel: `--workers=4 --repeat-each=3` passes
- [ ] No sleeps; only web-first assertions
- [ ] Locators by role/label/text/test id — no layout-based CSS/XPath
- [ ] Creates its own data; nothing depends on other tests
- [ ] No secrets or session files committed
- [ ] Tagged with the right tier (`@smoke`, `@regression`, …)
- [ ] `npx tsc -p .` passes
- [ ] Fails for the right reason: break the feature (or the expected value) once and watch it go red
- [ ] Coverage matrix / test list updated

**Need more detail?** [Cheat sheet](/cheatsheets/test-automation) ·
[Quick reference](/docs/fundamentals/test-automation/test-automation-quick-reference) ·
Framework guide
