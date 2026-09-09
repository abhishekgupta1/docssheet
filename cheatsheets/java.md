---
title: "Java Cheat Sheet"
description: "Quick reference for Java — OOP, generics, collections, streams, concurrency, and build tools."
tags: [java, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Java cheatsheet

A one-page reference for Java. For JVM internals and interview Q&A, see the
[complete guide](/docs/sdet-skills/java/java-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/java/java-guide">📖 Full guide: Java →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### OOP essentials

```java
public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public String speak() { return name + " makes a sound"; }
}

public class Dog extends Animal implements Comparable<Dog> {
    public Dog(String name) { super(name); }
    @Override public String speak() { return name + " barks"; }
    public int compareTo(Dog o) { return name.compareTo(o.name); }
}
```

</div>

<div class="cheat-card">

#### Generics

```java
public <T extends Comparable<T>> T max(List<T> list) {
    return list.stream().max(Comparable::compareTo).orElseThrow();
}

List<? extends Number> nums;   // producer, read-only
List<? super Integer> sink;    // consumer, write-only
```

</div>

<div class="cheat-card">

#### Collections framework

```java
List<String> list = new ArrayList<>();
Set<String> set = new HashSet<>();
Map<String, Integer> map = new HashMap<>();
Deque<String> stack = new ArrayDeque<>();  // push/pop
```

`ArrayList` — fast random access. `LinkedList` — fast insert/remove.
`HashMap` — O(1) avg lookup, no order.

</div>

<div class="cheat-card">

#### Streams & lambdas

```java
List<String> names = users.stream()
    .filter(u -> u.getAge() > 18)
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());

int total = orders.stream().mapToInt(Order::getQty).sum();
```

</div>

<div class="cheat-card">

#### Exception handling

```java
try {
    risky();
} catch (IOException | SQLException e) {
    log.error("failed", e);
} finally {
    cleanup();
}
```

Checked exceptions must be declared/caught; unchecked (`RuntimeException`) don't.

</div>

<div class="cheat-card">

#### Concurrency basics

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> f = pool.submit(() -> compute());
f.get();   // blocks for result

synchronized (lock) { counter++; }   // mutual exclusion
```

</div>

<div class="cheat-card">

#### Build tools

```xml
<!-- Maven: pom.xml -->
<dependency>
  <groupId>org.testng</groupId>
  <artifactId>testng</artifactId>
  <version>7.10.2</version>
</dependency>
```

```bash
mvn clean test
gradle test
```

</div>

<div class="cheat-card">

#### Why Java for SDET

- Mature ecosystem: JUnit/TestNG, Selenium/Appium, Rest Assured all Java-first.
- Strong typing catches framework bugs at compile time, not runtime.
- Enterprise QA orgs standardize on it for shared tooling with backend teams.

<span class="cheat-see">See: Why Java Underpins the Mainstream SDET Stack</span>

</div>

</div>
