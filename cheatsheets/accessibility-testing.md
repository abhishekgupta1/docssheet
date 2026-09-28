---
title: "Accessibility Testing Cheat Sheet"
description: "A beginner-to-advanced reference for accessibility testing — WCAG 2.2 and POUR, semantic HTML, names and labels, contrast, keyboard and focus, forms and errors, ARIA and live regions, axe automation, screen readers, zoom, motion, WCAG 2.2 criteria and audits."
level: beginner
tags: [accessibility, a11y, wcag, axe-core, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Accessibility testing cheatsheet

Learn to check that people with disabilities can use a product — and to
explain the fix. Examples use a **practice page with deliberate
accessibility bugs** and its fixed version, tested with
[axe-core](https://github.com/dequelabs/axe-core) and Playwright. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — broken vs fixed code, or a test with its real result.
- **Try it** — a small exercise.

Every test on this page was run and passes (axe-core 4.13). Want the longer
story? The accessibility testing guide
covers the laws and the audit service.

<a class="topic-crosslink" href="/docs/sdet-skills/qa-services-delivery/accessibility-testing">📖 Full guide: Accessibility testing →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Accessibility testing learning sections">
  <a class="button button--primary" href="/docs/learning-path/accessibility-testing/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/accessibility-testing/best-practices">Best Practices</a>
</nav>

:::tip How to use this page

Save the two [practice pages](#practice-lab) and open them side by side. Go
through **Part 1** in order — the core ideas. **Part 2** is how to test:
keyboard, forms, ARIA, automated checks, screen readers. **Part 3** covers
the less obvious criteria and running an audit. Turn on a screen reader for
the **Try it** tasks at least once — nothing teaches faster.

:::

## Contents {#contents}

**[Practice lab](#practice-lab)**

**[Part 1 — Beginner](#part-1)**:
[What accessibility is](#what-is-a11y) ·
[Who it's for](#who) ·
[WCAG & POUR](#wcag) ·
[Levels & laws](#levels-laws) ·
[Semantic HTML](#semantic-html) ·
[Text alternatives](#alt-text) ·
[Names & labels](#names) ·
[Colour & contrast](#contrast)

**[Part 2 — Core](#part-2)**:
[Keyboard access](#keyboard) ·
[Focus](#focus) ·
[Headings & landmarks](#structure) ·
[Forms & errors](#forms) ·
[ARIA basics](#aria) ·
[Status messages](#status) ·
[Automated checks (axe)](#axe) ·
[Keyboard tests in code](#keyboard-tests) ·
[Screen readers](#screen-readers) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Zoom, reflow & spacing](#zoom) ·
[Motion & timing](#motion) ·
[Mobile & touch](#mobile) ·
[New in WCAG 2.2](#wcag22) ·
[Running an audit](#audit) ·
[Accessibility in CI](#ci) ·
[Words you'll meet](#glossary)

## Practice lab {#practice-lab}

**In short:** one sign-up page written badly (`broken.html`) and the same
page fixed (`fixed.html`), served locally so tests can open both.

```bash
npm init -y && npm i -D @playwright/test @axe-core/playwright http-server
npx playwright install chromium
npx http-server site -p 8080          # then open http://localhost:8080/broken.html
```

<details>
<summary><code>site/broken.html</code> — 14 accessibility problems (don't peek at the list in the milestones yet)</summary>

```html title="site/broken.html"
<!-- site/broken.html — a sign-up page with deliberate accessibility bugs (practice only) -->
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Page</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    .hint { color: #aaa; }                       /* light grey on white: low contrast */
    .btn { background: #4a90d9; color: #fff; padding: 8px 16px; display: inline-block; cursor: pointer; }
    input:focus, .btn:focus { outline: none; }   /* focus indicator removed */
    .error { color: red; }
  </style>
</head>
<body>
  <div class="logo"><img src="logo.png"></div>
  <div style="font-size: 2em; font-weight: bold">Create your account</div>
  <p class="hint">All fields are required.</p>

  <form id="signup">
    <input id="email" type="text" placeholder="Email">
    <input id="password" type="password" placeholder="Password">
    <select id="plan"><option>Free</option><option>Pro</option></select>
    <p id="msg" class="error"></p>
    <div class="btn" id="submit" onclick="submitForm()">Sign up</div>
  </form>

  <a href="/terms">Click here</a>

  <script>
    function submitForm() {
      const email = document.getElementById('email');
      if (!email.value.includes('@')) {
        email.style.borderColor = 'red';                  // error shown by colour only
        return;
      }
      document.getElementById('msg').textContent = 'Account created';
    }
  </script>
</body>
</html>
```

</details>

<details>
<summary><code>site/fixed.html</code> — the same page, fixed</summary>

```html title="site/fixed.html"
<!-- site/fixed.html — the same sign-up page with the accessibility bugs fixed -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Create your account — Example Shop</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    .hint { color: #595959; }                    /* 7:1 contrast on white */
    button { background: #1a5fb4; color: #fff; padding: 8px 16px; border: 0; }
    input:focus-visible, select:focus-visible, button:focus-visible { outline: 3px solid #1a5fb4; outline-offset: 2px; }
    .error { color: #b00020; }
  </style>
</head>
<body>
  <header><img src="logo.png" alt="Example Shop"></header>
  <main>
    <h1>Create your account</h1>
    <p class="hint">All fields are required.</p>

    <form id="signup" novalidate>
      <label for="email">Email</label>
      <input id="email" type="email" autocomplete="email" required aria-describedby="email-error">
      <p id="email-error" class="error" hidden>Enter an email address like name@example.com</p>

      <label for="password">Password</label>
      <input id="password" type="password" autocomplete="new-password" required>

      <label for="plan">Plan</label>
      <select id="plan"><option>Free</option><option>Pro</option></select>

      <button type="submit">Sign up</button>
      <p id="msg" role="status"></p>
    </form>

    <a href="/terms">Terms of service</a>
  </main>

  <script>
    document.getElementById('signup').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email');
      const error = document.getElementById('email-error');
      if (!email.value.includes('@')) {
        email.setAttribute('aria-invalid', 'true');       // announced as "invalid"
        error.hidden = false;                              // error in words, linked to the field
        email.focus();
        return;
      }
      email.removeAttribute('aria-invalid');
      error.hidden = true;
      document.getElementById('msg').textContent = 'Account created';   // role=status: announced
    });
  </script>
</body>
</html>
```

</details>

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. What accessibility is {#what-is-a11y}

**In short:** accessibility (**a11y**) means people with disabilities can
perceive, understand, navigate and use a product — with the tools they rely on.

It's also about everyone else, sometimes: a broken arm, bright sunlight on a
phone, a noisy train, an older user. And in many markets it's a legal
requirement (section 4).

**Try it:** open `broken.html` and put your mouse away. Try to sign up using
only the keyboard. Where do you get stuck?

</div>

<div class="cheat-card">

#### 2. Who it's for {#who}

**In short:** design and test for many kinds of disability and the
**assistive technology** people use.

| Disability | Examples | Tools people use | What breaks for them |
|---|---|---|---|
| Blind | — | Screen readers (NVDA, JAWS, VoiceOver, TalkBack), braille displays | Images without alt text, unlabelled buttons |
| Low vision | Blurred vision, colour blindness | Zoom, magnifiers, high contrast | Low contrast, colour-only meaning, layouts that break at 200% |
| Motor | Tremor, paralysis, RSI | Keyboard only, switch devices, voice control | Mouse-only controls, tiny targets, time limits |
| Deaf / hard of hearing | — | Captions, transcripts | Video without captions |
| Cognitive | Dyslexia, memory, attention | Reading tools, simple layouts | Complex language, puzzles to log in, unclear errors |

</div>

<div class="cheat-card">

#### 3. WCAG & POUR {#wcag}

**In short:** **WCAG** (Web Content Accessibility Guidelines, from the W3C) is
the standard; its criteria are grouped under four principles — **POUR**.

| Principle | Means | Example criterion |
|---|---|---|
| **P**erceivable | Users can see or hear it | 1.1.1 Non-text Content (alt text) |
| **O**perable | Users can use every control | 2.1.1 Keyboard |
| **U**nderstandable | Content and behaviour make sense | 3.3.1 Error Identification |
| **R**obust | Works with assistive technology | 4.1.2 Name, Role, Value |

Each **success criterion** has a number (like `1.4.3`), a level (A, AA, AAA)
and a test you can pass or fail. The W3C "Understanding WCAG" pages explain each one.

</div>

<div class="cheat-card">

#### 4. Levels & laws {#levels-laws}

**In short:** most laws point to **WCAG AA**; the current version is **2.2** (2023).

| Level | Meaning |
|---|---|
| A | The minimum — without it, some users are completely blocked |
| **AA** | The usual legal and contract target |
| AAA | Highest; not required for whole sites |

Laws that use it (simplified): the **European Accessibility Act** (EU, in
force since 28 June 2025), the **ADA** (US; courts apply it to websites and apps),
**Section 508** (US federal), the **Equality Act** (UK), and others. Details
in the accessibility guide.
This is not legal advice — you test against the technical standard.

</div>

<div class="cheat-card">

#### 5. Semantic HTML {#semantic-html}

**In short:** use the HTML element that *means* what the thing *is* — a
button is a `<button>`, a heading is an `<h1>`–`<h6>` — and you get
keyboard support and screen-reader meaning for free.

```html
<!-- broken: looks like a heading and a button, means nothing -->
<div style="font-size: 2em; font-weight: bold">Create your account</div>
<div class="btn" id="submit" onclick="submitForm()">Sign up</div>

<!-- fixed: real heading, real button -->
<h1>Create your account</h1>
<button type="submit">Sign up</button>
```

The `<div>` button can't be reached with `Tab`, can't be pressed with
`Enter`/`Space`, and a screen reader doesn't call it a button. The `<button>`
does all three with no extra code.

**Try it:** in DevTools, inspect both "Sign up" controls in the **Accessibility**
pane. Compare their *role*.

</div>

<div class="cheat-card">

#### 6. Text alternatives {#alt-text}

**In short:** every meaningful image needs **alt text** that says what it
conveys; decorative images get `alt=""` so screen readers skip them.

```html
<img src="logo.png">                              <!-- broken: reader says "logo dot png" or nothing useful -->
<img src="logo.png" alt="Example Shop">           <!-- fixed: says what it is -->
<img src="divider.png" alt="">                    <!-- decorative: deliberately empty -->
```

| Image | Good alt |
|---|---|
| Logo linking home | "Example Shop home" |
| Product photo | "Blue backpack with two front pockets" |
| Chart | A short summary, plus the data in a table or text |
| Icon button (🗑) | The action: "Delete item" |

Tools can tell that alt text is **missing**; only a person can tell it's **wrong**.

</div>

<div class="cheat-card">

#### 7. Names & labels {#names}

**In short:** every control needs an **accessible name** — what a screen
reader announces — normally from a visible `<label>`.

```html
<!-- broken: placeholder only; it disappears when you type, and isn't a proper label -->
<input id="email" type="text" placeholder="Email">
<select id="plan">…</select>                        <!-- no name at all -->

<!-- fixed: visible label linked with for/id -->
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" required>
<label for="plan">Plan</label>
<select id="plan">…</select>
```

The accessible name comes, in order of preference, from: visible `<label>`,
`aria-labelledby`, `aria-label`, then fallbacks such as `placeholder` or `title`.
Playwright's `getByLabel('Email')` only finds real labels — a quick test.

**Try it:** open DevTools → Accessibility on the broken `select`. What is its name?

</div>

<div class="cheat-card">

#### 8. Colour & contrast {#contrast}

**In short:** text needs a contrast ratio of at least **4.5:1** (large text
3:1), and colour must never be the *only* way information is shown.

Real axe result on `broken.html`:

```text
.hint    contrast 2.32:1   ← #aaa on white, needs 4.5:1
#submit  contrast 3.34:1   ← white on #4a90d9, needs 4.5:1
```

```css
.hint { color: #aaa; }       /* broken: 2.32:1 */
.hint { color: #595959; }    /* fixed: 7:1 */
```

Colour-only meaning: `broken.html` marks a wrong email by turning the
border red — invisible to many colour-blind users and to screen readers.
The fix adds **words** ("Enter an email address like…") linked to the field.

| Needs | Ratio |
|---|---|
| Normal text | 4.5:1 |
| Large text (≥ 24 px, or ≥ 18.66 px bold) | 3:1 |
| UI components & focus indicators | 3:1 |

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 9. Keyboard access {#keyboard}

**In short:** everything a mouse can do, a keyboard must do too — in a
sensible order, with no traps.

| Key | Expected |
|---|---|
| `Tab` / `Shift+Tab` | Next / previous control |
| `Enter` | Activate links and buttons; submit forms |
| `Space` | Activate buttons, tick checkboxes, open selects |
| Arrow keys | Move inside menus, tabs, radio groups, selects |
| `Esc` | Close dialogs and menus |

Check: every control reachable; order matches the visual order; nothing
traps focus (you can always `Tab` out); custom widgets respond to the keys above.

**Try it:** on `broken.html`, press `Tab` five times. Is "Sign up" ever
highlighted? Now try `fixed.html`.

</div>

<div class="cheat-card">

#### 10. Focus {#focus}

**In short:** keyboard users must always **see** where focus is, and focus
must move in a logical order — never removed with `outline: none` alone.

```css
input:focus, .btn:focus { outline: none; }                       /* broken: focus invisible */

input:focus-visible, button:focus-visible {                       /* fixed: clear, 3:1 contrast */
  outline: 3px solid #1a5fb4;
  outline-offset: 2px;
}
```

`:focus-visible` shows the ring for keyboard users but not on every mouse
click — a common reason designers remove outlines, solved.

Also check: after opening a dialog focus moves into it; after closing, it
returns to the button that opened it; after an error, focus goes to the field.

</div>

<div class="cheat-card">

#### 11. Headings & landmarks {#structure}

**In short:** headings (`h1`–`h6`) and landmarks (`header`, `nav`, `main`,
`footer`) give the page a map that screen-reader users jump through.

```html
<header>…logo…</header>
<nav>…menu…</nav>
<main>
  <h1>Create your account</h1>          <!-- one h1: what this page is -->
  <h2>…</h2>                             <!-- sections below it, no skipped levels -->
</main>
<footer>…</footer>
```

Screen-reader users often press `H` to jump heading to heading, or open a
list of landmarks — a page of styled `<div>`s gives them nothing to jump to.
A descriptive `<title>` ("Create your account — Example Shop", not "Page") is
the first thing they hear.

</div>

<div class="cheat-card">

#### 12. Forms & errors {#forms}

**In short:** every field has a label; errors are shown in **words**, next to
the field, linked to it, and announced; focus goes to the problem.

```html
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" required aria-describedby="email-error">
<p id="email-error" class="error" hidden>Enter an email address like name@example.com</p>
```

```js
email.setAttribute('aria-invalid', 'true');   // announced as "invalid entry"
error.hidden = false;                          // the words appear, linked by aria-describedby
email.focus();                                 // the user lands on the problem
```

`autocomplete="email"` / `"new-password"` lets browsers and password managers
fill fields — required by WCAG 1.3.5 and a big help for motor and memory impairments.

</div>

<div class="cheat-card">

#### 13. ARIA basics {#aria}

**In short:** **ARIA** attributes add names, roles and states for assistive
technology — but the first rule of ARIA is: **use native HTML instead if you can**.

| Attribute | Use |
|---|---|
| `aria-label="Close"` | Name a control with no visible text (icon buttons) |
| `aria-labelledby="id"` | Name something using other visible text |
| `aria-describedby="id"` | Add a description (hints, errors) |
| `aria-invalid="true"` | Field has an error |
| `aria-expanded="true/false"` | Menu/accordion open or closed |
| `aria-hidden="true"` | Hide decoration from screen readers (never on focusable things) |
| `role="status"` / `role="alert"` | Announce updates (section 14) |

`<div role="button" tabindex="0">` needs you to add key handling yourself —
`<button>` already has it. "No ARIA is better than bad ARIA": wrong roles
mislead users more than no roles.

</div>

<div class="cheat-card">

#### 14. Status messages {#status}

**In short:** messages that appear without moving focus ("Account created",
"3 results", "Item added") must be in a **live region** so screen readers announce them.

```html
<p id="msg"></p>                  <!-- broken: text changes silently -->
<p id="msg" role="status"></p>     <!-- fixed: polite announcement when the text changes -->
```

| Region | Announces | Use for |
|---|---|---|
| `role="status"` (or `aria-live="polite"`) | When the user is idle | Success, counts, "saved" |
| `role="alert"` (or `aria-live="assertive"`) | Immediately, interrupting | Urgent errors, session about to expire |

The live region must exist in the page **before** its text changes.

</div>

<div class="cheat-card">

#### 15. Automated checks (axe) {#axe}

**In short:** **axe-core** scans a page against WCAG rules in a second — run
it in your test suite, but remember it finds only part of the problems.

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

Real output on `broken.html`:

```text
serious  color-contrast — 2 element(s)
serious  html-has-lang — 1 element(s)
critical image-alt — 1 element(s)
critical select-name — 1 element(s)
```

Four rule types — out of **14** planted problems. Adding axe's
`best-practice` rules finds three more (`landmark-one-main`,
`page-has-heading-one`, `region`). The rest — the `<div>` button, the missing
focus ring, colour-only errors, "Click here", silent messages, placeholder-only
labels, missing `autocomplete`, the vague title — need a person.

</div>

<div class="cheat-card">

#### 16. Keyboard tests in code {#keyboard-tests}

**In short:** some manual checks can be automated with keyboard presses and
accessibility-aware locators, so they never regress.

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

```text
8 passed (1.9s)          ← together with the two axe tests
```

`toHaveAccessibleDescription` and `toHaveAccessibleName` check what a screen
reader would announce — without running one.

</div>

<div class="cheat-card">

#### 17. Screen readers {#screen-readers}

**In short:** test key journeys with at least one real screen reader on
desktop and one on mobile — they reveal problems no tool can.

| Screen reader | Platform | Start / stop | Essentials |
|---|---|---|---|
| **VoiceOver** | macOS | `Cmd+F5` | `VO` = `Ctrl+Option`; `VO+→` next item; `VO+U` rotor (headings, links, landmarks) |
| **NVDA** (free) | Windows | `Ctrl+Alt+N` | `↓` next item; `H` next heading; `D` next landmark; `Tab` next control |
| **VoiceOver** | iOS | Settings → Accessibility (or triple-click side button if set) | Swipe right = next; double-tap = activate |
| **TalkBack** | Android | Settings → Accessibility | Swipe right = next; double-tap = activate |

Listen for: every control has a sensible **name**, **role** ("button",
"link") and **state** ("expanded", "invalid"); headings make sense out of
context; errors and messages are announced.

**Try it:** with VoiceOver or NVDA, fill in `broken.html` and then
`fixed.html`. Write down three differences you *hear*.

</div>

<div class="cheat-card">

#### 18. Common mistakes {#gotchas}

**In short:** the problems found on almost every site.

| Mistake | WCAG | Fix |
|---|---|---|
| Missing alt text | 1.1.1 | Meaningful `alt`, or `alt=""` for decoration |
| Low-contrast text | 1.4.3 | 4.5:1 minimum |
| Placeholder instead of label | 1.3.1, 3.3.2 | `<label for>` |
| `<div>` / `<span>` as buttons | 2.1.1, 4.1.2 | `<button>` |
| `outline: none` | 2.4.7 | `:focus-visible` style |
| Errors in colour only | 1.4.1, 3.3.1 | Text, linked to the field |
| "Click here" links | 2.4.4 | Link text that says where it goes |
| No `lang` on `<html>` | 3.1.1 | `<html lang="en">` |
| Silent status updates | 4.1.3 | `role="status"` |
| Keyboard traps in modals | 2.1.2 | Manage focus; `Esc` closes |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 19. Zoom, reflow & spacing {#zoom}

**In short:** content must still work when users zoom to **200%**, view it
**320 px** wide, or increase text spacing.

| Check | Criterion | How |
|---|---|---|
| Resize text to 200% | 1.4.4 | Browser zoom `Cmd/Ctrl +` |
| Reflow at 320 px, no sideways scroll | 1.4.10 | DevTools device mode at 320 px width (= 1280 px at 400% zoom) |
| Text spacing | 1.4.12 | Bookmarklet or CSS: line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em |
| Content on hover/focus | 1.4.13 | Tooltips can be dismissed (`Esc`), hovered, and don't vanish |

</div>

<div class="cheat-card">

#### 20. Motion & timing {#motion}

**In short:** users must be able to pause movement, avoid flashing, and have
enough time.

| Check | Criterion |
|---|---|
| Carousels / auto-moving content can be paused | 2.2.2 |
| Nothing flashes more than 3 times per second | 2.3.1 |
| Time limits can be turned off, adjusted or extended | 2.2.1 |
| Respect "reduce motion" settings | Best practice (2.3.3 at AAA) |

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

</div>

<div class="cheat-card">

#### 21. Mobile & touch {#mobile}

**In short:** on phones, check target sizes, orientation, gestures, and the
built-in screen readers.

| Check | Criterion |
|---|---|
| Works in portrait **and** landscape | 1.3.4 |
| Tap targets at least 24 × 24 CSS px (or enough spacing) | 2.5.8 (WCAG 2.2) |
| Complex gestures (pinch, swipe paths) have a simple alternative | 2.5.1 |
| Actions happen on release, not on touch-down (can be cancelled) | 2.5.2 |
| Visible label text is part of the accessible name (voice control) | 2.5.3 |
| TalkBack and VoiceOver can complete key journeys | — |

</div>

<div class="cheat-card">

#### 22. New in WCAG 2.2 {#wcag22}

**In short:** WCAG 2.2 added criteria about focus, touch, dragging, help and
logging in — check them on every new audit.

| Criterion | Level | Checks |
|---|---|---|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Sticky headers/cookie banners don't hide the focused element |
| 2.5.7 Dragging Movements | AA | Anything done by dragging can also be done with single clicks |
| 2.5.8 Target Size (Minimum) | AA | Targets ≥ 24 × 24 px or enough space around them |
| 3.2.6 Consistent Help | A | Help links appear in the same place on every page |
| 3.3.7 Redundant Entry | A | Don't make users re-type information they already gave |
| 3.3.8 Accessible Authentication (Minimum) | AA | No memory/puzzle tests to log in without an alternative; allow paste and password managers |

(4.1.1 Parsing was removed in 2.2.)

</div>

<div class="cheat-card">

#### 23. Running an audit {#audit}

**In short:** scope a sample of pages and journeys, test each with tools and
people, and report every issue against a WCAG criterion with a fix.

```text
1. Scope: WCAG 2.2 AA; key templates + journeys (home, search, product, sign-up, checkout)
2. Automated scan of each page and state (menus open, errors shown)
3. Keyboard pass → screen-reader pass → zoom/reflow → contrast → motion
4. Log each issue: page | criterion | severity | who is affected | element | fix
5. Report: compliance summary, top barriers, roadmap; re-test after fixes
```

Report template: accessibility guide.

</div>

<div class="cheat-card">

#### 24. Accessibility in CI {#ci}

**In short:** run axe and keyboard checks on key pages in every pull request,
so new barriers are caught before they ship — and keep manual audits for the rest.

- Scan pages in several **states**: menus open, dialogs open, errors shown.
- Start by blocking on `critical`/`serious` issues only, then tighten.
- For a site with existing issues, record today's violations as a baseline and
  fail only on **new** ones, while fixing the backlog.
- Tools: `@axe-core/playwright`, `cypress-axe`, `axe-core` with Selenium, **Pa11y CI**, Lighthouse CI.

</div>

<div class="cheat-card">

#### 25. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **a11y** | Accessibility ("a" + 11 letters + "y") |
| **Assistive technology (AT)** | Screen readers, magnifiers, switch devices, voice control |
| **Accessible name** | What assistive technology announces for an element |
| **Role / state** | What an element is (button, link) / its condition (expanded, checked) |
| **Accessibility tree** | The browser's version of the page that AT reads |
| **Landmark** | A page region (header, nav, main, footer) users can jump to |
| **Live region** | An area whose changes are announced (`role="status"`) |
| **ARIA** | Accessible Rich Internet Applications — attributes that add accessibility info |
| **Focus indicator** | The visible outline showing which element has keyboard focus |
| **Reflow** | Content fits a narrow width without scrolling sideways |
| **VPAT / ACR** | A vendor's Accessibility Conformance Report, often asked for in procurement |
| **EN 301 549** | The European accessibility standard that includes WCAG |

For the service end to end, see the
accessibility testing guide.

</div>

</div>
