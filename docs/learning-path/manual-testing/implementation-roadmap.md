---
title: "Manual Testing Learning Path: Start Here"
description: "How to learn manual testing and test design in six milestones — what to learn in each, the practice project you work on, how to check yourself against an answer key, and what comes next."
sidebar_position: 1
level: beginner
tags: [manual-testing, test-design, learning-path]
---

# Manual Testing Learning Path: Start Here

**In short:** you learn manual testing in **6 milestones**. Each one has a
practice project on a free shop with **real, deliberate bugs**, and an answer
key, so you always know how much you found. At the end you run a full test
cycle and write the report a manager would read.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → test → check → save**. Come back here whenever you're
unsure what to do next.

:::

## The pages in this learning path {#pages}

**In short:** each page has one job, so nothing is explained twice.

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan: what each milestone covers and how to check yourself | At the start of each milestone |
| [Manual testing cheat sheet](/cheatsheets/manual-testing) | Learn each idea: short explanation, example, exercise | The "learn" step of every milestone |
| [Milestones & Mini-Projects](/docs/learning-path/manual-testing/milestones-and-mini-projects) | A project and an answer key for each milestone | The "test" and "check" steps |
| [Quick Reference](/docs/fundamentals/manual-testing/manual-testing-quick-reference) | Templates, technique chooser, test-idea checklists | Any time you're testing |
| [Best Practices](/docs/fundamentals/manual-testing/best-practices) | Habits that make testing sharper and more trusted | After Milestone 3, then before every sign-off |
| Manual & functional testing guide | Every testing type in depth | When you want the deeper "why" |

## The milestones {#milestones}

**In short:** do them in order — each uses what the one before taught.

| Milestone | You learn | You work on | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Expected results, test cases, checklists | Login test suite | 1 week |
| [2](#milestone-2) | Bug reports, severity, comparing with a reference | Bug hunt: `problem_user` | 1 week |
| [3](#milestone-3) | Partitions, boundaries, decision tables, states | Test design from a spec | 1–2 weeks |
| [4](#milestone-4) | Exploratory testing, charters, DevTools, oracles | Sessions on three buggy users | 1 week |
| [5](#milestone-5) | Risk, smoke and regression, compatibility | Risk table + regression pack | 1 week |
| [6](#milestone-6) | Requirements review, test plan, coverage, reporting | Full test cycle + summary report | 1–2 weeks |

Times assume about 5 hours a week.

**For each milestone:**

1. **Learn** — read the cheat-sheet sections listed below.
2. **Test** — do the project in [Milestones & Mini-Projects](/docs/learning-path/manual-testing/milestones-and-mini-projects),
   on the [practice app](/cheatsheets/manual-testing#practice-app).
3. **Check** — compare your results with the expected results. Only then open
   the answer key, and note what you missed and why.
4. **Save** — keep your work in a folder (or a Git repo) — it becomes your
   portfolio:

```text
manual-testing-portfolio/
├── m1-login/test-cases.md
├── m2-bug-hunt/bug-reports.md
├── m3-test-design/design.md
├── m4-exploratory/session-notes.md
├── m5-regression/risk-and-regression.md
└── m6-full-cycle/plan.md, summary-report.md
```

### Milestone 1: Test cases & checklists {#milestone-1}

**Learn:** [What testing is](/cheatsheets/manual-testing#what-is-testing) ·
[Errors, defects & failures](/cheatsheets/manual-testing#defects) ·
[Expected vs actual](/cheatsheets/manual-testing#expected-actual) ·
[Test cases](/cheatsheets/manual-testing#test-cases) ·
[Checklists](/cheatsheets/manual-testing#checklists)

**Work on:** [Login test suite](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] Why write the expected result before running the step?
- [ ] What makes a test case repeatable by someone else?
- [ ] When is a checklist better than a detailed test case?

### Milestone 2: Bug reports {#milestone-2}

**Learn:** [Bug reports](/cheatsheets/manual-testing#bug-reports) ·
[Severity & priority](/cheatsheets/manual-testing#severity-priority) ·
Quick Reference: [Bug report template](/docs/fundamentals/manual-testing/manual-testing-quick-reference#bug-report-template)

**Work on:** [Bug hunt: problem_user](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] What goes in a good bug title?
- [ ] Who usually sets severity, and who sets priority?
- [ ] Why compare `problem_user` with `standard_user` before reporting?

### Milestone 3: Test design techniques {#milestone-3}

**Learn:** [Equivalence partitioning](/cheatsheets/manual-testing#equivalence) ·
[Boundary values](/cheatsheets/manual-testing#boundaries) ·
[Decision tables](/cheatsheets/manual-testing#decision-tables) ·
[State transitions](/cheatsheets/manual-testing#state-transitions) ·
[Pairwise](/cheatsheets/manual-testing#pairwise) ·
Quick Reference: [Which technique?](/docs/fundamentals/manual-testing/manual-testing-quick-reference#which-technique)

**Work on:** [Test design from a spec](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-3)

**Then read:** [Best Practices](/docs/fundamentals/manual-testing/best-practices), sections 1–5.

**Check yourself:**
- [ ] Why test invalid values one at a time?
- [ ] Which six values do you test for a range of 1 to 10?
- [ ] Why are forbidden state transitions worth testing?

### Milestone 4: Exploratory testing {#milestone-4}

**Learn:** [User journeys](/cheatsheets/manual-testing#journeys) ·
[Error guessing](/cheatsheets/manual-testing#error-guessing) ·
[Exploratory testing](/cheatsheets/manual-testing#exploratory) ·
[DevTools for testers](/cheatsheets/manual-testing#devtools) ·
[Test oracles](/cheatsheets/manual-testing#oracles) ·
Quick Reference: [Heuristics](/docs/fundamentals/manual-testing/manual-testing-quick-reference#heuristics)

**Work on:** [Sessions on three buggy users](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] What are the three parts of a charter?
- [ ] Name three oracles you can use when there is no spec.
- [ ] Where do you look when the screen shows no error but something failed?

### Milestone 5: Risk & regression {#milestone-5}

**Learn:** [Test levels](/cheatsheets/manual-testing#test-levels) ·
[Test types](/cheatsheets/manual-testing#test-types) ·
[Smoke & regression](/cheatsheets/manual-testing#regression) ·
[Risk-based testing](/cheatsheets/manual-testing#risk)

**Work on:** [Risk table + regression pack](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-5)

**Check yourself:**
- [ ] What two numbers make a risk score?
- [ ] What's the difference between re-testing and regression testing?
- [ ] Which regression checks would you automate first, and why?

### Milestone 6: Plan, cover, report {#milestone-6}

**Learn:** [Reviewing requirements](/cheatsheets/manual-testing#requirements) ·
[Strategy & plan](/cheatsheets/manual-testing#strategy) ·
[Coverage & traceability](/cheatsheets/manual-testing#coverage) ·
[QA metrics](/cheatsheets/manual-testing#metrics) ·
Quick Reference: [Test summary template](/docs/fundamentals/manual-testing/manual-testing-quick-reference#test-summary-template)

**Work on:** [Full test cycle](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/manual-testing/best-practices), sections 6–12.

**Check yourself:**
- [ ] What goes in the first line of a test summary?
- [ ] Why report what was *not* tested?
- [ ] How do you calculate defect removal efficiency?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| "I can't find any bugs" | Compare with `standard_user` screen by screen; open DevTools → Console; try the [input ideas](/docs/fundamentals/manual-testing/manual-testing-quick-reference#input-ideas) |
| "Is this a bug or a feature?" | Name your oracle (spec, consistency, user expectation). If still unsure, log it as a **question**, not a bug |
| "The app behaves differently now" | Side menu → **Reset App State**, log out and in again, or use a private window |
| "My report feels too long" | Keep title, steps, expected, actual, evidence. Move everything else to Notes |

## What's next {#next}

- **Automate** your regression pack: [Test automation learning path](/docs/learning-path/test-automation/implementation-roadmap).
- **Test beneath the screen**: [API testing learning path](/docs/learning-path/api-testing/implementation-roadmap).
- **See the whole service**: QA Services Delivery Playbook.

**Good books to read alongside:** *Explore It!* (Elisabeth Hendrickson) for
exploratory testing, and *Lessons Learned in Software Testing* (Kaner, Bach,
Pettichord) for 293 short, practical lessons. The ISTQB Foundation Level
syllabus (free on istqb.org) covers the standard vocabulary.
