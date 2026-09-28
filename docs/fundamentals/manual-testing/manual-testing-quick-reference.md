---
title: "Manual Testing Quick Reference"
description: "Copy-paste manual testing reference — templates (test case, bug report, charter, status, sign-off), which technique to use, heuristics, input ideas by field type, feature checklists, severity scale and DevTools shortcuts."
sidebar_position: 1
level: beginner
tags: [manual-testing, test-design, fundamentals, cheat-sheet]
---

# Manual Testing Quick Reference

A lookup page for everyday testing work: templates to copy, a table for
choosing a technique, and checklists of test ideas for common features.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
testing? Start with the [manual testing cheat sheet](/cheatsheets/manual-testing),
which explains each idea with an exercise. For the ordered plan with practice
projects, see the [manual testing learning path](/docs/learning-path/manual-testing/implementation-roadmap).

:::

## Quick Navigation

**Templates:** [Test case](#test-case-template) · [Bug report](#bug-report-template) · [Charter](#charter-template) · [Daily status](#daily-status-template) · [Test summary](#test-summary-template)

**Design:** [Which technique?](#which-technique) · [Boundary cheats](#boundary-cheats) · [Heuristics](#heuristics) · [Input ideas](#input-ideas)

**Checklists:** [Login](#login-checklist) · [Forms](#forms-checklist) · [Search & lists](#search-checklist) · [Cart & checkout](#checkout-checklist) · [File upload](#upload-checklist) · [Any new screen](#screen-checklist)

**Reference:** [Severity scale](#severity-scale) · [Bug life cycle](#bug-life-cycle) · [HTTP status codes](#http-status-codes) · [DevTools](#devtools) · [Tools](#tools)

---

## Test case template {#test-case-template}

```text
ID:             TC-<AREA>-<NNN>
Title:          <what it proves, in one line>
Priority:       P0 | P1 | P2 | P3
Requirement:    <REQ id or story link>
Preconditions:  <state before step 1: user, data, page>
Test data:      <exact values>
Steps:          1. …
                2. …
Expected:       <observable result per step, or at the end>
Actual:         <filled in when run>
Status:         Pass | Fail | Blocked | Not run
```

## Bug report template {#bug-report-template}

```text
Title:        [<Area>] <what goes wrong> <when / for whom>
Environment:  <URL/build>, <browser + version>, <OS>, <device>, <user/role>
Severity:     Blocker | Critical | Major | Minor | Trivial
Preconditions:<state needed before step 1>
Steps:        1. …
Expected:     …
Actual:       …
Frequency:    <n/n tries>; <where it does NOT happen>
Evidence:     screenshot / video / HAR / console log
Notes:        <workaround, first build seen, related bugs>
```

## Charter template {#charter-template}

```text
CHARTER:   Explore <area> with <resources / data / user>
           to discover <kind of information or risk>
TIME BOX:  30 | 60 | 90 minutes
TESTER:    <name>          DATE: <date>          BUILD: <build>
NOTES:     <time> <what I did> → <what I saw>
BUGS:      <ids>
ISSUES:    <blocks, questions, things to ask>
COVERAGE:  <what I did / did not get to>
```

## Daily status template {#daily-status-template}

```text
QA status — <date> — build <x.y.z>
✅ Done:     <areas, cases run/planned>
🐞 Bugs:     <new: n (by severity)>, <top one in one line>
⏭️ Next:     <tomorrow's focus>
🚧 Blocked:  <what, who can unblock>
Risk:        LOW | MEDIUM | HIGH — <one line why>
```

## Test summary template {#test-summary-template}

```text
Verdict:       GO | GO WITH RISKS | NO GO — <one sentence why>
Scope:         <features, platforms, builds, dates>
Results:       <cases run / passed / failed / blocked>, <charters done>
Open bugs:     <by severity>; top 3 in one line each
Not tested:    <what, and why>
Risks accepted:<by whom>
Recommendations: <2–4 lines>
```

---

## Which technique? {#which-technique}

| Situation | Technique | Cheat sheet |
|---|---|---|
| A field with a range of valid values | Equivalence partitioning + boundary values | [§10](/cheatsheets/manual-testing#equivalence), [§11](/cheatsheets/manual-testing#boundaries) |
| Several conditions decide an outcome | Decision table | [§12](/cheatsheets/manual-testing#decision-tables) |
| An object moves through states (order, account, ticket) | State transition | [§13](/cheatsheets/manual-testing#state-transitions) |
| A goal that spans several screens | User journey | [§14](/cheatsheets/manual-testing#journeys) |
| Many settings combine (browser × OS × role) | Pairwise | [§15](/cheatsheets/manual-testing#pairwise) |
| New feature, little documentation | Exploratory with charters | [§17](/cheatsheets/manual-testing#exploratory) |
| Limited time, many features | Risk-based testing | [§22](/cheatsheets/manual-testing#risk) |
| Known weak spots, experience | Error guessing | [§16](/cheatsheets/manual-testing#error-guessing) |

## Boundary cheats {#boundary-cheats}

| Rule | Test |
|---|---|
| Range `a`–`b` | `a-1, a, a+1, b-1, b, b+1` |
| Minimum length `n` | `n-1, n` characters |
| Maximum length `n` | `n, n+1` characters (and paste `n+1`) |
| Money | `0, 0.01, max, max+0.01`, negative, 3 decimal places |
| Dates | first/last day of month, 29 Feb (leap and non-leap year), 31 Dec → 1 Jan, time-zone midnight |
| Lists / pages | 0, 1, page size, page size + 1 items |
| Counts / limits | limit - 1, limit, limit + 1 (e.g. "max 3 login attempts") |

## Heuristics {#heuristics}

**SFDIPOT** ("San Francisco Depot", James Bach) — what to look at in a product:

| Letter | Area | Ask |
|---|---|---|
| **S** | Structure | What is it made of? Pages, services, files |
| **F** | Function | What does it do? Every feature and error |
| **D** | Data | What does it process? Inputs, outputs, stored data |
| **I** | Interfaces | How does it connect? UI, APIs, imports/exports |
| **P** | Platform | What does it depend on? Browser, OS, third parties |
| **O** | Operations | How is it really used? Common and rare user paths |
| **T** | Time | What changes over time? Timeouts, dates, concurrency |

**Consistency oracles** (based on Michael Bolton's "FEW HICCUPPS") — a result
is suspicious if it's inconsistent with:

| Consistent with… | Example |
|---|---|
| **History** | It worked in the last build |
| **Image** | The company's brand and tone |
| **Comparable products** | Other shops don't empty the cart on Back |
| **Claims** | The spec, help text, marketing |
| **User expectations** | What a reasonable user would expect |
| **Product** | Other parts of the same product (same price everywhere) |
| **Purpose** | What the feature is for |
| **Statutes & standards** | Laws, accessibility rules |
| **Familiar problems** | Bugs you have seen before |
| **Explainability** | You can explain the behaviour |
| **World** | How things work in real life (no 31 April) |

## Input ideas {#input-ideas}

| Field type | Try |
|---|---|
| Any text | empty, one space, leading/trailing spaces, max length, max+1, emoji 😀, `中文`, `Ñandú`, RTL text `مرحبا` |
| Injection-like | `<script>alert(1)</script>`, `' OR 1=1 --`, `{{7*7}}`, `../../etc/passwd` |
| Name | `O'Brien`, `Anne-Marie`, one letter, 100 letters |
| Email | `a@b.co`, `a+tag@b.com`, `A@B.COM`, missing `@`, two `@`, spaces |
| Phone | with `+91`, spaces, dashes, letters, too short/long |
| Number | 0, -1, 1.5, `1,000`, `1e5`, `007`, very large |
| Date | today, past, far future, 29/02, 31/04, other formats `2026-10-01` vs `01/10/2026` |
| Password | min-1, min, with/without digit or symbol, paste, spaces, very long |
| Postal code | valid, letters, too short/long, other country's format |

---

## Login checklist {#login-checklist}

```text
[ ] Valid credentials → correct landing page
[ ] Wrong password, unknown user → same generic error (no hint which one is wrong)
[ ] Empty username / empty password / both empty → clear error each
[ ] Locked / disabled user → clear error
[ ] Username case and surrounding spaces handled as the spec says
[ ] Password is masked; show/hide toggle works
[ ] Enter key submits
[ ] Too many attempts → lockout or delay
[ ] Session survives refresh; ends on logout; Back after logout doesn't show private pages
[ ] Direct URL to a private page when logged out → redirected to login
[ ] Password manager and paste work
```

## Forms checklist {#forms-checklist}

```text
[ ] Required fields marked; error appears next to the field, in words
[ ] Focus moves to the first error
[ ] Valid data from every partition accepted; boundaries tested
[ ] Data kept after a validation error (user doesn't retype everything)
[ ] Double-click submit → only one record
[ ] Back button after submit → no resubmission
[ ] Tab order follows the visual order; all fields keyboard-reachable
[ ] Labels read by screen readers; autofill works
[ ] Long input doesn't break the layout
```

## Search & lists checklist {#search-checklist}

```text
[ ] Exact match, partial match, no results (helpful message)
[ ] Case, accents, extra spaces, special characters
[ ] Sorting: every option, ties, sort + filter together, sort kept after Back
[ ] Filters combined; clear filters
[ ] Pagination: first, last, empty page, page size + 1 items
[ ] Very long names wrap or truncate cleanly
```

## Cart & checkout checklist {#checkout-checklist}

```text
[ ] Add/remove from list and from cart; badge always correct
[ ] Same price in list, product page, cart and overview
[ ] Total = sum of items + tax (+ shipping − discounts); check the maths yourself
[ ] Empty cart → checkout blocked or handled
[ ] Required details validated; errors clear
[ ] Cancel at each step returns to the right place with the cart intact
[ ] Finish → confirmation; cart emptied; Back doesn't create a second order
[ ] Cart after logout/login, refresh, and in a second tab
```

## File upload checklist {#upload-checklist}

```text
[ ] Allowed types accepted; others rejected with a clear message
[ ] Size limit: just under, at, just over
[ ] Empty (0-byte) file; very long file name; name with spaces and non-English letters
[ ] File renamed to a wrong extension (.exe renamed .jpg)
[ ] Several files at once; drag-and-drop; cancel mid-upload
[ ] Slow network; upload progress shown
```

## Any new screen checklist {#screen-checklist}

```text
[ ] Matches design at phone, tablet and desktop widths
[ ] Every link and button goes where it should
[ ] Loading, empty, error and "lots of data" states
[ ] Keyboard only; visible focus
[ ] No console errors (DevTools → Console)
[ ] Refresh, Back, deep link to this screen
[ ] Text: spelling, truncation, translations
```

---

## Severity scale {#severity-scale}

| Severity | Rule of thumb |
|---|---|
| Blocker | Can't test further / main feature unusable for everyone |
| Critical | Main feature broken or data lost/wrong; no workaround |
| Major | Feature works incorrectly; workaround exists |
| Minor | Small functional or UI issue |
| Trivial | Cosmetic, typo |

## Bug life cycle {#bug-life-cycle}

```text
New → Triaged → In progress → Fixed → Verified → Closed
        │                         │
        ├→ Rejected (not a bug,   └→ Reopened (fix didn't work) → In progress
        │   duplicate, can't reproduce)
        └→ Deferred (fix in a later release)
```

## HTTP status codes {#http-status-codes}

Seen in DevTools → Network while testing:

| Code | Meaning for a tester |
|---|---|
| 200 / 201 / 204 | Success |
| 301 / 302 | Redirect — check it goes to the right place |
| 400 / 422 | Server rejected the input — the UI should show a helpful message |
| 401 / 403 | Not logged in / not allowed |
| 404 | Not found — broken link or wrong id |
| 429 | Too many requests (rate limit) |
| 500 / 502 / 503 | Server error — always a bug report, attach the request |

## DevTools {#devtools}

| Action | Chrome / Edge | Firefox | Safari |
|---|---|---|---|
| Open DevTools | `F12` / `Cmd+Opt+I` | `F12` / `Cmd+Opt+I` | Enable Develop menu, then `Cmd+Opt+I` |
| Console | `Cmd/Ctrl+Opt/Shift+J` | `Cmd/Ctrl+Opt/Shift+K` | `Cmd+Opt+C` |
| Device mode | `Cmd/Ctrl+Shift+M` | `Cmd/Ctrl+Opt/Shift+M` | Develop → Enter Responsive Design Mode |
| Save network log | Network → ⤓ Export HAR | Network → ⚙ Save All As HAR | Network → Export |
| Throttle network | Network → "No throttling" menu | Network → throttling menu | Network → conditions |

## Tools {#tools}

| Need | Tools |
|---|---|
| Test management | TestRail, Zephyr / Xray (Jira), Qase, a spreadsheet to start |
| Bug tracking | Jira, Linear, GitHub Issues, Azure Boards |
| Screenshots & recordings | Built-in OS tools, Loom, Jam.dev (adds console + network logs) |
| Pairwise tables | Microsoft PICT |
| Cross-browser / devices | BrowserStack, Sauce Labs, LambdaTest |
| Test data | Mockaroo, Faker libraries |
| Mind maps for test ideas | XMind, Miro |

**Need more detail?** [Cheat sheet](/cheatsheets/manual-testing) ·
[Best practices](/docs/fundamentals/manual-testing/best-practices) ·
[Learning path](/docs/learning-path/manual-testing/implementation-roadmap) ·
Full guide
