---
title: "JUnit: The Complete Guide"
description: "End-to-end reference for JUnit — JUnit 5 architecture, annotations, assertions, extensions, tagging, and interview-ready Q&A."
sidebar_position: 1
tags: [junit, sdet, java, testing-framework]
---

# JUnit — The Complete Guide

A single-read, end-to-end reference for JUnit: enough to write idiomatic
JUnit 5 tests, build a custom extension, or walk into an SDET interview.
Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/junit">📋 Quick reference: JUnit →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 240" role="img" aria-labelledby="mm-junit-title mm-junit-desc">
<title id="mm-junit-title">JUnit 5's three-module architecture</title>
<desc id="mm-junit-desc">The JUnit Platform is the foundation that launches test engines; it hosts the JUnit Jupiter engine, which runs new JUnit 5 tests, and the JUnit Vintage engine, which runs legacy JUnit 3 and 4 tests side by side.</desc>
<defs>
  <marker id="mm-junit-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="80" y="10" width="220" height="50" rx="10"/>
<text class="mm-node-title" x="190" y="32" text-anchor="middle">@Test classes</text>
<text class="mm-node-sub" x="190" y="48" text-anchor="middle">uses Jupiter API</text>
<path class="mm-arrow" d="M190,60 L190,80" marker-end="url(#mm-junit-arrow)"/>

<rect class="mm-n6" x="480" y="10" width="220" height="50" rx="10"/>
<text class="mm-node-title" x="590" y="32" text-anchor="middle">Legacy tests</text>
<text class="mm-node-sub" x="590" y="48" text-anchor="middle">JUnit 3 / 4 style</text>
<path class="mm-arrow" d="M590,60 L590,80" marker-end="url(#mm-junit-arrow)"/>

<rect class="mm-n2" x="80" y="80" width="220" height="60" rx="10"/>
<text class="mm-node-title" x="190" y="107" text-anchor="middle">JUnit Jupiter</text>
<text class="mm-node-sub" x="190" y="123" text-anchor="middle">new programming model</text>

<rect class="mm-n4" x="480" y="80" width="220" height="60" rx="10"/>
<text class="mm-node-title" x="590" y="107" text-anchor="middle">JUnit Vintage</text>
<text class="mm-node-sub" x="590" y="123" text-anchor="middle">runs JUnit 3/4 unchanged</text>

<path class="mm-arrow" d="M330,170 L190,140" marker-end="url(#mm-junit-arrow)"/>
<path class="mm-arrow" d="M450,170 L590,140" marker-end="url(#mm-junit-arrow)"/>

<rect class="mm-n5" x="245" y="170" width="290" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="197" text-anchor="middle">JUnit Platform</text>
<text class="mm-node-sub" x="390" y="213" text-anchor="middle">launches test engines</text>
</svg>

<p class="mental-model__caption">JUnit 5 splits into three modules stacked on one foundation: the Platform launches whichever TestEngine is registered, the Jupiter engine runs tests written against the new JUnit 5 programming model, and the Vintage engine runs old JUnit 3/4 tests unchanged — so a codebase can migrate gradually with both generations of tests executing side by side in the same run.</p>
</div>

## 1. What JUnit Is, in Practical Terms

JUnit is the de facto standard testing framework for the JVM. **JUnit 5**
(a.k.a. "Jupiter") is the current generation, a ground-up rewrite from
JUnit 4 that splits the framework into three distinct components — this
architecture is the single most-asked JUnit interview topic.

```xml
<!-- Maven — JUnit 5 -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
```

### The three-module architecture

| Module | Role |
|---|---|
| **JUnit Platform** | The foundation — launches testing frameworks on the JVM, defines the `TestEngine` API. Runs Jupiter, Vintage (JUnit 3/4), and third-party engines side by side. |
| **JUnit Jupiter** | The new programming model and extension API — `@Test`, `@ExtendWith`, assertions. What you write tests against in JUnit 5. |
| **JUnit Vintage** | A `TestEngine` that runs JUnit 3/4 tests on the Platform — lets legacy tests coexist with new Jupiter tests during migration. |

```
JUnit Platform (launcher, TestEngine API)
        │
   ┌────┴────┬─────────────┐
JUnit Jupiter  JUnit Vintage  (3rd-party engines: Spock, Cucumber, ...)
(JUnit 5 API)  (JUnit 3/4 tests)
```

This separation is *why* JUnit 5 can run old JUnit 4 tests unmodified
(Vintage) while you migrate incrementally to Jupiter's API — and why build
tools (Maven Surefire, Gradle) only need to talk to one Platform launcher
regardless of which engine(s) are in play.

---

## 2. Core Annotations

```java
import org.junit.jupiter.api.*;

class OrderServiceTest {

    @BeforeAll
    static void beforeAll() { /* once, before all tests — MUST be static */ }

    @BeforeEach
    void beforeEach() { /* before every @Test method */ }

    @Test
    void orderTotalsAreCorrect() {
        // the actual test
    }

    @AfterEach
    void afterEach() { /* after every @Test method */ }

    @AfterAll
    static void afterAll() { /* once, after all tests — MUST be static */ }
}
```

- `@BeforeAll`/`@AfterAll` must be `static` by default because a new test
  instance is created **per test method** (JUnit 5's default lifecycle) — no
  instance exists yet when suite-level setup runs. This trips up everyone
  coming from TestNG, where suite-level hooks are plain instance methods.
- Override with `@TestInstance(Lifecycle.PER_CLASS)` on the class to allow
  non-static `@BeforeAll`/`@AfterAll` and share instance state across test
  methods in that class (useful for expensive shared fixtures, at the cost
  of test isolation).

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExpensiveSetupTest {
    private Connection sharedConnection;

    @BeforeAll
    void beforeAll() {                 // no longer needs to be static
        sharedConnection = createConnection();
    }
}
```

### Other core annotations

| Annotation | Purpose |
|---|---|
| `@DisplayName("...")` | Human-readable test name in reports/IDE |
| `@Disabled("reason")` | Skip a test, with a mandatory-in-spirit reason |
| `@Timeout(5)` | Fail if the test exceeds 5 seconds |
| `@RepeatedTest(5)` | Run the same test 5 times (flakiness checks, `RepetitionInfo` injectable) |
| `@Tag("smoke")` | Categorize tests for selective execution (see §6) |

```java
@Test
@DisplayName("Rejects orders with negative quantity")
@Timeout(3)
void rejectsNegativeQuantity() {
    assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(-1));
}
```

---

## 3. Assertions & Assumptions

### Assertions (`org.junit.jupiter.api.Assertions`)

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void basicAssertions() {
    assertEquals(99.99, cart.getTotal(), 0.01);      // delta for double comparison
    assertTrue(user.isActive());
    assertNotNull(response.getBody());
    assertThrows(NullPointerException.class, () -> service.process(null));

    assertAll("order validation",                      // grouped — reports ALL failures, not just the first
        () -> assertEquals("CONFIRMED", order.getStatus()),
        () -> assertEquals(3, order.getItemCount()),
        () -> assertTrue(order.getTotal() > 0)
    );
}
```

`assertAll()` is JUnit 5's built-in answer to TestNG's `SoftAssert` — every
lambda executes and every failure is collected into one combined
`MultipleFailuresError`, instead of stopping at the first failed assertion.
Unlike TestNG, there's no separate object to instantiate and no `assertAll`
call to forget — it's just how you group assertions from the start.

### Assumptions — conditionally skip, don't fail

```java
import static org.junit.jupiter.api.Assumptions.*;

@Test
void onlyRunsOnStaging() {
    assumeTrue("staging".equals(System.getenv("ENV")));
    // rest of the test — skipped (not failed) if the assumption is false
}
```

`assumeTrue`/`assumeFalse`/`assumingThat` mark a test **aborted** (a distinct
outcome from pass/fail) when a precondition isn't met — useful for
environment-dependent tests that shouldn't count as failures in CI when
run in the wrong environment.

### Third-party assertions

Most production JUnit 5 suites pair it with **AssertJ**
(`assertThat(order.getTotal()).isGreaterThan(0)`) for fluent, more readable
chained assertions and better failure messages than the built-in
`Assertions` class provides.

---

## 4. Parameterized Tests

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

@ParameterizedTest
@ValueSource(strings = {"", " ", "\t"})
void blankUsernamesAreRejected(String username) {
    assertFalse(validator.isValid(username));
}

@ParameterizedTest
@CsvSource({
    "validUser, correctPass, true",
    "validUser, wrongPass,   false",
    "'',        anyPass,     false"
})
void testLogin(String username, String password, boolean expected) {
    assertEquals(expected, loginService.login(username, password));
}

@ParameterizedTest
@MethodSource("loginProvider")
void testLoginFromMethod(String username, String password, boolean expected) {
    assertEquals(expected, loginService.login(username, password));
}

static Stream<Arguments> loginProvider() {
    return Stream.of(
        Arguments.of("validUser", "correctPass", true),
        Arguments.of("validUser", "wrongPass", false)
    );
}

@ParameterizedTest
@CsvFileSource(resources = "/testdata/users.csv", numLinesToSkip = 1)
void testLoginFromCsvFile(String username, String password, boolean expected) { ... }
```

| Source | Use for |
|---|---|
| `@ValueSource` | A single simple literal per run (String/int/etc.) |
| `@CsvSource` | Small inline multi-arg data sets |
| `@CsvFileSource` | Larger data sets kept in an external `.csv` file |
| `@MethodSource` | Programmatically generated or complex objects |
| `@EnumSource` | Iterate over an enum's values |
| `@ArgumentsSource` | Custom `ArgumentsProvider` for reusable, complex data logic |

This is the direct equivalent of TestNG's `@DataProvider`, just declared
inline via annotations rather than a separate provider method referenced by
string name (though `@MethodSource` is functionally very close to it).

---

## 5. `@Nested` Tests

```java
class OrderServiceTest {

    @Nested
    @DisplayName("when the cart is empty")
    class EmptyCart {
        @Test
        void checkoutIsDisabled() { ... }
    }

    @Nested
    @DisplayName("when the cart has items")
    class NonEmptyCart {
        @BeforeEach
        void addItems() { cart.add(sampleItem); }

        @Test
        void checkoutCalculatesTotal() { ... }

        @Nested
        @DisplayName("and a coupon is applied")
        class WithCoupon {
            @Test
            void totalReflectsDiscount() { ... }
        }
    }
}
```

`@Nested` (non-static inner classes) groups related tests under a shared
context/state, producing readable, hierarchical output in IDE/CI reports
that mirrors BDD-style "when X, then Y" structure — each nested class gets
its own `@BeforeEach` chain from outer to inner.

---

## 6. Tagging & Filtering

```java
@Tag("smoke")
@Test
void homePageLoads() { ... }

@Tag("regression")
@Tag("checkout")
@Test
void fullCheckoutFlow() { ... }
```

```xml
<!-- Maven Surefire: run only "smoke", exclude "flaky" -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <groups>smoke</groups>
        <excludedGroups>flaky</excludedGroups>
    </configuration>
</plugin>
```

```bash
mvn test -Dgroups=smoke
```

```groovy
// Gradle
test {
    useJUnitPlatform {
        includeTags 'smoke'
        excludeTags 'flaky'
    }
}
```

Tags are JUnit 5's direct equivalent of TestNG's `groups` — the mechanism
for slicing one test codebase into CI-stage-appropriate subsets (fast smoke
suite on every commit, full regression nightly).

---

## 7. The Extension Model (`@ExtendWith`)

JUnit 4 had a single, limited `@RunWith` extension point. JUnit 5 replaced
it with a composable **Extension API** — you can stack multiple extensions
on one test, unlike JUnit 4's one-runner-per-class limit.

```java
public class ScreenshotOnFailureExtension implements TestWatcher {
    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        byte[] screenshot = DriverFactory.getDriver()
                .getScreenshotAs(OutputType.BYTES);
        ExtentReportManager.attach(context.getDisplayName(), screenshot);
    }
}

@ExtendWith(ScreenshotOnFailureExtension.class)
class CheckoutTest {
    @Test
    void completesCheckout() { ... }
}
```

### Common extension interfaces

| Interface | Hooks into |
|---|---|
| `BeforeEachCallback` / `AfterEachCallback` | Around every test method — like AOP setup/teardown |
| `BeforeAllCallback` / `AfterAllCallback` | Around the whole class |
| `TestWatcher` | Observe outcomes (`testSuccessful`, `testFailed`, `testAborted`, `testDisabled`) without altering execution |
| `ParameterResolver` | Inject custom objects as test method parameters (e.g., a `WebDriver` instance) |
| `ExecutionCondition` | Programmatically enable/disable tests (custom `@Disabled`-like logic) |

```java
// A WebDriver injected via ParameterResolver — no field, no static state
class DriverExtension implements ParameterResolver, AfterEachCallback {
    @Override
    public boolean supportsParameter(ParameterContext pc, ExtensionContext ec) {
        return pc.getParameter().getType() == WebDriver.class;
    }
    @Override
    public Object resolveParameter(ParameterContext pc, ExtensionContext ec) {
        return new ChromeDriver();
    }
    @Override
    public void afterEach(ExtensionContext ec) {
        // quit the driver stored in the ExtensionContext.Store
    }
}

@ExtendWith(DriverExtension.class)
class LoginTest {
    @Test
    void login(WebDriver driver) {   // injected automatically
        driver.get("https://example.com");
    }
}
```

Spring Boot's `@SpringBootTest`, Mockito's `@ExtendWith(MockitoExtension.class)`,
and Testcontainers' JUnit 5 integration are all built on this same extension
API — understanding it is what lets you read (and eventually write) any of
those integrations.

---

## 8. Parallel Execution

Unlike TestNG (parallel by default via `testng.xml`), JUnit 5 parallel
execution is **opt-in** via a properties file:

```properties
# src/test/resources/junit-platform.properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.config.strategy = fixed
junit.jupiter.execution.parallel.config.fixed.parallelism = 4
```

```java
@Execution(ExecutionMode.CONCURRENT)
class OrderServiceTest { ... }

@Execution(ExecutionMode.SAME_THREAD)   // opt a specific class OUT of parallel runs
class LegacySequentialTest { ... }
```

Same `ThreadLocal` caveat as TestNG applies to shared resources like
`WebDriver` — parallel execution doesn't make non-thread-safe code
thread-safe.

---

## 9. JUnit 5 vs. TestNG — Quick Comparison

| Capability | JUnit 5 | TestNG |
|---|---|---|
| Parallelism | Opt-in via properties file, class/method granularity via `@Execution` | Built-in via `testng.xml`, more configuration knobs out of the box |
| Data-driven tests | `@ParameterizedTest` + source annotations — declarative | `@DataProvider` — a Java method, more programmatically flexible |
| Suite configuration | Code-based (`@Suite`, tags) or build-tool config | External `testng.xml` — reorganize suites with zero code change |
| Grouped soft assertions | `assertAll()` built into core `Assertions` | Requires instantiating `SoftAssert` + calling `assertAll()` |
| Test dependencies | Not supported — by design (tests should be independent) | `dependsOnMethods`/`dependsOnGroups` native |
| Extensibility | Composable `@ExtendWith` — stack many extensions | Listeners (`ITestListener`, etc.) — also composable, older API shape |
| Ecosystem | Default for Spring Boot, most general Java projects | Default for many large-scale Selenium/API SDET suites |

**Rule of thumb:** JUnit 5's opinionated independence (no test dependencies,
opt-in parallelism) fits general application testing and CI pipelines that
value strict isolation; TestNG's configurability (XML suites, native
dependencies, default parallelism) fits large end-to-end automation suites
that need fine control over execution order and grouping.

---

## 10. Interview-Ready Q&A

**Q: What are the three modules of JUnit 5 and why does that architecture matter?**
A: JUnit Platform (the launcher and `TestEngine` API), JUnit Jupiter (the new
programming model — annotations, assertions), and JUnit Vintage (runs old
JUnit 3/4 tests on the same Platform). It matters because it decouples "how
tests are launched" from "what testing model they're written in" — Jupiter
and Vintage tests can run side by side in one build, which is what makes
incremental JUnit 4 → 5 migration possible instead of a big-bang rewrite.

**Q: Why do `@BeforeAll`/`@AfterAll` need to be static?**
A: By default JUnit 5 creates a new test instance for every test method
(`Lifecycle.PER_METHOD`), so there's no single instance to attach
class-level setup/teardown to — it has to be static, tied to the class
itself, not an instance. Annotating the class `@TestInstance(PER_CLASS)`
switches to one shared instance per class, which allows non-static
`@BeforeAll`/`@AfterAll` at the cost of state potentially leaking between
test methods.

**Q: How does `assertAll()` differ from just writing several `assertEquals`
calls in a row?**
A: Plain sequential assertions stop at the first failure — you only ever see
one failure per run even if three things are wrong. `assertAll()` wraps
several assertions (as lambdas) so every one of them executes regardless of
earlier failures, then reports all failures together in one
`MultipleFailuresError`. It's JUnit 5's built-in equivalent of TestNG's
`SoftAssert`, without a separate object to instantiate.

**Q: What's the difference between an assertion failing and an assumption failing?**
A: A failed assertion marks the test **failed**. A failed assumption
(`assumeTrue`, etc.) marks the test **aborted** — a distinct outcome that
most CI reporting treats differently from a real failure. Assumptions exist
for preconditions the test can't control, like "only run this against the
staging environment" — skipping cleanly there shouldn't count against your
pass rate.

**Q: How would you inject a `WebDriver` into test methods without a static
field or a `@BeforeEach` boilerplate in every class?**
A: Write a custom `ParameterResolver` extension that recognizes the
`WebDriver` parameter type and supplies an instance, then register it with
`@ExtendWith`. Combined with `AfterEachCallback` to quit the driver, this
keeps driver lifecycle logic in one reusable extension instead of copy-pasted
setup/teardown in every test class.

**Q: Why doesn't JUnit 5 support test dependencies the way TestNG does?**
A: It's a deliberate design choice — JUnit's philosophy is that tests should
be independent and order-agnostic so they can run in parallel, be safely
reordered, and fail without cascading false "skipped" results across
unrelated tests. If you need setup shared across tests, that belongs in
`@BeforeEach`/`@BeforeAll` or a shared fixture, not a dependency chain
between test methods.

**Q: `@ValueSource` vs `@MethodSource` vs `@CsvFileSource` — when would you use each?**
A: `@ValueSource` for a single simple literal per run (a list of strings or
ints). `@CsvFileSource` for larger, tabular data sets better kept out of the
code, in an actual `.csv` file. `@MethodSource` when the data needs to be
generated programmatically or involves complex objects that don't fit into a
CSV row — it points at a static method returning a `Stream<Arguments>`.

**Q: How do you run only a subset of tests — say, just smoke tests — in CI?**
A: Tag the relevant tests with `@Tag("smoke")`, then configure Surefire
(`<groups>smoke</groups>`) or Gradle's `useJUnitPlatform { includeTags
'smoke' }` to filter by tag, or pass `-Dgroups=smoke` on the CLI. This lets
one test codebase serve both a fast on-commit smoke suite and a full nightly
regression run without maintaining separate test classes.

---

## 11. One-Line Summary

**JUnit 5's Platform/Jupiter/Vintage split and composable extension model
make it the flexible, opinionated-toward-independence default for JVM
testing — reach for `@ParameterizedTest`, `assertAll()`, and `@ExtendWith`
before reaching for a third-party add-on, and pair it with TestNG only when
a suite genuinely needs native test dependencies or XML-driven parallel
suite composition.**
