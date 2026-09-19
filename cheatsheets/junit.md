---
title: "JUnit Cheat Sheet"
description: "Quick reference for JUnit 5 — annotations, assertions, parameterized tests, and the extension model."
tags: [junit, sdet, cheat-sheet]
hide_table_of_contents: true
---

# JUnit cheatsheet

A one-page reference for JUnit 5. For the extension model and interview Q&A,
see the [complete guide](/docs/sdet-skills/junit/junit-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/junit/junit-guide">📖 Full guide: JUnit →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Core annotations

```java
@Test
void addsNumbers() { assertEquals(4, 2 + 2); }

@BeforeEach void setup() { ... }
@AfterEach  void teardown() { ... }
@BeforeAll static void once() { ... }
@Disabled("flaky, see JIRA-123")
```

</div>

<div class="cheat-card">

#### Assertions & assumptions

```java
assertEquals(expected, actual);
assertThrows(IllegalArgumentException.class, () -> parse(""));
assertAll(
  () -> assertTrue(user.isActive()),
  () -> assertEquals("Bob", user.getName())
);
assumeTrue(isCI());   // skip test if false, doesn't fail
```

</div>

<div class="cheat-card">

#### Parameterized tests

```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "\t"})
void blankStrings(String input) {
    assertTrue(input.isBlank());
}

@ParameterizedTest
@CsvSource({"1,1,2", "2,3,5"})
void add(int a, int b, int sum) {
    assertEquals(sum, a + b);
}
```

</div>

<div class="cheat-card">

#### `@Nested` tests

```java
class UserTest {
  @Nested class WhenActive {
    @Test void canLogin() { ... }
  }
  @Nested class WhenSuspended {
    @Test void cannotLogin() { ... }
  }
}
```

Groups related scenarios, readable failure output by context.

</div>

<div class="cheat-card">

#### Tagging & filtering

```java
@Tag("smoke")
class LoginTest { ... }
```

```bash
mvn test -Dgroups="smoke"
```

</div>

<div class="cheat-card">

#### Extension model

```java
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    @Mock Repository repo;
}
```

Replaces JUnit 4 `@RunWith` — composable, multiple extensions per class.

</div>

<div class="cheat-card">

#### Parallel execution

```properties
# junit-platform.properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
```

</div>

<div class="cheat-card">

#### JUnit 5 vs TestNG

| | JUnit 5 | TestNG |
|---|---|---|
| Parameterized | `@ParameterizedTest` | `@DataProvider` |
| Grouping | `@Tag` | `@Groups` |
| Parallel | config-based | native, more granular |

<span class="cheat-see">See: JUnit 5 vs. TestNG</span>

</div>

</div>
