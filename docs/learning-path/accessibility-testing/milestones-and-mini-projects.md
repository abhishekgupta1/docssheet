---
title: "Accessibility Testing Milestones & Mini-Projects"
description: "Tasks with expected results for each of the six accessibility testing milestones — the accessibility tree, a 14-issue manual audit with an answer key, axe scans, keyboard and form tests in code, screen readers and zoom, and a real audit report."
sidebar_position: 2
level: beginner
tags: [accessibility, a11y, wcag, learning-path, projects]
---

# Accessibility Testing Milestones & Mini-Projects

**In short:** six projects — five on the [practice lab](/cheatsheets/accessibility-testing#practice-lab)
(`broken.html` and `fixed.html`) and a final audit of a real site. Tasks show
the **expected result**; answer keys are folded away. The accessibility-tree
snapshots and test results below were captured from real runs.

:::tip How to use this page

Serve the lab with `npx http-server site -p 8080` and open both pages. First
read the milestone in the [Roadmap](/docs/learning-path/accessibility-testing/implementation-roadmap).
Write your own findings before opening an answer key — then count what you missed and why.

:::

## Contents

- [Milestone 1: Inspecting two pages](#milestone-1)
- [Milestone 2: Find the 14 issues](#milestone-2)
- [Milestone 3: Automated scans](#milestone-3)
- [Milestone 4: A suite that locks in fixes](#milestone-4)
- [Milestone 5: Listening and resizing](#milestone-5)
- [Milestone 6: A real audit](#milestone-6)
- [Final project](#final-project)

---

## Milestone 1: Inspecting two pages {#milestone-1}

**Practises:** semantics, roles and names, the accessibility tree.

| # | Task | Expected result |
|---|---|---|
| 1 | Open `broken.html`, put the mouse away, try to sign up | You can't reach "Sign up" |
| 2 | DevTools → Elements → **Accessibility** pane: inspect "Sign up" on both pages | Broken: no button role. Fixed: role `button`, name "Sign up" |
| 3 | Turn on the full accessibility tree view (DevTools → Accessibility → "Enable full-page accessibility tree") and compare the pages | See answer key |
| 4 | List 5 differences between the two trees | 5 differences |

<details>
<summary>Answer key</summary>

Accessibility trees as Playwright reports them (`page.locator('body').ariaSnapshot()`):

```yaml
# broken.html
- img
- text: Create your account
- paragraph: All fields are required.
- textbox "Email"
- textbox "Password"
- combobox:
  - option "Free" [selected]
  - option "Pro"
- paragraph
- text: Sign up
- link "Click here":
  - /url: /terms
```

```yaml
# fixed.html
- banner:
  - img "Example Shop"
- main:
  - heading "Create your account" [level=1]
  - paragraph: All fields are required.
  - text: Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - text: Plan
  - combobox "Plan":
    - option "Free" [selected]
    - option "Pro"
  - button "Sign up"
  - status
  - link "Terms of service":
    - /url: /terms
```

Differences: the image has no name vs "Example Shop"; "Create your account" is
plain text vs a level-1 heading; the combobox has no name vs "Plan"; "Sign
up" is plain text vs a button; no landmarks vs `banner` and `main`; no
`status` region; "Click here" vs "Terms of service".

Note: the broken textboxes still get names ("Email") — browsers fall back to
the placeholder. That's why tools often don't flag placeholder-only fields,
even though WCAG wants a visible, persistent label.

</details>

**Watch out for:** judging by what you *see*. Both pages look almost the same;
the accessibility tree is what assistive technology gets.

**Try it:** `ariaSnapshot()` output can be saved and compared in tests with
`toMatchAriaSnapshot` — which change on the page would make it fail?

---

## Milestone 2: Find the 14 issues {#milestone-2}

**Practises:** a full manual check of one page against WCAG 2.2 AA.

Use the [manual check routine](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#manual-routine)
on `broken.html`. For each issue write: element, WCAG criterion, who is
affected, fix. Don't open `fixed.html`'s source until you're done.

| # | Task | Expected result |
|---|---|---|
| 1 | Page-level checks (title, language, landmarks, headings) | 4 issues |
| 2 | Images and colour | 3 issues |
| 3 | Keyboard and focus | 2 issues |
| 4 | Form fields, errors and messages | 4 issues |
| 5 | Links | 1 issue |

<details>
<summary>Answer key — 14 issues</summary>

| # | Issue | WCAG | Who is affected | Fix |
|---|---|---|---|---|
| 1 | Title is "Page" | 2.4.2 Page Titled (A) | Screen-reader users (first thing announced), tab switchers | "Create your account — Example Shop" |
| 2 | No `lang` on `<html>` | 3.1.1 Language of Page (A) | Screen readers may use the wrong voice/pronunciation | `<html lang="en">` |
| 3 | No landmarks (`header`, `main`) | 1.3.1 / 2.4.1 (A), best practice | Users who jump by landmark | `<header>`, `<main>` |
| 4 | Heading is a styled `<div>` | 1.3.1 Info and Relationships (A) | Users who navigate by headings | `<h1>` |
| 5 | Logo image has no alt | 1.1.1 Non-text Content (A) | Screen-reader users | `alt="Example Shop"` |
| 6 | Hint text contrast 2.32:1 | 1.4.3 Contrast (AA) | Low-vision users | `#595959` (7:1) |
| 7 | Button text contrast 3.34:1 | 1.4.3 Contrast (AA) | Low-vision users | Darker blue `#1a5fb4` |
| 8 | "Sign up" is a `<div>` — not focusable, no role, no key support | 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A) | Keyboard, screen-reader, switch users — **blocker** | `<button type="submit">` |
| 9 | Focus outline removed | 2.4.7 Focus Visible (AA) | Keyboard users | `:focus-visible` outline |
| 10 | Inputs have placeholder but no label | 3.3.2 Labels or Instructions (A), 1.3.1 (A) | Everyone once typing starts; cognitive, low-vision users | `<label for>` |
| 11 | Plan `<select>` has no name at all | 4.1.2 Name, Role, Value (A) | Screen-reader users | `<label for="plan">` |
| 12 | No `autocomplete` on email/password | 1.3.5 Identify Input Purpose (AA) | Motor and memory impairments; password managers | `autocomplete="email"` / `"new-password"` |
| 13 | Wrong email shown only by a red border | 1.4.1 Use of Color (A), 3.3.1 Error Identification (A) | Colour-blind and screen-reader users | Error in words, `aria-describedby`, `aria-invalid`, focus |
| 14 | "Account created" appears silently; "Click here" link | 4.1.3 Status Messages (AA); 2.4.4 Link Purpose (A) | Screen-reader users | `role="status"`; "Terms of service" |

(Issue 14 has two parts — count them together or separately; either way,
**12+ found is excellent, 8–11 good**, under 8: do the routine again,
slower, with the keyboard.)

</details>

**Watch out for:** stopping at what's visible. Issues 2, 11, 12 and 14 can't
be seen on screen at all.

**Try it:** fix `broken.html` yourself, then compare your version with `fixed.html`.

---

## Milestone 3: Automated scans {#milestone-3}

**Practises:** axe with Playwright, tags, reading results, knowing the limits.

| # | Task | Expected result |
|---|---|---|
| 1 | Playwright + `@axe-core/playwright` project; `webServer` starts the lab | `npx playwright test` runs |
| 2 | Scan `broken.html` with WCAG A/AA tags; print each violation | 4 rule types |
| 3 | Scan `fixed.html`; assert no violations | Passes |
| 4 | Scan `broken.html` with **all** rules (no tags) | 3 more (best practice) |
| 5 | Compare with your 14 issues: which did axe find? | See answer key |

<details>
<summary>Answer key</summary>

```ts title="playwright.config.ts"
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:8080' },
  webServer: { command: 'npx http-server site -p 8080 -s', url: 'http://localhost:8080/fixed.html', reuseExistingServer: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

```ts title="tests/axe.spec.ts"
// tests/axe.spec.ts — automated WCAG checks on the broken and the fixed page
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('broken page: axe lists the violations', async ({ page }) => {
  await page.goto('/broken.html');
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();

  for (const v of violations) console.log(`${v.impact?.padEnd(8)} ${v.id} — ${v.nodes.length} element(s)`);
  expect(violations.length).toBeGreaterThan(0);
});

test('fixed page: no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/fixed.html');
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();

  expect(violations).toEqual([]);
});
```

Task 2 output:

```text
serious  color-contrast — 2 element(s)
serious  html-has-lang — 1 element(s)
critical image-alt — 1 element(s)
critical select-name — 1 element(s)
```

Task 4 adds: `landmark-one-main`, `page-has-heading-one`, `region` (5 elements)
— and one `incomplete` ("needs review") result: `bypass`.

Task 5: WCAG rules found issues **2, 5, 6, 7, 11**; best-practice rules point
at **3 and 4**. Not found by axe: **1, 8, 9, 10, 12, 13, 14** — half the
issues, including the blocker (#8).

</details>

**Watch out for:** `expect(violations.length).toBe(0)` on a page with no
interactive states tested — a clean scan of the first render says nothing
about the error state or an open menu.

**Try it:** type a wrong email on `fixed.html`, submit, then scan again. Still clean?

---

## Milestone 4: A suite that locks in fixes {#milestone-4}

**Practises:** keyboard order, focus, accessible names and descriptions,
status messages — as automated tests.

| # | Task | Expected result |
|---|---|---|
| 1 | Test: Tab order on `fixed.html` is email → password → plan → Sign up → Terms | Passes |
| 2 | Test: on `broken.html`, Tab never reaches "Sign up" | Passes (documents the bug) |
| 3 | Test: the focused email field has a visible solid outline | Passes |
| 4 | Test: wrong email → `aria-invalid`, focus on the field, description = the error text | Passes |
| 5 | Test: success message has `role="status"` and the right text | Passes |
| 6 | Test: `getByLabel('Email')` finds nothing on `broken.html` | Passes |

**Check:** `npx playwright test` — **8 passed** (with the two axe tests).

<details>
<summary>Solution</summary>

```ts title="tests/keyboard.spec.ts"
// tests/keyboard.spec.ts — what axe can't check: can a keyboard user actually do it?
import { test, expect, type Page } from '@playwright/test';

async function tabOrder(page: Page, presses: number) {
  const visited: string[] = [];
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    visited.push(await page.evaluate(() => {
      const el = document.activeElement!;
      return el.id || el.textContent?.trim() || el.tagName;   // a readable name for each stop
    }));
  }
  return visited;
}

test('fixed page: Tab reaches every control in visual order', async ({ page }) => {
  await page.goto('/fixed.html');
  expect(await tabOrder(page, 5)).toEqual(['email', 'password', 'plan', 'Sign up', 'Terms of service']);
});

test('broken page: the "Sign up" button is never reached by Tab', async ({ page }) => {
  await page.goto('/broken.html');
  const visited = await tabOrder(page, 5);
  expect(visited).not.toContain('submit');          // a <div> with onclick isn't focusable
});

test('fixed page: focus is visible', async ({ page }) => {
  await page.goto('/fixed.html');
  await page.keyboard.press('Tab');
  const outline = await page.locator('#email').evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('solid');
});

test('fixed page: a wrong email is announced, linked to the field, and focused', async ({ page }) => {
  await page.goto('/fixed.html');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Sign up' }).press('Enter');

  const email = page.getByLabel('Email');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toBeFocused();
  await expect(email).toHaveAccessibleDescription('Enter an email address like name@example.com');
});

test('fixed page: success message is a live status', async ({ page }) => {
  await page.goto('/fixed.html');
  await page.getByLabel('Email').fill('asha@example.com');
  await page.getByLabel('Password').fill('correct horse');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.getByRole('status')).toHaveText('Account created');   // screen readers announce role=status
});

test('broken page: fields have no accessible name', async ({ page }) => {
  await page.goto('/broken.html');
  await expect(page.getByLabel('Email')).toHaveCount(0);          // placeholder is not a label for getByLabel
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveCount(1);   // …but browsers still fall back to it
});
```

</details>

**Watch out for:** checking focus visibility by screenshot only. Computed
`outline-style` (or a visual comparison of the focused state) is a more precise check.

**Try it:** add a test that `Esc` closes a dialog and returns focus to the
button that opened it (add a small `<dialog>` to `fixed.html` first).

---

## Milestone 5: Listening and resizing {#milestone-5}

**Practises:** screen readers, zoom, reflow, text spacing, WCAG 2.2 criteria.

| # | Task | Expected result |
|---|---|---|
| 1 | With a screen reader, complete sign-up on `broken.html`, then `fixed.html` | Broken: you can't submit; fixed: you can, and you hear "Account created" |
| 2 | On `fixed.html`, submit a wrong email with the screen reader on | You hear the field is invalid and the error text |
| 3 | Jump by headings and landmarks on both pages | Broken: nothing to jump to; fixed: 1 heading, banner, main |
| 4 | Zoom `fixed.html` to 200%, then view at 320 px width | Nothing cut off, no sideways scrolling |
| 5 | Pick a public site you use; check **2.4.11 Focus Not Obscured** with a sticky header or cookie banner | Note whether focused items hide behind it |
| 6 | Same site: check **2.5.8 Target Size** on small icons | Note any targets under 24 × 24 px without spacing |

<details>
<summary>Answer key (what you should hear, roughly)</summary>

Wording differs by screen reader and version. With VoiceOver + Safari on `fixed.html`:

- Email field: *"Email, edit text, required"*.
- After a wrong email: *"invalid data"* and the description *"Enter an email address like name@example.com"*.
- After success: *"Account created"*, without focus moving.

On `broken.html`: the email field is announced from its placeholder, the plan
select has no name ("pop-up button" with no label), "Sign up" is read as
plain text and can't be activated from the keyboard, and nothing announces the success message.

</details>

**Watch out for:** navigating only with `Tab` in a screen reader. Screen-reader
users mostly read with the virtual cursor (arrows / swipes) and jump by
headings — use those too.

**Try it:** do task 1 on your phone with TalkBack or VoiceOver. What's different?

---

## Milestone 6: A real audit {#milestone-6}

**Practises:** scoping, a full audit, severity, reporting, a CI recommendation.

Pick a public site whose owner you won't harass with results (a site you
build, your company's site with permission, or a well-known demo). Audit it
against **WCAG 2.2 AA**.

| # | Deliverable | Expected result |
|---|---|---|
| 1 | Scope: 5 pages/templates + 1 journey; states to check | Written scope |
| 2 | Automated scan of every page and state | Violations exported |
| 3 | Manual routine + keyboard + one screen reader on the journey | Issues logged in the [template](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#issue-template) |
| 4 | Severity for each issue; group by component | Top barriers clear |
| 5 | Report: summary, scorecard, issues, roadmap | 2–4 pages |
| 6 | CI recommendation: which checks to automate first | 5 lines |

<details>
<summary>What a strong report summary looks like</summary>

```text
Scope:     WCAG 2.2 AA; home, search, product, sign-up, checkout; menu open, errors shown.
           Tools: axe 4.13 via Playwright; NVDA + Chrome; VoiceOver + Safari (iOS).
Summary:   23 issues (3 blocker, 7 serious, 9 moderate, 4 minor) in 6 components.
Blockers:  1) Checkout "Pay" is a <div> — not keyboard operable (2.1.1, 4.1.2)
           2) Cookie banner traps focus and can't be closed with Esc (2.1.2)
           3) Card-number field has no label (3.3.2, 4.1.2)
Roadmap:   Week 1 — the 3 blockers (shared Button and Input components)
           Weeks 2–4 — contrast tokens, focus styles, error messaging pattern
           Then — landmarks, headings, link text; re-test and publish an accessibility statement
CI:        axe on the 5 templates (WCAG tags) in every PR; keyboard tests for checkout and sign-up.
```

The numbers above are an example; yours come from your audit. What matters:
blockers first, each tied to a criterion, fixes at component level, and a re-test plan.

</details>

**Watch out for:** reporting 200 rows of "color-contrast" from a scanner. Group
them ("the grey hint text token fails on 40 pages") — one fix, one line.

**Try it:** write the one-paragraph version of your summary for a manager.

---

## Final project {#final-project}

Build (or take) a small multi-page app — sign-up, a list with filters, a
dialog, and a form with errors — make it accessible, and prove it.

**Done when:**

- [ ] Every page passes axe (WCAG 2.2 A/AA tags) in all tested states
- [ ] Keyboard tests for every journey: order, focus visible, no traps, `Esc` closes dialogs
- [ ] Accessible-name and description assertions for every form field and icon button
- [ ] Journeys completed with one desktop and one mobile screen reader — notes saved
- [ ] 200% zoom and 320 px reflow checked
- [ ] An accessibility statement page with known issues and contact details
- [ ] CI runs the axe and keyboard tests on every pull request
- [ ] Public repo — proof you can deliver the
      accessibility testing service
