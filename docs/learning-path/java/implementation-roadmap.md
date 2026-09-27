---
title: "Java Learning Path: Start Here"
description: "How to learn Java in seven milestones — what to learn in each, the project you build, how to check yourself, and the SDET track that follows."
sidebar_position: 1
level: beginner
tags: [java, learning-path]
image: /img/social/java-learning-path.png
---

# Java Learning Path: Start Here

**In short:** you learn core Java in **7 milestones**, building one small,
tested project in each. Then you move on to the SDET track, where Java is used
most on this site.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → build → test → commit**. Come back here whenever you're
unsure what to do next.

:::

## The pages in this learning path {#pages}

**In short:** each page has one job, so nothing is explained twice.

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan: what each milestone covers and how to check yourself | At the start of each milestone |
| [Java cheat sheet](/cheatsheets/java) | Learn each idea: short explanation, example, exercise | The "learn" step of every milestone |
| [Milestones & Mini-Projects](/docs/learning-path/java/milestones-and-mini-projects) | A full working project with tests for each milestone | The "build" and "test" steps |
| [Quick Reference](/docs/fundamentals/java/java-quick-reference) | Look up syntax and library calls | Any time you're coding |
| [Coding Best Practices](/docs/fundamentals/java/coding-best-practices) | Habits that keep code clean and safe | After Milestone 5, then before every commit |
| [Java: The Complete Guide](/docs/sdet-skills/java/java-guide) | JVM internals and interview questions | When you want the deeper "why" |

## Part 1 — Core Java: Milestones 1–7 {#core}

**In short:** everyone does these seven, in order. Each one ends with a
working project in your portfolio.

| Milestone | You learn | You build |
|---|---|---|
| [1](#milestone-1) | Setup, types, text, `switch`, methods | Temperature converter |
| [2](#milestone-2) | Lists, sets, maps, sorting | Word counter |
| [3](#milestone-3) | Loops, conditions, exceptions | Password validator |
| [4](#milestone-4) | Generics, lambdas, functional interfaces | Retry helper |
| [5](#milestone-5) | Classes, inheritance, interfaces, records, enums | Bank accounts |
| [6](#milestone-6) | Streams, `Optional`, files | Log analyzer |
| [7](#milestone-7) | Build tools, JUnit, concurrency | Concurrent health checker |

**For each milestone:**

1. **Learn** — read the cheat-sheet sections listed for that milestone below.
   Type the examples into `jshell`.
2. **Build** — follow its project in [Milestones & Mini-Projects](/docs/learning-path/java/milestones-and-mini-projects). Type the code; don't paste it.
3. **Test** — run `mvn test` until everything passes. Then do the project's **Try it**.
4. **Commit** — save your progress with git:

```bash
git add .
git commit -m "Milestone 1: temperature converter, 8 tests passing"
git push
```

### Milestone 1: Getting started {#milestone-1}

**Learn:** [Your first program](/cheatsheets/java#first-program) ·
[Variables & types](/cheatsheets/java#basics) ·
[Text & numbers](/cheatsheets/java#strings-numbers) ·
[Making decisions & loops](/cheatsheets/java#control-flow) ·
[Methods](/cheatsheets/java#methods)

**Build:** [Temperature converter](/docs/learning-path/java/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] What's the difference between `int` and `Integer`?
- [ ] Why does `7 / 2` give `3`, and how do you get `3.5`?
- [ ] What does `static` mean on a method?

### Milestone 2: Collections {#milestone-2}

**Learn:** [Arrays & lists](/cheatsheets/java#arrays-lists) ·
[Sets, maps & queues](/cheatsheets/java#collections) ·
Quick Reference: [Sorting](/docs/fundamentals/java/java-quick-reference#sorting)

**Build:** [Word counter](/docs/learning-path/java/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] When would you pick a `HashSet` over an `ArrayList`?
- [ ] What does `map.merge(key, 1, Integer::sum)` do when the key is missing?
- [ ] How do you sort by one field, then another?

### Milestone 3: Control flow & errors {#milestone-3}

**Learn:** [Handling errors](/cheatsheets/java#exceptions) ·
[Reading & writing files](/cheatsheets/java#files) ·
[Common mistakes](/cheatsheets/java#gotchas)

**Build:** [Password validator](/docs/learning-path/java/milestones-and-mini-projects#milestone-3)

**Check yourself:**
- [ ] What's the difference between a checked and an unchecked exception?
- [ ] Why should you compare strings with `equals`, not `==`?
- [ ] What does `try`-with-resources do for you?

### Milestone 4: Generics & lambdas {#milestone-4}

**Learn:** [Generics](/cheatsheets/java#generics) ·
[Lambdas](/cheatsheets/java#lambdas)

**Build:** [Retry helper](/docs/learning-path/java/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] What does the `<T>` in `static <T> T first(List<T> items)` mean?
- [ ] Name three functional interfaces and what each takes and returns.
- [ ] Why can't a lambda change a local variable from outside it?

### Milestone 5: Object-oriented design {#milestone-5}

**Learn:** [Classes & objects](/cheatsheets/java#classes) ·
[Records](/cheatsheets/java#records) ·
[Inheritance & interfaces](/cheatsheets/java#inheritance) ·
[equals, hashCode & toString](/cheatsheets/java#object-methods) ·
[Enums & switch patterns](/cheatsheets/java#enums)

**Build:** [Bank accounts](/docs/learning-path/java/milestones-and-mini-projects#milestone-5)

**Then read:** [Coding Best Practices](/docs/fundamentals/java/coding-best-practices), sections 1–5.

**Check yourself:**
- [ ] When would you use an `interface`, an `abstract class`, and a `record`?
- [ ] What goes wrong if you override `equals` but not `hashCode`?
- [ ] Why store money as `long` cents instead of `double`?

### Milestone 6: Streams & files {#milestone-6}

**Learn:** [Streams](/cheatsheets/java#streams) ·
[Optional](/cheatsheets/java#optional) ·
[Immutability](/cheatsheets/java#immutability) ·
Quick Reference: [Collectors](/docs/fundamentals/java/java-quick-reference#collectors),
[Files](/docs/fundamentals/java/java-quick-reference#files)

**Build:** [Log analyzer](/docs/learning-path/java/milestones-and-mini-projects#milestone-6)

**Check yourself:**
- [ ] Why does nothing happen until a stream's last step?
- [ ] What does `groupingBy` return?
- [ ] When should a method return `Optional`, and when an empty list?

### Milestone 7: Build, test & concurrency {#milestone-7}

**Learn:** [Build tools](/cheatsheets/java#build-tools) ·
[Testing with JUnit](/cheatsheets/java#testing) ·
[Threads & thread pools](/cheatsheets/java#threads) ·
[Sharing data safely](/cheatsheets/java#thread-safety) ·
[CompletableFuture](/cheatsheets/java#completable-future) ·
[The JVM & memory](/cheatsheets/java#jvm)

**Build:** [Concurrent health checker](/docs/learning-path/java/milestones-and-mini-projects#milestone-7)

**Check yourself:**
- [ ] What's a race condition, and name two ways to prevent one?
- [ ] When are virtual threads a good fit, and when aren't they?
- [ ] How did putting the network call behind an interface make the tests possible?

## Part 2 — Your role track: Milestone 8 onwards {#tracks}

**In short:** on this site Java is taught for **SDET** work (Software
Development Engineer in Test) — building automated tests and test frameworks.

| Step | Read | You build |
|---|---|---|
| 8 | [Java for SDET](/docs/role-guides/sdet/java-for-sdet), sections 2–6: unit tests, fixtures, data-driven tests, mocks, API tests | Tests for your Milestone 5 and 7 projects |
| 9 | [Java for SDET](/docs/role-guides/sdet/java-for-sdet), sections 7–12: page objects, waits, test data builders, tags, reports, CI | A small UI test framework that runs in CI |
| 10 | Tool guides: [JUnit](/docs/sdet-skills/junit/junit-guide), [TestNG](/docs/sdet-skills/testng/testng-guide), [Rest Assured](/docs/sdet-skills/rest-assured/rest-assured-guide), [Selenium](/docs/sdet-skills/selenium/selenium-guide) | Pick the tools your team uses |
| Final | [Java for SDET: practice projects](/docs/role-guides/sdet/java-for-sdet#practice-projects) | A full test automation suite running in CI (Continuous Integration) |

Working as an SDE or SRE? The same Milestones 1–7 apply; then use
[Java: The Complete Guide](/docs/sdet-skills/java/java-guide) for the deeper
language topics.

## Your portfolio {#portfolio}

**In short:** by Milestone 7 you'll have seven small, tested projects in one
GitHub repository.

```text
java-mastery/
├── pom.xml
├── README.md            # one line per milestone: what it does, how to run it
└── src/
    ├── main/java/com/example/m1 … m7/
    └── test/java/com/example/m1 … m7/
```

Your role track then adds one larger final project.

## How you know you're ready to move on {#checkpoints}

**After Milestone 7:**

- [ ] All seven projects built; `mvn test` passes.
- [ ] You can explain when to use a `List`, `Set`, or `Map`.
- [ ] You can read a file, handle errors, and test both the good and bad paths.
- [ ] Your git history shows steady progress.

**After your role track:**

- [ ] You finished the final project, and it runs in CI.
- [ ] You can explain the design choices in it to someone else.

## If you get stuck {#troubleshooting}

| Problem | What to do |
|---|---|
| The code won't compile | Read the **first** error only — later ones are often caused by it. The line number and `^` marker point at the problem. |
| `mvn test` finds no tests | Test classes must end in `Test`, sit under `src/test/java`, and use `org.junit.jupiter.api.Test`. |
| A milestone feels too hard | Re-read its cheat-sheet sections, and run each example on its own in `jshell`. |
| "I already know Java" | Still do Milestones 1–7, but do every **Try it** and add more tests. |
| Not enough time | Do less, but regularly. One milestone done well beats four rushed. |

## Start now {#start}

Install an LTS (Long-Term Support) JDK — Java 21 or 25 — and Maven, then create
the project from [Project setup](/docs/learning-path/java/milestones-and-mini-projects#setup).

```bash
java -version            # should say 21 or higher
mvn -version
mkdir -p ~/projects/java-mastery && cd ~/projects/java-mastery
git init
jshell                   # try a few lines, then /exit
```

**Helpful tools:**

| Tool | What it does |
|---|---|
| IntelliJ IDEA Community | Free editor with Java-aware hints and a test runner |
| `jshell` | Try any snippet instantly |
| SDKMAN! (`sdk install java`) | Install and switch between Java versions |

**Good books to read alongside:** *Effective Java* (Joshua Bloch) for idiomatic
Java, and *The Pragmatic Programmer* (Hunt & Thomas) for professional habits.
