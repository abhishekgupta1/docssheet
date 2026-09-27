---
title: "Java Coding Best Practices"
description: "Habits that make Java code easier to read, test, change, and run safely — naming, classes, nulls, exceptions, collections, logging, concurrency, security, testing, and a pre-commit checklist."
sidebar_position: 2
level: intermediate
tags: [java, fundamentals, best-practices]
image: /img/social/java-coding-best-practices.png
---

# Java Coding Best Practices

This page lists good habits for writing Java code.
These habits make code easier to read, test, change, and run safely.
They apply to everyone: SDET, SDE, and SRE.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example, where it helps.

:::tip How to use this page

Read it once after you finish Part 2 of the [Java cheat sheet](/cheatsheets/java),
then use [the checklist at the end](#15-short-checklist-before-you-commit)
before every commit. Pick two or three habits to practise each week rather than
all at once.

:::

---

## Contents

1. [Naming](#1-naming)
2. [Methods](#2-methods)
3. [Classes and Design](#3-classes-and-design)
4. [Null Handling](#4-null-handling)
5. [Exceptions](#5-exceptions)
6. [Collections and Streams](#6-collections-and-streams)
7. [Resources: Files, Connections, Streams](#7-resources-files-connections-streams)
8. [Logging](#8-logging)
9. [Concurrency](#9-concurrency)
10. [Testing](#10-testing)
11. [Security](#11-security)
12. [Performance](#12-performance)
13. [Project and Build](#13-project-and-build)
14. [Tools That Help](#14-tools-that-help)
15. [Short Checklist Before You Commit](#15-short-checklist-before-you-commit)

---

## 1. Naming

**In short:** a good name makes a comment unnecessary.

| Thing | Style | Example |
|---|---|---|
| Class, record, interface, enum | `PascalCase`, a noun | `OrderService`, `PaymentStatus` |
| Method | `camelCase`, a verb | `calculateTotal()`, `isExpired()` |
| Variable, parameter | `camelCase`, a noun | `retryCount`, `customerId` |
| Constant (`static final`) | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Package | all lower case, reversed domain | `com.example.orders` |
| Test method | the behaviour it checks | `rejectsExpiredCard()` |

- **Do** name booleans as questions: `isActive`, `hasAccess`, `canRetry`.
  **Why:** `if (user.isActive())` reads like a sentence.
- **Do** avoid abbreviations: `customer`, not `cust`; `count`, not `cnt`.
  **Why:** code is read far more often than it's typed.

---

## 2. Methods

**In short:** small methods that do one thing, with few inputs.

- **Do** keep methods short — if you need a comment to separate "steps",
  each step is probably its own method.
  **Why:** short methods are easy to name, test, and reuse.
- **Do** keep parameters to three or fewer; group more into a record.
  **Why:** `createUser(name, email, age, role, active)` is easy to call with
  arguments in the wrong order.

```java
// Harder to use correctly
static void createUser(String name, String email, int age, String role, boolean active) { }

// Easier: one clear input
record NewUser(String name, String email, int age, String role, boolean active) { }
static void createUser(NewUser user) { }
```

- **Do** return early to avoid deep nesting ("guard clauses").

```java
static double discount(String customerType, double total) {
    if (total <= 0) return 0;                 // guard: nothing to discount
    if (!"VIP".equals(customerType)) return 0;
    return total * 0.1;                       // the main rule, not nested
}
```

- **Do** avoid `boolean` flag parameters like `save(order, true)`.
  **Why:** nobody knows what `true` means at the call site. Write two methods
  (`save`, `saveAndNotify`) or pass an enum.

---

## 3. Classes and Design

**In short:** small classes, private data, and depend on interfaces.

- **Do** make fields `private` and `final` wherever you can.
  **Why:** a field that can't change can't be changed by mistake.
- **Do** use a `record` for plain data (DTOs — Data Transfer Objects — API
  responses, test data).
  **Why:** you get constructor, getters, `equals`, `hashCode`, `toString` for
  free, and the object can't change.
- **Do** pass dependencies in through the constructor ("dependency injection").

```java
interface PaymentGateway { boolean charge(String card, long cents); }

class CheckoutService {
    private final PaymentGateway gateway;          // depends on the interface

    CheckoutService(PaymentGateway gateway) {       // given from outside
        this.gateway = gateway;
    }

    boolean pay(String card, long cents) {
        return gateway.charge(card, cents);
    }
}
```

**Why:** in a test you can pass a fake gateway; in production, the real one.
No code change needed.

- **Do** prefer composition ("has a") over inheritance ("is a").
  **Why:** deep class trees are hard to change — a fix in the parent can break
  every child.
- **Do** always override `equals` and `hashCode` together (or use a record).
  **Why:** a class with only `equals` misbehaves in `HashSet` and `HashMap`.

---

## 4. Null Handling

**In short:** make "no value" visible instead of letting `null` travel.

- **Do** return an empty collection, never `null`, from methods that return lists.

```java
List<String> findTags(String id) {
    return List.of();          // not null — callers can loop safely
}
```

- **Do** return `Optional<T>` when a single result may be missing.
- **Do** check inputs at the boundary with `Objects.requireNonNull`.

```java
import java.util.Objects;

class Order {
    private final String id;
    Order(String id) {
        this.id = Objects.requireNonNull(id, "id must not be null");   // fail fast, clear message
    }
}
```

- **Do** put the known value first when comparing: `"VIP".equals(type)`.
  **Why:** it can't throw `NullPointerException` even if `type` is `null`.
- **Don't** use `Optional` for fields, parameters, or collections.
  **Why:** it was designed for return values; elsewhere it just adds noise.

---

## 5. Exceptions

**In short:** fail loudly with a clear message, and never hide a failure.

- **Do** catch the most specific exception you can handle.
- **Don't** swallow exceptions.

```java
// Bad — the failure disappears
try { riskyCall(); } catch (Exception e) { }

// Good — handle it or pass it on, keeping the original as the "cause"
try {
    riskyCall();
} catch (java.io.IOException e) {
    throw new IllegalStateException("could not load settings", e);
}

static void riskyCall() throws java.io.IOException { }
```

- **Do** use unchecked exceptions (`extends RuntimeException`) for your own
  business errors, and give them a clear name.
  **Why:** `OrderNotFoundException` says more than `RuntimeException("oops")`,
  and callers aren't forced to write empty `catch` blocks.
- **Do** include the useful values in the message: `"order 42 not found"`,
  not `"not found"`.
- **Don't** use exceptions for normal control flow (e.g. to leave a loop).
  **Why:** it's slow and hides what the code is doing.

---

## 6. Collections and Streams

**In short:** declare the interface, pick the right implementation, keep
streams simple.

- **Do** declare variables by interface: `List<String> names = new ArrayList<>();`
  **Why:** you can switch the implementation later without touching callers.
- **Do** use `List.of`, `Set.of`, `Map.of` for fixed data, and `List.copyOf`
  when handing out a list you own.
  **Why:** callers can't change your data behind your back.
- **Do** use a `Set` or `Map` for "is X in here?" checks, not a `List`.
  **Why:** `HashSet.contains` stays fast at any size; `List.contains` checks
  every item.
- **Do** keep stream chains short and readable; use a loop when it's clearer.

```java
record User(String name, int age, boolean active) { }
List<User> users = List.of(new User("Ada", 36, true), new User("Bo", 15, true));

// Clear: each step does one thing
List<String> activeAdults = users.stream()
    .filter(User::active)
    .filter(u -> u.age() >= 18)
    .map(User::name)
    .toList();
```

- **Don't** change outside variables from inside a stream (`forEach(x -> list.add(x))`).
  **Why:** it breaks with parallel streams and hides the result. Use `toList()`
  or a collector.

---

## 7. Resources: Files, Connections, Streams

**In short:** anything you open, close — use `try`-with-resources.

```java
import java.nio.file.*;
import java.io.*;

static long countLines(Path file) throws IOException {
    try (var lines = Files.lines(file)) {      // closed even if an exception is thrown
        return lines.count();
    }
}
```

**Why:** leaked file handles and database connections make long-running
services fail hours later, far from the real bug. This applies to anything
that `implements AutoCloseable` — files, JDBC (Java Database Connectivity)
connections, HTTP clients, `ExecutorService` (Java 19+).

---

## 8. Logging

**In short:** use a logger, not `System.out.println`, and log facts, not noise.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    void pay(String orderId, long cents) {
        log.info("Charging order {} for {} cents", orderId, cents);   // {} placeholders
        try {
            charge();
        } catch (RuntimeException e) {
            log.error("Charge failed for order {}", orderId, e);       // exception last → full stack trace
            throw e;
        }
    }
    void charge() { }
}
```

- **Do** use `{}` placeholders instead of `+`.
  **Why:** the message is only built if that level is switched on.
- **Do** pick the right level: `ERROR` needs a human, `WARN` is unusual but
  handled, `INFO` is a business event, `DEBUG` is for developers.
- **Don't** log passwords, tokens, card numbers, or personal data.

**SLF4J** (Simple Logging Facade for Java) is the common logging API; Logback
or Log4j 2 does the actual writing.

---

## 9. Concurrency

**In short:** share less, and use the ready-made thread-safe tools.

- **Do** use an `ExecutorService` rather than `new Thread(...)`.
- **Do** prefer immutable objects (records, `List.copyOf`) for data shared
  between threads.
- **Do** use `ConcurrentHashMap` and `AtomicInteger` rather than
  `synchronized` blocks around a `HashMap` or `int`.
- **Do** always set timeouts on waits: `future.get(5, TimeUnit.SECONDS)`.
  **Why:** a call that never returns will eventually freeze every thread.
- **Don't** use `Thread.sleep` to "wait until it's ready" in real code or tests;
  wait for the actual condition (a `CountDownLatch`, a polling loop with a
  deadline, or Awaitility in tests).

---

## 10. Testing

**In short:** fast, independent tests that each check one behaviour.

- **Do** follow Arrange → Act → Assert, with a blank line between them.

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class DiscountTest {
    static double discount(String type, double total) {
        return "VIP".equals(type) ? total * 0.1 : 0;
    }

    @Test
    void vipGetsTenPercent() {
        double total = 200;                          // Arrange

        double result = discount("VIP", total);      // Act

        assertEquals(20, result, 0.001);             // Assert
    }
}
```

- **Do** make tests independent: no shared mutable state, no required order.
- **Do** use `@ParameterizedTest` for the same check with many inputs.
- **Do** mock only what you don't own or what is slow (HTTP, database, clock).
  **Why:** over-mocked tests pass while the real code is broken.
- **Do** test the edge cases: empty, `null`, zero, negative, very large, duplicates.

---

## 11. Security

**In short:** never trust input, never store secrets in code.

- **Do** use `PreparedStatement` parameters for SQL, never string joining.

```java
import java.sql.*;

static ResultSet findUser(Connection db, String name) throws SQLException {
    // BAD:  "SELECT * FROM users WHERE name = '" + name + "'"   → SQL injection
    PreparedStatement ps = db.prepareStatement("SELECT * FROM users WHERE name = ?");
    ps.setString(1, name);                     // treated purely as a value
    return ps.executeQuery();
}
```

- **Do** read secrets from environment variables or a secrets manager:
  `System.getenv("DB_PASSWORD")`.
- **Do** keep dependencies up to date and scan them (OWASP Dependency-Check,
  Dependabot).
  **Why:** most real-world Java breaches come from old libraries, not your code.
- **Don't** deserialize untrusted data with `ObjectInputStream`; use JSON with
  a fixed target class instead.

---

## 12. Performance

**In short:** make it correct and clear first, then measure, then optimise the
slow part only.

- **Do** use `StringBuilder` when building text in a loop.
- **Do** pick the right collection (see the
  [collection speed table](/docs/fundamentals/java/java-quick-reference#collection-speed)).
- **Do** size collections when you know the size: `new ArrayList<>(10_000)`.
- **Do** measure with a profiler (Java Flight Recorder, async-profiler) or JMH
  (Java Microbenchmark Harness) — not with guesses or one-off `System.nanoTime` runs.
- **Don't** create expensive objects in hot loops: compile a `Pattern` once,
  reuse one `ObjectMapper`, reuse one `HttpClient`.

---

## 13. Project and Build

**In short:** standard layout, pinned versions, one command to build.

```text
my-service/
├── pom.xml  (or build.gradle.kts)
├── src/main/java/com/example/orders/   ← code, one package per feature
├── src/main/resources/                  ← config files
└── src/test/java/com/example/orders/   ← tests mirror the code packages
```

- **Do** pin dependency versions and commit the Gradle/Maven wrapper
  (`gradlew`, `mvnw`).
  **Why:** everyone, including CI (Continuous Integration), builds with exactly
  the same versions.
- **Do** target an LTS (Long-Term Support) Java version: 17, 21, or 25.
- **Do** package by feature (`orders`, `payments`), not by layer
  (`controllers`, `services`).
  **Why:** everything about one feature sits together.

---

## 14. Tools That Help

| Tool | What it does |
|---|---|
| IntelliJ IDEA inspections | Highlights bugs and simplifications as you type |
| Checkstyle / Spotless | Enforces one formatting style |
| SpotBugs / Error Prone | Finds likely bugs (null risks, bad `equals`) at build time |
| SonarQube / SonarLint | Code-quality and security findings |
| JaCoCo | Shows which lines your tests cover |
| OWASP Dependency-Check | Flags libraries with known vulnerabilities |

---

## 15. Short Checklist Before You Commit

- [ ] Names say what things are and do; no unexplained abbreviations.
- [ ] Methods are short, with three or fewer parameters.
- [ ] Fields are `private final` where possible; data classes are records.
- [ ] No method returns `null` for a collection; single "maybe" results use `Optional`.
- [ ] No empty `catch` blocks; exceptions keep their cause.
- [ ] Every file, connection, and stream is opened in `try`-with-resources.
- [ ] Logging uses `{}` placeholders and contains no secrets.
- [ ] SQL uses `PreparedStatement` parameters.
- [ ] New behaviour has tests, including edge cases, and `mvn test` / `./gradlew test` passes.
- [ ] The build shows no new compiler or linter warnings.
