---
title: "TestNG: The Complete Guide"
description: "End-to-end reference for TestNG — annotations, testng.xml suite configuration, parallel execution, data providers, and interview-ready Q&A."
sidebar_position: 1
tags: [testng, sdet, java, testing-framework]
---

# TestNG — The Complete Guide

A single-read, end-to-end reference for TestNG: enough to wire up a Java test
suite from scratch, configure parallel/cross-browser execution, or walk into
an SDET interview. Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/testng">📋 Quick reference: TestNG →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-testng-title mm-testng-desc">
<title id="mm-testng-title">TestNG's nested execution order</title>
<desc id="mm-testng-desc">Suite, test, class, and method-level setup/teardown annotations nest inside one another, outermost to innermost, wrapping the actual @Test methods at the center.</desc>

<rect class="mm-n1" x="20" y="20" width="740" height="260" rx="12"/>
<text class="mm-node-title" x="390" y="42" text-anchor="middle">@BeforeSuite / @AfterSuite</text>

<rect class="mm-n4" x="50" y="50" width="680" height="200" rx="12"/>
<text class="mm-node-title" x="390" y="72" text-anchor="middle">@BeforeTest / @AfterTest</text>

<rect class="mm-n2" x="80" y="80" width="620" height="140" rx="12"/>
<text class="mm-node-title" x="390" y="102" text-anchor="middle">@BeforeClass / @AfterClass</text>

<rect class="mm-n3" x="110" y="110" width="560" height="80" rx="12"/>
<text class="mm-node-title" x="390" y="140" text-anchor="middle">@BeforeMethod →</text>
<text class="mm-node-sub" x="390" y="158" text-anchor="middle">@Test → @AfterMethod</text>
</svg>

<p class="mental-model__caption">TestNG's annotations aren't a flat list — they nest like Russian dolls: suite-level setup wraps test-level setup, which wraps class-level setup, which wraps the actual @Test method run, and each layer tears back down in reverse order once its inner layer finishes.</p>
</div>

## 1. What TestNG Is and Why It Exists

TestNG ("Testing, Next Generation") is a Java testing framework inspired by
JUnit and NUnit but built to remove their early limitations — it was the
first mainstream Java framework with built-in **annotations**, **flexible
test configuration**, **parallel execution**, **data-driven testing**, and
**dependency-aware test ordering**, all without external add-ons.

It's the dominant framework in the **Selenium/Java SDET** ecosystem
specifically because of features JUnit historically lacked: native
parallelism, suite-level XML configuration, and first-class support for
grouping and ordering tests that model real-world test suite needs (smoke →
regression → sanity, or "skip dependents if setup fails").

```xml
<!-- Minimal Maven dependency -->
<dependency>
    <groupId>org.testng</groupId>
    <artifactId>testng</artifactId>
    <version>7.10.2</version>
    <scope>test</scope>
</dependency>
```

---

## 2. Core Annotations

```java
import org.testng.annotations.*;

public class OrderServiceTest {

    @BeforeSuite
    public void beforeSuite() { /* runs once, before any test in the <suite> */ }

    @BeforeTest
    public void beforeTest() { /* once per <test> tag in testng.xml */ }

    @BeforeClass
    public void beforeClass() { /* once per test class, before its first @Test */ }

    @BeforeMethod
    public void beforeMethod() { /* before EVERY @Test method in this class */ }

    @Test
    public void orderTotalsAreCorrect() {
        // the actual test
    }

    @AfterMethod
    public void afterMethod() { /* after every @Test — good place to screenshot on failure */ }

    @AfterClass
    public void afterClass() { /* once per class, after its last @Test */ }

    @AfterTest
    public void afterTest() { /* once per <test> tag */ }

    @AfterSuite
    public void afterSuite() { /* once, after everything — teardown shared resources */ }
}
```

### Execution order (outermost to innermost)

```
@BeforeSuite
  @BeforeTest
    @BeforeClass
      @BeforeMethod → @Test → @AfterMethod   (repeats per @Test)
    @AfterClass
  @AfterTest
@AfterSuite
```

This nesting is the single most-tested TestNG concept — know it cold. It
maps directly onto `testng.xml`'s `<suite> → <test> → <class> → <methods>`
hierarchy: a `@BeforeTest` fires once per `<test>` block, not once per class
inside it.

### `@Test` attributes worth knowing

| Attribute | Purpose |
|---|---|
| `enabled = false` | Skip this test without deleting it |
| `priority = 1` | Lower runs first (default `0`); ties run in declaration order |
| `timeOut = 5000` | Fail the test if it exceeds 5000ms |
| `expectedExceptions = {NullPointerException.class}` | Test passes only if this exception is thrown |
| `invocationCount = 5` | Run this test method 5 times |
| `dependsOnMethods = {"login"}` | Run only after `login()` passes (see §6) |
| `groups = {"smoke", "regression"}` | Tag for selective execution (see §6) |

```java
@Test(priority = 1, timeOut = 3000, expectedExceptions = IllegalArgumentException.class)
public void rejectsNegativeQuantity() {
    orderService.createOrder(-1);
}
```

---

## 3. `testng.xml` — Suite Configuration

`testng.xml` is TestNG's suite-level configuration file — it decides *what*
runs, *in what order*, *how parallel*, and *with what parameters*, entirely
outside the Java code.

```xml
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="RegressionSuite" parallel="classes" thread-count="4" verbose="1">

    <parameter name="environment" value="staging"/>

    <listeners>
        <listener class-name="com.company.listeners.RetryListener"/>
        <listener class-name="com.company.listeners.ExtentReportListener"/>
    </listeners>

    <test name="SmokeTests">
        <groups>
            <run>
                <include name="smoke"/>
            </run>
        </groups>
        <classes>
            <class name="com.company.tests.LoginTest"/>
            <class name="com.company.tests.CheckoutTest"/>
        </classes>
    </test>

    <test name="RegressionTests">
        <classes>
            <class name="com.company.tests.OrderServiceTest">
                <methods>
                    <exclude name="slowReconciliationTest"/>
                </methods>
            </class>
        </classes>
    </test>

</suite>
```

- `<suite>` is the root — one XML file can define multiple `<test>` blocks,
  each with its own classes, groups, and parallelism.
- Run it from Maven with the **Surefire plugin**:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.5</version>
    <configuration>
        <suiteXmlFiles>
            <suiteXmlFile>testng.xml</suiteXmlFile>
        </suiteXmlFiles>
    </configuration>
</plugin>
```

```bash
mvn test                      # picks up testng.xml via Surefire config
mvn test -Dgroups=smoke        # override groups from the CLI
```

### Passing parameters from XML to test code

```java
@Parameters({"environment"})
@Test
public void verifyBaseUrl(String environment) {
    Assert.assertEquals(config.getEnv(), environment);
}
```

---

## 4. Parallel Execution

TestNG can parallelize at four granularities via the `parallel` attribute on
`<suite>` or `<test>`:

| `parallel` value | Parallelizes | Typical use |
|---|---|---|
| `methods` | Every `@Test` method, even across classes | Maximum throughput; requires fully independent, thread-safe tests |
| `classes` | Each class runs in its own thread; methods within a class run sequentially | Most common for UI suites — isolates WebDriver instances per class |
| `tests` | Each `<test>` XML block runs in its own thread | Coarse-grained — good for separating unrelated suites (API vs UI) |
| `instances` | Each instance of a test class (with `@Factory`) runs in parallel | Data-driven object instantiation scenarios |

```xml
<suite name="Suite" parallel="methods" thread-count="10">
```

### The #1 pitfall: shared mutable state

```java
public class LoginTest {
    private WebDriver driver;   // BUG if parallel="methods" — shared across threads

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();   // fine ONLY if parallel="classes" or each
    }                                    // class gets its own instance per thread
}
```

**Fix:** use `ThreadLocal<WebDriver>` (the standard Selenium+TestNG parallel
pattern) so each thread gets its own driver instance, or ensure
`parallel="classes"`/`"tests"` so a class's `@BeforeMethod`-created driver is
never shared across threads in the first place.

```java
private static ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

public static WebDriver getDriver() { return driverThread.get(); }

@BeforeMethod
public void setUp() {
    driverThread.set(new ChromeDriver());
}

@AfterMethod
public void tearDown() {
    driverThread.get().quit();
    driverThread.remove();
}
```

---

## 5. Data-Driven Testing: `@DataProvider`

```java
@DataProvider(name = "loginCredentials")
public Object[][] loginData() {
    return new Object[][] {
        {"validUser", "correctPass", true},
        {"validUser", "wrongPass", false},
        {"", "anyPass", false},
    };
}

@Test(dataProvider = "loginCredentials")
public void testLogin(String username, String password, boolean expectedResult) {
    boolean actual = loginPage.login(username, password);
    Assert.assertEquals(actual, expectedResult);
}
```

Each row runs as a **separate, independently reported test** — a failure on
row 2 doesn't stop rows 1 and 3.

### Parallel data providers

```java
@DataProvider(name = "loginCredentials", parallel = true)
```

Runs each data row in its own thread — combine with `thread-count` on the
`<suite>` tag to control the pool size.

### DataProviders from external sources

```java
@DataProvider(name = "csvData")
public Object[][] fromCsv() throws IOException {
    // read a CSV/Excel/JSON file and map rows -> Object[][]
    return CsvUtils.readAsObjectArray("testdata/users.csv");
}
```

This is the standard way to decouple test *logic* from test *data* — QA
teams edit the CSV without touching Java code.

---

## 6. Groups & Dependencies

### Groups — tag-based selective execution

```java
@Test(groups = {"smoke"})
public void homePageLoads() { ... }

@Test(groups = {"regression", "checkout"})
public void fullCheckoutFlow() { ... }
```

```xml
<groups>
    <run>
        <include name="smoke"/>
        <exclude name="flaky"/>
    </run>
</groups>
```

```bash
mvn test -Dgroups=smoke,checkout -DexcludedGroups=flaky
```

Groups model a CI pipeline naturally: run `smoke` on every PR, `regression`
nightly, `flaky` never (until fixed and reclassified).

### `dependsOnMethods` / `dependsOnGroups`

```java
@Test
public void login() { ... }

@Test(dependsOnMethods = {"login"})
public void addToCart() { ... }   // skipped (not failed) if login() fails

@Test(dependsOnMethods = {"addToCart"}, alwaysRun = true)
public void checkout() { ... }    // runs even if a dependency fails, if alwaysRun=true
```

If `login()` fails, `addToCart()` is reported as **SKIPPED**, not run at all
— this matters for correct pass/fail metrics; TestNG distinguishes "didn't
run because a prerequisite failed" from an actual failure. Use dependencies
sparingly — they couple tests together and hurt parallelism (dependent tests
serialize even under `parallel="methods"`).

---

## 7. Assertions: Soft vs. Hard

### Hard assertions (`Assert`) — default, fail-fast

```java
import org.testng.Assert;

Assert.assertEquals(actualTotal, 99.99, "Cart total mismatch");
Assert.assertTrue(user.isActive());
Assert.assertNotNull(response.getBody());
```

A hard assertion failure **immediately stops the test method** — any
assertions after it never run.

### Soft assertions (`SoftAssert`) — collect-and-report

```java
import org.testng.asserts.SoftAssert;

@Test
public void verifyOrderSummary() {
    SoftAssert softAssert = new SoftAssert();
    softAssert.assertEquals(order.getStatus(), "CONFIRMED");
    softAssert.assertEquals(order.getItemCount(), 3);
    softAssert.assertTrue(order.getTotal() > 0);
    softAssert.assertAll();   // MUST call this — throws if any assertion above failed
}
```

`SoftAssert` records every failure but keeps executing, then throws a
single aggregated exception at `assertAll()` — invaluable for UI tests that
verify many independent fields on one page: one broken layout element
shouldn't hide five other broken fields in the same run. **Forgetting
`assertAll()` silently swallows all failures** — the most common soft-assert
bug.

| | Hard `Assert` | `SoftAssert` |
|---|---|---|
| On failure | Stops test immediately | Records and continues |
| Best for | Sequential logic where step 2 depends on step 1 succeeding | Independent checks on one page/response |
| Gotcha | None — this is the safe default | Forgetting `assertAll()` = false positives |

---

## 8. Listeners & Reporting

Listeners hook into the test lifecycle for cross-cutting behavior —
screenshots on failure, retry logic, custom reporting — without touching
individual test methods.

```java
public class TestListener implements ITestListener {

    @Override
    public void onTestFailure(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        byte[] screenshot = ((TakesScreenshot) DriverFactory.getDriver())
                .getScreenshotAs(OutputType.BYTES);
        ExtentReportManager.attachScreenshot(testName, screenshot);
    }

    @Override
    public void onTestSuccess(ITestResult result) { ... }

    @Override
    public void onTestSkipped(ITestResult result) { ... }
}
```

Wire it up either in `testng.xml` (`<listeners>`, shown in §3) or via
annotation on the test class:

```java
@Listeners(TestListener.class)
public class CheckoutTest { ... }
```

### Retry failed tests (`IRetryAnalyzer`)

```java
public class RetryAnalyzer implements IRetryAnalyzer {
    private int count = 0;
    private static final int MAX_RETRIES = 2;

    @Override
    public boolean retry(ITestResult result) {
        if (count < MAX_RETRIES) {
            count++;
            return true;
        }
        return false;
    }
}

@Test(retryAnalyzer = RetryAnalyzer.class)
public void flakyNetworkCall() { ... }
```

Apply it suite-wide via an `IAnnotationTransformer` so you don't have to
annotate every method — the standard pattern to tame flaky UI tests without
masking genuinely broken ones (cap retries low, and track retry counts in
reporting so "flaky" doesn't quietly become invisible).

### Built-in & third-party reporting

TestNG auto-generates `test-output/index.html` and `emailable-report.html`
after every run with pass/fail/skip counts and stack traces. Production
suites typically layer **ExtentReports** or **Allure** on top via a listener
for richer, screenshot-embedded, stakeholder-friendly HTML reports.

---

## 9. TestNG vs. JUnit 5 — Quick Comparison

| Capability | TestNG | JUnit 5 |
|---|---|---|
| Parallel execution | Built-in, XML-configurable, fine-grained (methods/classes/tests) | Supported since 5.3 but requires explicit config (`junit-platform.properties`), less granular out of the box |
| Suite configuration | External `testng.xml` — no code change to reorganize suites | Code-centric (`@Suite`, tags) — JUnit 5 Platform Suite API is newer/less mature |
| Data-driven tests | `@DataProvider` — supports parallel data rows natively | `@ParameterizedTest` + `@MethodSource`/`@CsvSource` — clean but less flexible for programmatic data |
| Dependencies between tests | `dependsOnMethods`/`dependsOnGroups` — native | Not supported natively — discouraged in JUnit philosophy (tests should be independent) |
| Grouping/tagging | `groups` attribute + XML `<groups>` | `@Tag` + tag expressions |
| Soft assertions | Built-in `SoftAssert` | Not built-in — needs AssertJ's `SoftAssertions` or similar |
| Ecosystem/IDE support | Strong (Selenium/enterprise Java QA) | Broader (default for most non-QA Java projects, Spring Boot default) |

**Rule of thumb:** TestNG tends to win for large Selenium/API automation
suites needing fine-grained parallel control and XML-driven suite
composition; JUnit 5 tends to win for general application unit/integration
testing and Spring ecosystem projects. Many SDET teams use both — JUnit for
unit tests inside the app, TestNG for the end-to-end automation suite.

---

## 10. Interview-Ready Q&A

**Q: Walk me through TestNG's annotation execution order.**
A: `@BeforeSuite` → `@BeforeTest` → `@BeforeClass` → (`@BeforeMethod` →
`@Test` → `@AfterMethod`, repeated for every test method) → `@AfterClass` →
`@AfterTest` → `@AfterSuite`. The Before/After pairs nest around the
`testng.xml` hierarchy: suite contains tests, tests contain classes, classes
contain methods.

**Q: What's the difference between `@BeforeMethod` and `@BeforeClass`?**
A: `@BeforeClass` runs once per class, before its first `@Test` method.
`@BeforeMethod` runs before every single `@Test` method in that class. Use
`@BeforeClass` for expensive one-time setup (starting a browser session
that's reused) and `@BeforeMethod` for per-test setup that must be fresh
(resetting state, navigating to a start page).

**Q: Explain soft vs. hard assertions and when you'd use each.**
A: A hard `Assert` failure throws immediately and halts the test method —
use it when later steps depend on an earlier one succeeding. A `SoftAssert`
records failures but keeps executing, then reports all of them together when
`assertAll()` is called — use it to verify several independent fields (e.g.,
multiple values on a confirmation page) in one run so a single broken field
doesn't hide the others. Forgetting to call `assertAll()` is the classic bug
— failures get silently recorded but never surfacing.

**Q: How does TestNG achieve parallel execution, and what's the biggest risk?**
A: Via the `parallel` attribute (`methods`, `classes`, `tests`, `instances`)
on `<suite>`/`<test>` in `testng.xml`, combined with `thread-count`. The
biggest risk is shared mutable state across threads — most commonly a
non-thread-safe `WebDriver` instance field. The standard fix is
`ThreadLocal<WebDriver>` so each thread gets an isolated driver instance.

**Q: What does `dependsOnMethods` do, and why should it be used sparingly?**
A: It makes a test method run only after its declared dependency passes; if
the dependency fails, the dependent test is marked **SKIPPED**, not run at
all — which is important for accurate reporting. It should be used sparingly
because dependent tests can't run in parallel with each other (TestNG
serializes them to respect order), and it couples test cases together,
making the suite more fragile to reorder or refactor.

**Q: How do you pass a dynamic set of test data into a test method?**
A: `@DataProvider` — a method returning `Object[][]` (or an `Iterator`)
referenced by name from `@Test(dataProvider = "...")`. Each row executes as
an independently reported test case, so one failing row doesn't block the
others. It can also be marked `parallel = true` to run data rows
concurrently, and commonly pulls from external sources (CSV, Excel, a
database) to decouple test data from test code.

**Q: How would you retry a flaky test without retrying every test in the suite?**
A: Implement `IRetryAnalyzer`, cap the retry count (e.g., 2 attempts), and
attach it via `@Test(retryAnalyzer = RetryAnalyzer.class)` on the specific
flaky test — or apply it globally via an `IAnnotationTransformer` listener so
individual tests don't need to be annotated one by one. Retries should be
capped and tracked in reporting, not used to permanently mask a genuinely
broken test.

**Q: How does `testng.xml` help with CI pipeline design?**
A: It lets you define multiple `<test>` blocks with different group
inclusions/exclusions (smoke vs. regression), different parallelism, and
different parameters — all without touching Java code. A CI pipeline can run
`mvn test -Dgroups=smoke` on every PR for fast feedback and a nightly job
with the full regression suite, just by pointing at different groups or XML
files.

---

## 11. One-Line Summary

**TestNG's edge over plain JUnit is operational: XML-driven suite
composition, native parallel execution, data providers, and
group/dependency modeling let you shape a large Selenium/API automation
suite around real CI pipelines instead of bolting that structure on
afterward.**
