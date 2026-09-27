---
title: "Java Milestones & Mini-Projects"
description: "A working, tested Java mini-project for each of the seven core milestones — converter, word counter, validator, retry helper, bank accounts, log analyzer, and a concurrent health checker."
sidebar_position: 2
level: beginner
tags: [java, learning-path, projects]
image: /img/social/java-milestones.png
---

# Java Milestones & Mini-Projects

**In short:** one small, tested project per milestone. Each project uses only
what that milestone teaches (plus earlier ones), and each ends with a
**Try it** extension so you write some code of your own.

:::tip How to use this page

First read the milestone in the [Roadmap](/docs/learning-path/java/implementation-roadmap)
and the cheat-sheet sections it links to. Then build the project here: type
the code (don't paste it), run `mvn test` until everything passes, do the
**Try it**, and commit.

:::

## Contents

- [Project setup (do this once)](#setup)
- [Milestone 1: Temperature converter](#milestone-1)
- [Milestone 2: Word counter](#milestone-2)
- [Milestone 3: Password validator](#milestone-3)
- [Milestone 4: Retry helper](#milestone-4)
- [Milestone 5: Bank accounts](#milestone-5)
- [Milestone 6: Log analyzer](#milestone-6)
- [Milestone 7: Concurrent health checker](#milestone-7)
- [After Milestone 7](#after)

---

## Project setup (do this once) {#setup}

**In short:** one Maven project holds all seven milestones, one package each
(`com.example.m1` … `com.example.m7`).

```text
java-mastery/
├── pom.xml
└── src/
    ├── main/java/com/example/m1/TemperatureConverter.java
    └── test/java/com/example/m1/TemperatureConverterTest.java
```

```xml
<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>java-mastery</artifactId>
  <version>1.0</version>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>   <!-- compile for Java 21 -->
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.11.0</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>                                   <!-- runs JUnit 5 tests on "mvn test" -->
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.0</version>
      </plugin>
    </plugins>
  </build>
</project>
```

```bash
mvn test                                  # compile everything and run all tests
mvn test -Dtest='com.example.m1.*Test'    # only Milestone 1's tests
```

---

## Milestone 1: Temperature converter {#milestone-1}

**Practises:** types, `String` methods, `switch`, static methods, throwing an
exception, `main`.

**The task:** turn input like `"100C"` or `"212F"` into the other unit.

```java
// src/main/java/com/example/m1/TemperatureConverter.java
package com.example.m1;

import java.util.Locale;

public class TemperatureConverter {

    public static double celsiusToFahrenheit(double celsius) {
        return celsius * 9 / 5 + 32;
    }

    public static double fahrenheitToCelsius(double fahrenheit) {
        return (fahrenheit - 32) * 5 / 9;
    }

    /** Converts "100C" to "212.0F" and "212F" to "100.0C". */
    public static String convert(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("input must not be empty");
        }
        String text = input.strip().toUpperCase();
        char unit = text.charAt(text.length() - 1);                            // last character
        double value = Double.parseDouble(text.substring(0, text.length() - 1)); // everything before it

        return switch (unit) {
            case 'C' -> String.format(Locale.ROOT, "%.1fF", celsiusToFahrenheit(value));
            case 'F' -> String.format(Locale.ROOT, "%.1fC", fahrenheitToCelsius(value));
            default -> throw new IllegalArgumentException("unit must be C or F: " + input);
        };
    }

    public static void main(String[] args) {
        for (String arg : args) {
            System.out.println(arg + " = " + convert(arg));
        }
    }
}
```

```java
// src/test/java/com/example/m1/TemperatureConverterTest.java
package com.example.m1;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class TemperatureConverterTest {

    @ParameterizedTest
    @CsvSource({
        "100C, 212.0F",
        "0C, 32.0F",
        "212F, 100.0C",
        "-40F, -40.0C",
        "37c, 98.6F"
    })
    void convertsBothWays(String input, String expected) {
        assertEquals(expected, TemperatureConverter.convert(input));
    }

    @Test
    void rejectsUnknownUnit() {
        assertThrows(IllegalArgumentException.class, () -> TemperatureConverter.convert("10K"));
    }

    @Test
    void rejectsEmptyInput() {
        assertThrows(IllegalArgumentException.class, () -> TemperatureConverter.convert("  "));
    }

    @Test
    void rejectsTextThatIsNotANumber() {
        // NumberFormatException is a kind of IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> TemperatureConverter.convert("abcC"));
    }
}
```

**Run it:** `java src/main/java/com/example/m1/TemperatureConverter.java 100C 32F`
prints `100C = 212.0F` and `32F = 0.0C`.

**Watch out for:** `String.format("%.1f", …)` uses your computer's language
settings — in some countries it prints `212,0`. Passing `Locale.ROOT` makes
the output the same everywhere, which keeps tests reliable.

**Try it:** add Kelvin — `"300K"` should give `"26.9C"`. Add a test first,
watch it fail, then make it pass.

---

## Milestone 2: Word counter {#milestone-2}

**Practises:** `HashMap`, `merge`, sorting entries with a `Comparator`,
`TreeSet`, reading a file.

**The task:** count how often each word appears in a text and list the most
common ones.

```java
// src/main/java/com/example/m2/WordCounter.java
package com.example.m2;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public class WordCounter {

    /** Returns word → how many times it appears, ignoring case and punctuation. */
    public static Map<String, Integer> count(String text) {
        Map<String, Integer> counts = new HashMap<>();
        for (String word : text.toLowerCase().split("\\W+")) {   // \W+ = one or more non-word characters
            if (word.isEmpty()) continue;                         // text starting with punctuation gives ""
            counts.merge(word, 1, Integer::sum);                  // add 1, or start at 1
        }
        return counts;
    }

    /** The n most common words; ties are sorted A to Z. */
    public static List<Map.Entry<String, Integer>> top(Map<String, Integer> counts, int n) {
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
        entries.sort(Map.Entry.<String, Integer>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()));
        return entries.subList(0, Math.min(n, entries.size()));
    }

    /** Every distinct word, sorted. */
    public static SortedSet<String> vocabulary(String text) {
        return new TreeSet<>(count(text).keySet());
    }

    public static void main(String[] args) throws IOException {
        String text = Files.readString(Path.of(args[0]));
        for (Map.Entry<String, Integer> e : top(count(text), 5)) {
            System.out.printf("%-12s %d%n", e.getKey(), e.getValue());
        }
    }
}
```

```java
// src/test/java/com/example/m2/WordCounterTest.java
package com.example.m2;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class WordCounterTest {

    @Test
    void countsWordsIgnoringCaseAndPunctuation() {
        Map<String, Integer> counts = WordCounter.count("To be, or not to BE.");
        assertEquals(Map.of("to", 2, "be", 2, "or", 1, "not", 1), counts);
    }

    @Test
    void topSortsByCountThenAlphabetically() {
        var top = WordCounter.top(WordCounter.count("b a c a b a"), 2);
        assertEquals(List.of(Map.entry("a", 3), Map.entry("b", 2)), top);
    }

    @Test
    void topCopesWithFewerWordsThanAskedFor() {
        assertEquals(1, WordCounter.top(WordCounter.count("solo"), 10).size());
    }

    @Test
    void emptyTextHasNoWords() {
        assertTrue(WordCounter.count("").isEmpty());
        assertTrue(WordCounter.count("...!").isEmpty());
    }

    @Test
    void vocabularyIsSortedAndUnique() {
        assertEquals(List.of("a", "b", "c"), List.copyOf(WordCounter.vocabulary("c b a b")));
    }
}
```

**Watch out for:** `split("\\W+")` treats an apostrophe as a separator, so
`"don't"` becomes `"don"` and `"t"`. Good enough here; real text analysis
needs a better pattern.

**Try it:** add a `stopWords` parameter (`Set<String>` like `"the"`, `"a"`)
that `count` skips. Why is a `Set` the right type for it?

---

## Milestone 3: Password validator {#milestone-3}

**Practises:** loops over characters, `if` / `else if`, building a list of
problems, a custom exception.

**The task:** check a password against rules and report *every* problem, not
just the first.

```java
// src/main/java/com/example/m3/PasswordValidator.java
package com.example.m3;

import java.util.ArrayList;
import java.util.List;

public class PasswordValidator {

    public static final int MIN_LENGTH = 8;

    /** Returns every broken rule; an empty list means the password is fine. */
    public static List<String> problems(String password) {
        if (password == null || password.isEmpty()) {
            return List.of("password is required");        // nothing else worth checking
        }
        List<String> problems = new ArrayList<>();
        if (password.length() < MIN_LENGTH) {
            problems.add("must be at least " + MIN_LENGTH + " characters");
        }

        boolean hasUpper = false, hasDigit = false, hasSymbol = false, hasSpace = false;
        for (char c : password.toCharArray()) {
            if (Character.isWhitespace(c)) hasSpace = true;
            else if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (!Character.isLetter(c)) hasSymbol = true;
        }
        if (!hasUpper) problems.add("needs an upper-case letter");
        if (!hasDigit) problems.add("needs a digit");
        if (!hasSymbol) problems.add("needs a symbol such as ! or #");
        if (hasSpace) problems.add("must not contain spaces");
        return problems;
    }

    /** Throws if the password breaks any rule. */
    public static void requireValid(String password) {
        List<String> problems = problems(password);
        if (!problems.isEmpty()) {
            throw new InvalidPasswordException(problems);
        }
    }
}
```

```java
// src/main/java/com/example/m3/InvalidPasswordException.java
package com.example.m3;

import java.util.List;

public class InvalidPasswordException extends RuntimeException {

    private final List<String> problems;

    public InvalidPasswordException(List<String> problems) {
        super("invalid password: " + String.join(", ", problems));
        this.problems = List.copyOf(problems);             // callers can't change our list
    }

    public List<String> problems() {
        return problems;
    }
}
```

```java
// src/test/java/com/example/m3/PasswordValidatorTest.java
package com.example.m3;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    void strongPasswordHasNoProblems() {
        assertEquals(List.of(), PasswordValidator.problems("Str0ng!pass"));
    }

    @Test
    void reportsEveryProblemAtOnce() {
        List<String> problems = PasswordValidator.problems("abc");
        assertEquals(4, problems.size());
        assertTrue(problems.contains("needs a digit"));
    }

    @Test
    void spacesAreNotAllowed() {
        assertTrue(PasswordValidator.problems("Has Space1!").contains("must not contain spaces"));
    }

    @ParameterizedTest
    @NullAndEmptySource                                   // runs once with null, once with ""
    void missingPasswordIsOneProblem(String password) {
        assertEquals(List.of("password is required"), PasswordValidator.problems(password));
    }

    @Test
    void requireValidThrowsWithTheProblems() {
        var e = assertThrows(InvalidPasswordException.class,
                () -> PasswordValidator.requireValid("short1!"));
        assertEquals(List.of("must be at least 8 characters", "needs an upper-case letter"), e.problems());
    }
}
```

**Watch out for:** `Character.isUpperCase('É')` is `true` — Java understands
letters from every language, not just A–Z. That's usually what you want.

**Try it:** add a rule "must not contain the username" by adding a
`problems(String password, String username)` overload. Compare
case-insensitively.

---

## Milestone 4: Retry helper {#milestone-4}

**Practises:** generic methods (`<T>`), lambdas and `Supplier`, loops with
`try` / `catch`, `Duration`.

**The task:** run an action that sometimes fails (like a network call), and
retry it a few times with a growing pause before giving up.

```java
// src/main/java/com/example/m4/Retry.java
package com.example.m4;

import java.time.Duration;
import java.util.function.Supplier;

public final class Retry {

    private Retry() { }                                    // only static methods: no objects needed

    /**
     * Runs action up to maxAttempts times. Waits firstWait after the first failure,
     * then twice as long after each later failure (1x, 2x, 4x…).
     */
    public static <T> T withRetries(int maxAttempts, Duration firstWait, Supplier<T> action) {
        if (maxAttempts < 1) {
            throw new IllegalArgumentException("maxAttempts must be at least 1");
        }
        RuntimeException lastFailure = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return action.get();                       // success: return straight away
            } catch (RuntimeException e) {
                lastFailure = e;
                if (attempt < maxAttempts) {
                    pause(firstWait.multipliedBy(1L << (attempt - 1)));   // 1, 2, 4, 8… times
                }
            }
        }
        throw new RetriesExhaustedException(maxAttempts, lastFailure);
    }

    private static void pause(Duration duration) {
        try {
            Thread.sleep(duration);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();            // keep the "please stop" signal
            throw new IllegalStateException("interrupted while waiting to retry", e);
        }
    }
}
```

```java
// src/main/java/com/example/m4/RetriesExhaustedException.java
package com.example.m4;

public class RetriesExhaustedException extends RuntimeException {
    public RetriesExhaustedException(int attempts, Throwable lastFailure) {
        super("gave up after " + attempts + " attempts", lastFailure);
    }
}
```

```java
// src/test/java/com/example/m4/RetryTest.java
package com.example.m4;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class RetryTest {

    @Test
    void returnsAsSoonAsTheActionSucceeds() {
        AtomicInteger calls = new AtomicInteger();
        String result = Retry.withRetries(5, Duration.ZERO, () -> {
            if (calls.incrementAndGet() < 3) throw new IllegalStateException("not yet");
            return "ok";
        });
        assertEquals("ok", result);
        assertEquals(3, calls.get());                      // failed twice, then succeeded
    }

    @Test
    void givesUpAndKeepsTheLastFailure() {
        var e = assertThrows(RetriesExhaustedException.class,
                () -> Retry.withRetries(3, Duration.ZERO, () -> { throw new IllegalStateException("down"); }));
        assertEquals("gave up after 3 attempts", e.getMessage());
        assertEquals("down", e.getCause().getMessage());
    }

    @Test
    void waitsLongerAfterEachFailure() {
        long start = System.nanoTime();
        assertThrows(RetriesExhaustedException.class,
                () -> Retry.withRetries(3, Duration.ofMillis(50), () -> { throw new RuntimeException(); }));
        long tookMs = (System.nanoTime() - start) / 1_000_000;
        assertTrue(tookMs >= 150, "expected 50 + 100 ms of waiting, took " + tookMs);
    }

    @Test
    void rejectsZeroAttempts() {
        assertThrows(IllegalArgumentException.class, () -> Retry.withRetries(0, Duration.ZERO, () -> 1));
    }
}
```

**Watch out for:** catching `InterruptedException` and carrying on hides a
request to stop the thread. Always call `Thread.currentThread().interrupt()`
before rethrowing or returning.

**Try it:** add a `Predicate<RuntimeException> retryIf` parameter, so an
`IllegalArgumentException` (a bug, not a blip) fails immediately without
retrying.

---

## Milestone 5: Bank accounts {#milestone-5}

**Practises:** classes with private state, an `abstract` class, inheritance,
`enum`, `record`, defensive copies.

**The task:** two account types that share deposit/withdraw logic but have
different withdrawal rules. Money is stored in whole cents (`long`) — never
`double`.

```java
// src/main/java/com/example/m5/TransactionType.java
package com.example.m5;

public enum TransactionType { DEPOSIT, WITHDRAWAL, INTEREST }
```

```java
// src/main/java/com/example/m5/Transaction.java
package com.example.m5;

public record Transaction(TransactionType type, long cents) { }
```

```java
// src/main/java/com/example/m5/InsufficientFundsException.java
package com.example.m5;

public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String accountId, long cents) {
        super("account " + accountId + " cannot withdraw " + cents + " cents");
    }
}
```

```java
// src/main/java/com/example/m5/Account.java
package com.example.m5;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public abstract class Account {

    private final String id;
    private long balanceCents;
    private final List<Transaction> history = new ArrayList<>();

    protected Account(String id) {
        this.id = Objects.requireNonNull(id, "id");
    }

    public void deposit(long cents) {
        requirePositive(cents);
        balanceCents += cents;
        history.add(new Transaction(TransactionType.DEPOSIT, cents));
    }

    public void withdraw(long cents) {
        requirePositive(cents);
        if (!canWithdraw(cents)) {
            throw new InsufficientFundsException(id, cents);
        }
        balanceCents -= cents;
        history.add(new Transaction(TransactionType.WITHDRAWAL, cents));
    }

    /** Each kind of account decides how far it may go. */
    protected abstract boolean canWithdraw(long cents);

    protected void addInterest(long cents) {
        balanceCents += cents;
        history.add(new Transaction(TransactionType.INTEREST, cents));
    }

    public String id() { return id; }
    public long balanceCents() { return balanceCents; }
    public List<Transaction> history() { return List.copyOf(history); }   // a copy: callers can't edit ours

    private static void requirePositive(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("amount must be positive: " + cents);
    }
}
```

```java
// src/main/java/com/example/m5/SavingsAccount.java
package com.example.m5;

public class SavingsAccount extends Account {

    private final int annualRateBasisPoints;               // 1 basis point = 0.01%, so 450 = 4.5%

    public SavingsAccount(String id, int annualRateBasisPoints) {
        super(id);
        this.annualRateBasisPoints = annualRateBasisPoints;
    }

    @Override
    protected boolean canWithdraw(long cents) {
        return balanceCents() >= cents;                    // savings can't go below zero
    }

    public void applyMonthlyInterest() {
        long interest = balanceCents() * annualRateBasisPoints / 10_000 / 12;
        if (interest > 0) addInterest(interest);
    }
}
```

```java
// src/main/java/com/example/m5/CheckingAccount.java
package com.example.m5;

public class CheckingAccount extends Account {

    private final long overdraftLimitCents;

    public CheckingAccount(String id, long overdraftLimitCents) {
        super(id);
        this.overdraftLimitCents = overdraftLimitCents;
    }

    @Override
    protected boolean canWithdraw(long cents) {
        return balanceCents() + overdraftLimitCents >= cents;   // may go negative, up to the limit
    }
}
```

```java
// src/test/java/com/example/m5/AccountTest.java
package com.example.m5;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AccountTest {

    @Test
    void depositAndWithdrawUpdateBalanceAndHistory() {
        Account acc = new SavingsAccount("S1", 0);
        acc.deposit(10_000);
        acc.withdraw(2_500);
        assertEquals(7_500, acc.balanceCents());
        assertEquals(List.of(
                new Transaction(TransactionType.DEPOSIT, 10_000),
                new Transaction(TransactionType.WITHDRAWAL, 2_500)), acc.history());
    }

    @Test
    void savingsCannotGoNegative() {
        Account acc = new SavingsAccount("S1", 0);
        acc.deposit(100);
        assertThrows(InsufficientFundsException.class, () -> acc.withdraw(101));
        assertEquals(100, acc.balanceCents());             // unchanged after the failure
    }

    @Test
    void checkingCanUseItsOverdraft() {
        Account acc = new CheckingAccount("C1", 5_000);
        acc.withdraw(5_000);
        assertEquals(-5_000, acc.balanceCents());
        assertThrows(InsufficientFundsException.class, () -> acc.withdraw(1));
    }

    @Test
    void monthlyInterestIsAdded() {
        SavingsAccount acc = new SavingsAccount("S1", 1_200);   // 12% a year = 1% a month
        acc.deposit(100_000);
        acc.applyMonthlyInterest();
        assertEquals(101_000, acc.balanceCents());
    }

    @Test
    void historyCannotBeChangedFromOutside() {
        Account acc = new CheckingAccount("C1", 0);
        acc.deposit(1);
        assertThrows(UnsupportedOperationException.class,
                () -> acc.history().add(new Transaction(TransactionType.DEPOSIT, 999)));
    }

    @Test
    void rejectsZeroOrNegativeAmounts() {
        Account acc = new CheckingAccount("C1", 0);
        assertThrows(IllegalArgumentException.class, () -> acc.deposit(0));
        assertThrows(IllegalArgumentException.class, () -> acc.withdraw(-5));
    }
}
```

**Watch out for:** a public `getHistory()` that returns the real list lets any
caller add fake transactions. Returning `List.copyOf(...)` closes that hole.

**Try it:** add a `transfer(Account from, Account to, long cents)` method in a
new `Bank` class. If the withdrawal fails, the deposit must not happen.

---

## Milestone 6: Log analyzer {#milestone-6}

**Practises:** records, `Optional`, streams and collectors, reading files
lazily, `@TempDir` in tests.

**The task:** read a log file, skip broken lines, count entries by level, and
find the noisiest error sources. Each line looks like:

```text
2026-09-24T10:15:02Z ERROR PaymentService Card declined for order 42
```

```java
// src/main/java/com/example/m6/LogEntry.java
package com.example.m6;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Optional;

public record LogEntry(Instant time, String level, String source, String message) {

    /** Parses one line; returns empty for lines that don't fit the format. */
    public static Optional<LogEntry> parse(String line) {
        String[] parts = line.strip().split(" ", 4);        // at most 4 pieces: message keeps its spaces
        if (parts.length < 4) {
            return Optional.empty();
        }
        try {
            return Optional.of(new LogEntry(Instant.parse(parts[0]), parts[1], parts[2], parts[3]));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }
}
```

```java
// src/main/java/com/example/m6/LogAnalyzer.java
package com.example.m6;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class LogAnalyzer {

    private final List<LogEntry> entries;

    public LogAnalyzer(List<LogEntry> entries) {
        this.entries = List.copyOf(entries);
    }

    public static LogAnalyzer fromFile(Path file) throws IOException {
        try (Stream<String> lines = Files.lines(file)) {   // reads lazily, closes the file
            return new LogAnalyzer(lines
                    .map(LogEntry::parse)
                    .flatMap(Optional::stream)              // keep only the lines that parsed
                    .toList());
        }
    }

    public int size() {
        return entries.size();
    }

    /** Level → number of entries, sorted by level name. */
    public Map<String, Long> countByLevel() {
        return entries.stream()
                .collect(Collectors.groupingBy(LogEntry::level, TreeMap::new, Collectors.counting()));
    }

    /** The n sources with the most ERROR entries, most first. */
    public List<Map.Entry<String, Long>> topErrorSources(int n) {
        return entries.stream()
                .filter(e -> e.level().equals("ERROR"))
                .collect(Collectors.groupingBy(LogEntry::source, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                        .thenComparing(Map.Entry.comparingByKey()))
                .limit(n)
                .toList();
    }

    public Optional<LogEntry> firstError() {
        return entries.stream().filter(e -> e.level().equals("ERROR")).findFirst();
    }

    public static void main(String[] args) throws IOException {
        LogAnalyzer analyzer = fromFile(Path.of(args[0]));
        System.out.println("Entries: " + analyzer.size());
        System.out.println("By level: " + analyzer.countByLevel());
        analyzer.topErrorSources(3).forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));
    }
}
```

```java
// src/test/java/com/example/m6/LogAnalyzerTest.java
package com.example.m6;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class LogAnalyzerTest {

    static final String LOG = """
            2026-09-24T10:00:00Z INFO  Api Started
            2026-09-24T10:00:01Z ERROR Payments Card declined for order 42
            not a log line
            2026-09-24T10:00:02Z ERROR Payments Timeout calling bank
            2026-09-24T10:00:03Z WARN Api Slow response 900ms
            2026-09-24T10:00:04Z ERROR Inventory Out of stock
            """;

    @Test
    void parsesAGoodLineAndKeepsSpacesInTheMessage() {
        LogEntry e = LogEntry.parse("2026-09-24T10:00:01Z ERROR Payments Card declined").orElseThrow();
        assertEquals("Payments", e.source());
        assertEquals("Card declined", e.message());
    }

    @Test
    void skipsLinesThatDoNotParse() {
        assertTrue(LogEntry.parse("not a log line").isEmpty());
        assertTrue(LogEntry.parse("yesterday ERROR Api Broken").isEmpty());
    }

    @Test
    void analysesAFile(@TempDir Path dir) throws IOException {   // JUnit makes and deletes a temp folder
        Path file = dir.resolve("app.log");
        Files.writeString(file, LOG);

        LogAnalyzer analyzer = LogAnalyzer.fromFile(file);

        assertEquals(5, analyzer.size());
        assertEquals(Map.of("ERROR", 3L, "INFO", 1L, "WARN", 1L), analyzer.countByLevel());
        assertEquals(List.of(Map.entry("Payments", 2L), Map.entry("Inventory", 1L)),
                analyzer.topErrorSources(2));
        assertEquals("Card declined for order 42", analyzer.firstError().orElseThrow().message());
    }
}
```

**Watch out for:** `INFO  Api` has two spaces. `split(" ", 4)` then produces
an empty "source" and shifts the message. The test data above includes that
line on purpose — look at what `countByLevel` says and why the test still
passes, then decide whether to fix it with `split("\\s+", 4)`.

**Try it:** add `errorsPerMinute()` returning a `Map<Instant, Long>` keyed by
the minute (`time().truncatedTo(ChronoUnit.MINUTES)`).

---

## Milestone 7: Concurrent health checker {#milestone-7}

**Practises:** interfaces as plug-in points, virtual threads, `invokeAll`,
Java's built-in `HttpClient`, testing concurrency with a fake.

**The task:** check many URLs at the same time and report which are healthy.
The part that talks to the network is behind an interface, so tests run
without a network.

```java
// src/main/java/com/example/m7/StatusFetcher.java
package com.example.m7;

@FunctionalInterface
public interface StatusFetcher {
    /** Returns the HTTP status code for url, or throws if it can't be reached. */
    int fetch(String url) throws Exception;
}
```

```java
// src/main/java/com/example/m7/CheckResult.java
package com.example.m7;

import java.time.Duration;

public record CheckResult(String url, boolean healthy, int status, Duration took) { }
```

```java
// src/main/java/com/example/m7/HealthChecker.java
package com.example.m7;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class HealthChecker {

    private final StatusFetcher fetcher;

    public HealthChecker(StatusFetcher fetcher) {
        this.fetcher = fetcher;
    }

    /** Checks every URL at the same time; results come back in the same order. */
    public List<CheckResult> checkAll(List<String> urls) throws InterruptedException {
        List<Callable<CheckResult>> tasks = urls.stream()
                .map(url -> (Callable<CheckResult>) () -> check(url))
                .toList();
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            return pool.invokeAll(tasks).stream()         // waits until every task is done
                    .map(Future::resultNow)                // check() never throws, so every task has a result
                    .toList();
        }
    }

    CheckResult check(String url) {
        long start = System.nanoTime();
        try {
            int status = fetcher.fetch(url);
            return new CheckResult(url, status >= 200 && status < 400, status, since(start));
        } catch (Exception e) {
            return new CheckResult(url, false, -1, since(start));   // unreachable counts as unhealthy
        }
    }

    private static Duration since(long startNanos) {
        return Duration.ofNanos(System.nanoTime() - startNanos);
    }

    /** The real fetcher: an HTTP HEAD request with a timeout. */
    public static StatusFetcher http(Duration timeout) {
        HttpClient client = HttpClient.newBuilder().connectTimeout(timeout).build();
        return url -> client.send(
                HttpRequest.newBuilder(URI.create(url))
                        .timeout(timeout)
                        .method("HEAD", HttpRequest.BodyPublishers.noBody())
                        .build(),
                HttpResponse.BodyHandlers.discarding()).statusCode();
    }

    public static void main(String[] args) throws InterruptedException {
        HealthChecker checker = new HealthChecker(http(Duration.ofSeconds(3)));
        for (CheckResult r : checker.checkAll(List.of(args))) {
            System.out.printf("%-4s %3d %5d ms  %s%n",
                    r.healthy() ? "UP" : "DOWN", r.status(), r.took().toMillis(), r.url());
        }
    }
}
```

```java
// src/test/java/com/example/m7/HealthCheckerTest.java
package com.example.m7;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

class HealthCheckerTest {

    @Test
    void reportsStatusForEachUrlInOrder() throws InterruptedException {
        StatusFetcher fake = url -> switch (url) {        // a fake: no network needed
            case "https://ok.test" -> 200;
            case "https://broken.test" -> 503;
            default -> throw new IOException("no route to host");
        };

        List<CheckResult> results = new HealthChecker(fake)
                .checkAll(List.of("https://ok.test", "https://broken.test", "https://gone.test"));

        assertEquals(List.of(true, false, false), results.stream().map(CheckResult::healthy).toList());
        assertEquals(List.of(200, 503, -1), results.stream().map(CheckResult::status).toList());
    }

    @Test
    void checksRunAtTheSameTime() throws InterruptedException {
        StatusFetcher slow = url -> { Thread.sleep(200); return 200; };
        List<String> urls = IntStream.range(0, 50).mapToObj(i -> "https://s" + i + ".test").toList();

        long start = System.nanoTime();
        List<CheckResult> results = new HealthChecker(slow).checkAll(urls);
        long tookMs = (System.nanoTime() - start) / 1_000_000;

        assertEquals(50, results.size());
        assertTrue(tookMs < 2_000, "50 × 200 ms one after another would take 10 s; took " + tookMs + " ms");
    }
}
```

**Run it for real:** `java -cp target/classes com.example.m7.HealthChecker https://example.com https://httpstat.us/503`
(after `mvn compile`).

**Watch out for:** without a timeout, one hanging server keeps `checkAll`
waiting forever. The real fetcher sets both a connect timeout and a request
timeout.

**Try it:** add `summary(List<CheckResult>)` that returns text like
`"2/3 healthy, slowest: https://… (812 ms)"`.

---

## After Milestone 7 {#after}

**In short:** you now have seven tested projects in one repository — proof
you can write real Java.

- [ ] `mvn test` passes for all seven packages.
- [ ] Each project has at least one test you wrote yourself (from **Try it**).
- [ ] Your git history has one or more commits per milestone.

Next, go back to the [Roadmap](/docs/learning-path/java/implementation-roadmap#tracks)
and start your role track.
