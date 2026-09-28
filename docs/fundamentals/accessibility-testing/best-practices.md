---
title: "Accessibility Testing Best Practices"
description: "Habits that make accessibility testing accurate and useful — shift left into design, native HTML first, test with people and assistive technology, combine automation with manual checks, test states and journeys, write fixable issues, prioritise by user impact, and a pre-release checklist."
sidebar_position: 2
level: intermediate
tags: [accessibility, a11y, wcag, fundamentals, best-practices]
---

# Accessibility Testing Best Practices

This page lists good habits for testing accessibility and getting it fixed.
They help you find the barriers that actually stop people, explain them so
developers can fix them quickly, and keep them from coming back. They apply
to testers, developers and designers.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example where it helps, from the [practice lab](/cheatsheets/accessibility-testing#practice-lab).

:::tip How to use this page

Read it once after you finish Part 2 of the [accessibility cheat sheet](/cheatsheets/accessibility-testing),
then use [the checklist at the end](#10-short-checklist-before-release) before each release.

:::

---

## Contents

1. [Start in Design](#1-start-in-design)
2. [Native HTML First](#2-native-html-first)
3. [Automation Plus People](#3-automation-plus-people)
4. [Test States and Journeys](#4-test-states-and-journeys)
5. [Use Real Assistive Technology](#5-use-real-assistive-technology)
6. [Write Fixable Issues](#6-write-fixable-issues)
7. [Prioritise by User Impact](#7-prioritise-by-user-impact)
8. [Keep It From Coming Back](#8-keep-it-from-coming-back)
9. [Communicate Carefully](#9-communicate-carefully)
10. [Short Checklist Before Release](#10-short-checklist-before-release)

---

## 1. Start in Design

**In short:** most accessibility bugs are cheaper to prevent in a design file than to fix in code.

- **Do** review designs for contrast, focus states, heading structure, target sizes and error messages.
  **Why:** a colour that fails 4.5:1 is a one-minute fix in Figma and a redesign after launch.
- **Do** ask "how does this work with a keyboard?" for every custom component.
  **Why:** drag-only and hover-only designs are the hardest to retrofit.
- **Do** include accessibility in acceptance criteria.
  **Why:** "keyboard operable, labelled, announced" becomes part of *done*, not an extra.

---

## 2. Native HTML First

**In short:** the right HTML element is usually the whole fix.

- **Do** push for `<button>`, `<a href>`, `<label>`, `<h1>`–`<h6>`, `<main>`, `<dialog>` before any ARIA.
  **Why:** native elements come with keyboard behaviour and correct roles; ARIA only *describes*, it doesn't *do*.
- **Don't** accept `role="button"` on a `<div>` without keyboard handling.
  **Why:** it announces as a button but doesn't work like one — worse than nothing.

```html
<!-- Weak -->
<div class="btn" onclick="submitForm()">Sign up</div>
<!-- Strong -->
<button type="submit">Sign up</button>
```

---

## 3. Automation Plus People

**In short:** automation is fast and consistent; people find the rest — you need both.

- **Do** run axe on every key page in CI.
  **Why:** it catches regressions like missing labels and contrast instantly.
- **Don't** report "axe passed" as "accessible".
  **Why:** on the practice page, WCAG-tagged axe rules found 4 of 14 problems.
- **Do** review axe's "incomplete" (needs review) results by hand.
  **Why:** they're the cases the tool couldn't decide — often real issues.

---

## 4. Test States and Journeys

**In short:** barriers hide in open menus, error states and multi-step flows — not on the first page load.

- **Do** test every state: menus and dialogs open, errors shown, empty results, loading.
  **Why:** a dialog that traps focus doesn't exist until you open it.
- **Do** complete whole journeys (sign up, search, checkout) with keyboard and screen reader.
  **Why:** a page can pass alone while the journey fails between pages.

---

## 5. Use Real Assistive Technology

**In short:** listen to what users hear; tools only guess.

- **Do** test with NVDA or JAWS on Windows, VoiceOver on macOS/iOS, TalkBack on Android — at least one desktop and one mobile.
  **Why:** screen readers and browsers differ; the common pairings are NVDA/JAWS + Chrome, VoiceOver + Safari.
- **Do** note the versions you tested with.
  **Why:** behaviour changes between versions; results must be reproducible.
- **Do** include disabled users in testing when the budget allows.
  **Why:** experts and real users find different problems.

---

## 6. Write Fixable Issues

**In short:** every issue says what, where, which criterion, who is affected, and how to fix it.

- **Do** name the exact element (selector or HTML snippet) and the WCAG criterion.
  **Why:** developers fix what they can find; auditors trace what they can cite.
- **Do** suggest a concrete fix — usually a small code change.
  **Why:** "use `<button>`" is actionable; "not accessible" isn't.
- **Do** group repeated issues by component.
  **Why:** fixing the shared button component once fixes 200 pages.

See the [issue template](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#issue-template).

---

## 7. Prioritise by User Impact

**In short:** fix what blocks people first.

- **Do** rank blockers (a group can't finish a key task) above everything else.
  **Why:** a keyboard user who can't press "Pay" is lost; a missing landmark is an inconvenience.
- **Do** fix templates and shared components early.
  **Why:** one fix, many pages.
- **Do** put known issues and dates in an accessibility statement.
  **Why:** users know what to expect and how to get help; many laws require it.

---

## 8. Keep It From Coming Back

**In short:** turn every fix into a check.

- **Do** add a test (axe scope, keyboard test, accessible-name assertion) for each fixed issue.
  **Why:** the same component tends to break again in the next redesign.
- **Do** give design-system components their own accessibility tests.
  **Why:** tested building blocks make accessible pages the default.
- **Do** baseline existing violations and fail CI only on new ones while the backlog is fixed.
  **Why:** a gate that fails on day one gets turned off.

---

## 9. Communicate Carefully

**In short:** describe barriers in terms of people and facts, not blame or legal fear.

- **Do** explain who is affected: "screen-reader users hear 'button' with no name".
  **Why:** it makes the priority obvious and builds empathy.
- **Don't** give legal advice or promise compliance.
  **Why:** you test against a technical standard; legal conclusions belong to lawyers.
- **Don't** recommend "accessibility overlay" widgets as a fix.
  **Why:** they don't fix the underlying code, and disabled users and experts widely criticise them.

---

## 10. Short Checklist Before Release

- [ ] axe (WCAG A/AA tags) passes on key pages and states, or every exception has a ticket
- [ ] Keyboard: every journey completes; focus visible; no traps; logical order
- [ ] Screen reader: key journeys completed on one desktop and one mobile reader
- [ ] Forms: labels, errors in words, linked and announced, focus to the error
- [ ] Contrast and non-text contrast checked, including focus indicators
- [ ] Zoom 200% and 320 px reflow checked
- [ ] Images, icons and media have text alternatives / captions
- [ ] New WCAG 2.2 criteria checked (focus not obscured, target size, dragging, authentication)
- [ ] Known issues logged with WCAG criterion, severity and owner
- [ ] Accessibility statement updated

**Need more detail?** [Cheat sheet](/cheatsheets/accessibility-testing) ·
[Quick reference](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference) ·
Full guide
