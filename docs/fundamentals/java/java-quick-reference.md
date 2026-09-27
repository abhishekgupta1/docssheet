---
title: "Java Quick Reference"
description: "Copy-paste reference for everyday Java 21 — strings, collections, sorting, streams, dates, files, regex, concurrency, JUnit, and build commands."
sidebar_position: 1
level: beginner
tags: [java, fundamentals, cheat-sheet]
image: /img/social/java-quick-reference.png
---

# Java Quick Reference

A copy-paste reference for everyday Java (Java 21). Every example shows its
result in a `// =>` comment.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
Java? Start with the [Java cheat sheet](/cheatsheets/java), which explains each
idea with an exercise. For the ordered plan with projects, see the
[Java learning path](/docs/learning-path/java/implementation-roadmap).

:::

## Quick Navigation

**Language:** [Strings](#strings) · [Numbers](#numbers) · [Arrays](#arrays) · [Lists](#lists) · [Maps](#maps) · [Sets & queues](#sets--queues) · [Sorting](#sorting) · [Streams](#streams) · [Optional](#optional) · [Records, enums & switch](#records-enums--switch) · [Exceptions](#exceptions)

**Toolkit:** [Dates & times](#dates--times) · [Files](#files) · [Regex](#regex) · [Concurrency](#concurrency) · [JUnit 5](#junit-5) · [Maven & Gradle](#maven--gradle) · [JVM options](#jvm-options) · [Collection speed](#collection-speed) · [One-liners](#one-liners-to-remember)

---

## Strings

```java
String s = "Hello, World";
s.length();                       // => 12
s.charAt(4);                      // => 'o'
s.indexOf("World");               // => 7   (-1 if not found)
s.substring(7);                   // => "World"
s.substring(0, 5);                // => "Hello"
s.toLowerCase();                  // => "hello, world"
s.replace("World", "Java");       // => "Hello, Java"
s.startsWith("Hell");             // => true
s.endsWith("!");                  // => false
s.contains(", ");                 // => true
"  pad  ".strip();                // => "pad"
"".isEmpty();                     // => true
"   ".isBlank();                  // => true
"ab".repeat(3);                   // => "ababab"
"a-b-c".split("-");               // => ["a", "b", "c"]
String.join(", ", List.of("x", "y"));   // => "x, y"
"Ada".equalsIgnoreCase("ADA");    // => true
"b".compareTo("a");               // => 1   (negative / 0 / positive)
"hello".chars().filter(c -> c == 'l').count();   // => 2
```

### Formatting

```java
String.format("%s is %d", "Ada", 36);        // => "Ada is 36"
String.format("%.2f", 3.14159);              // => "3.14"
String.format("%5d|", 42);                   // => "   42|"  right-aligned, width 5
String.format("%-5s|", "ab");                // => "ab   |"  left-aligned
String.format("%05d", 42);                   // => "00042"
String.format("%,d", 1234567);               // => "1,234,567"
String.format("%x", 255);                    // => "ff"
"%s scored %d".formatted("Bo", 90);          // => "Bo scored 90"  (Java 15+)
```

### Text blocks (Java 15+)

```java
String json = """
    {
      "name": "Ada",
      "age": 36
    }
    """;                                     // indentation up to the closing """ is removed
```

### StringBuilder

```java
StringBuilder sb = new StringBuilder();
sb.append("a").append(1).append(true);   // => "a1true"
sb.insert(0, ">");                       // => ">a1true"
sb.reverse();                            // => "eurt1a>"
sb.setLength(0);                         // empty it
sb.toString();                           // => ""
```

---

## Numbers

```java
Integer.parseInt("42");          // => 42
Double.parseDouble("3.5");       // => 3.5
Integer.valueOf(42).toString();  // => "42"
Integer.MAX_VALUE;               // => 2147483647
Long.MAX_VALUE;                  // => 9223372036854775807
Integer.MAX_VALUE + 1;           // => -2147483648  (overflow wraps around silently)
Math.addExact(Integer.MAX_VALUE, 1);   // throws ArithmeticException instead

Math.abs(-5);                    // => 5
Math.round(2.5);                 // => 3
Math.floor(2.7);                 // => 2.0
Math.ceil(2.1);                  // => 3.0
Math.sqrt(16);                   // => 4.0
Math.floorMod(-7, 3);            // => 2   (-7 % 3 is -1)
(int) 3.99;                      // => 3   (cast drops the decimals)
Integer.toBinaryString(5);       // => "101"
```

### Money: use BigDecimal, not double

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

0.1 + 0.2;                                           // => 0.30000000000000004
new BigDecimal("0.1").add(new BigDecimal("0.2"));    // => 0.3
new BigDecimal("10").divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);   // => 3.33
```

### Random numbers

```java
import java.util.concurrent.ThreadLocalRandom;

ThreadLocalRandom.current().nextInt(1, 7);   // => 1..6, like a dice roll
```

---

## Arrays

```java
import java.util.Arrays;

int[] a = {5, 2, 9};
int[] zeros = new int[3];              // => [0, 0, 0]
a.length;                              // => 3
Arrays.sort(a);                        // a is now [2, 5, 9]
Arrays.toString(a);                    // => "[2, 5, 9]"   (printing a directly shows junk)
Arrays.binarySearch(a, 5);             // => 1   (array must be sorted)
Arrays.fill(zeros, 7);                 // => [7, 7, 7]
Arrays.copyOf(a, 5);                   // => [2, 5, 9, 0, 0]
Arrays.copyOfRange(a, 1, 3);           // => [5, 9]
Arrays.equals(a, new int[]{2, 5, 9});  // => true
Arrays.stream(a).sum();                // => 16
int[][] grid = new int[2][3];          // 2 rows, 3 columns
```

---

## Lists

```java
List<String> list = new ArrayList<>(List.of("b", "a", "c"));
list.add("d");                       // => [b, a, c, d]
list.add(0, "z");                    // => [z, b, a, c, d]
list.get(1);                         // => "b"
list.set(1, "B");                    // => [z, B, a, c, d]
list.remove(0);                      // => [B, a, c, d]   (by index)
list.remove("a");                    // => [B, c, d]      (by value)
list.indexOf("c");                   // => 1
list.contains("d");                  // => true
list.subList(0, 2);                  // => [B, c]
list.addAll(List.of("e", "f"));      // => [B, c, d, e, f]
list.removeIf(s -> s.equals("e"));   // => [B, c, d, f]
list.replaceAll(String::toUpperCase);// => [B, C, D, F]
Collections.reverse(list);           // => [F, D, C, B]
Collections.frequency(list, "C");    // => 1
Collections.max(list);               // => "F"
List.copyOf(list);                   // immutable copy
list.getFirst();                     // => "F"   (Java 21+)
list.reversed();                     // => [B, C, D, F]  a reversed view (Java 21+)

Integer[] boxed = {3, 1};
List<Integer> view = Arrays.asList(boxed);   // fixed-size list backed by the array
List<Integer> copy = new ArrayList<>(view);  // real, growable list
```

---

## Maps

```java
Map<String, Integer> m = new HashMap<>();
m.put("a", 1);                         // => {a=1}
m.putIfAbsent("a", 99);                // => {a=1}   (unchanged)
m.get("a");                            // => 1
m.get("zz");                           // => null
m.getOrDefault("zz", 0);               // => 0
m.containsKey("a");                    // => true
m.merge("a", 1, Integer::sum);         // => {a=2}   (add to existing)
m.compute("b", (k, v) -> v == null ? 1 : v + 1);   // => {a=2, b=1}
m.remove("b");                         // => {a=2}
m.keySet();                            // => [a]
m.values();                            // => [2]

Map<String, List<String>> groups = new HashMap<>();
groups.computeIfAbsent("fruit", k -> new ArrayList<>()).add("apple");   // => {fruit=[apple]}

for (var e : m.entrySet()) {
    System.out.println(e.getKey() + " -> " + e.getValue());   // a -> 2
}
m.forEach((k, v) -> System.out.println(k + "=" + v));         // a=2

Map.of("x", 1, "y", 2);                // immutable, up to 10 pairs
new TreeMap<>(m);                      // sorted by key
new LinkedHashMap<String, Integer>();  // keeps insertion order
```

---

## Sets & queues

```java
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3));
Set<Integer> b = Set.of(2, 3, 4);

Set<Integer> union = new HashSet<>(a);  union.addAll(b);      // => [1, 2, 3, 4]
Set<Integer> both = new HashSet<>(a);   both.retainAll(b);    // => [2, 3]
Set<Integer> onlyA = new HashSet<>(a);  onlyA.removeAll(b);   // => [1]

new TreeSet<>(List.of(3, 1, 2));        // => [1, 2, 3]  sorted

Deque<Integer> dq = new ArrayDeque<>();
dq.offerFirst(1); dq.offerLast(2);      // => [1, 2]
dq.peekFirst();                         // => 1   (look, don't remove)
dq.pollLast();                          // => 2   (remove; null if empty)

PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 3));   // smallest first
pq.poll();                              // => 1
PriorityQueue<Integer> maxQ = new PriorityQueue<>(Comparator.reverseOrder());   // largest first
```

---

## Sorting

```java
record Person(String name, int age) { }
List<Person> people = new ArrayList<>(List.of(
    new Person("Cy", 30), new Person("Ada", 36), new Person("Bo", 30)));

people.sort(Comparator.comparing(Person::name));                  // by name A→Z
people.sort(Comparator.comparingInt(Person::age).reversed());     // oldest first
people.sort(Comparator.comparingInt(Person::age)
                      .thenComparing(Person::name));              // by age, then name
// => [Bo 30, Cy 30, Ada 36]

List<String> words = new ArrayList<>(List.of("pear", "Fig", "apple"));
words.sort(String.CASE_INSENSITIVE_ORDER);     // => [apple, Fig, pear]
words.sort(Comparator.comparing(String::length));   // => [Fig, pear, apple]
List<String> sorted = words.stream().sorted().toList();   // new list; words unchanged
```

---

## Streams

```java
import java.util.stream.*;

List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);

nums.stream().filter(n -> n % 2 == 0).toList();          // => [2, 4, 6]
nums.stream().map(n -> n * n).toList();                  // => [1, 4, 9, 16, 25, 36]
nums.stream().reduce(0, Integer::sum);                   // => 21
nums.stream().mapToInt(Integer::intValue).average();     // => OptionalDouble[3.5]
nums.stream().limit(2).toList();                         // => [1, 2]
nums.stream().skip(4).toList();                          // => [5, 6]
nums.stream().anyMatch(n -> n > 5);                      // => true
nums.stream().allMatch(n -> n > 0);                      // => true
nums.stream().max(Integer::compare);                     // => Optional[6]
nums.stream().distinct().count();                        // => 6

List.of(List.of(1, 2), List.of(3)).stream()
    .flatMap(List::stream).toList();                     // => [1, 2, 3]  flatten

IntStream.range(0, 3).boxed().toList();                  // => [0, 1, 2]
Stream.iterate(1, x -> x * 2).limit(5).toList();         // => [1, 2, 4, 8, 16]
```

### Collectors

| Goal | Code | Result type |
|---|---|---|
| To list | `.toList()` | `List<T>` (can't be changed) |
| To set | `.collect(Collectors.toSet())` | `Set<T>` |
| To map | `.collect(Collectors.toMap(User::id, u -> u))` | `Map<K, V>` (throws on duplicate keys) |
| Group | `.collect(Collectors.groupingBy(User::role))` | `Map<K, List<T>>` |
| Count per group | `.collect(Collectors.groupingBy(User::role, Collectors.counting()))` | `Map<K, Long>` |
| Split in two | `.collect(Collectors.partitioningBy(u -> u.age() >= 18))` | `Map<Boolean, List<T>>` |
| Join text | `.collect(Collectors.joining(", ", "[", "]"))` | `String` |
| Sum / average | `.mapToInt(User::age).sum()` / `.average()` | `int` / `OptionalDouble` |
| Stats in one go | `.mapToInt(User::age).summaryStatistics()` | min, max, average, sum, count |

---

## Optional

```java
static String compute() { return "computed"; }

Optional<String> o = Optional.ofNullable(System.getenv("NOPE"));   // empty if null

o.isEmpty();                            // => true
o.orElse("default");                    // => "default"
o.orElseGet(() -> compute());           // only runs compute() when empty
Optional.of("x").orElseThrow(() -> new IllegalStateException("missing"));   // => "x" (throws if empty)
o.map(String::trim).filter(s -> !s.isEmpty());
o.ifPresentOrElse(System.out::println, () -> System.out.println("none"));   // prints: none
```

---

## Records, enums & switch

```java
record Point(int x, int y) {
    public Point {                                  // compact constructor: validate
        if (x < 0) throw new IllegalArgumentException("x < 0");
    }
    static Point origin() { return new Point(0, 0); }   // extra methods are fine
    Point withX(int nx) { return new Point(nx, y); }    // "wither" — returns a changed copy
}

enum Level {
    LOW(1), HIGH(3);                    // enum with a value per constant
    final int weight;
    Level(int weight) { this.weight = weight; }
}
Level.HIGH.weight;                      // => 3
Level.valueOf("LOW");                   // => LOW
Level.HIGH.ordinal();                   // => 1  (position — don't store it)

Object obj = 42;
String what = switch (obj) {            // pattern matching switch (Java 21+)
    case Integer i when i > 10 -> "big int";
    case Integer i -> "int";
    case String str -> "text of length " + str.length();
    case null -> "null";
    default -> "something else";
};                                      // => "big int"

if (obj instanceof Integer n && n > 0) {   // test and cast in one step
    System.out.println(n + 1);             // 43
}
```

---

## Exceptions

```java
try (var in = Files.newBufferedReader(Path.of("a.txt"))) {   // closed automatically
    in.readLine();
} catch (NoSuchFileException e) {        // more specific first
    System.out.println("missing: " + e.getMessage());
} catch (IOException e) {
    throw new UncheckedIOException("could not read a.txt", e);   // wrap, keep the cause
}

class OrderNotFoundException extends RuntimeException {     // your own exception
    OrderNotFoundException(String id) { super("order not found: " + id); }
}
```

| Exception | Usually means |
|---|---|
| `NullPointerException` | Called a method on `null` — Java 14+ names the null variable in the message |
| `IndexOutOfBoundsException` | `list.get(i)` with `i` too big or negative |
| `ClassCastException` | Cast an object to a type it isn't |
| `NumberFormatException` | `parseInt` on text that isn't a number |
| `IllegalArgumentException` | A method was given a bad input (throw it yourself for bad input) |
| `IllegalStateException` | Called at the wrong time, e.g. `next()` on an empty iterator |
| `ConcurrentModificationException` | Changed a collection while looping over it |
| `UnsupportedOperationException` | Tried to change an immutable collection (`List.of`) |
| `OutOfMemoryError` | The heap is full — look for a collection that keeps growing |
| `StackOverflowError` | Recursion that never stops |

---

## Dates & times

```java
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

LocalDate d = LocalDate.of(2026, 9, 27);         // date only
d.plusDays(5);                                   // => 2026-10-02
d.getDayOfWeek();                                // => SUNDAY
LocalDate.parse("2026-01-31");                   // from ISO text
ChronoUnit.DAYS.between(d, d.plusWeeks(2));      // => 14

LocalDateTime now = LocalDateTime.now();         // date + time, no zone
Instant ts = Instant.now();                      // a moment in UTC — use for logs & APIs
ZonedDateTime ist = ts.atZone(ZoneId.of("Asia/Kolkata"));

Duration.ofSeconds(90).toMinutes();              // => 1
DateTimeFormatter.ofPattern("dd MMM yyyy").format(d);   // => "27 Sep 2026"
```

Avoid the old `java.util.Date` and `SimpleDateFormat`; the `java.time` types
above are immutable and thread-safe.

---

## Files

```java
import java.nio.file.*;
import java.util.stream.Stream;

Path p = Path.of("out", "report.txt");            // => out/report.txt
Files.createDirectories(p.getParent());           // like mkdir -p
Files.writeString(p, "hello\n");                  // create or overwrite
Files.writeString(p, "more\n", StandardOpenOption.APPEND);
Files.readString(p);                              // => "hello\nmore\n"
Files.readAllLines(p);                            // => [hello, more]
Files.size(p);                                    // => 11 (bytes)
Files.copy(p, Path.of("out/copy.txt"), StandardCopyOption.REPLACE_EXISTING);
Files.deleteIfExists(Path.of("out/copy.txt"));    // => true

try (Stream<String> lines = Files.lines(p)) {     // lazy — fine for huge files
    lines.filter(l -> l.startsWith("h")).count(); // => 1
}
try (Stream<Path> files = Files.walk(Path.of("out"))) {   // every file below a folder
    files.filter(Files::isRegularFile).forEach(System.out::println);
}
p.getFileName().toString();                       // => "report.txt"
```

### JSON with Jackson

```java
import com.fasterxml.jackson.databind.ObjectMapper;

record User(String name, int age) { }
ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(new User("Ada", 36));   // => {"name":"Ada","age":36}
User back = mapper.readValue(json, User.class);                 // => User[name=Ada, age=36]
```

---

## Regex

```java
import java.util.regex.*;

Pattern p = Pattern.compile("(?<user>\\w+)@(?<domain>[\\w.]+)");   // compile once, reuse
Matcher m = p.matcher("mail ada@site.com now");
if (m.find()) {
    m.group();                 // => "ada@site.com"
    m.group("user");           // => "ada"
    m.group("domain");         // => "site.com"
}

"a1b22c".replaceAll("\\d+", "#");          // => "a#b#c"
"2026-09-27".matches("\\d{4}-\\d{2}-\\d{2}");   // => true  (whole string must match)
Pattern.compile("\\d+").matcher("a1b22").results()
       .map(MatchResult::group).toList();  // => [1, 22]  all matches
```

In Java strings a regex backslash is written twice: `\\d` means the regex `\d`.

| Pattern | Matches |
|---|---|
| `\\d` / `\\w` / `\\s` | digit / letter, digit or `_` / whitespace |
| `.` | any character |
| `*` / `+` / `?` | 0 or more / 1 or more / 0 or 1 |
| `{2,4}` | 2 to 4 times |
| `^` / `$` | start / end of line |
| `[a-z]` / `[^a-z]` | one of / none of |
| `(…)` / `(?<name>…)` | group / named group |

---

## Concurrency

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

try (var pool = Executors.newFixedThreadPool(4)) {             // closes itself (Java 19+)
    Future<String> f = pool.submit(() -> "done");
    f.get(2, TimeUnit.SECONDS);                                // => "done" — or TimeoutException
    List<Future<Integer>> all = pool.invokeAll(List.of(() -> 1, () -> 2));   // run many, wait for all
}

CompletableFuture.supplyAsync(() -> 21)
    .thenApply(x -> x * 2)
    .thenAccept(System.out::println);                          // prints 42

CountDownLatch ready = new CountDownLatch(2);                  // wait until 2 things happen
ready.countDown(); ready.countDown();
ready.await();                                                 // returns straight away now

AtomicLong counter = new AtomicLong();
counter.incrementAndGet();                                     // => 1
```

| Need | Use |
|---|---|
| Run tasks on a few threads | `Executors.newFixedThreadPool(n)` |
| Thousands of tasks that mostly wait (HTTP, DB) | `Executors.newVirtualThreadPerTaskExecutor()` (Java 21+) |
| Chain async steps | `CompletableFuture` |
| Shared counter | `AtomicInteger` / `AtomicLong` / `LongAdder` |
| Shared map | `ConcurrentHashMap` |
| Producer → consumer hand-off | `BlockingQueue` (`LinkedBlockingQueue`) |
| Run something every N seconds | `Executors.newScheduledThreadPool(1).scheduleAtFixedRate(...)` |

---

## JUnit 5

```java
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Price rules")
class PriceTest {

    @BeforeAll static void once() { }          // before all tests in the class
    @BeforeEach void each() { }                // before every test
    @AfterEach void cleanUp() { }              // after every test

    @Test
    void basics() {
        assertEquals(4, 2 + 2);
        assertEquals(0.3, 0.1 + 0.2, 1e-9);    // doubles: give a tolerance
        assertTrue("abc".startsWith("a"));
        assertNull(null);
        assertIterableEquals(List.of(1, 2), List.of(1, 2));
        assertAll(                              // report every failure, not just the first
            () -> assertEquals("A", "A"),
            () -> assertNotEquals(1, 2));
        var e = assertThrows(IllegalArgumentException.class,
            () -> { throw new IllegalArgumentException("bad"); });
        assertEquals("bad", e.getMessage());
        assertTimeout(Duration.ofSeconds(1), () -> { });
    }

    @ParameterizedTest
    @ValueSource(strings = {"a", "bb"})
    void notEmpty(String s) { assertFalse(s.isEmpty()); }

    @ParameterizedTest
    @CsvSource({"1, 2, 3", "5, 5, 10"})
    void adds(int a, int b, int sum) { assertEquals(sum, a + b); }

    @Disabled("flaky, see ticket 123")
    @Test void skipped() { }

    @Tag("slow")
    @Test void runOnlyWhenAsked() { }          // mvn test -Dgroups=slow
}
```

---

## Maven & Gradle

| Task | Maven | Gradle |
|---|---|---|
| Run tests | `mvn test` | `./gradlew test` |
| One test class | `mvn test -Dtest=PriceTest` | `./gradlew test --tests PriceTest` |
| One test method | `mvn test -Dtest=PriceTest#adds` | `./gradlew test --tests 'PriceTest.adds'` |
| Build the JAR | `mvn package` | `./gradlew build` |
| Skip tests | `mvn package -DskipTests` | `./gradlew build -x test` |
| Clean build | `mvn clean install` | `./gradlew clean build` |
| Show dependencies | `mvn dependency:tree` | `./gradlew dependencies` |
| Start a new project | `mvn archetype:generate` | `gradle init` |

---

## JVM options

| Flag | Does |
|---|---|
| `-Xms512m` / `-Xmx2g` | Starting / maximum heap size |
| `-XX:+HeapDumpOnOutOfMemoryError` | Save a heap snapshot when memory runs out |
| `-XX:+UseZGC` | Low-pause garbage collector for big heaps |
| `-Dkey=value` | Set a system property, read with `System.getProperty("key")` |
| `-ea` | Turn on `assert` statements |

```bash
jps                            # list running Java processes
jcmd <pid> Thread.print        # every thread's stack — find what's stuck
jcmd <pid> GC.heap_info        # heap usage
jfr print recording.jfr        # read a Java Flight Recorder profile
```

---

## Collection speed

"O(1)" = same speed at any size; "O(n)" = slower as the collection grows;
"O(log n)" = slows very gently.

| Operation | `ArrayList` | `LinkedList` | `HashMap` / `HashSet` | `TreeMap` / `TreeSet` | `ArrayDeque` |
|---|---|---|---|---|---|
| Get by index | O(1) | O(n) | — | — | — |
| Add at end | O(1) | O(1) | O(1) | O(log n) | O(1) |
| Add / remove at front | O(n) | O(1) | — | — | O(1) |
| `contains` / get by key | O(n) | O(n) | O(1) | O(log n) | O(n) |
| Kept in sorted order | no | no | no | yes | no |

In practice, prefer `ArrayList` over `LinkedList` almost always, and
`ArrayDeque` over `Stack`.

---

## One-liners to Remember

| Task | Code |
|---|---|
| Print a list or map | `System.out.println(list)` |
| Print an array | `Arrays.toString(arr)` |
| Remove duplicates, keep order | `new ArrayList<>(new LinkedHashSet<>(list))` |
| Reverse a string | `new StringBuilder(s).reverse().toString()` |
| Count words | `Arrays.stream(text.split("\\s+")).collect(groupingBy(w -> w, counting()))` |
| Max by field | `users.stream().max(comparingInt(User::age))` |
| List to comma text | `String.join(",", list)` |
| Array to list | `List.of(arr)` (objects) / `Arrays.stream(ints).boxed().toList()` (int[]) |
| List to array | `list.toArray(String[]::new)` |
| Null-safe equals | `Objects.equals(a, b)` |
| Default for null | `Objects.requireNonNullElse(value, "default")` |
| Fail fast on null | `Objects.requireNonNull(arg, "arg must not be null")` |
| Pause | `Thread.sleep(Duration.ofMillis(200))` |
| Time something | `long start = System.nanoTime(); … (System.nanoTime() - start) / 1_000_000` ms |
| Read an env variable | `System.getenv().getOrDefault("ENV", "dev")` |
| Unmodifiable view | `Collections.unmodifiableList(list)` |

---

## Need More Detail?

This page is the quick answer. For explanations with exercises, use the
[Java cheat sheet](/cheatsheets/java). For JVM internals and interview
questions, see [Java: The Complete Guide](/docs/sdet-skills/java/java-guide).
For habits that keep Java code clean, see
[Java Coding Best Practices](/docs/fundamentals/java/coding-best-practices).

*Last updated: September 2026*
