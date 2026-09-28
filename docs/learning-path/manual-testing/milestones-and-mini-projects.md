---
title: "Manual Testing Milestones & Mini-Projects"
description: "A practice project with an answer key for each of the six manual testing milestones — login test suite, problem_user bug hunt, test design from a spec, exploratory sessions, risk and regression, and a full test cycle."
sidebar_position: 2
level: beginner
tags: [manual-testing, learning-path, projects]
---

# Manual Testing Milestones & Mini-Projects

**In short:** one project per milestone on the
[practice app](/cheatsheets/manual-testing#practice-app), with tasks, the
**expected result** of each, and an answer key folded away. The bugs listed
in the answer keys were all reproduced on saucedemo.com while writing this
page — try first, then compare.

:::tip How to use this page

First read the milestone in the [Roadmap](/docs/learning-path/manual-testing/implementation-roadmap)
and the cheat-sheet sections it links to. Then do the tasks, write your
results down, and only then open the answer key. Count what you found and
note what you missed — that list tells you what to practise. The practice site
belongs to Sauce Labs and may change; if a result differs, note it as a
finding, just as you would on a real project.

:::

## Contents

- [Milestone 1: Login test suite](#milestone-1)
- [Milestone 2: Bug hunt — problem_user](#milestone-2)
- [Milestone 3: Test design from a spec](#milestone-3)
- [Milestone 4: Exploratory sessions](#milestone-4)
- [Milestone 5: Risk table & regression pack](#milestone-5)
- [Milestone 6: Full test cycle](#milestone-6)
- [After Milestone 6](#after)

---

## Milestone 1: Login test suite {#milestone-1}

**Practises:** expected vs actual, test cases, checklists, positive and negative tests.

**Setup:** open [saucedemo.com](https://www.saucedemo.com) in a private
window. Don't log in yet.

| # | Task | Expected result |
|---|---|---|
| 1 | Write test cases for: valid login, locked user, wrong password, empty username, empty password, both empty | 6 test cases in the [template](/docs/fundamentals/manual-testing/manual-testing-quick-reference#test-case-template) |
| 2 | Write the expected result for each **before** running it | 6 expected results written first |
| 3 | Run all six on `standard_user` / `locked_out_user` | 6 pass (see answer key for the exact messages) |
| 4 | Add 3 edge cases: username in different case, a leading space, pressing Enter instead of clicking | 3 more cases, run |
| 5 | Open `https://www.saucedemo.com/inventory.html` while logged out | You're kept out and told why |
| 6 | Write a 10-line login checklist for future regression runs | A checklist anyone on the team can run |

<details>
<summary>Answer key</summary>

| Case | Actual message on saucedemo.com |
|---|---|
| Valid login | Product list opens (`/inventory.html`) |
| `locked_out_user` | `Epic sadface: Sorry, this user has been locked out.` |
| Wrong password | `Epic sadface: Username and password do not match any user in this service` |
| Empty username (with or without password) | `Epic sadface: Username is required` |
| Empty password | `Epic sadface: Password is required` |
| `Standard_User` (different case) | Same as wrong password — usernames are case-sensitive |
| `" standard_user"` (leading space) | Same as wrong password — spaces are not trimmed |
| Logged out, open `/inventory.html` | `Epic sadface: You can only access '/inventory.html' when you are logged in.` |

Every error also shows a red ✗ icon in both fields.

Questions worth raising (not bugs yet — ask the product owner):
- Should spaces around a username be trimmed? Most sites do.
- The wrong-password message doesn't say which field is wrong — that's **good**
  for security (attackers can't learn which usernames exist).

</details>

**Watch out for:** writing "error is shown" as the expected result. Write the
**exact** text you expect, or at least what it must say — otherwise a wrong
message passes.

**Try it:** a teammate says "login is tested". Using only your checklist,
list three login risks it still doesn't cover (hint: the
[login checklist](/docs/fundamentals/manual-testing/manual-testing-quick-reference#login-checklist)).

---

## Milestone 2: Bug hunt — problem_user {#milestone-2}

**Practises:** comparing with a reference, bug reports, severity.

**Setup:** two browser windows side by side — one logged in as
`standard_user` (the reference), one as `problem_user` (use a private window
for the second so the sessions don't mix).

| # | Task | Expected result |
|---|---|---|
| 1 | Compare the product list screen by screen | At least 1 visual bug |
| 2 | Try every sort option | At least 1 functional bug |
| 3 | Add each of the 6 products to the cart, then remove them | At least 2 cart bugs |
| 4 | Open two different products' detail pages | At least 1 navigation bug |
| 5 | Complete a checkout | At least 1 bug that blocks checkout |
| 6 | Try every link in the side menu (☰) | At least 1 bug |
| 7 | Write a full bug report for each, with severity | **6+ reports** |

<details>
<summary>Answer key — 7 bugs</summary>

| # | Bug | Suggested severity |
|---|---|---|
| 1 | **All product images are the same wrong picture** | Major — users can't see what they buy |
| 2 | **Sorting does nothing** — every option keeps the default order | Major (workaround: scroll) |
| 3 | **"Add to cart" does nothing for 3 products**: Bolt T-Shirt, Fleece Jacket, Test.allTheThings() T-Shirt — the badge doesn't change | Critical — half the shop can't be bought |
| 4 | **"Remove" on the product list doesn't remove** the item — the badge stays the same | Major (workaround: remove from the cart page) |
| 5 | **Product names open the wrong product page** — each link opens a different product's details | Major |
| 6 | **Typing a Last Name overwrites the First Name**; Last Name stays empty, so Continue always fails with `Error: Last Name is required` | **Blocker / Critical — no order can be completed** |
| 7 | **Side menu "About" opens a 404 page** (for `standard_user` it opens saucelabs.com) | Minor |

Scoring: 6–7 = excellent, 4–5 = good, under 4 = compare more slowly, field by
field, and repeat each action for **every** product, not just the first.

Sample report for bug 6 is in the
[cheat sheet](/cheatsheets/manual-testing#bug-reports).

</details>

**Watch out for:** stopping after the first product. Bug 3 only appears on
three of the six products — testing one product would miss it.

**Try it:** re-rate each bug's severity from the point of view of a shop
that sells mostly T-shirts. Which ratings change?

---

## Milestone 3: Test design from a spec {#milestone-3}

**Practises:** equivalence partitioning, boundary values, decision tables, state transitions.

This milestone is on paper — you design tests from a specification, the way
you would before the feature is built.

```text
SPEC — Discount codes (v1)
R1  A code is 6 to 10 characters, letters and digits only. Case doesn't matter.
R2  Codes can be used on orders from ₹500 to ₹50,000 (inclusive).
R3  A code gives 10% off. Members get an extra 5% (15% in total).
R4  If the order is ₹10,000 or more, the discount is capped at ₹1,500.
R5  A code is Active until used or until 23:59 on its end date, then Expired.
    Support staff can Disable an Active code. A used code is Used and can't be used again.
```

| # | Task | Expected result |
|---|---|---|
| 1 | Equivalence partitions for the **code text** (R1) | 6+ partitions |
| 2 | Boundary values for **code length** (R1) and **order total** (R2) | 6 lengths, 6 totals |
| 3 | Decision table for the discount (R2, R3, R4) with conditions: in range? member? ≥ ₹10,000? | Rules with expected discount |
| 4 | State diagram for a code (R5); list allowed and 3 forbidden transitions | 4 states, 3 allowed moves |
| 5 | Three questions for the product owner — things the spec doesn't say | 3 questions |

<details>
<summary>Answer key</summary>

**1. Partitions for the code text**

| Partition | Example | Valid? |
|---|---|---|
| 6–10 letters/digits | `SAVE10` | ✅ |
| Lower case (case doesn't matter) | `save10` | ✅ same as `SAVE10` |
| Shorter than 6 | `SAVE1` | ❌ |
| Longer than 10 | `SAVE10SAVE1` | ❌ |
| Contains a symbol or space | `SAVE-10` | ❌ |
| Empty | (blank) | ❌ |
| Non-English letters | `SÄVE10` | ❓ spec unclear — a question for task 5 |

**2. Boundaries**

- Code length: **5, 6, 7, 9, 10, 11** characters.
- Order total: **₹499, ₹500, ₹501, ₹49,999, ₹50,000, ₹50,001**
  (and ₹499.99 / ₹50,000.01 if prices have paise).

**3. Decision table** (order in range, i.e. ₹500–₹50,000)

| Rule | Member? | Total ≥ ₹10,000? | Discount | Example |
|---|---|---|---|---|
| D1 | No | No | 10% | ₹2,000 → ₹200 off |
| D2 | Yes | No | 15% | ₹2,000 → ₹300 off |
| D3 | No | Yes | 10%, max ₹1,500 | ₹12,000 → ₹1,200 off; ₹20,000 → ₹1,500 off (not ₹2,000) |
| D4 | Yes | Yes | 15%, max ₹1,500 | ₹10,000 → ₹1,500 off; ₹12,000 → ₹1,500 off (not ₹1,800) |
| D5 | any | — (out of range) | Code rejected | ₹499 → error |

Note D3/D4: the cap changes the answer for bigger orders — test on both sides
of where the cap starts to bite (10% of ₹15,000 = ₹1,500 exactly).

**4. States**

```text
            use                        
 [Active] ─────────▶ [Used]
    │  │
    │  └── end date passes ──▶ [Expired]
    └── support disables ────▶ [Disabled]
```

Forbidden moves to test: use an **Expired** code; use a **Used** code again;
use a **Disabled** code. Also test the clock: use at 23:59 on the end date
(allowed) and at 00:00 the next day (expired) — in which time zone?

**5. Good questions**

- Can a code be combined with other offers?
- Is the ₹500–₹50,000 range before or after tax and shipping?
- Which time zone is "23:59 on the end date"?
- Are non-English letters allowed? Does "case doesn't matter" include them?
- Can a Disabled code be re-enabled? (If so, it's a missing transition.)

</details>

**Watch out for:** D3/D4 — many testers test only ₹12,000 and never notice the
cap is wrong for members, or test ₹15,000 where 10% equals the cap exactly and
a missing cap is invisible.

**Try it:** R4 changes to "discount capped at ₹1,500 **per order**, and
members' extra 5% is **not** capped". Redo the decision table.

---

## Milestone 4: Exploratory sessions {#milestone-4}

**Practises:** charters, session notes, DevTools, oracles.

Run **three** 30-minute sessions, each with notes in the
[charter template](/docs/fundamentals/manual-testing/manual-testing-quick-reference#charter-template).
Keep DevTools open on the **Console** tab.

| Session | Charter | Expected result |
|---|---|---|
| A | Explore the shop with `error_user` to discover failures the screen doesn't show | 4+ findings |
| B | Explore prices and layout with `visual_user` to discover inconsistencies | 3+ findings |
| C | Explore login and page speed with `performance_glitch_user` to discover timing problems | 1+ finding |

<details>
<summary>Answer key</summary>

**Session A — `error_user`**

1. Sorting shows a browser alert: *"Sorting is broken! This error has been
   reported to Backtrace."* and the order doesn't change.
2. "Add to cart" fails for Bolt T-Shirt, Fleece Jacket and Test.allTheThings()
   T-Shirt; the Console shows `Failed to add item to the cart.`
3. "Remove" fails; the Console shows `Failed to remove item from cart.`
4. Checkout: the Last Name field can't be filled, **but Continue still
   works** — validation is bypassed and the order moves on without a last name.
5. On the overview page, **Finish does nothing**; the Console shows JavaScript errors.

**Session B — `visual_user`**

1. **Prices are random and change on every reload** (for example $62.28, then $35.77 for the same backpack).
2. **The overview total doesn't match the cart**: the cart shows the random
   price, but the total is based on the real price ($29.99 + $2.40 tax = $32.39).
3. The Backpack's image is wrong.
4. Layout is off: the cart icon is moved down and left, and one "Add to cart"
   button isn't aligned with the others (compare screenshots with `standard_user`).

The oracle for 1–2: **consistency within the product** — the same item must
cost the same everywhere.

**Session C — `performance_glitch_user`**

1. Login takes about **5 seconds** to show the product list (under 1 second
   for `standard_user`). Everything works — it's slow, not broken.

</details>

**Watch out for:** session A, point 4 — there's no error on screen, so it
looks like it works. Checking the overview page's data (where's the last
name?) is what finds it.

**Try it:** for session C, write the bug report without the word "slow" —
use numbers and a comparison instead.

---

## Milestone 5: Risk table & regression pack {#milestone-5}

**Practises:** risk-based testing, smoke vs regression, compatibility.

| # | Task | Expected result |
|---|---|---|
| 1 | Risk table for Sauce Demo: login, product list, sorting, product page, cart, checkout, menu | 7 rows, impact × likelihood, sorted |
| 2 | Smoke checklist (max 8 lines) | Runs in under 5 minutes |
| 3 | Regression pack: checklists for the top 4 risks | 25–40 lines in total |
| 4 | Run the smoke checklist on Chrome, Firefox and Safari (or a phone size in device mode) with `standard_user` | All pass |
| 5 | Run the regression pack once with `standard_user` | Note anything suspicious — see answer key |
| 6 | Mark 10 regression lines you'd automate first | 10 marked, with a reason each |

<details>
<summary>Answer key</summary>

**1. A reasonable risk table** (your scores can differ — the reasoning matters)

| Area | Impact | Likelihood | Risk |
|---|---|---|---|
| Checkout | 5 | 4 | 20 |
| Cart | 4 | 3 | 12 |
| Login | 5 | 2 | 10 |
| Product list | 4 | 2 | 8 |
| Sorting | 2 | 3 | 6 |
| Product page | 3 | 2 | 6 |
| Side menu | 1 | 2 | 2 |

**2. Sample smoke checklist**

```text
[ ] standard_user logs in → 6 products shown
[ ] Add Backpack → badge 1
[ ] Cart shows Backpack $29.99
[ ] Checkout with name + postal code → overview
[ ] Overview: Item total $29.99, Tax $2.40, Total $32.39
[ ] Finish → "Thank you for your order!"
[ ] Logout → back on login page
```

**5. Things `standard_user` regression should surface** (questions, not
necessarily bugs):

- **Checkout works with an empty cart** and completes a $0.00 order.
- The details form accepts a last name of only spaces and a postal code of
  letters (`abc`).
- The cart **survives logout** — logging in again shows the old badge. Is that intended?
- Tax is 8% of the item total: 3 items ($29.99 + $9.99 + $7.99 = $47.97) →
  tax **$3.84**, total **$51.81** — check your own maths, don't trust the screen.

**6. Good first automation candidates:** smoke lines, login negatives,
cart add/remove for all six products, totals for fixed baskets, sort
options — stable, repeated, and easy to check automatically.

</details>

**Watch out for:** running regression only with `standard_user` and calling
it done — a risk-based pack should include the other users, or the equivalent
roles/data in a real product.

**Try it:** a new release changes only the tax rate. Which lines of your
regression pack would you run, and which would you skip?

---

## Milestone 6: Full test cycle {#milestone-6}

**Practises:** requirements review, test plan, traceability, reporting. This
is the final project — it pulls every milestone together.

**Scenario:** Sauce Demo is releasing "v2.9". Treat the six users as six
builds or customer segments, and deliver a full test cycle.

| # | Deliverable | Expected result |
|---|---|---|
| 1 | Write 8 requirements for the shop as you understand it (REQ-1…REQ-8) | Testable, with numbers where possible |
| 2 | One-page test plan | Scope, risks, approach, entry/exit, schedule ([example](/cheatsheets/manual-testing#strategy)) |
| 3 | Traceability matrix | Every REQ linked to cases/charters, with results |
| 4 | Test execution across all six users | Results recorded; bugs filed |
| 5 | Test summary report | Verdict, results, open bugs, not tested, recommendations ([template](/docs/fundamentals/manual-testing/manual-testing-quick-reference#test-summary-template)) |
| 6 | Metrics | Cases run/passed/failed, bugs by severity, defect removal efficiency for an imagined "5 bugs found by users later" |

<details>
<summary>Answer key — what a strong summary looks like</summary>

```text
TEST SUMMARY — Sauce Demo v2.9 — <dates>
Verdict:   NO GO for problem_user, error_user and visual_user builds;
           GO WITH RISKS for standard_user (empty-cart checkout, weak form validation).
Scope:     Login, product list, sorting, product page, cart, checkout, menu;
           Chrome, Firefox, Safari; 6 users. Not tested: accessibility, performance under load.
Results:   74 checks run: 52 passed, 22 failed; 3 charters (90 min).
Open bugs: 2 blocker, 5 critical, 8 major, 3 minor.
           Top: no order possible for problem_user (last name) or error_user (Finish);
           prices inconsistent for visual_user; half the catalogue can't be added to cart for two users.
Risks accepted: none yet — decision needed from product owner.
Recommendations: 1) Fix blockers and re-run full regression. 2) Add server-side
           validation for checkout details. 3) Automate the smoke and cart checks.
```

Defect removal efficiency with 18 bugs found in testing and 5 found later by
users: 18 ÷ (18 + 5) ≈ **78%**.

Your numbers will differ. What matters: the verdict is the first line, every
claim traces to a test or bug, and "not tested" is stated.

</details>

**Watch out for:** a summary that lists 20 bugs but no verdict. The reader
wants the decision first, then the evidence.

**Try it:** rewrite your verdict for a manager who has 10 seconds. One line.

---

## After Milestone 6 {#after}

You can now plan, run and report a manual test cycle. Next steps:

- Put your six folders in a public repo — it's a portfolio that proves you can
  deliver the manual testing service.
- Automate your regression pack in the [test automation path](/docs/learning-path/test-automation/implementation-roadmap).
- Test the API beneath a UI in the [API testing path](/docs/learning-path/api-testing/implementation-roadmap).
