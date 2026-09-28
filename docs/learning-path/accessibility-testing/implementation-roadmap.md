---
title: "Accessibility Testing Learning Path: Start Here"
description: "How to learn accessibility testing in six milestones — semantics and the accessibility tree, a 14-issue manual audit with an answer key, automated axe checks, keyboard and form tests in code, screen readers and zoom, and a real audit with a report."
sidebar_position: 1
level: beginner
tags: [accessibility, a11y, wcag, learning-path]
---

# Accessibility Testing Learning Path: Start Here

**In short:** you learn accessibility testing in **6 milestones**, starting on
a practice page with **14 planted problems** and its fixed twin, and ending
with a real audit report. Each milestone has an answer key or a tested solution.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → test → check → commit**. Come back here whenever you're
unsure what to do next.

:::

## Before you start {#before}

- The [practice lab](/cheatsheets/accessibility-testing#practice-lab) saved locally (`site/broken.html`, `site/fixed.html`).
- Basic HTML: elements, attributes, forms.
- A screen reader you can start: VoiceOver (built into macOS/iOS), NVDA (free for Windows) or TalkBack (Android).
- From Milestone 3: Node.js 20+ for Playwright and axe.

## The pages in this learning path {#pages}

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan and self-checks | At the start of each milestone |
| [Accessibility cheat sheet](/cheatsheets/accessibility-testing) | Learn each idea: broken vs fixed, tests with real results | The "learn" step |
| [Milestones & Mini-Projects](/docs/learning-path/accessibility-testing/milestones-and-mini-projects) | Tasks, expected results, answer keys | The "test" and "check" steps |
| [Quick Reference](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference) | WCAG by check, numbers, keys, screen-reader commands, templates | Any time |
| [Best Practices](/docs/fundamentals/accessibility-testing/best-practices) | Habits that get barriers found and fixed | After Milestone 2, then before every release |
| Accessibility testing guide | The laws and the audit service | For the deeper "why" |

## The milestones {#milestones}

| Milestone | You learn | You work on | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Who it's for, POUR, semantics, the accessibility tree | Inspecting two pages | 1 week |
| [2](#milestone-2) | Names, contrast, keyboard, focus, forms, structure | Manual audit: find 14 issues | 1–2 weeks |
| [3](#milestone-3) | axe, tags, what tools can't find | Automated scans | 1 week |
| [4](#milestone-4) | Keyboard, focus and form tests in code | A test suite that locks in fixes | 1 week |
| [5](#milestone-5) | Screen readers, zoom, reflow, motion, WCAG 2.2 | Listening and resizing | 1–2 weeks |
| [6](#milestone-6) | Audits, severity, reporting, CI | A real audit and report | 1–2 weeks |

Times assume about 5 hours a week.

**For each milestone:** learn (cheat-sheet sections below) → test (the
milestone tasks) → check (answer key) → commit your notes, tests and reports.

### Milestone 1: Semantics & the accessibility tree {#milestone-1}

**Learn:** [What accessibility is](/cheatsheets/accessibility-testing#what-is-a11y) ·
[Who it's for](/cheatsheets/accessibility-testing#who) ·
[WCAG & POUR](/cheatsheets/accessibility-testing#wcag) ·
[Levels & laws](/cheatsheets/accessibility-testing#levels-laws) ·
[Semantic HTML](/cheatsheets/accessibility-testing#semantic-html)

**Work on:** [Inspecting two pages](/docs/learning-path/accessibility-testing/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] Name the four POUR principles with one example each.
- [ ] Why does a `<div>` with `onclick` fail keyboard users?
- [ ] Which WCAG level do most laws require?

### Milestone 2: Manual audit {#milestone-2}

**Learn:** [Text alternatives](/cheatsheets/accessibility-testing#alt-text) ·
[Names & labels](/cheatsheets/accessibility-testing#names) ·
[Colour & contrast](/cheatsheets/accessibility-testing#contrast) ·
[Keyboard access](/cheatsheets/accessibility-testing#keyboard) ·
[Focus](/cheatsheets/accessibility-testing#focus) ·
[Headings & landmarks](/cheatsheets/accessibility-testing#structure) ·
[Forms & errors](/cheatsheets/accessibility-testing#forms) ·
[Status messages](/cheatsheets/accessibility-testing#status) ·
Quick Reference: [Manual check routine](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#manual-routine)

**Work on:** [Find the 14 issues](/docs/learning-path/accessibility-testing/milestones-and-mini-projects#milestone-2)

**Then read:** [Best Practices](/docs/fundamentals/accessibility-testing/best-practices), sections 1–4.

**Check yourself:**
- [ ] What's the minimum contrast for normal text?
- [ ] Why isn't a placeholder a label?
- [ ] How must an error be shown so everyone gets it?

### Milestone 3: Automated checks {#milestone-3}

**Learn:** [ARIA basics](/cheatsheets/accessibility-testing#aria) ·
[Automated checks (axe)](/cheatsheets/accessibility-testing#axe) ·
Quick Reference: [axe tags and rules](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#axe)

**Work on:** [Automated scans](/docs/learning-path/accessibility-testing/milestones-and-mini-projects#milestone-3)

**Check yourself:**
- [ ] What share of your 14 issues did axe find?
- [ ] What does axe's `incomplete` list mean?
- [ ] What's the difference between the `wcag2aa` and `best-practice` tags?

### Milestone 4: Tests in code {#milestone-4}

**Learn:** [Keyboard tests in code](/cheatsheets/accessibility-testing#keyboard-tests) ·
Quick Reference: [Playwright assertions](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#playwright),
[Keyboard expectations](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#keyboard)

**Work on:** [A suite that locks in fixes](/docs/learning-path/accessibility-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] How do you test focus order in code?
- [ ] What does `toHaveAccessibleDescription` check?

### Milestone 5: Screen readers, zoom & WCAG 2.2 {#milestone-5}

**Learn:** [Screen readers](/cheatsheets/accessibility-testing#screen-readers) ·
[Zoom, reflow & spacing](/cheatsheets/accessibility-testing#zoom) ·
[Motion & timing](/cheatsheets/accessibility-testing#motion) ·
[Mobile & touch](/cheatsheets/accessibility-testing#mobile) ·
[New in WCAG 2.2](/cheatsheets/accessibility-testing#wcag22) ·
Quick Reference: [Screen-reader commands](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#screen-readers)

**Work on:** [Listening and resizing](/docs/learning-path/accessibility-testing/milestones-and-mini-projects#milestone-5)

**Check yourself:**
- [ ] How do you jump heading to heading in your screen reader?
- [ ] What width do you test reflow at, and why that number?
- [ ] Name three criteria added in WCAG 2.2.

### Milestone 6: Audit & report {#milestone-6}

**Learn:** [Running an audit](/cheatsheets/accessibility-testing#audit) ·
[Accessibility in CI](/cheatsheets/accessibility-testing#ci) ·
Quick Reference: [Issue template](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#issue-template),
[Severity](/docs/fundamentals/accessibility-testing/accessibility-testing-quick-reference#severity)

**Work on:** [A real audit](/docs/learning-path/accessibility-testing/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/accessibility-testing/best-practices), sections 5–10.

**Check yourself:**
- [ ] What makes an issue "blocker" severity?
- [ ] Why group issues by component?
- [ ] Why shouldn't an audit report promise legal compliance?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| Screen reader is overwhelming | Learn 4 commands: next item, activate, next heading, stop speaking. Turn speech rate down |
| Not sure which criterion applies | Search the W3C "Understanding WCAG 2.2" page for the symptom |
| axe says "needs review" | Check that element by hand — it's the tool asking you |
| Contrast tool disagrees with axe | Check the exact colours (including transparency and background images) with a contrast analyser |

## What's next {#next}

- Mobile apps: [Mobile testing learning path](/docs/learning-path/mobile-testing/implementation-roadmap).
- Automation depth: [Test automation learning path](/docs/learning-path/test-automation/implementation-roadmap).
- Certification: IAAP **CPACC** (concepts) and **WAS** (technical); the US DHS **Trusted Tester** programme.

**Good resources:** W3C [WAI](https://www.w3.org/WAI/) (WCAG, Understanding
docs, ARIA Authoring Practices), and [WebAIM](https://webaim.org/) articles and surveys.
