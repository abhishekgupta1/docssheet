---
title: "TestNG Cheat Sheet"
description: "Quick reference for TestNG — annotations, testng.xml, parallel execution, and data providers."
tags: [testng, sdet, cheat-sheet]
hide_table_of_contents: true
---

# TestNG cheatsheet

A one-page reference for TestNG. For listeners/reporting and interview Q&A,
see the [complete guide](/docs/sdet-skills/testng/testng-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/testng/testng-guide">📖 Full guide: TestNG →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Core annotations

```java
@BeforeSuite  void suiteSetup() { ... }
@BeforeClass  void classSetup() { ... }
@BeforeMethod void testSetup() { ... }

@Test(priority = 1)
void login() { ... }

@AfterMethod void teardown() { ... }
```

</div>

<div class="cheat-card">

#### `testng.xml` suite config

```xml
<suite name="Regression">
  <test name="Smoke">
    <classes>
      <class name="tests.LoginTest"/>
    </classes>
  </test>
</suite>
```

```bash
mvn test -DsuiteXmlFile=testng.xml
```

</div>

<div class="cheat-card">

#### Parallel execution

```xml
<suite parallel="methods" thread-count="4">
```

`parallel` can be `methods`, `classes`, `tests`, or `instances` — far more
granular than JUnit 5's config-based parallelism.

</div>

<div class="cheat-card">

#### Data-driven testing

```java
@DataProvider(name = "logins")
public Object[][] logins() {
  return new Object[][] { {"admin", "right"}, {"admin", "wrong"} };
}

@Test(dataProvider = "logins")
void login(String user, String pass) { ... }
```

</div>

<div class="cheat-card">

#### Groups & dependencies

```java
@Test(groups = "smoke")
void quickCheck() { ... }

@Test(dependsOnMethods = "login")
void checkout() { ... }
```

</div>

<div class="cheat-card">

#### Soft vs hard assertions

```java
SoftAssert soft = new SoftAssert();
soft.assertEquals(actual1, expected1);
soft.assertEquals(actual2, expected2);
soft.assertAll();   // reports all failures together, not just the first
```

</div>

<div class="cheat-card">

#### Listeners & reporting

```java
public class RetryListener implements ITestListener {
  public void onTestFailure(ITestResult r) { captureScreenshot(); }
}
```

```xml
<listeners><listener class-name="RetryListener"/></listeners>
```

</div>

<div class="cheat-card">

#### TestNG vs JUnit 5

| | TestNG | JUnit 5 |
|---|---|---|
| Data-driven | `@DataProvider` | `@ParameterizedTest` |
| Parallel | native, granular | config-based |
| Dependencies | `dependsOnMethods` | not built-in |

<span class="cheat-see">See: TestNG vs. JUnit 5</span>

</div>

</div>
