---
title: "Manual Testing Best Practices"
description: "Habits that make manual testing faster, sharper and more trusted — requirements review, test design, test cases, exploratory sessions, bug reports, evidence, test data, regression, working with developers, reporting, and a sign-off checklist."
sidebar_position: 2
level: intermediate
tags: [manual-testing, test-design, fundamentals, best-practices]
---

# Manual Testing Best Practices

This page lists good habits for testing by hand. They make your testing
find more important bugs in less time, and make your results easy for others
to trust. They apply to everyone who tests: QA engineers, SDETs, developers
and product owners doing acceptance.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example, where it helps. Examples use the
  [practice app](/cheatsheets/manual-testing#practice-app).

:::tip How to use this page

Read it once after you finish Part 2 of the [manual testing cheat sheet](/cheatsheets/manual-testing),
then use [the checklist at the end](#12-short-checklist-before-you-sign-off)
before every release sign-off. Pick two or three habits to practise each week.

:::

---

## Contents

1. [Start Before the Code](#1-start-before-the-code)
2. [Design Tests on Purpose](#2-design-tests-on-purpose)
3. [Writing Test Cases](#3-writing-test-cases)
4. [Exploratory Sessions](#4-exploratory-sessions)
5. [Bug Reports](#5-bug-reports)
6. [Evidence](#6-evidence)
7. [Test Data and Environments](#7-test-data-and-environments)
8. [Regression and Re-testing](#8-regression-and-re-testing)
9. [Working With Developers](#9-working-with-developers)
10. [Reporting Status](#10-reporting-status)
11. [Growing as a Tester](#11-growing-as-a-tester)
12. [Short Checklist Before You Sign Off](#12-short-checklist-before-you-sign-off)

---

## 1. Start Before the Code

**In short:** the cheapest bugs to fix are the ones found in the requirement.

- **Do** read every story before development starts and write your questions down.
  **Why:** a missing rule found in refinement costs a comment; found in production it costs a hotfix.
- **Do** turn vague words into numbers: "fast" → "search results in under 2 seconds".
  **Why:** you can't test "fast", and the developer can't build it.
- **Do** ask for acceptance criteria in Given/When/Then form, or write them yourself and agree them.
  **Why:** everyone tests against the same definition of done.
- **Do** join "three amigos" sessions — product owner, developer, tester together.
  **Why:** three views of the same story find gaps nobody finds alone.

---

## 2. Design Tests on Purpose

**In short:** pick tests with a technique, not by habit — and start with the riskiest areas.

- **Do** rank features by risk (impact × likelihood) before planning.
  **Why:** when time runs out — it always does — the important parts are already tested.
- **Do** use the technique that fits the input: partitions and boundaries for
  ranges, decision tables for rules, state diagrams for life cycles
  ([which technique?](/docs/fundamentals/manual-testing/manual-testing-quick-reference#which-technique)).
  **Why:** techniques find more bugs with fewer tests than intuition alone.
- **Do** test one invalid value at a time.
  **Why:** if two things are wrong in one test, you can't tell which one the system rejected.
- **Do** write down the expected result before running a test.
  **Why:** after you see the actual result, it's tempting to decide that it's "fine".

```text
Weak:   Login works.
Strong: TC-LOGIN-001 valid user → product list;
        TC-LOGIN-002 empty username → "Username is required";
        TC-LOGIN-003 locked user → locked-out message; …
```

---

## 3. Writing Test Cases

**In short:** write test cases someone else can run tomorrow without asking you anything.

- **Do** give each case one goal and a title that says what it proves.
  **Why:** a failed "TC-042 misc checks" tells nobody what broke.
- **Do** use exact data (`problem_user`, `560001`), not "a valid user".
  **Why:** different data can give different results — and then the case isn't repeatable.
- **Do** keep steps short and put the expected result where it's checked.
  **Why:** the tester knows exactly where the check happens.
- **Do** use checklists instead of detailed cases for stable, well-known areas.
  **Why:** detailed cases take time to write and maintain; spend that time where the risk is.
- **Do** review and delete outdated cases every quarter.
  **Why:** a suite nobody trusts is worse than a small suite everybody runs.

---

## 4. Exploratory Sessions

**In short:** explore with a charter, a time box and notes — free, but not random.

- **Do** write a charter first: *explore* what, *with* what, *to discover* what.
  **Why:** a mission keeps you focused and tells others what was covered.
- **Do** time-box sessions (30–90 minutes) and take notes as you go.
  **Why:** notes turn exploring into evidence and help you reproduce bugs.
- **Do** compare with a working reference (another user, browser or build).
  **Why:** it's the fastest way to tell "odd" from "wrong" — see how `standard_user`
  exposes every `problem_user` bug.
- **Do** end each session with a short debrief: bugs, questions, what's still untested.
  **Why:** the "not covered" list is the plan for the next session.

---

## 5. Bug Reports

**In short:** a developer should be able to reproduce the bug from the report alone, on the first try.

- **Do** write the title as *where + what + when*.
  **Why:** people scan titles in lists; "Checkout broken" helps nobody.

```text
Weak:   Checkout broken
Strong: [Checkout] Typing a last name overwrites the first name (problem_user)
```

- **Do** include environment, exact steps, expected vs actual, and frequency.
  **Why:** "works on my machine" usually means a missing detail.
- **Do** isolate before you report: other user? other browser? last build?
  **Why:** "only on Firefox" or "only for problem_user" halves the developer's search.
- **Do** report one bug per report.
  **Why:** two bugs in one ticket get half-fixed and closed.
- **Do** describe facts, not blame: "the total is wrong", not "someone broke the total".
  **Why:** developers are your partners; friction slows fixes.
- **Do** search for duplicates before filing.
  **Why:** duplicates waste triage time and split the discussion.

---

## 6. Evidence

**In short:** attach proof that makes the bug obvious and the cause easier to find.

- **Do** attach a screenshot or short video for anything visual or multi-step.
  **Why:** a 10-second video replaces a paragraph of explanation.
- **Do** attach console errors and the network request (or a HAR file) for failures.
  **Why:** a 500 response with its body often shows the developer the exact bug.
- **Do** mask personal data and secrets in evidence.
  **Why:** bug trackers are widely shared; screenshots leak.

---

## 7. Test Data and Environments

**In short:** know exactly which environment and data you tested with, and keep them under control.

- **Do** note the build/version you tested in every report and status.
  **Why:** "fixed" and "still broken" both depend on which build.
- **Do** keep a list of test accounts per role and their state.
  **Why:** shared accounts change under you and cause false bugs.
- **Do** reset data before a test cycle (Sauce Demo: side menu → **Reset App State**).
  **Why:** leftover data from earlier tests makes results unrepeatable.
- **Do** use made-up data, never real customer data.
  **Why:** privacy law and trust — and you don't need it to find bugs.

---

## 8. Regression and Re-testing

**In short:** confirm the fix, then check nothing around it broke.

- **Do** re-test a fixed bug with the exact original steps, then with variations.
  **Why:** fixes often handle the reported case and miss its neighbours.
- **Do** run the smoke checklist on every new build before deeper testing.
  **Why:** ten minutes saves a day of testing a broken build.
- **Do** add every production bug to the regression suite.
  **Why:** the same bug should never reach users twice.
- **Do** mark stable, repeated regression checks as automation candidates.
  **Why:** people should spend their time exploring, not repeating the same clicks
  ([test automation path](/docs/learning-path/test-automation/implementation-roadmap)).

---

## 9. Working With Developers

**In short:** testing is a team sport — share early, talk directly, keep it about the product.

- **Do** show a bug in person (or on a call) when it's hard to explain.
  **Why:** two minutes of screen-sharing beats a day of ticket comments.
- **Do** test early builds and feature branches, not only the "final" build.
  **Why:** bugs found while the developer still remembers the code are fixed faster.
- **Do** learn the architecture: services, databases, integrations.
  **Why:** you'll guess where bugs hide and write better reports.
- **Do** say what's good, too.
  **Why:** trust makes people want to hear about the bugs.

---

## 10. Reporting Status

**In short:** tell people what they need to decide — risk and progress — in a few lines.

- **Do** lead with the risk and the verdict, then details.
  **Why:** managers read the first line; make it the one that matters.
- **Do** report what was **not** tested, and why.
  **Why:** hidden gaps become production incidents; visible gaps become decisions.
- **Do** use trends (escaped bugs per release) rather than raw counts.
  **Why:** "300 test cases" says nothing about quality; "escaped bugs 5 → 1" does.

---

## 11. Growing as a Tester

**In short:** keep practising, keep learning the product and the technology behind it.

- **Do** practise on apps with known bugs, like the [milestones](/docs/learning-path/manual-testing/milestones-and-mini-projects).
  **Why:** you can check yourself against an answer key.
- **Do** learn HTTP, SQL and browser DevTools.
  **Why:** they let you test beneath the screen — see the [API testing path](/docs/learning-path/api-testing/implementation-roadmap)
  and the [SQL cheat sheet](/cheatsheets/sql).
- **Do** consider the ISTQB Foundation Level certification.
  **Why:** it gives you the common vocabulary employers and clients expect.

---

## 12. Short Checklist Before You Sign Off

- [ ] Every P0/P1 requirement has at least one test, and all were run on the release build
- [ ] Exploratory sessions done for new and changed features; notes saved
- [ ] No open blocker or critical bugs, or the product owner accepted each one in writing
- [ ] Fixed bugs re-tested; smoke and regression checklists passed
- [ ] Tested on the agreed browsers/devices
- [ ] Known issues listed for the release notes
- [ ] "Not tested" list shared, with reasons
- [ ] Test summary sent with a clear GO / GO WITH RISKS / NO GO verdict

**Need more detail?** [Cheat sheet](/cheatsheets/manual-testing) ·
[Quick reference](/docs/fundamentals/manual-testing/manual-testing-quick-reference) ·
Full guide
