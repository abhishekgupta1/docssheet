---
title: "Manual Testing & Test Design Cheat Sheet"
description: "A beginner-to-advanced reference for manual testing — test cases, bug reports, severity, test design techniques, exploratory testing, regression, risk, requirements review, strategy and metrics."
level: beginner
tags: [manual-testing, test-design, qa, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Manual testing & test design cheatsheet

Learn to test software by hand — and, more importantly, to decide **what** to
test. Everything here is also the base for automation, API, performance and
security testing. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — a real case, with the result written next to it.
- **Try it** — a small exercise on the practice app.

Want the longer story? The
manual and functional testing guide
explains each testing type in more depth.

<a class="topic-crosslink" href="/docs/sdet-skills/qa-services-delivery/manual-and-functional-testing">📖 Full guide: Manual & functional testing →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Manual testing learning sections">
  <a class="button button--primary" href="/docs/learning-path/manual-testing/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/manual-testing/manual-testing-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/manual-testing/best-practices">Best Practices</a>
</nav>

:::tip How to use this page

Go through **Part 1** in order — each section builds on the one before. Then
move to **Part 2**, the test design techniques that separate testers from
people who "click around". **Part 3** is for when you plan testing for a whole
team. Do every **Try it** on the [practice app](#practice-app) — reading about
testing teaches much less than testing.

:::

## Contents {#contents}

**[Practice app](#practice-app)**

**[Part 1 — Beginner](#part-1)**:
[What testing is](#what-is-testing) ·
[Errors, defects & failures](#defects) ·
[Expected vs actual](#expected-actual) ·
[Test cases](#test-cases) ·
[Checklists](#checklists) ·
[Bug reports](#bug-reports) ·
[Severity & priority](#severity-priority) ·
[Test levels](#test-levels) ·
[Test types](#test-types)

**[Part 2 — Core](#part-2)**:
[Equivalence partitioning](#equivalence) ·
[Boundary values](#boundaries) ·
[Decision tables](#decision-tables) ·
[State transitions](#state-transitions) ·
[User journeys](#journeys) ·
[Pairwise](#pairwise) ·
[Error guessing](#error-guessing) ·
[Exploratory testing](#exploratory) ·
[Smoke & regression](#regression) ·
[DevTools for testers](#devtools) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Reviewing requirements](#requirements) ·
[Risk-based testing](#risk) ·
[Test oracles](#oracles) ·
[Strategy & plan](#strategy) ·
[Coverage & traceability](#coverage) ·
[QA metrics](#metrics) ·
[Words you'll meet](#glossary)

## Practice app {#practice-app}

**In short:** [Sauce Demo](https://www.saucedemo.com) is a free practice
shop with several built-in users; some of them have **deliberate bugs** for
you to find.

| Username | Password | Use it for |
|---|---|---|
| `standard_user` | `secret_sauce` | The "working" version — your reference |
| `locked_out_user` | `secret_sauce` | A user who is not allowed in |
| `problem_user` | `secret_sauce` | Bug hunting — compare everything with `standard_user` |
| `error_user` | `secret_sauce` | Bug hunting — watch what happens at each step |
| `performance_glitch_user` | `secret_sauce` | Something feels different… |
| `visual_user` | `secret_sauce` | Look very carefully at the screen |

The shop has a login page, a product list (6 products) with sorting, a cart,
a three-step checkout (details → overview → complete) and a side menu. The
[milestones](/docs/learning-path/manual-testing/milestones-and-mini-projects)
have the full list of bugs, as an answer key.

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. What testing is {#what-is-testing}

**In short:** testing is gathering information about a product's quality so
people can make better decisions — mainly "is this ready to release?".

| Word | Meaning | Example on Sauce Demo |
|---|---|---|
| **QA** (Quality Assurance) | Preventing defects: process, reviews, standards | Reviewing the checkout story before it is built |
| **QC** (Quality Control) | Finding defects in the product | Running checkout with a wrong postal code |
| **Verification** | "Did we build it right?" — matches the spec | The error text is exactly as the spec says |
| **Validation** | "Did we build the right thing?" — meets user needs | Users can actually find the checkout button |

Testing can show that bugs **are** there, never that they are **not** there.
That is why the job is choosing the tests that find the most important bugs
first.

**Try it:** log in as `standard_user`. Write down five things you would
want to check before this shop goes live. Keep the list — you'll improve it in
later sections.

</div>

<div class="cheat-card">

#### 2. Errors, defects & failures {#defects}

**In short:** a person makes an **error**, which puts a **defect** (bug) in
the code, which may cause a **failure** users can see.

```text
Error (a mistake)         → developer types  price * qty + tax  instead of  (price * qty) * (1 + tax)
Defect (bug in the code)  → the formula in checkout.js is wrong
Failure (visible result)  → the order total is wrong on the overview page
```

Not every defect causes a failure — the wrong code may never run. And not
every failure is a code defect: it can be bad data, bad config, or a broken
environment. Say "failure" until you know the cause.

**Try it:** think of one bug you saw in any app this month. Write its
error, defect and failure in three lines, like the example.

</div>

<div class="cheat-card">

#### 3. Expected vs actual {#expected-actual}

**In short:** a test compares the **expected result** (from requirements,
the design, or common sense) with the **actual result**; a mismatch is a
possible bug.

| Step | Expected | Actual (`standard_user`) | Pass? |
|---|---|---|---|
| Enter `standard_user` / `secret_sauce`, click Login | Product list opens | Product list opens | ✅ |
| Click Login with both fields empty | Error asking for the username | `Epic sadface: Username is required` | ✅ |
| Sort "Price (low to high)" | Cheapest first | First item $7.99 | ✅ |

Write the expected result **before** you run the step. If you write it after,
you'll tend to accept whatever the app did.

**Try it:** write the expected result for "click Login with a username but no
password", then check it.

</div>

<div class="cheat-card">

#### 4. Test cases {#test-cases}

**In short:** a test case is a set of steps with data and expected results
that anyone on the team can run and get the same answer.

```text
ID:            TC-LOGIN-003
Title:         Locked-out user cannot log in and sees a clear error
Priority:      P1
Preconditions: On the login page, not logged in
Steps:         1. Enter username "locked_out_user"
               2. Enter password "secret_sauce"
               3. Click Login
Expected:      Stays on login page
               Error: "Epic sadface: Sorry, this user has been locked out."
               Both fields are marked with a red ✗
```

Good test cases:

- **One goal** per case — the title says what it proves.
- **Exact data** — not "a valid user" but which user.
- **Observable expected results** — something you can see or measure.
- **Independent** — doesn't rely on another case running first.

**Try it:** write test cases TC-LOGIN-001 (valid login) and TC-LOGIN-002
(empty password) in the same format.

</div>

<div class="cheat-card">

#### 5. Checklists {#checklists}

**In short:** a checklist is a short list of things to check, without
detailed steps — faster to write, for testers who already know the product.

```text
Cart — checklist
[ ] Add one item → badge shows 1
[ ] Add all six items → badge shows 6
[ ] Remove from product list → badge goes down
[ ] Remove from cart page → item disappears
[ ] Cart survives a page refresh
[ ] "Continue Shopping" returns to the product list
```

| Use test cases when… | Use checklists when… |
|---|---|
| The flow is risky or regulated (payments, health) | The team knows the product well |
| New people will run them | Features change often |
| You need audit evidence | You want speed |

**Try it:** write an eight-line checklist for the side menu (☰ in the top left).

</div>

<div class="cheat-card">

#### 6. Bug reports {#bug-reports}

**In short:** a good bug report lets a developer see the bug on the first
try: a clear title, exact steps, expected vs actual, and evidence.

```text
Title:        [Checkout] Typing a last name overwrites the first name (problem_user)
Environment:  saucedemo.com, Chrome 131, macOS 15, user problem_user
Severity:     Critical — no order can be placed
Steps:        1. Log in as problem_user, add any item, open cart, click Checkout
              2. Type "Asha" in First Name
              3. Type "Rao" in Last Name
Expected:     First Name = "Asha", Last Name = "Rao"
Actual:       First Name = "Rao", Last Name is empty;
              Continue shows "Error: Last Name is required"
Frequency:    5/5 tries; does not happen for standard_user
Evidence:     screen recording attached
```

- **Title = where + what + (when)** — readable in a list of 200 bugs.
- **One bug per report.** Two problems → two reports.
- **Compare** with a working case (here `standard_user`) — it shows what is special.

**Try it:** log in as `problem_user`, find one bug that's *not* the example
above, and report it in this format.

</div>

<div class="cheat-card">

#### 7. Severity & priority {#severity-priority}

**In short:** **severity** is how much harm the bug does; **priority** is how
soon it will be fixed. Testers usually suggest severity; the product owner decides priority.

| Severity | Meaning | Example |
|---|---|---|
| **Blocker** | Stops testing or use of a main feature | Nobody can log in |
| **Critical** | Main feature broken, no workaround | Checkout can't be completed |
| **Major** | Feature wrong, workaround exists | Sorting fails, but users can scroll |
| **Minor** | Small problem | Misaligned button |
| **Trivial** | Cosmetic | Typo in the footer |

High severity + low priority: a crash in a feature that's being removed next week.
Low severity + high priority: the company name misspelled on the home page.

**Try it:** rate the severity of the bug you reported in section 6. Then
argue for a different priority in one sentence.

</div>

<div class="cheat-card">

#### 8. Test levels {#test-levels}

**In short:** software is tested at several levels, from single functions to
the whole system with real users.

| Level | Tests | Usually done by |
|---|---|---|
| **Unit** | One function or class | Developers, automated |
| **Integration** | Parts working together (service + database, app + payment provider) | Developers / SDETs |
| **System** | The whole product against requirements | QA |
| **Acceptance (UAT)** | Meets business needs; ready to accept | Users / product owner, helped by QA |

Lower levels are faster and cheaper to run; higher levels are closer to what
users actually do. Good teams test at every level.

**Try it:** for "the order total includes tax", write one test idea for each
of the four levels.

</div>

<div class="cheat-card">

#### 9. Test types {#test-types}

**In short:** **functional** tests check *what* the system does;
**non-functional** tests check *how well* it does it.

| Functional | Non-functional |
|---|---|
| Login works with valid details | Login takes under 2 seconds (performance) |
| Sorting orders by price | Works on Safari and Firefox (compatibility) |
| Total = items + tax | Screen reader can complete checkout (accessibility) |
| Removing an item updates the badge | Other users can't see my cart (security) |

Change-related types: **smoke** (does the build work at all?), **regression**
(did we break what used to work?) and **re-testing / confirmation** (is this
bug really fixed?).

**Try it:** add two functional and two non-functional checks to your list from section 1.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 10. Equivalence partitioning {#equivalence}

**In short:** split inputs into groups (**partitions**) the system should
treat the same way, and test one value from each group.

Spec: *"Quantity must be a whole number from 1 to 10."*

| Partition | Valid? | Test value | Expected |
|---|---|---|---|
| 1 to 10 | ✅ | 5 | Accepted |
| Less than 1 | ❌ | -3 | Error |
| More than 10 | ❌ | 15 | Error |
| Decimal | ❌ | 2.5 | Error |
| Not a number | ❌ | "two" | Error |
| Empty | ❌ | (blank) | Error |

Six tests instead of infinitely many. Test invalid partitions **one at a
time** — if a test has two bad values, you don't know which one caused the error.

**Try it:** a "name" field accepts 2–50 letters, spaces and hyphens. List the
partitions and one test value for each.

</div>

<div class="cheat-card">

#### 11. Boundary values {#boundaries}

**In short:** bugs cluster at the edges of partitions, so test the values
just below, on, and just above each boundary.

For "1 to 10":

```text
      invalid │          valid           │ invalid
   ... -1  0  │  1   2  ...  9   10      │  11  12 ...
          ▲   │  ▲   ▲       ▲    ▲      │  ▲
          test these six: 0, 1, 2, 9, 10, 11
```

A developer who wrote `qty < 10` instead of `qty <= 10` passes a test with
5 but fails with 10. Boundaries exist for lengths (0, 1, max, max+1
characters), dates (month end, leap day), money (0.00, 0.01) and counts
(empty list, one item, the page size).

**Try it:** a password must be 8–64 characters. Write the six boundary lengths to test.

</div>

<div class="cheat-card">

#### 12. Decision tables {#decision-tables}

**In short:** when several conditions combine to decide an outcome, list
every combination in a table; each column (or row) becomes a test.

Spec: *"Shipping is free for members, or for orders of ₹999 or more. Anyone
can use the code FREESHIP."*

| Rule | Member? | Order ≥ ₹999? | Code FREESHIP? | Free shipping? |
|---|---|---|---|---|
| R1 | Yes | Yes | Yes | Yes |
| R2 | Yes | Yes | No | Yes |
| R3 | Yes | No | Yes | Yes |
| R4 | Yes | No | No | Yes |
| R5 | No | Yes | Yes | Yes |
| R6 | No | Yes | No | Yes |
| R7 | No | No | Yes | Yes |
| R8 | No | No | No | **No** |

Three yes/no conditions give 2 × 2 × 2 = 8 rules. The table makes it obvious
that only R8 pays for shipping — and would show a gap if the spec didn't say
what happens in some row.

**Try it:** add a fourth condition — "orders to islands never ship free" —
and redo the table. How many rules now, and which change?

</div>

<div class="cheat-card">

#### 13. State transitions {#state-transitions}

**In short:** when something moves through states, draw the states and
arrows; test every allowed arrow and some forbidden ones.

```text
          add item               checkout            finish
 [Empty] ─────────▶ [Has items] ─────────▶ [Checking out] ─────────▶ [Ordered]
    ▲                  │    ▲                   │
    └── remove last ───┘    └──── cancel ───────┘
```

| Test | From → To | Expected |
|---|---|---|
| Allowed | Empty → Has items (add) | Badge shows 1 |
| Allowed | Checking out → Has items (cancel) | Back to cart, items kept |
| Forbidden | Empty → Checking out | Checkout not possible with an empty cart? |
| Forbidden | Ordered → Checking out (browser Back) | Must not place the order twice |

The forbidden moves find the interesting bugs.

**Try it:** on Sauce Demo, open the checkout page with an empty cart (add, go
to checkout, remove from another tab, or type the URL `/checkout-step-one.html`).
What happens? Is it a bug?

</div>

<div class="cheat-card">

#### 14. User journeys {#journeys}

**In short:** test complete paths a real user takes from start to goal —
not just single screens — including the unhappy paths.

| Journey | Steps | Variations to test |
|---|---|---|
| First purchase | Login → browse → add → cart → checkout → finish | Several items; remove one first; change sort |
| Change of mind | Add → cart → continue shopping → remove → add another | Cart stays correct |
| Interrupted | Start checkout → close tab → log in again | Is the cart still there? |
| Logout mid-flow | Add items → logout → login | Cart kept or cleared — as the spec says? |

Journeys catch bugs that single-screen tests miss: data lost between pages,
wrong totals after several changes, state not reset after logout.

**Try it:** run the "Logout mid-flow" journey on Sauce Demo. Write down what
happened and whether the spec (if you were the product owner) should say otherwise.

</div>

<div class="cheat-card">

#### 15. Pairwise testing {#pairwise}

**In short:** when many settings combine, test every **pair** of values at
least once instead of every full combination — most bugs need only two
settings to interact.

Browser (3) × OS (3) × language (4) × user type (3) = **108 combinations**.
All pairs are covered by about **12 combinations**:

| # | Browser | OS | Language | User |
|---|---|---|---|---|
| 1 | Chrome | Windows | English | Guest |
| 2 | Firefox | macOS | English | Member |
| 3 | Safari | iOS | Hindi | Guest |
| … | … | … | … | … |

Tools like Microsoft **PICT** (free) generate the table from a list of
parameters. Pairwise is a way to *reduce* tests — still add extra tests for
risky combinations you already know about.

**Try it:** list 3 parameters with 3 values each for Sauce Demo (for example
browser, user, sort option). How many full combinations is that?

</div>

<div class="cheat-card">

#### 16. Error guessing {#error-guessing}

**In short:** use experience and known bug patterns to guess where defects
hide, then test there on purpose.

| Input or action | Try |
|---|---|
| Text fields | Empty, spaces only, very long text, emoji 😀, `<b>bold</b>`, `' OR 1=1 --` |
| Numbers | 0, -1, 0.1, 99999999, `1e3`, leading zeros `007` |
| Dates | 29 Feb, 31 Apr, far past, far future, other time zones |
| Actions | Double-click submit, browser Back after submit, refresh mid-flow, two tabs |
| Network | Slow connection, offline, request fails halfway |
| Users | New, returning, no permissions, two users editing the same thing |

**Try it:** on the checkout details page, try at least six inputs from the
table in the First Name field. Which ones should the shop reject?

</div>

<div class="cheat-card">

#### 17. Exploratory testing {#exploratory}

**In short:** exploratory testing is learning, designing and testing at the
same time — in time-boxed sessions guided by a mission called a **charter**.

```text
CHARTER:   Explore the cart with problem_user
           to discover bugs in adding and removing items
TIME BOX:  30 minutes
NOTES:     10:02 add Backpack → badge 1 ✓
           10:03 add Bolt T-Shirt → badge still 1 ✗  (bug?)
           10:05 same on standard_user → badge 2      (so yes, bug)
BUGS:      BUG-12, BUG-13
QUESTIONS: Should the cart survive logout?
```

This is called **session-based test management** (SBTM, Jonathan and James
Bach). The notes turn free exploring into evidence others can review.

**Try it:** run the charter above yourself for 30 minutes and compare your
bug list with the [answer key](/docs/learning-path/manual-testing/milestones-and-mini-projects#milestone-2).

</div>

<div class="cheat-card">

#### 18. Smoke & regression {#regression}

**In short:** a **smoke** test is a few quick checks that the build works at
all; **regression** testing re-checks features that already worked, after
every change.

| | Smoke | Regression |
|---|---|---|
| Question | "Is this build worth testing?" | "Did the change break anything?" |
| Size | 5–30 checks, minutes | Hundreds, hours (so usually automated) |
| When | Every new build | Before release; nightly when automated |
| Sauce Demo example | Login, product list shows 6 items, add to cart, checkout completes | All of the above for every user, sort options, menu, cart edits |

Every fixed bug adds a regression test, so it can never come back unnoticed.

**Try it:** write a smoke checklist for Sauce Demo with no more than 8 lines.

</div>

<div class="cheat-card">

#### 19. DevTools for testers {#devtools}

**In short:** the browser's developer tools (`F12`, or `Cmd+Option+I` on a Mac)
show what's happening behind the screen — perfect for evidence and for
finding the cause of a bug.

| Tab | Use it to |
|---|---|
| **Console** | See JavaScript errors — attach them to bug reports |
| **Network** | See every request, status code and response; export a HAR file |
| **Elements** | Inspect a field, check labels, find `data-test` attributes |
| **Application** | See cookies and local storage (session, cart) |
| **Device toolbar** (`Cmd/Ctrl+Shift+M`) | Test phone and tablet sizes |
| **Network → Throttling** | Simulate slow 3G or offline |

Example: log in as `error_user`, open the **Console** tab, and add items to
the cart. Red error messages appear there even when the screen says nothing.

**Try it:** open the Application tab after logging in. Which cookie holds your
session? What happens to it when you log out?

</div>

<div class="cheat-card">

#### 20. Common mistakes {#gotchas}

**In short:** most weak testing comes from the same handful of habits.

| Mistake | Better |
|---|---|
| Only testing the happy path | Every feature gets negative and edge cases |
| "It doesn't work" bug reports | Steps, data, expected vs actual, evidence |
| Testing with the same data every time | Vary users, values, order of steps |
| Deciding expected results after seeing the result | Write them first |
| Retesting only the fixed bug | Also re-run nearby regression checks |
| Not comparing with a working case | Compare with another user, browser or build |
| Stopping at the first bug | Note it, then keep going — bugs cluster |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 21. Reviewing requirements {#requirements}

**In short:** the cheapest bug is the one found in the requirement before any
code exists — review stories for missing, vague or untestable parts.

Story: *"As a shopper, I want to sort products so I can find what I need."*

| Question | Why it matters |
|---|---|
| Sort by what? Name, price, newest? | Missing detail |
| Default order when the page opens? | Missing detail |
| What if two products have the same price? | Edge case |
| Does the sort survive going back from a product page? | State |
| Is "fast" defined? | Untestable word |

Acceptance criteria written as **Given / When / Then** are easy to test:

```gherkin
Given I am on the product list
When I choose "Price (low to high)"
Then the first product costs $7.99
And each price is equal to or higher than the one before it
```

**Try it:** write five review questions for the story *"As a shopper, I want
to remove items from my cart."*

</div>

<div class="cheat-card">

#### 22. Risk-based testing {#risk}

**In short:** rate each feature by **impact** (how bad if it breaks) ×
**likelihood** (how likely to break), then test the highest scores first and deepest.

| Feature | Impact (1–5) | Likelihood (1–5) | Risk | Test depth |
|---|---|---|---|---|
| Checkout & payment | 5 | 4 | **20** | Deep: all techniques, every release |
| Login | 5 | 2 | 10 | Solid: all cases, smoke every build |
| Cart | 4 | 3 | 12 | Solid |
| Sorting | 2 | 3 | 6 | Light |
| About link | 1 | 1 | 1 | Glance |

Likelihood goes up with: new code, complex logic, many recent bugs, new
developers, third-party integrations, rushed deadlines.

**Try it:** add "side menu" and "product details page" to the table with your
own scores. Where do they rank?

</div>

<div class="cheat-card">

#### 23. Test oracles {#oracles}

**In short:** an **oracle** is how you decide whether a result is right — a
spec, a working version, a calculation, or a consistency rule.

| Oracle | Example on Sauce Demo |
|---|---|
| Specification | The requirement says error text X |
| Comparable product / version | `standard_user` behaves differently from `problem_user` |
| Calculation | Total = item prices + tax — work it out yourself |
| Consistency within the product | Price in the list = price in the cart = price on the overview |
| User expectation | Nobody expects the Back button to empty the cart |
| History | It worked in the last build |

When there's no spec, name your oracle in the bug report: *"Inconsistent with
the cart page, which shows $29.99."*

**Try it:** log in as `visual_user`, add one item, and compare the price in
the list, the cart and the overview total. Which oracle tells you something is wrong?

</div>

<div class="cheat-card">

#### 24. Strategy & plan {#strategy}

**In short:** a **test strategy** explains *how* a product is tested and why;
a **test plan** says *who tests what, when* for one release.

```text
TEST PLAN — Sauce Demo release 2.9 (one page)
Scope:        Login, product list, cart, checkout. Out: side menu links.
Risks:        1. Checkout total  2. Cart updates  3. Sorting
Approach:     Smoke every build; test cases for checkout; 3 exploratory charters
Environments: Chrome, Firefox, Safari (latest); iPhone viewport
Entry:        Build deployed; smoke passes
Exit:         No open critical bugs; all P0/P1 cases run; charters done
Schedule:     Mon–Wed testing, Thu retest, Fri go/no-go
People:       Asha (checkout), Ravi (cart, sorting)
```

The full strategy outline is in the
engagement lifecycle guide.

**Try it:** write a one-page plan like this for testing only the cart.

</div>

<div class="cheat-card">

#### 25. Coverage & traceability {#coverage}

**In short:** a **traceability matrix** links each requirement to its tests
and their results, so you can say exactly what is — and isn't — tested.

| Requirement | Tests | Result |
|---|---|---|
| REQ-1 Valid users can log in | TC-LOGIN-001 | ✅ Pass |
| REQ-2 Locked users are refused | TC-LOGIN-003 | ✅ Pass |
| REQ-3 Products can be sorted by price | TC-SORT-001, 002 | ❌ Fail (BUG-7, problem_user) |
| REQ-4 Checkout needs name and postal code | TC-CHK-004..008 | ⚠️ 3/5 run |
| REQ-5 Order total includes tax | — | ❌ **No test** |

The empty row is the most valuable line in the table — a gap you found before users did.

</div>

<div class="cheat-card">

#### 26. QA metrics {#metrics}

**In short:** a few trend metrics help decide and improve; counting test
cases or bugs per tester does not.

| Metric | Formula | Tells you |
|---|---|---|
| **Escaped defects** | Bugs found in production per release | Is quality reaching users? |
| **Defect removal efficiency** | Bugs found before release ÷ all bugs | How much testing catches |
| **Test execution progress** | Cases run ÷ cases planned | Are we on schedule? |
| **Reopen rate** | Reopened bugs ÷ fixed bugs | Are fixes and bug reports clear? |
| **Requirements coverage** | Requirements with tests ÷ all requirements | Gaps in the plan |

Example: 45 bugs found in testing, 5 found by users after release → defect
removal efficiency = 45 ÷ 50 = **90%**.

</div>

<div class="cheat-card">

#### 27. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **AUT / SUT** | Application / System Under Test — the thing you are testing |
| **Test basis** | What tests are designed from: requirements, designs, user stories |
| **Test condition** | Something that can be tested, e.g. "quantity above 10 is rejected" |
| **Test suite** | A group of test cases run together |
| **Charter** | The mission of one exploratory session |
| **Oracle** | The way you decide if a result is right |
| **Partition** | A group of inputs the system should treat the same way |
| **Re-testing** | Checking one fixed bug is really fixed (also: confirmation testing) |
| **Regression** | Something that used to work and is now broken |
| **UAT** | User Acceptance Testing — users confirm it meets their needs |
| **Triage** | Deciding a bug's severity, priority, owner and fix date |
| **HAR file** | HTTP Archive — a recording of all network requests on a page |
| **Shift-left** | Testing earlier — in requirements, design and code review |
| **ISTQB** | International Software Testing Qualifications Board — the common certification body |

For the testing types in depth, see the
manual and functional testing guide.

</div>

</div>
