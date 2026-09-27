---
title: "Java for SDET"
description: "How Java fundamentals map to test engineering — JUnit 5, fixtures, data-driven tests, Mockito, Rest Assured, page objects, waits, test data builders, tags, reports, and CI."
sidebar_position: 3
level: intermediate
tags: [java, sdet, testing]
image: /img/social/java-for-sdet.png
---

# Java for SDET
## How the Fundamentals Help You Test Software

**SDET** means **Software Development Engineer in Test**.
An SDET writes code that tests other code, and builds the tools and frameworks
other people use to test.

This guide shows how each Java fundamental helps in real testing work. Learn
the basics first with the [Java cheat sheet](/cheatsheets/java) and
[Milestones 1–7](/docs/learning-path/java/implementation-roadmap). Each tool
used here also has its own full guide — this page shows how they fit together
rather than every option.

Each use case has the same parts:

- **The task** – what you need to do.
- **Fundamentals used** – which basic ideas solve it.
- **How it works** – the steps in plain words.
- **Code** – an example you can copy and change.
- **Try it** – a small exercise.

:::tip How to use this page

Work through the use cases in order in one Maven project — later ones reuse
earlier code. Add these test dependencies to your `pom.xml` (on top of the
[project setup](/docs/learning-path/java/milestones-and-mini-projects#setup)):

```xml
<dependency><groupId>org.mockito</groupId><artifactId>mockito-junit-jupiter</artifactId><version>5.24.0</version><scope>test</scope></dependency>
<dependency><groupId>org.assertj</groupId><artifactId>assertj-core</artifactId><version>3.26.3</version><scope>test</scope></dependency>
<dependency><groupId>io.rest-assured</groupId><artifactId>rest-assured</artifactId><version>5.5.0</version><scope>test</scope></dependency>
<dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.17.2</version><scope>test</scope></dependency>
<dependency><groupId>org.seleniumhq.selenium</groupId><artifactId>selenium-java</artifactId><version>4.25.0</version><scope>test</scope></dependency>
```

:::

---

## Contents

1. [Fundamentals Map for SDET](#1-fundamentals-map-for-sdet)
2. [Use Case: Write Your First Unit Test](#2-use-case-write-your-first-unit-test)
3. [Use Case: Share Set-up with Fixtures](#3-use-case-share-set-up-with-fixtures)
4. [Use Case: Data-Driven Tests](#4-use-case-data-driven-tests)
5. [Use Case: Replace Real Services with Mocks](#5-use-case-replace-real-services-with-mocks)
6. [Use Case: Test a REST API](#6-use-case-test-a-rest-api)
7. [Use Case: Build a UI Framework with Page Objects](#7-use-case-build-a-ui-framework-with-page-objects)
8. [Use Case: Wait for Slow Things (Avoid Flaky Tests)](#8-use-case-wait-for-slow-things-avoid-flaky-tests)
9. [Use Case: Create Test Data with Builders](#9-use-case-create-test-data-with-builders)
10. [Use Case: Group, Filter and Parallelise Tests](#10-use-case-group-filter-and-parallelise-tests)
11. [Use Case: Summarise Test Results](#11-use-case-summarise-test-results)
12. [Use Case: Run Tests in CI/CD](#12-use-case-run-tests-in-cicd)
13. [How to Organise a Test Project](#13-how-to-organise-a-test-project)
14. [Practice Projects](#practice-projects)
15. [Skills Checklist](#15-skills-checklist)

---

## 1. Fundamentals Map for SDET

**In short:** almost every Java feature shows up somewhere in test code.

| Fundamental | Where an SDET uses it |
|-------------|------------------------|
| Types, `String`, numbers | Expected values, test inputs, status codes, readable failure messages |
| `List`, `Set`, `Map` | Many inputs, comparing results where order doesn't matter, JSON bodies and headers |
| Methods | Each test is a method; helper methods remove repeated steps |
| Exceptions | Checking code fails the right way (`assertThrows`) |
| Classes & inheritance | Page objects, API clients, base test classes |
| Interfaces | Swapping real services for fakes and mocks |
| Records | Test data, expected API responses, parameter sets |
| Enums | Browsers, environments, user roles |
| Generics | Reusable helpers like `Waits.until(...)` that work for any type |
| Lambdas | `assertThrows(() -> …)`, `assertAll`, wait conditions, Mockito answers |
| Streams | Filtering and checking lists of results |
| Annotations | `@Test`, `@BeforeEach`, `@ParameterizedTest`, `@Mock`, `@Tag` |
| Files & XML | Loading test data, reading test reports |
| Concurrency | Running tests in parallel, testing thread-safe code |
| `Duration`, `Instant` | Timeouts, waits, measuring response times |

---

## 2. Use Case: Write Your First Unit Test

**The task:** prove a price calculation is right, including the bad inputs.

**Fundamentals used:** methods, `long` arithmetic, exceptions, annotations.

**How it works:** each test follows **Arrange → Act → Assert**: set up the
inputs, call the code once, then check the result. One behaviour per test,
named after that behaviour.

```java
// src/main/java/com/example/shop/PriceCalculator.java
package com.example.shop;

public class PriceCalculator {

    /** Total in cents after a percentage discount. */
    public long totalCents(long unitCents, int quantity, int discountPercent) {
        if (quantity < 0) {
            throw new IllegalArgumentException("quantity must not be negative");
        }
        if (discountPercent < 0 || discountPercent > 100) {
            throw new IllegalArgumentException("discount must be 0-100, was " + discountPercent);
        }
        long gross = unitCents * quantity;
        return gross - gross * discountPercent / 100;
    }
}
```

```java
// src/test/java/com/example/shop/PriceCalculatorTest.java
package com.example.shop;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class PriceCalculatorTest {

    private final PriceCalculator calculator = new PriceCalculator();   // JUnit makes a new test object per test

    @Test
    void appliesDiscountToTheWholeOrder() {
        long unitCents = 2_000;                                         // Arrange

        long total = calculator.totalCents(unitCents, 3, 10);           // Act

        assertEquals(5_400, total);                                     // Assert
    }

    @Test
    void zeroQuantityCostsNothing() {
        assertEquals(0, calculator.totalCents(999, 0, 0));
    }

    @Test
    void rejectsADiscountAbove100() {
        var e = assertThrows(IllegalArgumentException.class,
                () -> calculator.totalCents(100, 1, 150));
        assertThat(e).hasMessageContaining("was 150");                  // AssertJ: reads like a sentence
    }
}
```

**AssertJ** (`assertThat(...)`) is an optional assertion library. Its
failure messages are more detailed, and IDE autocomplete shows every check
available for that type.

**Try it:** add a test showing a negative quantity throws. Then find the
input where `unitCents * quantity` overflows `long`, and decide whether the
calculator should guard against it.

---

## 3. Use Case: Share Set-up with Fixtures

**The task:** many tests need the same starting state — without tests
affecting each other.

**Fundamentals used:** classes, fields, annotations, nested classes.

**How it works:** `@BeforeEach` builds fresh state before *every* test, so
tests can run in any order. `@Nested` groups tests that share a situation
("when the cart is empty"), and the report reads like a specification.

```java
// src/main/java/com/example/shop/Cart.java
package com.example.shop;

import java.util.LinkedHashMap;
import java.util.Map;

public class Cart {

    private final Map<String, Integer> items = new LinkedHashMap<>();   // SKU → quantity

    public void add(String sku, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be positive");
        items.merge(sku, quantity, Integer::sum);
    }

    public void remove(String sku) { items.remove(sku); }
    public int quantityOf(String sku) { return items.getOrDefault(sku, 0); }
    public int totalItems() { return items.values().stream().mapToInt(Integer::intValue).sum(); }
    public boolean isEmpty() { return items.isEmpty(); }
}
```

```java
// src/test/java/com/example/shop/CartTest.java
package com.example.shop;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartTest {

    private Cart cart;

    @BeforeEach
    void newCart() {
        cart = new Cart();                        // fresh for every test
    }

    @Nested
    @DisplayName("when empty")
    class WhenEmpty {
        @Test void hasNoItems() { assertTrue(cart.isEmpty()); }
        @Test void quantityOfAnythingIsZero() { assertEquals(0, cart.quantityOf("SKU-1")); }
    }

    @Nested
    @DisplayName("with two of one product")
    class WithTwoOfOneProduct {

        @BeforeEach
        void addItems() {                         // runs after the outer @BeforeEach
            cart.add("SKU-1", 2);
        }

        @Test void addingMoreIncreasesTheQuantity() {
            cart.add("SKU-1", 3);
            assertEquals(5, cart.quantityOf("SKU-1"));
        }

        @Test void removingEmptiesTheCart() {
            cart.remove("SKU-1");
            assertTrue(cart.isEmpty());
        }
    }
}
```

| Annotation | Runs | Use for |
|---|---|---|
| `@BeforeEach` / `@AfterEach` | Around every test | Fresh objects, clean-up |
| `@BeforeAll` / `@AfterAll` | Once per class (`static` method) | Expensive things: start a server, open a browser |
| `@TempDir` | Per test | A temporary folder that's deleted afterwards |

**Try it:** add a `@Nested` class "with two products" and test `totalItems()`.

---

## 4. Use Case: Data-Driven Tests

**The task:** run the same check with many inputs, without copying the test.

**Fundamentals used:** records, streams, files, generics.

**How it works:** `@ParameterizedTest` runs once per row. Small tables go in
`@CsvSource`; larger ones in a CSV file; rows with objects come from a method
returning a `Stream`.

```java
// src/test/java/com/example/shop/PriceCalculatorDataTest.java
package com.example.shop;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PriceCalculatorDataTest {

    private final PriceCalculator calculator = new PriceCalculator();

    record Case(String name, long unitCents, int quantity, int discount, long expected) {
        @Override public String toString() { return name; }     // shown in the test report
    }

    static Stream<Case> cases() {
        return Stream.of(
                new Case("no discount", 1_000, 2, 0, 2_000),
                new Case("half price", 1_000, 2, 50, 1_000),
                new Case("free", 1_000, 2, 100, 0),
                new Case("rounds down", 333, 1, 10, 300));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    void calculatesTotals(Case c) {
        assertEquals(c.expected(), calculator.totalCents(c.unitCents(), c.quantity(), c.discount()));
    }

    @ParameterizedTest(name = "{0} x {1} at {2}% = {3}")
    @CsvFileSource(resources = "/prices.csv", numLinesToSkip = 1)
    void calculatesTotalsFromFile(long unitCents, int quantity, int discount, long expected) {
        assertEquals(expected, calculator.totalCents(unitCents, quantity, discount));
    }
}
```

```text
# src/test/resources/prices.csv
unitCents,quantity,discount,expected
500,4,0,2000
500,4,25,1500
1999,1,5,1900
```

**Try it:** add a row to the CSV that you expect to fail, run the tests, and
read how the report names the failing row.

---

## 5. Use Case: Replace Real Services with Mocks

**The task:** test order logic without charging a real card or sending real
email.

**Fundamentals used:** interfaces, constructor injection, lambdas, exceptions.

**How it works:** `OrderService` depends on *interfaces*, passed in through
its constructor. In the test, **Mockito** creates fake versions ("mocks").
You tell each mock what to return (`when … thenReturn`), then check how it
was called (`verify`).

```java
// src/main/java/com/example/orders/PaymentGateway.java
package com.example.orders;

public interface PaymentGateway {
    PaymentResult charge(String customerId, long cents);
}
```

```java
// src/main/java/com/example/orders/PaymentResult.java
package com.example.orders;

public record PaymentResult(boolean approved, String reference) { }
```

```java
// src/main/java/com/example/orders/EmailSender.java
package com.example.orders;

public interface EmailSender {
    void send(String to, String subject);
}
```

```java
// src/main/java/com/example/orders/PaymentDeclinedException.java
package com.example.orders;

public class PaymentDeclinedException extends RuntimeException {
    public PaymentDeclinedException(String customerId) {
        super("payment declined for customer " + customerId);
    }
}
```

```java
// src/main/java/com/example/orders/OrderService.java
package com.example.orders;

public class OrderService {

    private final PaymentGateway payments;
    private final EmailSender email;

    public OrderService(PaymentGateway payments, EmailSender email) {
        this.payments = payments;
        this.email = email;
    }

    /** Charges the customer and emails a confirmation. Returns the payment reference. */
    public String placeOrder(String customerId, String customerEmail, long cents) {
        PaymentResult result = payments.charge(customerId, cents);
        if (!result.approved()) {
            throw new PaymentDeclinedException(customerId);
        }
        email.send(customerEmail, "Order confirmed: " + result.reference());
        return result.reference();
    }
}
```

```java
// src/test/java/com/example/orders/OrderServiceTest.java
package com.example.orders;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)            // creates the @Mock fields before each test
class OrderServiceTest {

    @Mock PaymentGateway payments;
    @Mock EmailSender email;
    @InjectMocks OrderService service;          // built with the two mocks above

    @Test
    void approvedPaymentSendsConfirmation() {
        when(payments.charge("c1", 5_000)).thenReturn(new PaymentResult(true, "REF-9"));

        String ref = service.placeOrder("c1", "ada@example.com", 5_000);

        assertEquals("REF-9", ref);
        verify(email).send("ada@example.com", "Order confirmed: REF-9");
    }

    @Test
    void declinedPaymentSendsNoEmail() {
        when(payments.charge(anyString(), anyLong())).thenReturn(new PaymentResult(false, null));

        assertThrows(PaymentDeclinedException.class,
                () -> service.placeOrder("c1", "ada@example.com", 5_000));
        verifyNoInteractions(email);
    }

    @Test
    void gatewayOutageIsNotSwallowed() {
        when(payments.charge(any(), anyLong())).thenThrow(new IllegalStateException("gateway down"));

        var e = assertThrows(IllegalStateException.class,
                () -> service.placeOrder("c1", "ada@example.com", 1));
        assertEquals("gateway down", e.getMessage());
    }

    @Test
    void subjectContainsTheReference() {
        when(payments.charge(any(), anyLong())).thenReturn(new PaymentResult(true, "REF-1"));
        ArgumentCaptor<String> subject = ArgumentCaptor.forClass(String.class);   // grabs the real argument

        service.placeOrder("c1", "ada@example.com", 1);

        verify(email).send(eq("ada@example.com"), subject.capture());
        assertTrue(subject.getValue().endsWith("REF-1"));
    }
}
```

**Watch out for:** mock only things you don't own or that are slow (payment
providers, email, clocks, HTTP). If you mock your own simple classes, tests
pass even when the real code is broken.

**Try it:** add retry to `placeOrder` using the
[Retry helper from Milestone 4](/docs/learning-path/java/milestones-and-mini-projects#milestone-4),
and use `thenThrow(...).thenReturn(...)` to prove a second attempt succeeds.

---

## 6. Use Case: Test a REST API

**The task:** check an HTTP API returns the right status codes and JSON.

**Fundamentals used:** records, `Map`, lambdas, `@BeforeAll`/`@AfterAll`.

**How it works:** **Rest Assured** gives a readable `given → when → then`
style for HTTP tests. So this example runs anywhere, `@BeforeAll` starts a
tiny fake API with the JDK's built-in `HttpServer`. Against a real
environment, you'd only change `baseUri`.

```java
// src/test/java/com/example/api/UserApiTest.java
package com.example.api;

import com.sun.net.httpserver.HttpServer;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

class UserApiTest {

    record User(int id, String name, String role) { }
    record NewUser(String name, String role) { }             // what we send: the server picks the id

    static HttpServer server;
    static String baseUri;

    @BeforeAll
    static void startFakeApi() throws IOException {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);   // port 0 = any free port
        server.createContext("/users/1", exchange ->
                reply(exchange, 200, "{\"id\":1,\"name\":\"Ada\",\"role\":\"admin\"}"));
        server.createContext("/users", exchange -> {
            if (exchange.getRequestMethod().equals("POST")) {
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                reply(exchange, 201, body.replace("{", "{\"id\":2,"));   // echo it back with a new id
            } else {
                reply(exchange, 404, "{\"error\":\"not found\"}");
            }
        });
        server.start();
        baseUri = "http://localhost:" + server.getAddress().getPort();
    }

    @AfterAll
    static void stopFakeApi() {
        server.stop(0);
    }

    static void reply(com.sun.net.httpserver.HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }

    @Test
    void getsAUser() {
        given().baseUri(baseUri)
        .when().get("/users/1")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("name", equalTo("Ada"))
            .body("role", is("admin"));
    }

    @Test
    void readsTheBodyIntoARecord() {
        User user = given().baseUri(baseUri).get("/users/1").as(User.class);   // JSON → record via Jackson
        assertEquals(new User(1, "Ada", "admin"), user);
    }

    @Test
    void createsAUser() {
        given().baseUri(baseUri)
            .contentType(ContentType.JSON)
            .body(new NewUser("Linus", "viewer"))                             // record → JSON
        .when().post("/users")
        .then()
            .statusCode(201)
            .body("id", equalTo(2))
            .body("name", equalTo("Linus"));
    }

    @Test
    void unknownRouteIs404() {
        given().baseUri(baseUri).get("/users").then().statusCode(404).body("error", containsString("not found"));
    }
}
```

**Watch out for:** don't hard-code environment URLs or tokens in tests. Read
them with `System.getenv("API_BASE_URL")` so the same tests run locally and
in CI. See the [Rest Assured guide](/docs/sdet-skills/rest-assured/rest-assured-guide)
for authentication, JSON schema checks, and request specifications.

**Try it:** add a `DELETE /users/1` route that returns `204` and a test for it.

---

## 7. Use Case: Build a UI Framework with Page Objects

**The task:** write browser tests that don't break every time a button moves.

**Fundamentals used:** classes, inheritance, encapsulation, method chaining.

**How it works:** the **Page Object Model** puts each page's locators and
actions in one class. Tests call `loginPage.loginAs("ada", "pw")` and never
touch locators — so when the page changes, you fix one class, not fifty tests.

```java
// src/test/java/com/example/ui/pages/BasePage.java
package com.example.ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class BasePage {

    protected final WebDriver driver;
    private final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    protected WebElement visible(By locator) {                // waits, then returns the element
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    protected void type(By locator, String text) {
        WebElement field = visible(locator);
        field.clear();
        field.sendKeys(text);
    }
}
```

```java
// src/test/java/com/example/ui/pages/LoginPage.java
package com.example.ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    private static final By USERNAME = By.id("username");
    private static final By PASSWORD = By.id("password");
    private static final By SUBMIT = By.cssSelector("button[type=submit]");
    private static final By ERROR = By.cssSelector("[data-test=error]");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public LoginPage open(String baseUrl) {
        driver.get(baseUrl + "/login");
        return this;                                          // lets tests chain calls
    }

    public DashboardPage loginAs(String user, String password) {
        type(USERNAME, user);
        type(PASSWORD, password);
        click(SUBMIT);
        return new DashboardPage(driver);                     // the page you land on
    }

    public String errorMessage() {
        return visible(ERROR).getText();
    }
}
```

```java
// src/test/java/com/example/ui/pages/DashboardPage.java
package com.example.ui.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class DashboardPage extends BasePage {

    private static final By WELCOME = By.cssSelector("[data-test=welcome]");

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public String welcomeText() {
        return visible(WELCOME).getText();
    }
}
```

```java
// src/test/java/com/example/ui/LoginUiTest.java
package com.example.ui;

import com.example.ui.pages.LoginPage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Tag("ui")                                                    // run with: mvn test -Dgroups=ui
class LoginUiTest {

    static final String BASE_URL = System.getenv().getOrDefault("APP_URL", "http://localhost:8080");
    WebDriver driver;

    @BeforeEach
    void openBrowser() {
        driver = new ChromeDriver(new ChromeOptions().addArguments("--headless=new"));   // no window: works in CI
    }

    @AfterEach
    void closeBrowser() {
        driver.quit();                                        // always close, even if the test failed
    }

    @Test
    void validUserSeesWelcome() {
        String welcome = new LoginPage(driver).open(BASE_URL).loginAs("ada", "correct-pw").welcomeText();
        assertEquals("Welcome, Ada", welcome);
    }
}
```

**Watch out for:** prefer stable locators — `id` or a dedicated `data-test`
attribute — over long XPath or CSS paths that copy the page layout. See the
[Selenium guide](/docs/sdet-skills/selenium/selenium-guide) for grids, browsers,
and screenshots on failure.

**Try it:** add an `invalidPasswordShowsError` test using `errorMessage()`.
Notice `LoginPage` needs no change.

---

## 8. Use Case: Wait for Slow Things (Avoid Flaky Tests)

**The task:** wait for something that becomes true *eventually* — a job
finishing, a message arriving, a page updating — without fixed sleeps.

**Fundamentals used:** generics, `Supplier` and `Predicate` lambdas, `Duration`,
loops, exceptions.

**How it works:** a **flaky test** passes sometimes and fails sometimes with no
code change — usually because of timing. `Thread.sleep(5000)` is either too
short (flaky) or too long (slow). Instead, **poll**: check often, return as
soon as the condition is true, and fail with a clear message at a deadline.

```java
// src/test/java/com/example/support/Waits.java
package com.example.support;

import java.time.Duration;
import java.time.Instant;
import java.util.function.Predicate;
import java.util.function.Supplier;

public final class Waits {

    private Waits() { }

    /** Calls check until accept(value) is true, then returns that value. */
    public static <T> T until(Supplier<T> check, Predicate<T> accept, Duration timeout, Duration every) {
        Instant deadline = Instant.now().plus(timeout);
        T last = null;
        while (Instant.now().isBefore(deadline)) {
            last = check.get();
            if (accept.test(last)) {
                return last;                                 // done as soon as it's true
            }
            try {
                Thread.sleep(every);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("interrupted while waiting", e);
            }
        }
        throw new AssertionError("condition not met within " + timeout + "; last value was: " + last);
    }
}
```

```java
// src/test/java/com/example/support/WaitsTest.java
package com.example.support;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class WaitsTest {

    @Test
    void returnsAsSoonAsTheJobFinishes() {
        AtomicReference<String> status = new AtomicReference<>("RUNNING");
        CompletableFuture.runAsync(() -> status.set("DONE"),
                CompletableFuture.delayedExecutor(300, TimeUnit.MILLISECONDS));   // finishes after ~0.3 s

        String result = Waits.until(status::get, "DONE"::equals, Duration.ofSeconds(5), Duration.ofMillis(50));

        assertEquals("DONE", result);
    }

    @Test
    void failsWithTheLastValueAtTheDeadline() {
        AssertionError e = assertThrows(AssertionError.class,
                () -> Waits.until(() -> "RUNNING", "DONE"::equals, Duration.ofMillis(200), Duration.ofMillis(50)));
        assertTrue(e.getMessage().contains("last value was: RUNNING"));
    }
}
```

In Selenium, `WebDriverWait` (used in `BasePage` above) does the same job for
page elements. For everything else, the **Awaitility** library offers this
pattern ready-made: `await().atMost(5, SECONDS).until(() -> job.isDone())`.

**Try it:** use `Waits.until` to wait for a file to appear in a `@TempDir`
folder that a background task creates after 200 ms.

---

## 9. Use Case: Create Test Data with Builders

**The task:** each test needs a user, but only cares about one or two fields.

**Fundamentals used:** records, classes, method chaining, `static` factory
methods, `AtomicInteger`.

**How it works:** a **test data builder** fills in sensible defaults, so each
test only states what matters to it. A counter keeps emails unique, so tests
never clash on a "unique email" rule.

```java
// src/test/java/com/example/support/User.java
package com.example.support;

public record User(String name, String email, String role, boolean active) { }
```

```java
// src/test/java/com/example/support/UserBuilder.java
package com.example.support;

import java.util.concurrent.atomic.AtomicInteger;

public final class UserBuilder {

    private static final AtomicInteger COUNTER = new AtomicInteger();

    private String name = "Test User";
    private String email = "user" + COUNTER.incrementAndGet() + "@example.test";   // unique every time
    private String role = "viewer";
    private boolean active = true;

    public static UserBuilder aUser() { return new UserBuilder(); }

    public UserBuilder named(String name) { this.name = name; return this; }
    public UserBuilder withRole(String role) { this.role = role; return this; }
    public UserBuilder inactive() { this.active = false; return this; }

    public User build() { return new User(name, email, role, active); }
}
```

```java
// src/test/java/com/example/support/UserBuilderTest.java
package com.example.support;

import org.junit.jupiter.api.Test;

import static com.example.support.UserBuilder.aUser;
import static org.junit.jupiter.api.Assertions.*;

class UserBuilderTest {

    @Test
    void defaultsAreSensible() {
        User user = aUser().build();
        assertTrue(user.active());
        assertEquals("viewer", user.role());
    }

    @Test
    void testsOnlyStateWhatMatters() {
        User admin = aUser().withRole("admin").inactive().build();   // reads like the test's intent
        assertEquals("admin", admin.role());
        assertFalse(admin.active());
    }

    @Test
    void everyUserGetsAUniqueEmail() {
        assertNotEquals(aUser().build().email(), aUser().build().email());
    }
}
```

**Try it:** add an `anAdmin()` shortcut that returns `aUser().withRole("admin")`.

---

## 10. Use Case: Group, Filter and Parallelise Tests

**The task:** run only the fast smoke tests on every commit, everything
nightly — and make the full run faster.

**Fundamentals used:** annotations (including making your own), properties
files, concurrency.

**How it works:** `@Tag` labels tests; Maven's `-Dgroups` picks which labels
to run. Your own annotation can bundle `@Test` and `@Tag` so the label can't
be misspelled. A properties file turns on parallel runs.

```java
// src/test/java/com/example/support/SmokeTest.java
package com.example.support;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)        // keep it at runtime so JUnit can see it
@Tag("smoke")
@Test
public @interface SmokeTest { }            // use @SmokeTest instead of @Test + @Tag("smoke")
```

```java
// src/test/java/com/example/support/HealthSmokeTest.java
package com.example.support;

import static org.junit.jupiter.api.Assertions.assertTrue;

class HealthSmokeTest {

    @SmokeTest
    void applicationAnswers() {
        assertTrue(true, "replace with a real health-check call");
    }
}
```

```text
# src/test/resources/junit-platform.properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.config.strategy = dynamic
```

```bash
mvn test -Dgroups=smoke              # only smoke tests
mvn test -DexcludedGroups=ui         # everything except browser tests
mvn test -Dgroups='api & !slow'      # tag expressions: and (&), or (|), not (!)
```

**Watch out for:** parallel tests must not share changeable state — no
`static` fields that tests write to, and each test uses its own data (the
builder's unique emails help). Mark a class `@Execution(ExecutionMode.SAME_THREAD)`
if it genuinely can't run in parallel. See the
[JUnit guide](/docs/sdet-skills/junit/junit-guide) and
[TestNG guide](/docs/sdet-skills/testng/testng-guide) for suites and listeners.

**Try it:** tag the UI test from use case 7 as `slow` too, and run everything
except slow tests.

---

## 11. Use Case: Summarise Test Results

**The task:** after a run, print (or post to chat) a one-line summary and the
names of failed tests.

**Fundamentals used:** files, XML parsing, records, streams.

**How it works:** Maven writes one XML report per test class to
`target/surefire-reports/TEST-*.xml`. Each `<testsuite>` element has totals as
attributes, and each failed `<testcase>` contains a `<failure>` or `<error>`
element. Read them all and add them up.

```java
// src/test/java/com/example/support/ReportSummary.java
package com.example.support;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public record ReportSummary(int tests, int failed, int skipped, List<String> failures) {

    public static ReportSummary from(Path reportsDir) throws Exception {
        int tests = 0, failed = 0, skipped = 0;
        List<String> failures = new ArrayList<>();
        List<Path> files;
        try (Stream<Path> list = Files.list(reportsDir)) {
            files = list.filter(p -> p.getFileName().toString().matches("TEST-.*\\.xml")).sorted().toList();
        }
        for (Path file : files) {
            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(file.toFile());
            Element suite = doc.getDocumentElement();
            tests += Integer.parseInt(suite.getAttribute("tests"));
            failed += Integer.parseInt(suite.getAttribute("failures")) + Integer.parseInt(suite.getAttribute("errors"));
            skipped += Integer.parseInt(suite.getAttribute("skipped"));

            NodeList cases = suite.getElementsByTagName("testcase");
            for (int i = 0; i < cases.getLength(); i++) {
                Element tc = (Element) cases.item(i);
                if (tc.getElementsByTagName("failure").getLength() > 0 || tc.getElementsByTagName("error").getLength() > 0) {
                    failures.add(tc.getAttribute("classname") + "." + tc.getAttribute("name"));
                }
            }
        }
        return new ReportSummary(tests, failed, skipped, List.copyOf(failures));
    }

    public String oneLine() {
        String status = failed == 0 ? "PASSED" : "FAILED";
        return "%s: %d tests, %d failed, %d skipped".formatted(status, tests, failed, skipped);
    }

    public static void main(String[] args) throws Exception {
        ReportSummary summary = from(Path.of(args.length > 0 ? args[0] : "target/surefire-reports"));
        System.out.println(summary.oneLine());
        summary.failures().forEach(f -> System.out.println("  ✗ " + f));
        System.exit(summary.failed() == 0 ? 0 : 1);            // non-zero exit fails the CI step
    }
}
```

```java
// src/test/java/com/example/support/ReportSummaryTest.java
package com.example.support;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReportSummaryTest {

    @Test
    void addsUpEveryReportFile(@TempDir Path dir) throws Exception {
        Files.writeString(dir.resolve("TEST-CartTest.xml"), """
                <testsuite name="CartTest" tests="3" failures="1" errors="0" skipped="1">
                  <testcase classname="CartTest" name="adds"/>
                  <testcase classname="CartTest" name="removes"><failure message="expected 0"/></testcase>
                  <testcase classname="CartTest" name="later"><skipped/></testcase>
                </testsuite>
                """);
        Files.writeString(dir.resolve("TEST-ApiTest.xml"), """
                <testsuite name="ApiTest" tests="2" failures="0" errors="1" skipped="0">
                  <testcase classname="ApiTest" name="get"/>
                  <testcase classname="ApiTest" name="post"><error message="timeout"/></testcase>
                </testsuite>
                """);
        Files.writeString(dir.resolve("notes.txt"), "ignored");

        ReportSummary summary = ReportSummary.from(dir);

        assertEquals("FAILED: 5 tests, 2 failed, 1 skipped", summary.oneLine());
        assertEquals(List.of("ApiTest.post", "CartTest.removes"), summary.failures());
    }
}
```

**Try it:** add the slowest three tests to the summary, using each
`<testcase>`'s `time` attribute.

---

## 12. Use Case: Run Tests in CI/CD

**The task:** run the tests automatically on every push and pull request,
and keep the reports when something fails.

**Fundamentals used:** build tool commands, environment variables, exit codes.

**How it works:** **CI** (Continuous Integration) runs your build on a clean
machine for every change. `mvn verify` exits with a non-zero code when a test
fails, which marks the run red. Secrets come from the CI system's secret
store as environment variables — never from the repository.

```yaml
# .github/workflows/tests.yml
name: tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven                              # reuse downloaded libraries between runs
      - name: Unit and API tests
        run: mvn -B verify -DexcludedGroups=ui      # -B = batch mode: plain logs
        env:
          API_BASE_URL: ${{ vars.API_BASE_URL }}
          API_TOKEN: ${{ secrets.API_TOKEN }}
      - name: Keep the reports
        if: always()                                # upload even when tests failed
        uses: actions/upload-artifact@v4
        with:
          name: surefire-reports
          path: target/surefire-reports/
```

**Try it:** add a second job that runs only `-Dgroups=smoke` after the first
job succeeds (`needs: test`).

---

## 13. How to Organise a Test Project

```text
my-app/
├── pom.xml
├── src/main/java/com/example/...           ← application code
└── src/test/
    ├── java/com/example/
    │   ├── shop/        ← unit tests, next to the package they test
    │   ├── orders/      ← unit tests with mocks
    │   ├── api/         ← API tests (tag: api)
    │   ├── ui/          ← browser tests (tag: ui)
    │   │   └── pages/   ← page objects
    │   └── support/     ← builders, waits, custom annotations, report tools
    └── resources/
        ├── junit-platform.properties
        └── prices.csv   ← test data files
```

**The test pyramid:** write many unit tests, fewer API/integration tests, and
only a few end-to-end UI tests. Unit tests are fast and exact; UI tests are
slow but prove the whole system works together.

```text
        /\        UI / end-to-end: few, slow, full journeys
       /  \
      /----\      API / integration: some, medium speed
     /      \
    /--------\    Unit: many, very fast
```

---

## 14. Practice Projects {#practice-projects}

Build these in order. Each one uses more fundamentals.

| # | Project | Fundamentals practised |
|---|---------|------------------------|
| 1 | Unit tests for your [Milestone 5 bank accounts](/docs/learning-path/java/milestones-and-mini-projects#milestone-5), with `@Nested` groups | classes, exceptions, fixtures |
| 2 | Data-driven tests from a CSV file for a validation rule | records, files, `@ParameterizedTest` |
| 3 | API test suite for a public demo API with a shared request specification | Rest Assured, records, env variables |
| 4 | Order service with mocked payment and email, including retry | interfaces, Mockito, lambdas |
| 5 | Page object framework for a demo website | inheritance, waits, `WebDriver` |
| 6 | Test results summary tool that posts to chat | files, XML, streams, exit codes |
| 7 | CI pipeline running unit, API, and smoke tests, keeping reports | build tools, tags, YAML |
| 8 | **Final project:** full automation suite for one application — unit + API + UI tests, test data builders, parallel runs, CI, and a report | everything above |

---

## 15. Skills Checklist

- [ ] I can write a test with Arrange → Act → Assert and `assertThrows`.
- [ ] I can share set-up with `@BeforeEach` and group tests with `@Nested`.
- [ ] I can run one test with many inputs from `@CsvSource`, a CSV file, or a method.
- [ ] I can mock an interface with Mockito, stub its answers, and verify calls.
- [ ] I know what not to mock.
- [ ] I can test a REST API's status codes and JSON with Rest Assured.
- [ ] I can build page objects on a base class, with stable locators.
- [ ] I can replace fixed sleeps with polling waits.
- [ ] I can build test data with a builder and defaults.
- [ ] I can tag tests, filter them, and run them in parallel safely.
- [ ] I can summarise test reports and fail a build with the right exit code.
- [ ] I can run the whole suite in CI with secrets from environment variables.

**Next:** read [Java Coding Best Practices](/docs/fundamentals/java/coding-best-practices),
then the tool guides for [JUnit](/docs/sdet-skills/junit/junit-guide),
[TestNG](/docs/sdet-skills/testng/testng-guide),
[Rest Assured](/docs/sdet-skills/rest-assured/rest-assured-guide), and
[Selenium](/docs/sdet-skills/selenium/selenium-guide).
