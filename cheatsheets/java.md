---
title: "Java Cheat Sheet"
description: "A beginner-to-advanced reference for Java — types, collections, classes, generics, streams, testing, and concurrency."
level: beginner
tags: [java, sdet, sde, cheat-sheet]
hide_table_of_contents: true
image: /img/social/java.png
---

# Java cheatsheet

Learn Java step by step, from your first program to running tasks side by
side. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — code with a comment on every line saying what it produces.
- **Try it** — a tiny exercise to check you understood.

Want the longer story behind a topic? The [complete guide](/docs/sdet-skills/java/java-guide)
walks through it in more depth.

<a class="topic-crosslink" href="/docs/sdet-skills/java/java-guide">📖 Full guide: Java →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Java learning sections">
  <a class="button button--primary" href="/docs/learning-path/java/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/java/java-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/java/coding-best-practices">Best Practices</a>
  <a class="button button--primary" href="/docs/role-guides/sdet/java-for-sdet">Java for SDET</a>
</nav>

:::tip How to use this page

Go through **Part 1** in order — each section builds on the one before. Once
you're comfortable, move to **Part 2**. **Part 3** is for when you're writing
larger programs. Type the examples yourself instead of copying them; you'll
remember them far better. You can try any snippet in `jshell`, the Java
playground that comes with the JDK (Java Development Kit).

:::

## Contents {#contents}

**[Part 1 — Beginner](#part-1)**:
[Your first program](#first-program) ·
[Variables & types](#basics) ·
[Text & numbers](#strings-numbers) ·
[Making decisions & loops](#control-flow) ·
[Arrays & lists](#arrays-lists) ·
[Methods](#methods) ·
[Handling errors](#exceptions) ·
[Reading & writing files](#files)

**[Part 2 — Core](#part-2)**:
[Classes & objects](#classes) ·
[Records](#records) ·
[Inheritance & interfaces](#inheritance) ·
[equals, hashCode & toString](#object-methods) ·
[Sets, maps & queues](#collections) ·
[Generics](#generics) ·
[Lambdas](#lambdas) ·
[Streams](#streams) ·
[Optional](#optional) ·
[Build tools](#build-tools) ·
[Testing with JUnit](#testing) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Enums & switch patterns](#enums) ·
[Immutability](#immutability) ·
[Threads & thread pools](#threads) ·
[Sharing data safely](#thread-safety) ·
[CompletableFuture](#completable-future) ·
[The JVM & memory](#jvm) ·
[Words you'll meet](#glossary)

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. Your first program {#first-program}

**In short:** Java code lives inside a **class**, and a program starts at a
method called `main`.

```java
public class Hello {                             // file must be named Hello.java
    public static void main(String[] args) {     // where the program starts
        System.out.println("Hello, World!");     // shows: Hello, World!
    }
}
```

```bash
java Hello.java        # compile and run in one step (Java 11+)
javac Hello.java       # or: compile to Hello.class (bytecode)...
java Hello             # ...then run it
```

Java is **compiled**: `javac` turns your code into *bytecode*, and the **JVM**
(Java Virtual Machine) runs that bytecode on any operating system. Every
statement ends with `;`, and `{ }` braces group code together.

**Try it:** change the program to print your name on one line and your city on
the next.

</div>

<div class="cheat-card">

#### 2. Variables & types {#basics}

**In short:** every variable has a **type** that is fixed when you declare it —
the compiler stops you putting the wrong kind of value in.

```java
int age = 30;              // int     — whole number
double price = 9.99;       // double  — decimal number
boolean active = true;     // boolean — true or false
char grade = 'A';          // char    — one character, single quotes
String name = "Ada";       // String  — text, double quotes
long views = 3_000_000L;   // long    — big whole number (L at the end)

var city = "London";       // var — Java works out the type (String) for you
final int MAX = 5;         // final — can't be changed after this line
```

`int`, `double`, `boolean`, `char`, `long` are **primitives** — plain values,
lower-case names. `String` and everything else with a capital letter is an
**object** — it can be `null` ("points at nothing") and has methods like
`name.length()`.

**Try it:** declare your age and height, then print
`"Age: 30, height: 1.75"` using `+` to join the text and values.

</div>

<div class="cheat-card">

#### 3. Text & numbers {#strings-numbers}

**In short:** `String` has many helper methods; numbers work like a calculator,
except that `int / int` drops the decimals.

```java
String text = "Java";
text.length();                  // 4
text.charAt(0);                 // 'J'  — first character (counting starts at 0)
text.substring(1, 3);           // "av" — characters 1 and 2
text.toUpperCase();             // "JAVA"
text.contains("av");            // true
"a,b,c".split(",");             // String[] {"a", "b", "c"}
String.format("%s is %d", text, 30);   // "Java is 30"

7 / 2;                          // 3   — int / int drops the decimal part
7 / 2.0;                        // 3.5 — one double makes the answer a double
7 % 2;                          // 1   — the remainder
Math.max(3, 8);                 // 8
Math.pow(2, 3);                 // 8.0 — always a double
Integer.parseInt("42");         // 42  — text to int
String.valueOf(42);             // "42" — int to text
```

**Try it:** with `String name = "ada lovelace";`, print only the first name in
capital letters. (Hint: `split(" ")` then `toUpperCase()`.)

</div>

<div class="cheat-card">

#### 4. Making decisions & loops {#control-flow}

**In short:** `if` chooses what to run; `switch` picks one of many; `for` and
`while` repeat.

```java
int score = 72;

if (score >= 90) {
    System.out.println("A");
} else if (score >= 70) {
    System.out.println("B");               // shows: B
} else {
    System.out.println("C");
}

String day = "SAT";
String kind = switch (day) {               // switch expression (Java 14+)
    case "SAT", "SUN" -> "weekend";
    default -> "weekday";
};                                          // kind is "weekend"

for (int i = 0; i < 3; i++) {              // i = 0, 1, 2
    System.out.println(i);
}

int[] nums = {4, 5, 6};
for (int n : nums) {                       // "for each n in nums"
    System.out.println(n);                 // 4, then 5, then 6
}

int count = 3;
while (count > 0) {                        // repeat while the condition is true
    count--;                               // count = count - 1
}
```

`&&` means "and", `||` means "or", `!` means "not". Use `break` to leave a
loop early and `continue` to skip to the next round.

**Try it:** print the numbers 1 to 15, but print `"Fizz"` instead of any
number divisible by 3.

</div>

<div class="cheat-card">

#### 5. Arrays & lists {#arrays-lists}

**In short:** an **array** has a fixed size; an **`ArrayList`** grows and
shrinks. In day-to-day code you'll mostly use lists.

```java
import java.util.ArrayList;
import java.util.List;

int[] scores = {90, 75, 60};             // int[] — array, size fixed at 3
scores[0];                               // 90 — first item
scores.length;                           // 3  — no brackets for arrays

List<String> names = new ArrayList<>();  // ArrayList — empty, can grow
names.add("Ada");                        // ["Ada"]
names.add("Linus");                      // ["Ada", "Linus"]
names.get(1);                            // "Linus"
names.size();                            // 2  — brackets for lists
names.contains("Ada");                   // true
names.remove("Ada");                     // ["Linus"]

List<Integer> fixed = List.of(1, 2, 3);  // List — can't be changed (add throws)
```

`List<String>` reads "a list of Strings". The `<>` part says what type the
list holds. Lists hold objects only, so use `Integer` (not `int`) and `Double`
(not `double`) inside `< >`.

**Try it:** make an `ArrayList` of three fruits, add a fourth, then print
the list and its size.

</div>

<div class="cheat-card">

#### 6. Methods {#methods}

**In short:** a method is a named, reusable block of code. You say the type of
each input and the type of what it gives back.

```java
public class MathTools {

    static int add(int a, int b) {        // takes two ints, returns an int
        return a + b;
    }

    static double add(double a, double b) {   // same name, different inputs
        return a + b;                          // ("overloading")
    }

    static void greet(String name) {      // void — returns nothing
        System.out.println("Hi " + name);
    }

    public static void main(String[] args) {
        add(2, 3);                        // 5
        add(1.5, 2.0);                    // 3.5 — picks the double version
        greet("Ada");                     // shows: Hi Ada
    }
}
```

`static` means the method belongs to the class itself, so you can call it
without making an object first. Java has no default parameter values — use
overloading instead.

**Try it:** write `average(int[] numbers)` that returns the average as a
`double`.

</div>

<div class="cheat-card">

#### 7. Handling errors {#exceptions}

**In short:** when something goes wrong, Java *throws* an **exception**.
`try` / `catch` lets you handle it instead of crashing.

```java
try {
    int n = Integer.parseInt("abc");       // throws NumberFormatException
} catch (NumberFormatException e) {
    System.out.println("Not a number: " + e.getMessage());
} finally {
    System.out.println("always runs");     // runs whether or not it failed
}

static void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("age must be >= 0");  // raise your own
    }
}
```

Two kinds of exception:

| Kind | Example | Rule |
|---|---|---|
| **Checked** | `IOException` | The compiler forces you to `catch` it or add `throws IOException` to the method |
| **Unchecked** | `NullPointerException`, `IllegalArgumentException` | Subclasses of `RuntimeException`; usually a bug to fix, not to catch |

**Try it:** read a number with `Integer.parseInt`, and print `"try again"` if
the text isn't a number.

</div>

<div class="cheat-card">

#### 8. Reading & writing files {#files}

**In short:** the `Files` and `Path` classes read and write whole files in one
line; `try (...)` closes things for you.

```java
import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

Path path = Path.of("notes.txt");

Files.writeString(path, "line 1\nline 2\n");    // write text (overwrites)
String all = Files.readString(path);            // String — the whole file
List<String> lines = Files.readAllLines(path);  // List<String> — ["line 1", "line 2"]
Files.exists(path);                             // true

try (BufferedReader reader = Files.newBufferedReader(path)) {   // try-with-resources
    String line;
    while ((line = reader.readLine()) != null) {   // one line at a time — good for big files
        System.out.println(line);
    }
}                                                  // reader is closed automatically here
```

These methods throw `IOException` (a checked exception), so the method that
calls them needs `throws IOException` or a `try` / `catch`.

**Try it:** write three names to a file, one per line, then read the file back
and print how many lines it has.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 9. Classes & objects {#classes}

**In short:** a class is a blueprint; an **object** is one thing made from it,
with its own data (**fields**) and behaviour (**methods**).

```java
public class BankAccount {
    private final String owner;        // private — only this class can touch it
    private double balance;            // each object has its own balance

    public BankAccount(String owner) { // constructor — runs on "new"
        this.owner = owner;            // this.owner = the field, owner = the input
        this.balance = 0;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be > 0");
        balance += amount;
    }

    public double getBalance() {       // "getter" — read-only access from outside
        return balance;
    }
}

BankAccount acc = new BankAccount("Ada");   // BankAccount — a new object
acc.deposit(50);
acc.getBalance();                           // 50.0
```

Keeping fields `private` and changing them only through methods is called
**encapsulation** — the class can check every change (like `amount > 0`).

**Try it:** add a `withdraw(double amount)` method that refuses to let the
balance go below zero.

</div>

<div class="cheat-card">

#### 10. Records {#records}

**In short:** a `record` (Java 16+) is a one-line class for plain data — Java
writes the constructor, getters, `equals`, `hashCode`, and `toString` for you.

```java
public record User(String name, int age) { }

User u = new User("Ada", 36);        // User — a record
u.name();                            // "Ada" — getter has no "get" prefix
u.age();                             // 36
u;                                   // User[name=Ada, age=36] — free toString
u.equals(new User("Ada", 36));       // true — compares the values

public record Email(String value) {
    public Email {                                   // "compact constructor" — checks input
        if (!value.contains("@")) throw new IllegalArgumentException("bad email");
    }
}
```

Records can't be changed after they're made (their fields are `final`). Use
one whenever a class just carries data — test data, API responses, config.

**Try it:** make a `record Point(int x, int y)` and add a method
`distanceFromOrigin()` that returns a `double`.

</div>

<div class="cheat-card">

#### 11. Inheritance & interfaces {#inheritance}

**In short:** `extends` reuses a parent class; `implements` promises a set of
methods. A class can extend one class but implement many interfaces.

```java
interface Shape {                       // interface — a promise of methods
    double area();                      // no body: each class writes its own
}

abstract class Animal {                 // abstract — can't be made with "new"
    protected final String name;        // protected — this class and its children
    Animal(String name) { this.name = name; }
    abstract String sound();            // children must write this
    String speak() { return name + " says " + sound(); }
}

class Dog extends Animal {              // Dog is an Animal
    Dog(String name) { super(name); }   // super(...) — call the parent's constructor
    @Override String sound() { return "woof"; }
}

record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
}

new Dog("Rex").speak();                 // "Rex says woof"
Shape s = new Circle(1);                // hold it by its interface type
s.area();                               // 3.14159...
```

`@Override` asks the compiler to check that you really are replacing a parent
method — it catches typos. Prefer **interfaces** for "can do" (`Comparable`,
`Runnable`) and small class trees over deep ones.

**Try it:** add a `record Square(double side) implements Shape` and put a
circle and a square in one `List<Shape>`, then print each area.

</div>

<div class="cheat-card">

#### 12. equals, hashCode & toString {#object-methods}

**In short:** `==` asks "same object?"; `equals` asks "same value?". If you
write `equals`, you must also write `hashCode`, or sets and maps break.

```java
String a = new String("hi");
String b = new String("hi");
a == b;                         // false — two different objects
a.equals(b);                    // true  — same text

import java.util.Objects;

class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override public boolean equals(Object o) {
        return o instanceof Point p && p.x == x && p.y == y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
    @Override public String toString() { return "Point(" + x + ", " + y + ")"; }
}
```

**hashCode** is a number that `HashSet` and `HashMap` use to find a bucket
quickly; equal objects must give the same number. A `record` writes all three
for you — another reason to use one.

**Try it:** put two `new Point(1, 2)` objects in a `HashSet`. What's the size
with `hashCode`, and what is it if you delete `hashCode`?

</div>

<div class="cheat-card">

#### 13. Sets, maps & queues {#collections}

**In short:** pick the collection by the question you'll ask it most often.

```java
import java.util.*;

Set<String> tags = new HashSet<>(List.of("a", "b", "a"));   // HashSet — {"a", "b"}, no duplicates
tags.contains("a");                                         // true, and fast at any size

Map<String, Integer> ages = new HashMap<>();   // HashMap — key → value
ages.put("Ada", 36);                           // {Ada=36}
ages.get("Ada");                               // 36
ages.get("Bob");                               // null — missing key
ages.getOrDefault("Bob", 0);                   // 0
ages.merge("Ada", 1, Integer::sum);            // {Ada=37} — add 1 to the existing value
for (Map.Entry<String, Integer> e : ages.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}

Deque<String> stack = new ArrayDeque<>();      // ArrayDeque ("deck") — stack or queue
stack.push("a"); stack.push("b");              // stack: b on top
stack.pop();                                   // "b" — last in, first out

Queue<String> queue = new ArrayDeque<>();
queue.offer("a"); queue.offer("b");
queue.poll();                                  // "a" — first in, first out
```

| You need… | Use | Why |
|---|---|---|
| Items in order, by position | `ArrayList` | Fast `get(i)` |
| "Have I seen this?" | `HashSet` | Fast `contains` |
| Look up a value by key | `HashMap` | Fast `get(key)` |
| Keep keys sorted | `TreeMap` / `TreeSet` | Sorted, a bit slower |
| Keep insertion order | `LinkedHashMap` / `LinkedHashSet` | Predictable printing |
| Stack or queue | `ArrayDeque` | Fast at both ends |

**Try it:** count how many times each word appears in
`"to be or not to be"` using a `HashMap<String, Integer>`.

</div>

<div class="cheat-card">

#### 14. Generics {#generics}

**In short:** generics let one class or method work with any type while the
compiler still checks you use it correctly. `T` is a placeholder for "some type".

```java
class Box<T> {                          // Box of some type T
    private final T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
}

Box<String> b = new Box<>("hi");        // Box<String>
String s = b.get();                     // no cast needed

static <T extends Comparable<T>> T largest(List<T> items) {   // T must be comparable
    T best = items.get(0);
    for (T item : items) if (item.compareTo(best) > 0) best = item;
    return best;
}

largest(List.of(3, 9, 4));              // 9
largest(List.of("pear", "apple"));      // "pear"

double sum(List<? extends Number> nums) {    // ? extends — read Numbers out
    double total = 0;
    for (Number n : nums) total += n.doubleValue();
    return total;
}
```

`<? extends Number>` means "a list of some kind of Number" — good for
reading. `<? super Integer>` means "a list you can put Integers into" — good
for writing. Memory aid: **PECS** — Producer `extends`, Consumer `super`.

**Try it:** write a generic `record Pair<A, B>(A first, B second)` and make a
`Pair<String, Integer>`.

</div>

<div class="cheat-card">

#### 15. Lambdas & method references {#lambdas}

**In short:** a **lambda** is a small unnamed function you can pass around,
like `x -> x * 2`.

```java
import java.util.function.*;

Function<Integer, Integer> twice = x -> x * 2;     // takes Integer, returns Integer
twice.apply(5);                                    // 10

Predicate<String> isEmpty = s -> s.isEmpty();      // takes a value, returns boolean
Supplier<Double> dice = () -> Math.random();       // takes nothing, returns a value
Consumer<String> show = s -> System.out.println(s);// takes a value, returns nothing

List<String> names = new ArrayList<>(List.of("Linus", "Ada", "Bo"));
names.sort((x, y) -> x.length() - y.length());     // ["Bo", "Ada", "Linus"]
names.sort(Comparator.naturalOrder());             // ["Ada", "Bo", "Linus"]
names.forEach(System.out::println);                // method reference — same as s -> System.out.println(s)
```

A lambda fits anywhere Java expects a **functional interface** — an interface
with exactly one method (`Function`, `Predicate`, `Runnable`, `Comparator`…).

**Try it:** sort a list of words by their last letter using a lambda.

</div>

<div class="cheat-card">

#### 16. Streams {#streams}

**In short:** a **stream** runs a list of items through steps — filter, change,
collect — without writing a loop.

```java
import java.util.stream.*;

record User(String name, int age) { }
List<User> users = List.of(new User("Ada", 36), new User("Bo", 15), new User("Cy", 22));

List<String> adults = users.stream()
    .filter(u -> u.age() >= 18)            // keep only adults
    .map(User::name)                       // User → name
    .sorted()                              // A to Z
    .toList();                             // List<String> — ["Ada", "Cy"] (Java 16+)

int totalAge = users.stream().mapToInt(User::age).sum();          // 73
boolean anyTeen = users.stream().anyMatch(u -> u.age() < 18);     // true

Map<Boolean, List<User>> byAdult = users.stream()
    .collect(Collectors.partitioningBy(u -> u.age() >= 18));      // {false=[Bo], true=[Ada, Cy]}

String csv = Stream.of("a", "b", "c").collect(Collectors.joining(","));   // "a,b,c"
IntStream.rangeClosed(1, 5).sum();                                        // 15
```

Nothing runs until the last step (`toList`, `sum`, `anyMatch`…). A stream can
be used only once — make a new one each time.

**Try it:** from a list of words, build a list of only the words longer than 4
letters, in capitals.

</div>

<div class="cheat-card">

#### 17. Optional {#optional}

**In short:** `Optional` is a box that may or may not hold a value — a clear
way to say "there might be no answer" instead of returning `null`.

```java
import java.util.Optional;

Optional<String> found = Optional.of("Ada");     // Optional holding "Ada"
Optional<String> none = Optional.empty();        // empty Optional

found.isPresent();                   // true
none.orElse("guest");                // "guest" — fallback value
found.map(String::toUpperCase);      // Optional["ADA"]
found.ifPresent(System.out::println);// shows: Ada

Optional<String> first = List.of("x", "yy").stream()
    .filter(s -> s.length() > 1)
    .findFirst();                    // Optional["yy"]
```

Use `Optional` as a *return type*. Don't use it for fields or parameters, and
avoid `.get()` — it throws if the box is empty; prefer `orElse` or
`orElseThrow()`.

**Try it:** write `findUser(String name)` that returns `Optional<String>` and
prints `"not found"` via `orElse` when the name is missing.

</div>

<div class="cheat-card">

#### 18. Build tools {#build-tools}

**In short:** **Maven** or **Gradle** downloads libraries, compiles, and runs
tests with one command. Both use the same folder layout.

```text
my-app/
├── pom.xml                  ← Maven settings (or build.gradle for Gradle)
└── src/
    ├── main/java/           ← your code
    └── test/java/           ← your tests
```

```xml
<!-- pom.xml: add a library ("dependency") -->
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.11.0</version>
  <scope>test</scope>              <!-- only needed for tests -->
</dependency>
```

```bash
mvn clean test          # Maven: delete old output, compile, run tests
mvn package             # build a .jar file in target/
./gradlew test          # Gradle: run tests (the wrapper script pins the version)
./gradlew build         # compile, test, and package
```

A **JAR** (Java ARchive) is a zip of compiled classes — the file you ship or
run with `java -jar app.jar`.

**Try it:** create a Maven project, add the JUnit dependency above, and run
`mvn test`.

</div>

<div class="cheat-card">

#### 19. Testing with JUnit {#testing}

**In short:** a test is a method that checks your code gives the right answer.
**JUnit 5** finds methods marked `@Test` and runs them.

```java
// src/test/java/CalculatorTest.java
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    void addsTwoNumbers() {
        assertEquals(5, 2 + 3);                    // passes if equal
    }

    @Test
    void rejectsBadInput() {
        assertThrows(NumberFormatException.class,
            () -> Integer.parseInt("abc"));        // passes if it throws
    }

    @ParameterizedTest                             // one test, many inputs
    @CsvSource({"1, 1, 2", "2, 3, 5", "-1, 1, 0"})
    void adds(int a, int b, int expected) {
        assertEquals(expected, a + b);
    }

    @BeforeEach
    void setUp() { /* runs before every test */ }
}
```

Run with `mvn test` or `./gradlew test`. Name tests after the behaviour they
check (`rejectsBadInput`), so a failure explains itself.

**Try it:** write a test for the `average` method you made in section 6.

</div>

<div class="cheat-card">

#### 20. Common mistakes {#gotchas}

**In short:** the classic Java traps, and how to avoid each one.

```java
// 1. Comparing text with ==
"hi" == new String("hi");        // false — different objects
"hi".equals(new String("hi"));   // true  — always compare Strings with equals

// 2. Whole-number division
double half = 1 / 2;             // 0.0 — int / int happens first
double ok = 1 / 2.0;             // 0.5

// 3. Calling a method on null → NullPointerException
String name = null;
// name.length();                // crashes
"Ada".equals(name);              // false — safe: the known value goes first

// 4. Removing from a list while looping over it
List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
// for (int n : nums) if (n % 2 == 0) nums.remove((Integer) n);  // ConcurrentModificationException
nums.removeIf(n -> n % 2 == 0);  // [1, 3] — the safe way

// 5. Comparing wrapper numbers with ==
Integer a = 1000, b = 1000;
a == b;                          // false — two objects (only -128..127 are shared)
a.equals(b);                     // true

// 6. List.of can't be changed
List<String> fixed = List.of("a");
// fixed.add("b");               // UnsupportedOperationException
```

**Try it:** run each commented-out line in `jshell` and read the error message
it prints — you'll recognise them instantly next time.

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 21. Enums & switch patterns {#enums}

**In short:** an `enum` is a fixed list of named values; modern `switch` can
also match on an object's *type* and pull its parts out.

```java
enum Status { PASS, FAIL, SKIP }

Status s = Status.valueOf("FAIL");       // Status.FAIL — from text
Status.values();                         // [PASS, FAIL, SKIP]

String icon = switch (s) {               // compiler checks every value is handled
    case PASS -> "✓";
    case FAIL -> "✗";
    case SKIP -> "-";
};                                       // "✗"

sealed interface Shape permits Circle, Square { }   // sealed — only these two may implement it
record Circle(double r) implements Shape { }
record Square(double side) implements Shape { }

static double area(Shape shape) {
    return switch (shape) {                          // pattern matching (Java 21+)
        case Circle c -> Math.PI * c.r() * c.r();
        case Square(double side) -> side * side;     // "record pattern" — unpacks the record
    };                                               // no default needed: sealed = all cases known
}
```

**Try it:** add a `Triangle(double base, double height)` record to `Shape` and
see the compiler tell you `area` is missing a case.

</div>

<div class="cheat-card">

#### 22. Immutability {#immutability}

**In short:** an **immutable** object can't change after it's made, so it's
safe to share between methods and threads.

```java
final List<String> a = new ArrayList<>();
a.add("x");                    // allowed — final stops re-assigning a, not changing it
// a = new ArrayList<>();      // not allowed

List<String> copy = List.copyOf(a);   // immutable copy — add/remove throw
Map<String, Integer> m = Map.of("a", 1, "b", 2);   // immutable map

record Money(long cents, String currency) {         // records are immutable
    Money plus(Money other) {
        return new Money(cents + other.cents, currency);   // return a NEW object
    }
}
```

`String` is immutable too: `s.toUpperCase()` returns a new string and leaves
`s` alone. When building text in a loop, use `StringBuilder` to avoid making
thousands of throwaway strings.

**Try it:** build the text `"0,1,2,…,9"` with a `StringBuilder` in a loop.

</div>

<div class="cheat-card">

#### 23. Threads & thread pools {#threads}

**In short:** a **thread** runs code at the same time as other code. Don't
create threads by hand — hand tasks to an **`ExecutorService`** (a thread
pool) and let it manage them.

```java
import java.util.concurrent.*;

try (ExecutorService pool = Executors.newFixedThreadPool(4)) {  // 4 worker threads; closes itself
    Future<Integer> f = pool.submit(() -> 6 * 7);   // Future — a result that will arrive later
    f.get();                                        // 42 — waits for the answer
}

try (ExecutorService vpool = Executors.newVirtualThreadPerTaskExecutor()) {  // Java 21+
    for (int i = 0; i < 1_000; i++) {
        int id = i;
        vpool.submit(() -> {                        // virtual threads are cheap — fine for 1000s of waits
            Thread.sleep(100);                      // stands in for a slow network call
            return id;
        });
    }
}
```

**Virtual threads** (Java 21+) are lightweight threads managed by the JVM —
ideal when tasks spend most of their time *waiting* on the network or disk.
For number-crunching, a fixed pool about the size of your CPU count is best.

**Try it:** submit three tasks that each sleep one second and return a number;
time how long collecting all three answers takes.

</div>

<div class="cheat-card">

#### 24. Sharing data safely {#thread-safety}

**In short:** when two threads change the same data at once, updates get
lost. Use thread-safe types instead of plain ones.

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

int unsafe = 0;                  // unsafe++ from many threads loses updates ("race condition")

AtomicInteger hits = new AtomicInteger();          // thread-safe counter
hits.incrementAndGet();                            // 1

ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();   // thread-safe map
counts.merge("page", 1, Integer::sum);             // {page=1}

Object lock = new Object();
synchronized (lock) {            // only one thread at a time runs this block
    // update shared state here
}
```

A **race condition** is a bug where the result depends on which thread runs
first. Rule of thumb: share as little as possible, prefer immutable data, and
reach for `Atomic*` and `Concurrent*` types before `synchronized`.

**Try it:** start 1,000 tasks that each add 1 to a plain `int[] counter`, and
1,000 that add to an `AtomicInteger`. Compare the totals.

</div>

<div class="cheat-card">

#### 25. CompletableFuture {#completable-future}

**In short:** `CompletableFuture` chains steps that run in the background —
"when this finishes, do that" — without blocking while you wait.

```java
import java.util.concurrent.CompletableFuture;

CompletableFuture<String> user  = CompletableFuture.supplyAsync(() -> "Ada");   // runs in background
CompletableFuture<Integer> score = CompletableFuture.supplyAsync(() -> 90);

String report = user
    .thenCombine(score, (u, s) -> u + " scored " + s)   // when both are done
    .exceptionally(err -> "failed: " + err.getMessage()) // if anything threw
    .join();                                             // "Ada scored 90" — wait for the result

CompletableFuture.allOf(user, score).join();             // wait for several at once
```

Use it to call several services at the same time and combine the answers. On
Java 21+, plain blocking code on virtual threads is often simpler.

**Try it:** fetch three numbers with `supplyAsync`, then print their sum once
all three are ready.

</div>

<div class="cheat-card">

#### 26. The JVM & memory {#jvm}

**In short:** the JVM runs your bytecode, stores objects on the **heap**, and
frees unused objects automatically with the **garbage collector**.

| Part | What it holds |
|---|---|
| **Stack** | Each method call's local variables — one stack per thread, cleared when the method returns |
| **Heap** | Every object made with `new` — shared by all threads |
| **Garbage collector (GC)** | Finds objects nothing points to any more and frees their memory |
| **JIT compiler** | "Just-in-time" — turns frequently run bytecode into fast machine code while the program runs |

```bash
java -Xms512m -Xmx2g -jar app.jar     # start with 512 MB heap, allow up to 2 GB
jcmd <pid> GC.heap_info               # how full is the heap of a running program?
```

An `OutOfMemoryError` means the heap is full — usually a collection that keeps
growing (a cache with no limit, a list you never clear). Measure before
tuning: most slow Java code is slow because of the algorithm or the database,
not the JVM.

</div>

<div class="cheat-card">

#### 27. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **JDK** | Java Development Kit — the compiler (`javac`), `java`, `jshell`, and tools. Install this. |
| **JVM** | Java Virtual Machine — runs compiled bytecode on any operating system |
| **Bytecode** | The `.class` files `javac` produces; the same file runs on Windows, Mac, Linux |
| **LTS** | Long-Term Support — Java 17, 21, 25 get years of fixes; use one of these |
| **Primitive** | A plain value type: `int`, `double`, `boolean`, `char`, `long`… |
| **Wrapper** | The object version of a primitive: `Integer`, `Double`, `Boolean`… |
| **Autoboxing** | Java converting `int` ↔ `Integer` for you automatically |
| **NPE** | `NullPointerException` — you called a method on `null` |
| **POJO** | "Plain Old Java Object" — a simple class with fields, getters, setters |
| **Annotation** | A `@Label` like `@Test` or `@Override` that tools and frameworks read |
| **Classpath** | The list of folders and JARs where Java looks for classes |
| **Artifact** | A built file (usually a JAR) identified by `groupId:artifactId:version` in Maven |

For role-specific examples and longer explanations, see the
[complete guide](/docs/sdet-skills/java/java-guide) and
[Java for SDET](/docs/role-guides/sdet/java-for-sdet).

</div>

</div>
