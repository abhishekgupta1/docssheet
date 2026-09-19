---
title: "Cucumber & BDD Cheat Sheet"
description: "Quick reference for Cucumber and BDD — Gherkin syntax, step definitions, hooks, tags, and data tables."
tags: [cucumber, bdd, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Cucumber & BDD cheatsheet

A one-page reference for Cucumber/BDD. For the full walkthrough and
anti-patterns, see the [complete guide](/docs/sdet-skills/cucumber-bdd/cucumber-bdd-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/cucumber-bdd/cucumber-bdd-guide">📖 Full guide: Cucumber & BDD →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Gherkin syntax

```gherkin
Feature: Login
  Scenario: Valid credentials
    Given I am on the login page
    When I enter valid credentials
    And I click "Sign in"
    Then I should see the dashboard
```

</div>

<div class="cheat-card">

#### Step definitions

```java
@Given("I am on the login page")
public void onLoginPage() {
    driver.get("/login");
}

@When("I enter valid credentials")
public void enterValidCreds() {
    loginPage.login("abhishek", "secret123");
}
```

</div>

<div class="cheat-card">

#### Data tables

```gherkin
Scenario: Create multiple users
  Given the following users exist:
    | name  | role  |
    | Alice | admin |
    | Bob   | user  |
```

```java
@Given("the following users exist:")
public void createUsers(DataTable table) {
    List<Map<String,String>> rows = table.asMaps();
}
```

</div>

<div class="cheat-card">

#### Scenario Outline

```gherkin
Scenario Outline: Login attempts
  When I login as "<user>" with "<pass>"
  Then I see "<result>"

  Examples:
    | user  | pass   | result  |
    | admin | right  | success |
    | admin | wrong  | error   |
```

</div>

<div class="cheat-card">

#### Hooks

```java
@Before
public void setup() { driver = new ChromeDriver(); }

@After
public void teardown(Scenario s) {
    if (s.isFailed()) captureScreenshot();
    driver.quit();
}
```

`@Before("@tag")` / `@After("@tag")` scope hooks to tagged scenarios only.

</div>

<div class="cheat-card">

#### Tags

```gherkin
@smoke @regression
Scenario: Critical path
```

```bash
mvn test -Dcucumber.filter.tags="@smoke and not @wip"
```

</div>

<div class="cheat-card">

#### Common anti-patterns

- Imperative steps ("click button at x,y") instead of declarative ("I log in") — couples feature files to UI details.
- One giant step definition class instead of composable, reusable steps.
- Using Gherkin for pure technical/unit tests — BDD's value is business-readable specs, not a syntax tax on every test.

<span class="cheat-see">See: Common Anti-Patterns</span>

</div>

</div>
