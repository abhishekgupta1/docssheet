---
title: "Test Automation Learning Path: Start Here"
description: "How to learn test automation in six milestones — build a real Playwright + TypeScript framework step by step, with what to learn in each milestone, tested solutions, self-checks and a final project."
sidebar_position: 1
level: beginner
tags: [test-automation, playwright, learning-path]
---

# Test Automation Learning Path: Start Here

**In short:** you learn test automation in **6 milestones**, and each one adds
a layer to **one framework** you keep building — from three plain tests to a
suite with page objects, fixtures, an API layer, CI, mocking and visual checks.
Every milestone has a tested solution to compare with.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → build → check → commit**. Come back here whenever you're
unsure what to do next.

:::

## Before you start {#before}

- You can write basic TypeScript or JavaScript: variables, functions, `async`/`await`,
  classes. (Java or Python instead? The ideas are the same — see
  [Other tools](/cheatsheets/test-automation#other-tools).)
- You know Git basics — see the [Git cheat sheet](/cheatsheets/git).
- You know what to test — the [manual testing path](/docs/learning-path/manual-testing/implementation-roadmap)
  (at least Milestones 1–3) makes this path much easier.
- Node.js 20+ is installed.

## The pages in this learning path {#pages}

**In short:** each page has one job, so nothing is explained twice.

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan: what each milestone covers and how to check yourself | At the start of each milestone |
| [Test automation cheat sheet](/cheatsheets/test-automation) | Learn each idea: short explanation, example, exercise | The "learn" step of every milestone |
| [Milestones & Mini-Projects](/docs/learning-path/test-automation/milestones-and-mini-projects) | What to build in each milestone, with tested solutions | The "build" and "check" steps |
| [Quick Reference](/docs/fundamentals/test-automation/test-automation-quick-reference) | Locators, assertions, CLI, config, errors and fixes | Any time you're writing tests |
| [Best Practices](/docs/fundamentals/test-automation/best-practices) | Habits that keep a suite fast and trusted | After Milestone 3, then on every pull request |
| Framework implementation guide | The finished framework explained layer by layer | When you want the deeper "why" |

## The milestones {#milestones}

**In short:** do them in order — each milestone changes the same project.

| Milestone | You learn | You build | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Set-up, locators, actions, assertions, running | Three login tests | 1 week |
| [2](#milestone-2) | Page objects, test data | `LoginPage`, `InventoryPage`, a sorting test | 1–2 weeks |
| [3](#milestone-3) | Fixtures, saved logins, independence | Fixtures + a cart test that starts logged in | 1–2 weeks |
| [4](#milestone-4) | API testing in code, builders, negative tests | An API client and booking tests | 1–2 weeks |
| [5](#milestone-5) | Config, tags, reports, CI | Browser projects, tiers, a GitHub Actions pipeline | 1 week |
| [6](#milestone-6) | Mocking, visual tests, flaky and known-bug handling | Mocked-API tests, a visual test, known-bug tests | 1–2 weeks |

Times assume about 6 hours a week.

**For each milestone:**

1. **Learn** — read the cheat-sheet sections listed below and run their examples.
2. **Build** — do the tasks in [Milestones & Mini-Projects](/docs/learning-path/test-automation/milestones-and-mini-projects).
3. **Check** — run the check command. Only when it passes, open the solution and compare designs.
4. **Commit** — one commit (or pull request) per milestone:

```bash
git add .
git commit -m "Milestone 2: page objects for login and inventory, sorting test"
```

### Milestone 1: First tests {#milestone-1}

**Learn:** [What automation is](/cheatsheets/test-automation#what-is-automation) ·
[Set-up](/cheatsheets/test-automation#setup) ·
[Your first test](/cheatsheets/test-automation#first-test) ·
[Finding elements](/cheatsheets/test-automation#locators) ·
[Actions](/cheatsheets/test-automation#actions) ·
[Assertions](/cheatsheets/test-automation#assertions) ·
[Running & debugging](/cheatsheets/test-automation#running) ·
[Grouping & hooks](/cheatsheets/test-automation#hooks)

**Build:** [Three login tests](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] What happens if you forget `await` before an action?
- [ ] Why is `getByRole` preferred over a CSS selector?
- [ ] What's the difference between `expect(locator).toHaveText()` and `expect(text).toBe()`?

### Milestone 2: Page objects {#milestone-2}

**Learn:** [Page objects](/cheatsheets/test-automation#page-objects) ·
[Test data](/cheatsheets/test-automation#test-data) ·
Quick Reference: [Locators](/docs/fundamentals/test-automation/test-automation-quick-reference#locators)

**Build:** [Page objects and a sorting test](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] If the login button's text changes, how many files do you edit?
- [ ] Why should page objects avoid `if` statements about test data?
- [ ] What does `filter({ hasText })` do, and why is it needed on a product list?

### Milestone 3: Fixtures & saved logins {#milestone-3}

**Learn:** [Fixtures](/cheatsheets/test-automation#fixtures) ·
[Parallel & independent](/cheatsheets/test-automation#parallel) ·
[Saved logins](/cheatsheets/test-automation#saved-login) ·
Quick Reference: [Fixture pattern](/docs/fundamentals/test-automation/test-automation-quick-reference#fixture-pattern)

**Build:** [Fixtures and a logged-in cart test](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-3)

**Then read:** [Best Practices](/docs/fundamentals/test-automation/best-practices), sections 1–7.

**Check yourself:**
- [ ] When does the code after `use()` in a fixture run?
- [ ] Why may a test file not import another test file?
- [ ] Why must `.auth/` never be committed?

### Milestone 4: API layer {#milestone-4}

**Learn:** [API calls in tests](/cheatsheets/test-automation#api-in-tests) ·
[Test data](/cheatsheets/test-automation#test-data) ·
[API testing cheat sheet](/cheatsheets/api-testing), sections 1–12

**Build:** [An API client and booking tests](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] Why create UI test data through the API?
- [ ] What makes a negative API test valuable?
- [ ] How does a data builder keep parallel tests from clashing?

### Milestone 5: Config, tags & CI {#milestone-5}

**Learn:** [Config & environments](/cheatsheets/test-automation#config) ·
[Tags & tiers](/cheatsheets/test-automation#tags) ·
[Reports & traces](/cheatsheets/test-automation#reports) ·
[Running in CI](/cheatsheets/test-automation#ci) ·
[Sharding](/cheatsheets/test-automation#sharding) ·
Quick Reference: [Config options](/docs/fundamentals/test-automation/test-automation-quick-reference#config-options),
[CLI](/docs/fundamentals/test-automation/test-automation-quick-reference#cli)

**Build:** [Projects, tiers and a pipeline](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-5)

**Check yourself:**
- [ ] Which tier runs on a pull request, and which nightly? Why?
- [ ] Why retry only in CI?
- [ ] Why upload the report with `if: ${{ !cancelled() }}`?

### Milestone 6: Resilience {#milestone-6}

**Learn:** [Network mocking](/cheatsheets/test-automation#mocking) ·
[Visual testing](/cheatsheets/test-automation#visual) ·
[Flaky tests](/cheatsheets/test-automation#flaky) ·
[Known bugs](/cheatsheets/test-automation#known-bugs) ·
Quick Reference: [Errors and fixes](/docs/fundamentals/test-automation/test-automation-quick-reference#errors-and-fixes)

**Build:** [Mocking, visual and known-bug tests](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/test-automation/best-practices), sections 8–14.

**Check yourself:**
- [ ] When would you mock an API, and when must you not?
- [ ] Why are visual baselines stored per operating system?
- [ ] What's the difference between `test.fail()` and `test.skip()`?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| A locator can't find the element | Run `npx playwright codegen https://www.saucedemo.com` and click the element; or open `--ui` and use the locator picker |
| *strict mode violation* | Your locator matches several elements — add a `name`, a `filter`, or scope it inside a card |
| Test passes alone, fails in the full run | Shared data or order dependence — see [Parallel & independent](/cheatsheets/test-automation#parallel) |
| TypeScript errors | `npx tsc -p .` shows them all at once; see [Errors and fixes](/docs/fundamentals/test-automation/test-automation-quick-reference#errors-and-fixes) |
| The practice site changed | Update the locator — that's real-world maintenance, and good practice |

## What's next {#next}

- Go deeper on APIs: [API testing learning path](/docs/learning-path/api-testing/implementation-roadmap).
- Advise others: Automation consulting and strategy.
- Automate mobile apps: [Appium guide](/docs/sdet-skills/appium/appium-guide).

**Good resources to use alongside:** the official
[Playwright docs](https://playwright.dev/docs/intro) and their "Best Practices"
page, and the ISTQB Advanced Test Automation Engineering syllabus for the
architecture vocabulary.
