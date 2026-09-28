---
title: "Accessibility Testing Quick Reference"
description: "Copy-paste accessibility testing reference — WCAG 2.2 AA criteria by check, contrast ratios, keyboard expectations, screen-reader commands, ARIA patterns, axe rules and tags, Playwright accessibility assertions, issue template and tools."
sidebar_position: 1
level: beginner
tags: [accessibility, a11y, wcag, fundamentals, cheat-sheet]
---

# Accessibility Testing Quick Reference

A lookup page for accessibility checks: which WCAG criterion covers what,
the numbers to test against, and the commands for tools and screen readers.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
accessibility? Start with the [accessibility cheat sheet](/cheatsheets/accessibility-testing),
which explains each idea with a broken-vs-fixed example. For the ordered plan,
see the [accessibility learning path](/docs/learning-path/accessibility-testing/implementation-roadmap).

:::

## Quick Navigation

**Standards:** [WCAG 2.2 AA by check](#wcag-by-check) · [Numbers to remember](#numbers)

**Testing:** [Manual check routine](#manual-routine) · [Keyboard expectations](#keyboard) · [Screen-reader commands](#screen-readers) · [ARIA patterns](#aria-patterns)

**Automation:** [axe tags and rules](#axe) · [Playwright assertions](#playwright) · [Other tools](#tools)

**Reporting:** [Issue template](#issue-template) · [Severity](#severity)

---

## WCAG 2.2 AA by check {#wcag-by-check}

| Area | Criterion (level) | Pass when |
|---|---|---|
| Images | 1.1.1 Non-text Content (A) | Meaningful images have alt text; decorative have `alt=""` |
| Media | 1.2.2 Captions (A), 1.2.5 Audio Description (AA) | Videos captioned; key visuals described |
| Structure | 1.3.1 Info and Relationships (A) | Headings, lists, tables, labels are real HTML, not just styling |
| Order | 1.3.2 Meaningful Sequence (A) | Reading order makes sense |
| Orientation | 1.3.4 Orientation (AA) | Works portrait and landscape |
| Input purpose | 1.3.5 Identify Input Purpose (AA) | `autocomplete` on personal-data fields |
| Colour | 1.4.1 Use of Color (A) | Colour is never the only signal |
| Contrast | 1.4.3 Contrast (Minimum) (AA) | Text 4.5:1, large text 3:1 |
| Resize | 1.4.4 Resize Text (AA) | Usable at 200% zoom |
| Images of text | 1.4.5 (AA) | Real text, not pictures of text |
| Reflow | 1.4.10 Reflow (AA) | No sideways scroll at 320 px width |
| Non-text contrast | 1.4.11 (AA) | Controls and focus indicators 3:1 |
| Text spacing | 1.4.12 (AA) | No loss when spacing is increased |
| Hover/focus content | 1.4.13 (AA) | Dismissible, hoverable, persistent |
| Keyboard | 2.1.1 Keyboard (A), 2.1.2 No Keyboard Trap (A) | Everything works by keyboard; you can always leave |
| Time | 2.2.1 Timing Adjustable (A), 2.2.2 Pause, Stop, Hide (A) | Time limits adjustable; motion can be paused |
| Flashing | 2.3.1 Three Flashes (A) | No more than 3 flashes per second |
| Bypass | 2.4.1 Bypass Blocks (A) | Skip link or landmarks |
| Title | 2.4.2 Page Titled (A) | Descriptive `<title>` |
| Focus order | 2.4.3 (A) | Logical order |
| Link purpose | 2.4.4 (A) | Link text (with context) says where it goes |
| Headings/labels | 2.4.6 (AA) | Descriptive headings and labels |
| Focus visible | 2.4.7 (AA) | Always visible |
| Focus not obscured | 2.4.11 (AA) | Not hidden by sticky bars |
| Pointer | 2.5.1–2.5.3 (A), 2.5.7 Dragging (AA), 2.5.8 Target Size (AA) | Simple alternatives to gestures/dragging; 24 px targets; label in name |
| Language | 3.1.1 (A), 3.1.2 (AA) | `lang` on the page and on foreign-language parts |
| Predictable | 3.2.1, 3.2.2 (A), 3.2.3, 3.2.4 (AA), 3.2.6 Consistent Help (A) | No surprise context changes; consistent navigation and help |
| Errors | 3.3.1 (A), 3.3.2 (A), 3.3.3 (AA), 3.3.4 (AA) | Errors identified in text, labels given, suggestions, reversible/confirmed legal & money actions |
| Re-entry & login | 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication (AA) | No re-typing; no puzzle-only login |
| Name, role, value | 4.1.2 (A) | Every control exposes name, role, state |
| Status messages | 4.1.3 (AA) | Announced without moving focus |

## Numbers to remember {#numbers}

| What | Value |
|---|---|
| Text contrast | 4.5:1 (large text 3:1) |
| Large text | ≥ 24 px regular, or ≥ 18.66 px bold (18 pt / 14 pt) |
| Non-text contrast (controls, focus ring) | 3:1 |
| Zoom | 200% text; reflow at 320 CSS px wide |
| Target size (AA) | 24 × 24 CSS px (AAA: 44 × 44) |
| Flashing | ≤ 3 per second |
| Text spacing test | line-height 1.5 × font size; paragraph spacing 2 ×; letter 0.12 ×; word 0.16 × |

---

## Manual check routine {#manual-routine}

```text
Per page / state:
[ ] Title describes the page; one h1; heading levels in order
[ ] Landmarks: header, nav, main, footer
[ ] Tab through everything: order, visible focus, no traps, Esc closes things
[ ] Every control: visible label = accessible name; role and state correct
[ ] Images: alt text meaningful / empty for decoration
[ ] Contrast of text, controls, focus ring
[ ] Zoom 200% and 320 px width: nothing lost or overlapping
[ ] Forms: labels, required marked in text, errors in words + linked + announced
[ ] Status messages announced (screen reader)
[ ] Motion can be paused; no flashing
[ ] Key journey completed with a screen reader
```

## Keyboard expectations {#keyboard}

| Widget | Keys |
|---|---|
| Link | `Enter` |
| Button | `Enter`, `Space` |
| Checkbox | `Space` |
| Radio group | Arrows move and select; `Tab` leaves the group |
| Select / combobox | Arrows; `Enter` or `Space` opens; typing jumps |
| Menu | Arrows; `Enter` activates; `Esc` closes and returns focus |
| Tabs | Arrows switch tabs; `Tab` moves into the panel |
| Dialog | Focus moves inside; `Tab` cycles inside; `Esc` closes; focus returns to the opener |
| Accordion | `Enter`/`Space` toggles; `aria-expanded` updates |

Patterns for every widget: the W3C **ARIA Authoring Practices Guide (APG)**.

## Screen-reader commands {#screen-readers}

| Action | NVDA (Windows) | VoiceOver (macOS) | VoiceOver (iOS) | TalkBack (Android) |
|---|---|---|---|---|
| Start / stop | `Ctrl+Alt+N` / `Insert+Q` | `Cmd+F5` | Accessibility shortcut | Volume keys shortcut (if set) |
| Next item | `↓` | `VO+→` | Swipe right | Swipe right |
| Activate | `Enter` | `VO+Space` | Double-tap | Double-tap |
| Next heading | `H` | `VO+Cmd+H` | Rotor → Headings, swipe down | Reading controls → Headings |
| Next landmark | `D` | Rotor (`VO+U`) → Landmarks | Rotor → Landmarks | Reading controls |
| List of links/headings | `Insert+F7` | `VO+U` | Rotor | — |
| Stop speaking | `Ctrl` | `Ctrl` | Two-finger tap | Two-finger tap |

`VO` = `Ctrl+Option`. `Insert` = the NVDA key (Caps Lock can be set instead).

## ARIA patterns {#aria-patterns}

```html
<!-- icon-only button -->
<button aria-label="Close dialog">✕</button>

<!-- error linked to a field -->
<input id="email" aria-describedby="email-error" aria-invalid="true">
<p id="email-error">Enter an email address like name@example.com</p>

<!-- disclosure / accordion -->
<button aria-expanded="false" aria-controls="details">Shipping details</button>
<div id="details" hidden>…</div>

<!-- announcements -->
<p role="status">3 results found</p>
<p role="alert">Your session will end in 1 minute</p>

<!-- dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Delete item?</h2>
</div>

<!-- skip link, first thing in <body> -->
<a href="#main" class="skip-link">Skip to main content</a>
```

Native `<dialog>`, `<details>/<summary>`, `<button>` and `<select>` give much of
this for free — prefer them.

---

## axe tags and rules {#axe}

| Tag | Includes |
|---|---|
| `wcag2a`, `wcag2aa` | WCAG 2.0 A / AA rules |
| `wcag21a`, `wcag21aa` | Added in WCAG 2.1 |
| `wcag22aa` | Added in WCAG 2.2 |
| `best-practice` | Not required by WCAG but recommended (landmarks, one h1…) |

Common rule ids: `color-contrast`, `image-alt`, `label`, `select-name`,
`button-name`, `link-name`, `html-has-lang`, `document-title`,
`aria-valid-attr-value`, `duplicate-id-aria`, `landmark-one-main`,
`page-has-heading-one`, `region`, `target-size`.

```ts
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .include('#checkout')                 // scan one part of the page
  .exclude('.third-party-widget')       // skip what you don't own (and report it separately)
  .disableRules(['color-contrast'])     // only with a recorded reason
  .analyze();
// results.violations — failed; results.incomplete — "needs review" by a person
```

## Playwright assertions {#playwright}

| Assertion / locator | Checks |
|---|---|
| `getByRole('button', { name: 'Sign up' })` | Element has that role and accessible name |
| `getByLabel('Email')` | A real label exists |
| `toHaveAccessibleName('…')` | Announced name |
| `toHaveAccessibleDescription('…')` | Announced description (hints, errors) |
| `toHaveRole('dialog')` | Role |
| `toBeFocused()` | Focus landed where expected |
| `toHaveAttribute('aria-expanded', 'true')` | State |
| `expect(page.locator('body')).toMatchAriaSnapshot(…)` | The accessibility tree matches an approved snapshot |
| `page.keyboard.press('Tab')` + `document.activeElement` | Focus order |

## Other tools {#tools}

| Tool | Use |
|---|---|
| axe DevTools extension | Scan a page in the browser |
| WAVE (WebAIM) | Visual overlay of issues |
| Accessibility Insights (Microsoft) | Guided manual assessment + FastPass |
| Lighthouse | Accessibility score (runs axe rules) |
| WebAIM / TPGi Colour Contrast Analyser | Contrast of any two colours |
| Chrome DevTools → Accessibility pane | Name, role, accessibility tree |
| Pa11y / Pa11y CI | Scan many URLs from the command line |
| Android Accessibility Scanner, Xcode Accessibility Inspector | Mobile apps |

---

## Issue template {#issue-template}

```text
ID / Title:   A11Y-07 — "Sign up" can't be reached or pressed with a keyboard
Page / state: /signup, default state
WCAG:         2.1.1 Keyboard (A); 4.1.2 Name, Role, Value (A)
Severity:     Blocker — keyboard and screen-reader users can't create an account
Who:          Keyboard-only users, screen-reader users, switch users
Found with:   Keyboard (Tab ×5), NVDA 2025.x + Chrome
Element:      <div class="btn" id="submit" onclick="submitForm()">
Fix:          Use <button type="submit">Sign up</button>
```

## Severity {#severity}

| Severity | Meaning |
|---|---|
| Blocker | A user group can't complete a key task (sign up, pay) |
| Serious | Very hard, or needs a workaround most users won't find |
| Moderate | Annoying or slows users down |
| Minor | Small; best-practice level |

**Need more detail?** [Cheat sheet](/cheatsheets/accessibility-testing) ·
[Best practices](/docs/fundamentals/accessibility-testing/best-practices) ·
[Learning path](/docs/learning-path/accessibility-testing/implementation-roadmap) ·
Full guide
