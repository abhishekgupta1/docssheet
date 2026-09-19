---
title: "Robot Framework Cheat Sheet"
description: "Quick reference for Robot Framework — suite structure, built-in libraries, keywords, and data-driven testing."
tags: [robot-framework, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Robot Framework cheatsheet

A one-page reference for Robot Framework. For reporting and framework
comparisons, see the [complete guide](/docs/sdet-skills/robot-framework/robot-framework-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/robot-framework/robot-framework-guide">📖 Full guide: Robot Framework →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Suite file structure

```robot
*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    https://example.com

*** Test Cases ***
Valid Login
    Open Browser    ${URL}    chrome
    Input Text      id:username    abhishek
    Click Button    Sign in
    Page Should Contain    Welcome
```

</div>

<div class="cheat-card">

#### Built-in libraries

| Library | Use |
|---|---|
| SeleniumLibrary | web UI |
| RequestsLibrary | API testing |
| Collections | list/dict helpers |
| OperatingSystem | files, env vars |

</div>

<div class="cheat-card">

#### Custom keywords

```robot
*** Keywords ***
Login As
    [Arguments]    ${user}    ${pass}
    Input Text      id:username    ${user}
    Input Text      id:password    ${pass}
    Click Button    Sign in
```

Reusable, human-readable — the keyword-driven equivalent of a Page Object method.

</div>

<div class="cheat-card">

#### Data-driven testing

```robot
*** Test Cases ***
Login Attempts
    [Template]    Try Login
    admin    right    success
    admin    wrong    error
```

</div>

<div class="cheat-card">

#### Tags

```robot
*** Test Cases ***
Smoke Test
    [Tags]    smoke    critical
```

```bash
robot --include smoke tests/
```

</div>

<div class="cheat-card">

#### Reporting

```bash
robot --outputdir results tests/
```

Generates `log.html` (step-by-step trace) and `report.html` (pass/fail summary) automatically — no extra plugin needed.

</div>

<div class="cheat-card">

#### When to choose Robot Framework

- Team includes non-programmers who need to read/write test cases.
- Keyword-driven style matters more than raw language flexibility.
- Not ideal when tests need heavy custom logic — code-first frameworks (Selenium/Playwright + Java/Python) scale better there.

<span class="cheat-see">See: When to Choose Robot Framework Over a Code-First Framework</span>

</div>

</div>
