---
title: "Cucumber & BDD: The Complete Guide"
description: "End-to-end reference for Cucumber and BDD — Gherkin syntax, feature files, step definitions, hooks, data tables, and interview-ready Q&A."
sidebar_position: 1
tags: [cucumber, bdd, sdet, gherkin]
---

# Cucumber & BDD — The Complete Guide

A single-read, end-to-end reference for Behavior-Driven Development and
Cucumber: enough to write a feature file that survives a "three amigos"
review, wire up step definitions, or walk into an SDET interview. Organized
as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/cucumber-bdd">📋 Quick reference: Cucumber & BDD →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 260" role="img" aria-labelledby="mm-cucumber-title mm-cucumber-desc">
<title id="mm-cucumber-title">The BDD loop from conversation to executable spec</title>
<desc id="mm-cucumber-desc">The Three Amigos collaborate to write a Gherkin feature file, step definitions bind that plain text to code, execution produces a pass or fail report, and the results feed back into the next round of collaborative refinement.</desc>
<defs>
  <marker id="mm-cucumber-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n5" x="30" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="112" y="120" text-anchor="middle">Three Amigos</text>
<text class="mm-node-sub" x="112" y="137" text-anchor="middle">business + dev + QA</text>
<path class="mm-arrow" d="M195,125 L211,125" marker-end="url(#mm-cucumber-arrow)"/>

<rect class="mm-n2" x="215" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="297" y="120" text-anchor="middle">Feature file</text>
<text class="mm-node-sub" x="297" y="137" text-anchor="middle">Gherkin: Given/When/Then</text>
<path class="mm-arrow" d="M380,125 L396,125" marker-end="url(#mm-cucumber-arrow)"/>

<rect class="mm-n4" x="400" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="482" y="120" text-anchor="middle">Step definitions</text>
<text class="mm-node-sub" x="482" y="137" text-anchor="middle">binds text to code</text>
<path class="mm-arrow" d="M565,125 L581,125" marker-end="url(#mm-cucumber-arrow)"/>

<rect class="mm-n1" x="585" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="667" y="120" text-anchor="middle">Test execution</text>
<text class="mm-node-sub" x="667" y="137" text-anchor="middle">pass / fail report</text>

<path class="mm-arrow" d="M667,160 C620,230 160,230 112,160" marker-end="url(#mm-cucumber-arrow)"/>
<text class="mm-flow-label" x="390" y="225" text-anchor="middle">review and refine together</text>
</svg>

<p class="mental-model__caption">BDD starts as a conversation, not code: the Three Amigos agree on behavior in a Gherkin feature file written in Given/When/Then form, step definitions translate that plain English into executable code, and the resulting pass/fail report feeds back into the next round of collaborative refinement, so the feature file stays living documentation instead of a one-time spec.</p>
</div>

## 1. What BDD Is and the Problem It Solves

**Behavior-Driven Development** is a collaboration practice — not
fundamentally a testing framework — that grew out of Test-Driven
Development. Its core idea: define expected system behavior in a shared,
structured natural language **before** implementation, so business
stakeholders, developers, and testers agree on what "done" means using the
exact same document.

Cucumber is the best-known tool that *executes* BDD specifications written
in **Gherkin** as automated tests — it's the glue between the human-readable
spec and the code that verifies it.

### The "Three Amigos"

The practice of writing scenarios collaboratively with three perspectives in
the room before development starts:

| Role | Brings |
|---|---|
| **Business/Product** | What outcome matters and why (the "why") |
| **Development** | What's technically feasible, edge cases in implementation |
| **Testing/QA** | What could go wrong, missing edge cases, testability concerns |

The output of a Three Amigos session is a set of concrete
**Given/When/Then** examples — this is BDD's real mechanism: replacing vague
requirements ("the login should work correctly") with unambiguous, testable
examples agreed on by all three roles *before* a line of code is written.

### Living documentation

Because feature files are plain text, version-controlled alongside the
code, and directly executable, they function as **living documentation** —
unlike a requirements doc or wiki page, a Gherkin feature file can never
silently drift out of sync with actual system behavior, because a failing
scenario is a build failure.

---

## 2. Gherkin Syntax

Gherkin is BDD's structured, (mostly) natural-language, line-oriented
syntax — parsed by keyword, not free-form English.

```gherkin
Feature: User Login
  As a registered user
  I want to log in with my credentials
  So that I can access my account dashboard

  Background:
    Given the login page is open

  Scenario: Valid credentials grant access
    Given a registered user with username "standard_user" and password "secret_sauce"
    When the user submits the login form
    Then the user should see the dashboard
    And the welcome message should contain "standard_user"

  Scenario: Invalid password is rejected
    Given a registered user with username "standard_user" and password "wrong_pass"
    When the user submits the login form
    Then the user should see an error message "Invalid credentials"
```

### Keyword reference

| Keyword | Purpose |
|---|---|
| `Feature` | Top-level description of the capability under test; free-text narrative below it is documentation only |
| `Background` | Steps run before **every** `Scenario` in the file — shared setup, avoids repeating the same `Given` in each scenario |
| `Scenario` | One concrete example/test case |
| `Given` | Establishes the initial context/state |
| `When` | The action/event under test |
| `Then` | The expected outcome |
| `And` / `But` | Continuation of the previous keyword's type — purely for readability, functionally identical to repeating `Given`/`When`/`Then` |
| `Scenario Outline` + `Examples` | A templated scenario run once per data row (§4) |

Gherkin is intentionally **declarative, not imperative** — it describes
*what* the system does, not *how* the test interacts with the UI. This
distinction is the most common thing separating good Gherkin from bad
Gherkin (§7).

---

## 3. Feature Files & Step Definitions

The feature file is pure Gherkin — no implementation. Each step line is
matched at runtime to a **step definition**: a function whose text pattern
or regex matches the step, containing the actual automation code.

```gherkin
# src/test/resources/features/login.feature
Feature: User Login

  Scenario: Valid credentials grant access
    Given a registered user with username "standard_user" and password "secret_sauce"
    When the user submits the login form
    Then the user should see the dashboard
```

```java
// Cucumber-JVM (Java) — Cucumber Expressions (preferred over regex since Cucumber 4+)
public class LoginSteps {

    private final LoginPage loginPage = new LoginPage(driver);

    @Given("a registered user with username {string} and password {string}")
    public void aRegisteredUser(String username, String password) {
        loginPage.enterCredentials(username, password);
    }

    @When("the user submits the login form")
    public void theUserSubmitsTheLoginForm() {
        loginPage.submit();
    }

    @Then("the user should see the dashboard")
    public void theUserShouldSeeTheDashboard() {
        assertTrue(dashboardPage.isDisplayed());
    }
}
```

```python
# behave (Python) — decorator-based step definitions
from behave import given, when, then

@given('a registered user with username "{username}" and password "{password}"')
def step_enter_credentials(context, username, password):
    context.login_page.enter_credentials(username, password)

@when('the user submits the login form')
def step_submit(context):
    context.login_page.submit()

@then('the user should see the dashboard')
def step_see_dashboard(context):
    assert context.dashboard_page.is_displayed()
```

**Cucumber Expressions** (`{string}`, `{int}`, `{word}`) are the modern
default over raw regex — more readable, and custom parameter types can be
registered for domain objects. Regex (`^a registered user...$`) still works
and is common in older codebases.

### Matching is text-based, not line-number-based

A step's `Given`/`When`/`Then` prefix is **stripped before matching** —
Cucumber matches only the text after the keyword, which is why `And`/`But`
steps reuse whatever step definition matches their text regardless of which
keyword type defined it originally.

---

## 4. Data Tables & Scenario Outlines

### Data tables — structured data within a single scenario

```gherkin
Scenario: Cart total reflects multiple items
  Given the cart contains the following items:
    | name    | price | quantity |
    | Widget  | 9.99  | 2        |
    | Gadget  | 19.99 | 1        |
  When the user views the cart summary
  Then the total should be "39.97"
```

```java
@Given("the cart contains the following items:")
public void theCartContains(io.cucumber.datatable.DataTable table) {
    List<Map<String, String>> rows = table.asMaps();
    for (Map<String, String> row : rows) {
        cart.addItem(row.get("name"), Double.parseDouble(row.get("price")),
                     Integer.parseInt(row.get("quantity")));
    }
}
```

### Scenario Outline + Examples — the same scenario, run per data row

```gherkin
Scenario Outline: Invalid login attempts are rejected
  Given a registered user with username "<username>" and password "<password>"
  When the user submits the login form
  Then the user should see an error message "<error>"

  Examples:
    | username      | password    | error                 |
    | standard_user | wrong_pass  | Invalid credentials   |
    | ""            | secret_sauce| Username is required  |
    | locked_out    | secret_sauce| Account is locked     |
```

Each `Examples` row generates and reports as an **independent scenario** —
the direct Gherkin equivalent of TestNG's `@DataProvider` or JUnit's
`@ParameterizedTest`, expressed in the feature file itself instead of code,
which keeps the data visible to non-programmer reviewers.

---

## 5. Hooks

Hooks run code around scenarios without cluttering the feature file itself
— Cucumber's equivalent of TestNG's `@Before/@AfterMethod` or JUnit's
`@BeforeEach/@AfterEach`.

```java
public class Hooks {

    @Before                                  // before every scenario
    public void setUp() {
        driver = new ChromeDriver();
    }

    @Before("@api")                          // only before scenarios tagged @api
    public void setUpApiClient() {
        apiClient = new ApiClient();
    }

    @After                                   // after every scenario
    public void tearDown(Scenario scenario) {
        if (scenario.isFailed()) {
            byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            scenario.attach(screenshot, "image/png", "failure-screenshot");
        }
        driver.quit();
    }

    @BeforeStep
    public void beforeEachStep() { /* runs before every individual step */ }
}
```

`@Before`/`@After` can be **tag-scoped** (`@Before("@api")`,
`@Before("@ui and not @mobile")`) so setup logic only runs for the
scenarios that actually need it — critical once a suite mixes UI, API, and
mobile scenarios in one project. Execution order across multiple `@Before`
hooks follows declaration order by default, overridable with
`@Before(order = 1)`.

---

## 6. Tags

```gherkin
@smoke @login
Feature: User Login

  @regression
  Scenario: Valid credentials grant access
    ...

  @wip @skip
  Scenario: Password reset flow
    ...
```

```bash
mvn test -Dcucumber.filter.tags="@smoke and not @wip"
```

```java
// JUnit 5 Platform Suite runner
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAG_PROPERTY_NAME, value = "@smoke and not @wip")
public class RunCucumberTest {}
```

Tags apply at both `Feature` and `Scenario` level (a `Feature`-level tag
applies to every `Scenario` inside it) and support boolean expressions
(`and`, `or`, `not`) for precise CI filtering — same purpose as TestNG
groups or JUnit `@Tag`, but visible directly in the spec that
non-programmers read.

---

## 7. Cucumber-JVM vs. Other Implementations

| Implementation | Language | Notes |
|---|---|---|
| **Cucumber-JVM** | Java, Kotlin, Scala | The reference/most mature implementation; integrates with JUnit 5 (Platform Suite) or TestNG as the runner |
| **behave** | Python | Similar Gherkin support, Python-idiomatic step definitions via decorators |
| **SpecFlow / Reqnroll** | .NET/C# | SpecFlow is now community-maintained as **Reqnroll** after SpecFlow's commercial sunset — same Gherkin model |
| **Cucumber.js** | JavaScript/TypeScript | Node-based, integrates with Playwright/WebdriverIO |
| **Godog** | Go | Gherkin support for Go projects |

All implementations share the same Gherkin parser/spec (feature files are
portable across languages) — only the step definition binding syntax and
runner integration differ.

### Cucumber-JVM runner setup (JUnit 5 Platform)

```java
import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.company.steps")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME,
        value = "pretty, html:target/cucumber-report.html, json:target/cucumber.json")
public class RunCucumberTest {}
```

- **`glue`** points Cucumber at the package(s) containing step definitions
  and hooks.
- **Plugins** (`pretty`, `html`, `json`, `junit`) control report output —
  `html` produces a browsable report; `json` feeds tools like Allure or
  custom CI dashboards.

---

## 8. Common Anti-Patterns

### Imperative steps (bad) vs. declarative steps (good)

```gherkin
# Imperative — describes UI mechanics, brittle, unreadable to non-programmers
Scenario: Login
  Given the user navigates to "/login"
  When the user types "standard_user" into the field with id "username"
  And the user types "secret_sauce" into the field with id "password"
  And the user clicks the element with id "login-button"
  Then the text "Dashboard" should be visible on the page

# Declarative — describes intent/behavior, resilient to UI changes
Scenario: Login
  Given a registered user
  When the user logs in with valid credentials
  Then the user should see the dashboard
```

Imperative steps couple the spec to implementation details (a CSS ID
change breaks the *feature file*, not just a page object) and defeat BDD's
purpose — a non-programmer can't review "clicks the element with id
login-button" as a business requirement. Push the "how" into the step
definition/page object; keep the feature file describing "what" and "why."

### Other common anti-patterns

| Anti-pattern | Why it hurts |
|---|---|
| **Feature files written solo by QA, never reviewed by the team** | Defeats the entire collaboration premise of BDD — becomes just "Gherkin as a test DSL," losing the living-documentation value |
| **One giant `Scenario` covering an entire user journey** | Hard to pinpoint failures, hard to reuse steps; prefer small, focused scenarios per behavior |
| **Step definitions with business logic/assertions duplicated across files** | Same discipline problem as any codebase — extract shared logic, use page objects/helper classes behind step defs |
| **Over-parameptrizing every noun into `Scenario Outline`** | Reduces readability for cases where only 1-2 concrete examples are needed; reserve outlines for genuinely repetitive variations |
| **Using `Background` for something only half the scenarios need** | Forces unnecessary setup cost/noise on scenarios that don't need it — keep `Background` truly universal to the feature |
| **Treating Cucumber as "just a test framework"** | Misses the point — if scenarios aren't written collaboratively pre-development, you've lost BDD's core value and kept only its syntax overhead |

---

## 9. Interview-Ready Q&A

**Q: What problem does BDD actually solve, distinct from just "testing with Gherkin"?**
A: BDD is a collaboration practice for establishing shared understanding of
requirements *before* development, using concrete Given/When/Then examples
agreed on by business, dev, and QA together (the "Three Amigos"). Cucumber
executing Gherkin as automated tests is a consequence of that practice, not
its point — a team that writes Gherkin solo in QA after the fact and calls
it "BDD" has kept the syntax but lost the actual value: shared understanding
and living documentation.

**Q: What's the difference between imperative and declarative Gherkin steps, and why does it matter?**
A: Imperative steps describe UI mechanics ("click the element with id
login-button"); declarative steps describe intent ("the user logs in with
valid credentials"). Imperative steps couple the spec to implementation
details, so a CSS/DOM change breaks the feature file itself, and they're
unreadable as a business requirement to non-programmers — defeating BDD's
purpose. Declarative steps push the "how" into step definitions/page
objects and keep the feature file describing "what" and "why."

**Q: How does `Background` differ from a `@Before` hook?**
A: `Background` is Gherkin syntax living inside the feature file — steps
that run before every `Scenario` in that file, visible to anyone reading the
spec. A `@Before` hook is code-level setup (driver initialization, test data
seeding) invisible in the feature file itself. Use `Background` for
business-meaningful shared context worth stating explicitly in the spec; use
hooks for technical/infrastructure setup that isn't part of the behavior
being described.

**Q: How would you run only smoke tests from a large Cucumber suite in CI?**
A: Tag the relevant `Feature`s or `Scenario`s with `@smoke`, then filter at
runtime with a tag expression — `-Dcucumber.filter.tags="@smoke and not
@wip"` via Maven, or the equivalent `ConfigurationParameter` on the JUnit
Platform Suite runner. Tag expressions support boolean logic (`and`, `or`,
`not`), so CI stages can compose precise subsets without maintaining
separate feature files.

**Q: Explain `Scenario Outline` and when you'd reach for it.**
A: It's a templated scenario with placeholders (`<username>`) filled in by
each row of an `Examples` table, and each row runs and reports as an
independent scenario. Use it when you have genuinely repetitive variations
of the same behavior (multiple invalid-login combinations, boundary values)
— it keeps the data visible in the spec itself, which matters for
non-programmer reviewers, unlike hiding equivalent data in a code-level data
provider.

**Q: What's the risk of writing one giant end-to-end `Scenario` instead of several focused ones?**
A: A failure anywhere in a long scenario makes it hard to pinpoint what
actually broke, since Cucumber reports failure at the scenario level; it
also discourages step reuse across scenarios and makes the spec harder for
reviewers to read as a discrete behavior. Prefer small, focused scenarios,
each verifying one behavior, composed from reusable steps.

**Q: How does Cucumber-JVM integrate with JUnit 5 or TestNG as a runner?**
A: Cucumber itself parses feature files and matches steps via its own
engine; JUnit 5's Platform Suite API (`@IncludeEngines("cucumber")`,
`@SelectClasspathResource`) or a TestNG-based runner acts as the entry point
that build tools (Maven Surefire, Gradle) actually invoke, letting Cucumber
scenarios show up in the same reports and CI tooling as regular
JUnit/TestNG tests.

**Q: A step definition text doesn't match its Gherkin step — what typically causes that, and how do you debug it?**
A: Usually a mismatch between the Cucumber Expression/regex pattern and the
literal step text (a typo, an extra/missing quoted argument, or a parameter
type mismatch like expecting `{int}` where the value has quotes). Cucumber's
"undefined step" output at runtime actually prints a suggested step
definition snippet matching the exact text — the fastest way to spot the
mismatch is comparing that generated snippet against your real step
definition's pattern.

---

## 10. One-Line Summary

**Cucumber's real value is upstream of the code — Gherkin scenarios written
collaboratively by business, dev, and QA before implementation create living
documentation that stays true by construction; keep steps declarative,
reserve `Scenario Outline` for genuine data variation, and treat Cucumber as
a collaboration practice with a test runner attached, not a test runner
with a natural-language decorator.**
