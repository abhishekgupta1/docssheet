---
title: "Java: The Complete Guide"
description: "End-to-end reference for Java — JVM internals, OOP and generics, collections/streams, concurrency, and interview-ready Q&A."
sidebar_position: 1
tags: [java, sdet, programming-language]
---

# Java — The Complete Guide

A single-read, end-to-end reference for Java: enough to onboard onto a new
codebase, write idiomatic production code, or walk into an SDET interview.
Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/java">📋 Quick reference: Java →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 360" role="img" aria-labelledby="mm-java-title mm-java-desc">
<title id="mm-java-title">From Java source to a running program</title>
<desc id="mm-java-desc">Source code compiles to platform-independent bytecode, which the JVM loads via its classloader, executes through its execution engine, and manages via memory and garbage collection, before running on the host OS and hardware.</desc>
<defs>
  <marker id="mm-java-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="305" y="20" width="170" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="47" text-anchor="middle">Source code</text>
<text class="mm-node-sub" x="390" y="63" text-anchor="middle">.java, compiled by javac</text>
<path class="mm-arrow" d="M390,80 L390,106" marker-end="url(#mm-java-arrow)"/>

<rect class="mm-n2" x="305" y="110" width="170" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="137" text-anchor="middle">Bytecode</text>
<text class="mm-node-sub" x="390" y="153" text-anchor="middle">.class files</text>

<path class="mm-arrow" d="M370,170 L155,200" marker-end="url(#mm-java-arrow)"/>
<path class="mm-arrow" d="M390,170 L390,200" marker-end="url(#mm-java-arrow)"/>
<path class="mm-arrow" d="M410,170 L625,200" marker-end="url(#mm-java-arrow)"/>

<rect class="mm-n5" x="60" y="200" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="155" y="230" text-anchor="middle">Classloader</text>
<text class="mm-node-sub" x="155" y="247" text-anchor="middle">loads .class files</text>

<rect class="mm-n4" x="295" y="200" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="390" y="230" text-anchor="middle">Execution engine</text>
<text class="mm-node-sub" x="390" y="247" text-anchor="middle">interprets / JIT-compiles</text>

<rect class="mm-n6" x="530" y="200" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="625" y="230" text-anchor="middle">Memory &amp; GC</text>
<text class="mm-node-sub" x="625" y="247" text-anchor="middle">heap, stack, GC</text>

<path class="mm-arrow" d="M390,270 L390,300" marker-end="url(#mm-java-arrow)"/>

<rect class="mm-n1" x="305" y="300" width="170" height="45" rx="10"/>
<text class="mm-node-title" x="390" y="320" text-anchor="middle">Host OS / hardware</text>
<text class="mm-node-sub" x="390" y="335" text-anchor="middle">write once, run anywhere</text>
</svg>

<p class="mental-model__caption">Java source compiles once to bytecode, and the JVM does the rest: the classloader brings .class files in, the execution engine interprets or JIT-compiles them, and the memory manager handles heap allocation and garbage collection — the same bytecode then runs unmodified on whatever OS and hardware host the JVM.</p>
</div>

## 1. What Java Is, in Practical Terms

Java is a **statically typed, compiled-to-bytecode, garbage-collected,
object-oriented** language. Source (`.java`) compiles to platform-independent
**bytecode** (`.class`), which the **JVM (Java Virtual Machine)** executes —
"write once, run anywhere." This matters directly for SDET work: **Selenium,
Appium, TestNG, JUnit, REST Assured, and Cucumber-JVM are all Java-based**,
so fluency in the language is the prerequisite for fluency in the entire
mainstream automation stack, not a separate skill from it.

| Term | Meaning |
|---|---|
| **JDK** (Java Development Kit) | Compiler (`javac`) + JVM + standard library — what you install to build/run Java |
| **JRE** (Java Runtime Environment) | JVM + libraries only, no compiler — just to *run* compiled Java (mostly folded into JDK distributions today) |
| **JVM** (Java Virtual Machine) | The runtime that loads, verifies, and executes bytecode; provides memory management (GC) and platform abstraction |

Current LTS releases in active industry use: **Java 17** and **Java 21**
(virtual threads, pattern matching, records are now standard toolbox items in
modern codebases and worth knowing even if a legacy project targets Java 8).

---

## 2. JVM Basics: Compilation, Classloading, Memory

```
.java source
    │  javac
    ▼
.class bytecode  ──────────────►  JVM
                                     │
                        ┌────────────┼────────────┐
                        ▼            ▼             ▼
                  Classloader   Bytecode        Runtime
                  (loads .class  Verifier      Data Areas
                   files at         │          (heap, stack,
                   runtime)         ▼           method area)
                              JIT Compiler
                          (bytecode → native
                           machine code, hot paths)
```

- **Classloading** is lazy and hierarchical (Bootstrap → Extension/Platform →
  Application classloader) — a class is loaded the first time it's
  referenced, not all upfront.
- **JIT (Just-In-Time) compilation** — the JVM interprets bytecode initially,
  then compiles "hot" methods (called frequently) to native machine code at
  runtime for near-native performance after warm-up. This is why JVM
  benchmarks often show a warm-up period before steady-state throughput.
- **Memory areas**:
  - **Heap** — all objects live here; shared across threads; garbage
    collected.
  - **Stack** — one per thread; holds local variables and method call
    frames; `StackOverflowError` on unbounded recursion.
  - **Method area / Metaspace** — class metadata, static fields.
- **Garbage Collection** — automatic; modern default collectors (G1, and
  ZGC/Shenandoah for very low pause-time needs) reclaim unreachable objects.
  You don't manually free memory, but you can still leak it (e.g., static
  collections that grow forever, unclosed resources, listeners never
  deregistered).

---

## 3. Core Language: Types, Operators, Control Flow

Java is **statically typed** — every variable's type is checked at compile
time. It has two type categories:

| Category | Examples | Notes |
|---|---|---|
| **Primitives** | `int`, `long`, `double`, `boolean`, `char`, `byte`, `short`, `float` | Stored by value, not on the heap as objects, no `null` |
| **Reference types** | Classes, interfaces, arrays, `String` | Variables hold a reference to a heap object; can be `null` |

**Autoboxing/unboxing** converts between primitives and their wrapper
classes automatically (`int` ↔ `Integer`) — convenient but a classic gotcha:

```java
Integer a = 127, b = 127;
System.out.println(a == b);   // true — Integer caches -128..127

Integer x = 200, y = 200;
System.out.println(x == y);   // false — outside cache range, different objects!
System.out.println(x.equals(y)); // true — always use .equals() for wrapper comparison
```

**`String` is immutable** — every "modification" (`concat`, `+`, `replace`)
creates a new `String` object. In loops, prefer `StringBuilder`:

```java
StringBuilder sb = new StringBuilder();
for (String s : items) {
    sb.append(s).append(",");
}
String result = sb.toString();   // O(n), vs O(n²) for repeated String +=
```

`String` literals are also **interned** in a string pool — `"abc" ==
"abc"` is `true`, but `new String("abc") == "abc"` is `false`. Same rule as
above: use `.equals()` for content comparison, never `==`.

---

## 4. OOP: Classes, Interfaces, Inheritance

```java
public interface Shape {
    double area();                       // implicitly public abstract
    default String describe() {          // default method — since Java 8
        return "A shape with area " + area();
    }
}

public abstract class AbstractShape implements Shape {
    protected String name;
    protected AbstractShape(String name) { this.name = name; }
}

public class Circle extends AbstractShape {
    private final double radius;

    public Circle(double radius) {
        super("Circle");
        this.radius = radius;
    }

    @Override
    public double area() { return Math.PI * radius * radius; }
}
```

- **Interfaces** define a contract; a class implements as many as it wants
  (Java has no multiple *class* inheritance, but unlimited interface
  implementation). Since Java 8, interfaces can carry `default` and `static`
  method bodies.
- **Abstract classes** can hold state (fields) and partial implementation;
  a class extends **only one**.
- **`@Override`** is not required but should always be used — the compiler
  catches signature mismatches (e.g., a typo'd method name that would
  otherwise silently create a new method instead of overriding).
- **Access modifiers**: `private` (class only) → *(package-private, no
  keyword)* → `protected` (package + subclasses) → `public` (everywhere).
- **`final`**: on a class = no subclassing; on a method = no overriding; on
  a variable = assign-once (reference is fixed, but a `final List` can still
  have items added/removed — final protects the reference, not the object's
  mutability).

### `equals()` and `hashCode()`

Overriding `equals()` without `hashCode()` (or vice versa) breaks the
contract that equal objects must have equal hash codes — silently corrupts
behavior in `HashMap`/`HashSet` (lookups fail even when an "equal" object is
present). IDEs and `@EqualsAndHashCode` (Lombok) generate both together for
exactly this reason.

### Records (Java 16+)

```java
public record Point(int x, int y) { }
// auto-generates constructor, accessors x()/y(), equals(), hashCode(), toString()
```

Immutable data carriers — the modern replacement for boilerplate POJOs/DTOs
in test data models and API request/response objects.

---

## 5. Generics

Generics give **compile-time type safety** for containers and reusable APIs
without casting.

```java
public class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

Box<String> box = new Box<>();     // "diamond operator" infers <String>
box.set("hello");
String s = box.get();               // no cast needed
```

### Bounded wildcards

```java
public void printAll(List<? extends Number> list) { }   // read-only, accepts List<Integer>, List<Double>...
public void addNumbers(List<? super Integer> list) { }   // write-only, accepts List<Integer>, List<Number>, List<Object>
```

Mnemonic — **PECS**: *Producer Extends, Consumer Super*. Use `? extends T`
when you only read from the structure; `? super T` when you only write to
it.

**Type erasure**: generic type info exists only at compile time and is
erased at runtime — `List<String>` and `List<Integer>` are the same class
(`List`) at runtime. This is why you can't do `new T()` or `list instanceof List<String>`
directly, and why generic arrays (`new T[10]`) aren't allowed.

---

## 6. Collections Framework

```
                Collection
        ┌───────────┼───────────┐
       List         Set         Queue/Deque
   ArrayList    HashSet         ArrayDeque
   LinkedList   LinkedHashSet   PriorityQueue
   Vector       TreeSet

                    Map (separate hierarchy, not a Collection)
              HashMap, LinkedHashMap, TreeMap
```

| Type | Ordering | Duplicates | Typical use |
|---|---|---|---|
| `ArrayList` | Insertion order | Yes | Default general-purpose list; O(1) get, O(n) insert/remove in middle |
| `LinkedList` | Insertion order | Yes | O(1) insert/remove at ends; implements `Deque` too; rarely beats `ArrayList` in practice |
| `HashSet` | No guaranteed order | No | O(1) average membership check |
| `LinkedHashSet` | Insertion order | No | Set + predictable iteration order |
| `TreeSet` | Sorted (natural or `Comparator`) | No | O(log n) ops, sorted iteration |
| `HashMap` | No guaranteed order | Keys unique | Default key-value store; O(1) average get/put |
| `LinkedHashMap` | Insertion (or access) order | Keys unique | Predictable iteration; basis of simple LRU caches |
| `TreeMap` | Sorted by key | Keys unique | Sorted key iteration, range queries |

```java
Map<String, Integer> scores = new HashMap<>();
scores.put("alice", 90);
scores.merge("alice", 5, Integer::sum);      // atomic-ish "update or insert" pattern
scores.computeIfAbsent("bob", k -> 0);
scores.getOrDefault("carol", -1);

List<String> immutable = List.of("a", "b", "c");   // Java 9+ immutable factory
```

**Fail-fast iterators**: modifying a collection while iterating over it
(other than via the iterator's own `remove()`) throws
`ConcurrentModificationException`. Use `Iterator.remove()`, or collect
removals into a separate list, or use `removeIf()`:

```java
list.removeIf(item -> item.isExpired());   // safe, correct way
```

---

## 7. Streams and Lambdas (Java 8+)

Lambdas are anonymous implementations of **functional interfaces**
(single-abstract-method interfaces like `Runnable`, `Comparator`,
`Function<T,R>`, `Predicate<T>`).

```java
List<String> names = List.of("Charlie", "alice", "Bob");

names.stream()
     .filter(n -> n.length() > 3)
     .map(String::toUpperCase)
     .sorted()
     .forEach(System.out::println);

// collecting results
List<String> upper = names.stream()
     .map(String::toUpperCase)
     .collect(Collectors.toList());

Map<Integer, List<String>> byLength = names.stream()
     .collect(Collectors.groupingBy(String::length));

double avg = names.stream()
     .mapToInt(String::length)
     .average()
     .orElse(0.0);
```

- **Streams are lazy** — intermediate operations (`filter`, `map`, `sorted`)
  don't execute until a **terminal operation** (`collect`, `forEach`,
  `reduce`, `count`) is called; this enables pipeline fusion and short-
  circuiting (`findFirst`, `anyMatch` stop as soon as satisfied).
- **A stream can only be consumed once** — calling a terminal operation
  twice on the same stream throws `IllegalStateException`.
- Prefer **method references** (`String::toUpperCase`,
  `System.out::println`) over equivalent lambdas for readability when the
  lambda body is just a single method call.
- `Optional<T>` — wraps a possibly-absent value to force explicit
  null-handling (`.orElse()`, `.orElseThrow()`, `.ifPresent()`) instead of
  returning raw `null` and risking `NullPointerException` at some distant
  call site.

---

## 8. Exception Handling

```java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) { super(message); }
}

try {
    withdraw(balance, amount);
} catch (InsufficientFundsException e) {
    log.warn("withdrawal rejected: {}", e.getMessage());
} catch (IllegalArgumentException | NullPointerException e) {
    log.error("bad input", e);          // multi-catch, Java 7+
} finally {
    closeConnection();                    // always runs
}

try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
    return reader.readLine();
}   // reader.close() called automatically — try-with-resources, Java 7+
```

| Category | Examples | Must be declared/caught? |
|---|---|---|
| **Checked exceptions** | `IOException`, `SQLException` | Yes — compiler enforces `throws` or `try/catch` |
| **Unchecked (`RuntimeException`)** | `NullPointerException`, `IllegalArgumentException`, `IllegalStateException` | No — compiler doesn't force handling |
| **`Error`** | `OutOfMemoryError`, `StackOverflowError` | No — not meant to be caught/recovered from |

**Custom exceptions** for automation frameworks typically extend
`RuntimeException` rather than `Exception` — checked exceptions force every
caller up the stack to declare or catch them, which becomes noisy
boilerplate in test code (e.g., a custom `ElementNotInteractableException`
wrapping a Selenium failure with extra context).

**Best practice**: never swallow an exception silently
(`catch (Exception e) {}`) — at minimum log it; in test frameworks a
swallowed exception is a false-positive "pass."

---

## 9. Concurrency Basics

```java
Runnable task = () -> System.out.println("running on " + Thread.currentThread().getName());
Thread t = new Thread(task);
t.start();
t.join();                                  // wait for completion
```

### `ExecutorService` — the idiomatic way to run concurrent work

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

List<Future<Integer>> futures = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    int n = i;
    futures.add(executor.submit(() -> n * n));
}
for (Future<Integer> f : futures) {
    System.out.println(f.get());           // blocks until result ready
}
executor.shutdown();
```

- Never manage raw `Thread` pools by hand in production/test-framework code
  — always go through `ExecutorService` for lifecycle management (shutdown,
  queuing, rejection policy).
- **`CompletableFuture`** composes async pipelines without blocking:
  ```java
  CompletableFuture.supplyAsync(() -> fetchUser(id))
      .thenApply(User::getName)
      .thenAccept(System.out::println);
  ```
- **Thread safety tools**: `synchronized` blocks/methods for mutual
  exclusion; `java.util.concurrent.atomic.AtomicInteger` for lock-free
  counters; `ConcurrentHashMap` instead of synchronizing a `HashMap`
  manually; `CountDownLatch`/`CyclicBarrier` for coordinating thread
  start/finish points (common in parallel test-execution harnesses).
- **Why this matters for SDET**: TestNG and JUnit 5 both support
  **parallel test execution** (`parallel="methods"` in `testng.xml`, or
  JUnit 5's `@Execution(CONCURRENT)`) — understanding thread safety is
  required to avoid shared mutable state (e.g., a static WebDriver
  instance) causing cross-test interference under parallel runs.

---

## 10. Build Tools: Maven and Gradle

Both manage dependencies, compilation, test execution, and packaging;
almost every Java-based automation framework repo uses one of them.

### Maven (`pom.xml`) — declarative, convention-over-configuration

```xml
<project>
  <dependencies>
    <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>4.21.0</version>
    </dependency>
    <dependency>
      <groupId>org.testng</groupId>
      <artifactId>testng</artifactId>
      <version>7.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

```bash
mvn clean install         # compile, test, package, install to local repo
mvn test                  # run tests only
mvn test -Dtest=LoginTest # run a single test class
mvn dependency:tree       # inspect resolved dependency versions/conflicts
```

### Gradle (`build.gradle` / `build.gradle.kts`) — programmatic, faster incremental builds

```groovy
dependencies {
    testImplementation 'org.seleniumhq.selenium:selenium-java:4.21.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
}
```

```bash
./gradlew build
./gradlew test --tests "com.example.LoginTest"
```

**Maven vs. Gradle**: Maven's XML is more verbose but highly standardized
(easy to onboard onto any Maven repo instantly); Gradle's Groovy/Kotlin DSL
is more flexible and generally faster via incremental build caching. Neither
is objectively "correct" — most enterprise SDET codebases still default to
Maven for its predictability and the sheer volume of Maven-based example
projects/plugins in the ecosystem.

---

## 11. Why Java Underpins the Mainstream SDET Stack

| Framework | Role | Why Java |
|---|---|---|
| **Selenium WebDriver** | Browser automation | Original bindings are Java; JVM ecosystem gives mature IDE support, debugging, and CI integration |
| **TestNG** | Test runner/orchestration | Annotations (`@Test`, `@BeforeMethod`), parallel execution, data providers, native to the JVM test ecosystem |
| **JUnit 5** | Test runner (alternative to TestNG) | De facto standard for unit tests; extension model integrates with Spring, Mockito, etc. |
| **REST Assured** | API testing | Fluent Java DSL (`given().when().then()`) built directly on Java's HTTP client ecosystem |
| **Appium** | Mobile automation | Java client bindings speak the same WebDriver protocol as Selenium — one mental model for web + mobile |
| **Cucumber-JVM** | BDD | Gherkin step definitions implemented as Java methods |

The practical implication: strong Java fundamentals (OOP for Page Object
Models, generics for reusable utility classes, streams for test-data
transformation, exception handling for custom framework errors, concurrency
for parallel suites) transfer directly across the *entire* toolchain rather
than being framework-specific trivia.

---

## 12. Interview-Ready Q&A

**Q: What's the difference between the JDK, JRE, and JVM?**
A: The JVM is the runtime engine that executes bytecode and manages memory;
the JRE bundles the JVM with the standard libraries needed to *run* Java
programs; the JDK adds the compiler (`javac`) and development tools on top
of the JRE, needed to *build* Java programs. Modern JDK distributions
include everything, so the JRE-only distinction matters less day to day, but
it's still asked as a fundamentals check.

**Q: Why does `==` sometimes appear to work for comparing two `Integer`
objects, and why is it wrong to rely on it?**
A: The JVM caches boxed `Integer` values from -128 to 127, so two
`Integer` variables in that range holding the same value can point to the
same cached object, making `==` return `true` by coincidence. Outside that
range, autoboxing creates distinct objects and `==` returns `false` even for
equal values. The correct comparison is always `.equals()`, since `==` on
reference types compares identity, not value.

**Q: Explain checked vs. unchecked exceptions and when you'd choose to
create a custom one as which.**
A: Checked exceptions (subclassing `Exception`) must be declared with
`throws` or handled by every caller up the call chain — the compiler
enforces it, useful for genuinely recoverable conditions like I/O failures.
Unchecked exceptions (subclassing `RuntimeException`) aren't enforced by the
compiler. In test-automation frameworks, custom exceptions almost always
extend `RuntimeException` because forcing every calling test method to
declare or catch a framework-internal exception (e.g., an element-not-found
wrapper) adds boilerplate without adding safety.

**Q: What does PECS mean for generic wildcards, and give an example?**
A: "Producer Extends, Consumer Super." Use `? extends T` when a generic
parameter is only being read from (it *produces* values of type T or a
subtype), and `? super T` when it's only being written to (it *consumes*
values of type T). Example: a method that copies from a source list to a
destination list would type the source `List<? extends T>` and the
destination `List<? super T>`.

**Q: Why can a `HashMap` lookup fail to find an object that looks equal to
the one you inserted?**
A: Because `equals()` was overridden without also overriding `hashCode()`
consistently (or vice versa). `HashMap` uses `hashCode()` to locate the
bucket and `equals()` to confirm the match within that bucket; if two
"equal" objects produce different hash codes, the map looks in the wrong
bucket and the lookup silently fails to find an entry that's actually there.

**Q: What happens if you modify a `List` while iterating over it with a
for-each loop?**
A: It throws `ConcurrentModificationException` — the for-each loop uses an
`Iterator` under the hood, and most collection iterators are fail-fast,
detecting structural modification via an internal mod-count check. The fix
is to use `Iterator.remove()` directly, collect items to remove into a
separate list and remove them after iterating, or use
`Collection.removeIf()`.

**Q: How would parallel test execution in TestNG cause a flaky failure
that's actually a Java concurrency bug, not a test bug?**
A: If the framework holds shared mutable state in a `static` field — most
commonly a single static `WebDriver` instance meant to be reused — parallel
threads running different test methods will read/write that same instance
concurrently, causing one test's browser actions to interleave with
another's. The fix is `ThreadLocal<WebDriver>` so each thread gets its own
isolated instance, not a shared one.

**Q: Streams vs. traditional for-loops — when do you actually prefer
streams?**
A: Streams read more declaratively for filter/map/reduce-shaped
transformations of collections and enable easy parallelization
(`.parallelStream()`) for CPU-bound work on large datasets. For-loops remain
clearer when the logic has early returns, multiple accumulator variables, or
side effects that don't map cleanly onto `map`/`filter`/`collect` — forcing
imperative logic into a stream pipeline just to "look modern" often hurts
readability more than it helps.

---

## 13. One-Line Summary

**Java's static typing, mature JVM tooling, and object-oriented model are
why the entire mainstream automation stack — Selenium, TestNG, JUnit,
REST Assured, Appium — is built in it; strong fundamentals in generics,
collections, streams, exceptions, and concurrency transfer directly across
all of them rather than being framework-specific trivia.**
