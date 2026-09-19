---
title: "Robot Framework: The Complete Guide"
description: "End-to-end reference for Robot Framework — keyword-driven testing, .robot suite structure, built-in libraries, custom keywords, and interview-ready Q&A."
sidebar_position: 1
tags: [robot-framework, sdet, automation, bdd]
---

# Robot Framework — The Complete Guide

A single-read, end-to-end reference for Robot Framework: enough to write a
keyword-driven test suite from scratch, wire up custom keywords in Python,
or walk into an SDET interview. Organized as a lookup you can also read
top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/robot-framework">📋 Quick reference: Robot Framework →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-robot-title mm-robot-desc">
<title id="mm-robot-title">How Robot Framework resolves keywords into a test case</title>
<desc id="mm-robot-desc">A test case is a plain-text sequence of keywords; those keyword names are resolved against whichever libraries are imported, such as built-in keywords, a UI library, or custom Python keywords.</desc>
<defs>
  <marker id="mm-robot-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="20" y="20" width="200" height="60" rx="10"/>
<text class="mm-node-title" x="120" y="47" text-anchor="middle">BuiltIn library</text>
<text class="mm-node-sub" x="120" y="63" text-anchor="middle">core keywords</text>

<rect class="mm-n2" x="290" y="20" width="200" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="47" text-anchor="middle">UI library</text>
<text class="mm-node-sub" x="390" y="63" text-anchor="middle">SeleniumLibrary / Browser</text>

<rect class="mm-n4" x="560" y="20" width="200" height="60" rx="10"/>
<text class="mm-node-title" x="660" y="47" text-anchor="middle">Custom keywords</text>
<text class="mm-node-sub" x="660" y="63" text-anchor="middle">your own Python @keyword</text>

<path class="mm-arrow" d="M120,80 L340,130" marker-end="url(#mm-robot-arrow)"/>
<path class="mm-arrow" d="M390,80 L390,130" marker-end="url(#mm-robot-arrow)"/>
<path class="mm-arrow" d="M660,80 L440,130" marker-end="url(#mm-robot-arrow)"/>

<rect class="mm-n5" x="290" y="130" width="200" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="157" text-anchor="middle">Keyword layer</text>
<text class="mm-node-sub" x="390" y="173" text-anchor="middle">resolves keyword names</text>

<path class="mm-arrow" d="M390,190 L390,220" marker-end="url(#mm-robot-arrow)"/>

<rect class="mm-n6" x="290" y="220" width="200" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="247" text-anchor="middle">Test case (.robot)</text>
<text class="mm-node-sub" x="390" y="263" text-anchor="middle">plain-text keyword steps</text>
</svg>

<p class="mental-model__caption">Robot Framework test cases don't call code directly — they call keyword names, and the framework resolves each one against whatever libraries are imported: built-in keywords, a UI automation library like SeleniumLibrary or Browser, or custom keywords written in Python, so a test case reads as plain instructions a non-programmer could follow and even write.</p>
</div>

## 1. What Robot Framework Is and Why It Exists

Robot Framework is a **generic, open-source, keyword-driven test automation
framework** built on Python. It's not tied to any one testing type — the
same engine drives UI automation, API testing, RPA (robotic process
automation), and acceptance testing, differentiated only by which
**library** of keywords you import.

Its defining idea is **keyword-driven testing**: test cases are written as
plain-text (or tabular) sequences of human-readable keywords, not
programming-language code. A test reads like an instruction sheet a
non-programmer could follow — and, critically, could also **write**,
lowering the barrier for manual QA and business stakeholders to contribute
or review automated tests directly.

```robotframework
*** Test Cases ***
Valid Login Shows Dashboard
    Open Browser    https://example.com/login    chrome
    Input Text      id:username    standard_user
    Input Text      id:password    secret_sauce
    Click Button    id:login-button
    Page Should Contain    Dashboard
    [Teardown]    Close Browser
```

Every line above is a **keyword** — either built into a library
(`Open Browser`, `Input Text`) or user-defined by composing other keywords
(§5). This is the core abstraction the entire framework is built on.

```bash
pip install robotframework
```

---

## 2. Test Suite File Structure (`.robot` / `.resource`)

A `.robot` file is organized into named sections, each starting with
`*** Section Name ***`. Whitespace (2+ spaces or a tab) — not commas or
brackets — separates cells; this pipe-free, whitespace-delimited format is
Robot's signature syntax.

```robotframework
*** Settings ***
Documentation     Login and checkout flow smoke suite.
Library           SeleniumLibrary
Library           RequestsLibrary
Resource          resources/common_keywords.resource
Suite Setup       Open Browser To Login Page
Suite Teardown    Close All Browsers
Test Setup        Go To Login Page
Test Teardown     Capture Page Screenshot
Test Timeout      2 minutes

*** Variables ***
${BASE_URL}       https://example.com
${BROWSER}        chrome
${VALID_USER}     standard_user
&{DEFAULT_ITEM}   name=Widget    price=9.99

*** Test Cases ***
Valid Login Succeeds
    [Documentation]    Verifies a valid user reaches the dashboard.
    [Tags]    smoke    login
    Input Credentials    ${VALID_USER}    secret_sauce
    Click Button    id:login-button
    Page Should Contain    Dashboard

*** Keywords ***
Input Credentials
    [Arguments]    ${username}    ${password}
    Input Text      id:username    ${username}
    Input Text      id:password    ${password}
```

| Section | Purpose |
|---|---|
| `*** Settings ***` | Imports (libraries, resource files), suite/test-level setup & teardown, metadata, tags |
| `*** Variables ***` | Scalars (`${x}`), lists (`@{x}`), dictionaries (`&{x}`) usable throughout the suite |
| `*** Test Cases ***` | The actual tests — each a named sequence of keyword calls |
| `*** Keywords ***` | User-defined keywords local to this file (see §5) |
| `*** Comments ***` | Free-text notes, ignored at execution |

### Variable types

| Syntax | Type | Example |
|---|---|---|
| `${scalar}` | Single value (string, number, object) | `${BASE_URL}` |
| `@{list}` | List | `@{BROWSERS}    chrome    firefox` |
| `&{dict}` | Dictionary | `&{USER}    name=Alice    age=30` |

### `.resource` files — sharing keywords/variables across suites

Common keywords, variables, and library imports live in a `.resource` file
(same section syntax, no `*** Test Cases ***`) and get pulled in via
`Resource` in `*** Settings ***` — the standard way to avoid duplicating
login/setup logic across every suite file.

---

## 3. Built-In Libraries

Robot Framework ships a **BuiltIn** library (always available, no import
needed — `Log`, `Should Be Equal`, `Sleep`, `Run Keyword If`) plus a
standard library set, and the ecosystem adds domain-specific libraries on
top.

| Library | Domain | Notes |
|---|---|---|
| **BuiltIn** | Core keywords (logging, control flow, generic assertions) | Always available, no import |
| **SeleniumLibrary** | Web UI automation | The long-standing standard; wraps Selenium WebDriver |
| **Browser** (`robotframework-browser`) | Web UI automation | Newer, built on Playwright — faster, auto-waiting, better modern JS app support; increasingly preferred over SeleniumLibrary for new projects |
| **RequestsLibrary** | HTTP/API testing | Wraps Python `requests`; `GET On Session`, `POST On Session`, JSON assertions |
| **Collections** | Lists/dicts manipulation | `Append To List`, `Get From Dictionary`, `Lists Should Be Equal` |
| **OperatingSystem** | File system, env vars | `Create File`, `Remove Directory`, `Get Environment Variable` |
| **DatabaseLibrary** | SQL databases | `Connect To Database`, `Execute SQL String`, `Check If Exists In Database` |
| **AppiumLibrary** | Mobile automation | Appium wrapper, same keyword-driven model extended to mobile |

```robotframework
*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Test Cases ***
Get User Returns Correct Fields
    Create Session    api    https://api.example.com
    ${response}=    GET On Session    api    /users/1
    Should Be Equal As Strings    ${response.status_code}    200
    ${body}=    Set Variable    ${response.json()}
    Should Be Equal    ${body}[name]    Leanne Graham
```

### SeleniumLibrary vs. Browser library

```robotframework
# SeleniumLibrary
Open Browser    ${BASE_URL}    ${BROWSER}
Wait Until Element Is Visible    id:submit-button
Click Element    id:submit-button

# Browser library (Playwright-based)
New Browser    chromium    headless=False
New Page       ${BASE_URL}
Click          id=submit-button    # auto-waits, no explicit Wait Until needed
```

The Browser library's auto-waiting (inherited from Playwright) eliminates
most of the explicit-wait boilerplate SeleniumLibrary suites accumulate —
the same trade-off as choosing Playwright over raw Selenium at the code
level, just expressed through Robot's keyword layer.

---

## 4. Data-Driven Testing

### Test Template — one keyword, many data rows

```robotframework
*** Settings ***
Test Template    Login Should Fail With Invalid Credentials

*** Test Cases ***                 USERNAME       PASSWORD
Empty Username                     ${EMPTY}       secret_sauce
Empty Password                     standard_user  ${EMPTY}
Wrong Password                     standard_user  wrong_pass
Locked Out User                    locked_out_user secret_sauce

*** Keywords ***
Login Should Fail With Invalid Credentials
    [Arguments]    ${username}    ${password}
    Input Text      id:username    ${username}
    Input Text      id:password    ${password}
    Click Button    id:login-button
    Page Should Contain    Epic sadface
```

Each row under `*** Test Cases ***` becomes its own reported test case,
executed against the templated keyword — Robot's direct equivalent of
TestNG's `@DataProvider` or JUnit's `@ParameterizedTest`, expressed as
tabular data instead of code.

### `FOR` loops within a single test

```robotframework
*** Test Cases ***
Add Multiple Items To Cart
    FOR    ${item}    IN    @{CART_ITEMS}
        Add Item To Cart    ${item}
    END
```

### External data sources

`RequestsLibrary` combined with `OperatingSystem`/`Collections` reads JSON
fixtures directly; for large tabular data, teams typically pull rows via
`DatabaseLibrary` or a custom Python keyword that reads a CSV/Excel file and
returns a list Robot can `FOR`-loop over.

---

## 5. Custom Keywords

### User keywords (in `.robot`/`.resource` files)

Built by composing existing keywords — no programming language required:

```robotframework
*** Keywords ***
Add Item To Cart
    [Documentation]    Adds a named item to the cart and verifies the count increments.
    [Arguments]    ${item_name}
    ${count_before}=    Get Cart Item Count
    Click Element    xpath://div[text()="${item_name}"]//button[@class="add-to-cart"]
    Wait Until Element Is Visible    id:cart-count
    ${count_after}=    Get Cart Item Count
    Should Be Equal As Numbers    ${count_after}    ${count_before + 1}

Get Cart Item Count
    [Documentation]    Returns the current cart badge count as an integer.
    ${text}=    Get Text    id:cart-count
    RETURN    ${text}
```

`[Arguments]` declares parameters; `RETURN` (Robot 5+; earlier versions used
`[Return]`) sends a value back to the caller.

### Custom keywords in Python (library keywords)

For logic too complex for keyword composition — custom assertions, API
calls, data transformation — write a Python library:

```python
# CartUtils.py
from robot.api.deco import keyword, library

@library
class CartUtils:

    @keyword("Calculate Expected Total")
    def calculate_expected_total(self, items, tax_rate=0.08):
        subtotal = sum(item["price"] * item["qty"] for item in items)
        return round(subtotal * (1 + tax_rate), 2)
```

```robotframework
*** Settings ***
Library    CartUtils.py

*** Test Cases ***
Cart Total Matches Expected Calculation
    ${expected}=    Calculate Expected Total    ${CART_ITEMS}
    Should Be Equal As Numbers    ${actual_total}    ${expected}
```

**Rule of thumb:** if it's sequencing/orchestrating existing actions, write
a `.robot` user keyword — QA engineers without Python experience can read
and maintain it. If it's genuine logic (math, parsing, API calls not
covered by an existing library), write a Python keyword library.

---

## 6. Tags

```robotframework
*** Test Cases ***
Checkout Completes Successfully
    [Tags]    smoke    regression    checkout
    ...
```

```bash
robot --include smoke tests/
robot --exclude flaky tests/
robot --include smokeANDcheckout tests/     # AND/OR/NOT combinators
```

Tags can also be applied suite-wide (`Force Tags` in `*** Settings ***`,
now `Test Tags` in Robot 6+) so every test in a file inherits a common tag
(e.g., the feature area) without repeating it per test — same purpose as
TestNG groups or JUnit `@Tag`, but resolved at execution time via CLI flags
rather than build-tool config.

---

## 7. Reporting: `log.html` and `report.html`

Every `robot` run produces three artifacts by default, with zero extra
configuration:

| File | Contents |
|---|---|
| `output.xml` | Raw machine-readable execution results — input for merging (`rebot`), CI parsing, or custom reporting |
| `log.html` | Detailed, drill-down execution log — every keyword call, its arguments, screenshots, and timing, nested by test/suite |
| `report.html` | High-level summary — pass/fail counts, tag statistics, suite breakdown |

```bash
robot --outputdir results --include smoke tests/
rebot --merge results/output1.xml results/output2.xml   # merge reruns/parallel shards into one report
```

`log.html`'s keyword-by-keyword drill-down (including embedded screenshots
on UI failures, auto-captured by SeleniumLibrary/Browser on error) is one of
Robot's strongest practical advantages — a failing test's log is usually
self-explanatory without re-running it locally.

### Parallel execution: `pabot`

Robot Framework itself runs suites sequentially; the community tool
**Pabot** (`pabot`) parallelizes execution across suites/tests and merges
results back into one report:

```bash
pabot --processes 4 --outputdir results tests/
```

---

## 8. When to Choose Robot Framework Over a Code-First Framework

| Choose Robot Framework when... | Choose a code-first framework (pytest/TestNG/Playwright) when... |
|---|---|
| Manual QA / non-programmers need to read, write, or review tests | The team is entirely engineers comfortable in a general-purpose language |
| Business stakeholders want living, readable acceptance criteria | Test logic is complex — heavy branching, data transformation, custom assertions |
| You need one framework spanning UI + API + RPA + mobile with a consistent syntax | You need tight IDE tooling, refactoring support, and full language ecosystem (generics, strong typing, package management) |
| Built-in reporting (`log.html`) with zero setup is a priority | You already have a code-first testing culture and CI pipeline standardized on it |
| RPA-adjacent automation, not just testing, is in scope | Performance/scale of the test suite itself becomes a concern — Robot's plain-text parsing has more overhead per keyword call than direct code |

Robot Framework's biggest trade-off is the inverse of its biggest strength:
readability for non-programmers comes at the cost of some expressiveness
and tooling maturity (refactoring, debugging, type-checking) compared to
writing tests directly in Python/Java/TypeScript.

---

## 9. Interview-Ready Q&A

**Q: What does "keyword-driven testing" mean, and why does Robot Framework use it?**
A: Test cases are written as sequences of human-readable keywords (either
library-provided or user-composed) rather than programming-language
statements — a test reads like a step-by-step instruction sheet. Robot
Framework uses this so manual QA engineers and even business stakeholders
can read, write, and review automated tests without needing to know Python,
which lowers the collaboration barrier compared to a purely code-first
framework.

**Q: Walk me through the sections of a `.robot` file.**
A: `*** Settings ***` handles imports (libraries, resource files) and
suite/test-level setup, teardown, and tags. `*** Variables ***` declares
scalars, lists, and dictionaries used throughout the suite. `*** Test
Cases ***` contains the actual tests as keyword sequences. `*** Keywords
***` defines reusable, file-local user keywords built by composing other
keywords. Shared keywords/variables across multiple suites live in a
`.resource` file instead, imported via `Resource`.

**Q: How would you data-drive the same test logic across many input combinations?**
A: Use `Test Template` in `*** Settings ***` to point at a keyword, then
list each data row as its own named test case under `*** Test Cases ***`
with column values — each row runs and reports as an independent test. This
is Robot's equivalent of TestNG's `@DataProvider` or JUnit's
`@ParameterizedTest`, just expressed as tabular data rather than code.

**Q: When would you write a custom keyword in `.robot` syntax versus in Python?**
A: Write a `.robot` user keyword when you're just sequencing/composing
existing keywords — it stays readable and maintainable by non-programmers.
Drop to a Python library keyword (`@keyword` decorator) when the logic is
genuinely computational — custom calculations, complex assertions, API
calls not covered by an existing library — since that logic doesn't
naturally decompose into existing keyword calls.

**Q: SeleniumLibrary vs. the newer Browser library — what's the practical difference?**
A: SeleniumLibrary wraps Selenium WebDriver and is the long-established
standard, but inherits Selenium's need for explicit waits in many
situations. The Browser library wraps Playwright and inherits its
auto-waiting behavior, generally faster execution, and better handling of
modern JS-heavy applications — fewer flaky waits to hand-write. Browser is
increasingly the default choice for new Robot Framework UI projects.

**Q: How does Robot Framework's reporting work out of the box?**
A: Every run produces `output.xml` (raw results for tooling/CI/merging),
`log.html` (a detailed, drill-down keyword-by-keyword execution log with
embedded failure screenshots), and `report.html` (a high-level pass/fail
summary with tag statistics) — all with zero extra configuration. `log.html`
in particular usually makes a failure self-explanatory without needing to
rerun the test locally.

**Q: Robot Framework runs suites sequentially by default — how do you parallelize?**
A: Use the community tool Pabot (`pabot --processes N`), which splits
suites/tests across processes and merges the resulting output files back
into a single combined report. Robot's core engine has no native
parallelism, unlike TestNG or JUnit 5's built-in options — parallelism is an
ecosystem add-on, not a framework feature.

**Q: When would you steer a team away from Robot Framework toward a code-first
framework like pytest or Playwright/TypeScript?**
A: When the team is all engineers with no need for non-programmer
readability, when test logic involves heavy branching or data
transformation that's awkward to express in keyword composition, or when
tight IDE tooling (refactoring, type-checking, debugging) matters more than
plain-text readability. Robot's strength — accessibility to non-programmers
— is also its cost: less expressive and less tooling-mature than writing
tests directly in a general-purpose language.

---

## 10. One-Line Summary

**Robot Framework trades some of the expressiveness and tooling maturity
of code-first frameworks for keyword-driven readability that non-programmers
can write and review — pick it when collaboration across QA/business
stakeholders matters more than raw engineering flexibility, and pair
built-in libraries (SeleniumLibrary/Browser, RequestsLibrary) with custom
Python keywords for anything genuinely computational.**
