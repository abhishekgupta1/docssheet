---
title: "Python Coding Best Practices"
description: "Habits that make Python code easier to read, test, change, and run safely \u2014 naming, functions, errors, logging, security, testing, and a pre-commit checklist."
sidebar_position: 3
level: intermediate
tags: [python, fundamentals, best-practices]
image: /img/mental-model-share.png
---

# Python Coding Best Practices

This page lists good habits for writing Python code.
These habits make code easier to read, test, change, and run safely.
They apply to everyone: SDET, SDE, and SRE.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example, where it helps.

:::tip How to use this page

Read it once after you know the basics, then use
[the checklist at the end](#19-short-checklist-before-you-commit) before every
commit. Pick two or three habits to practise each week rather than all at once.

:::

---

## Contents

1. [Readability](#1-readability)
2. [Naming](#2-naming)
3. [Functions](#3-functions)
4. [Classes and Design](#4-classes-and-design)
5. [Data and Collections](#5-data-and-collections)
6. [Errors and Exceptions](#6-errors-and-exceptions)
7. [Logging](#7-logging)
8. [Resources: Files, Connections, Locks](#8-resources-files-connections-locks)
9. [Testing](#9-testing)
10. [Security](#10-security)
11. [Performance](#11-performance)
12. [Configuration](#12-configuration)
13. [Dependencies and Environments](#13-dependencies-and-environments)
14. [Project Structure](#14-project-structure)
15. [Comments and Documentation](#15-comments-and-documentation)
16. [Git and Code Review](#16-git-and-code-review)
17. [Automation Scripts](#17-automation-scripts)
18. [Tools That Help](#18-tools-that-help)
19. [Short Checklist Before You Commit](#19-short-checklist-before-you-commit)

---

## 1. Readability

Code is read many more times than it is written. Write for the next person who reads it.

### 1.1 Follow the standard style (PEP 8 — Python's official style guide)
**Do:** Use 4 spaces for indentation. Keep lines short (about 88–100 characters). Put spaces around `=` and operators. Use a *formatter* (a tool that rewrites your code's spacing and layout automatically) to do this for you.
**Why:** When all code looks the same, people can read it faster.

### 1.2 Keep code flat
**Do:** Check for bad cases first and return early. Avoid deep nesting.
**Why:** Deeply nested code is hard to follow.

```python
# Harder to read
def process(user):
    if user:
        if user.is_active:
            if user.email:
                send(user.email)

# Easier to read
def process(user):
    if not user or not user.is_active or not user.email:
        return
    send(user.email)
```

### 1.3 Clear is better than clever
**Do:** Choose the simple, clear version, even if it is one line longer.
**Why:** Clever one-liners are hard to understand and hard to fix.

### 1.4 Do not use "magic numbers"
**Do:** Give important numbers a name.
**Why:** The name explains what the number means, and you change it in one place.

```python
# Unclear
if response_time > 2.5:
    alert()

# Clear
MAX_RESPONSE_SECONDS = 2.5
if response_time > MAX_RESPONSE_SECONDS:
    alert()
```

### 1.5 Use f-strings for text
**Do:** `f"User {name} has {count} items"`
**Why:** Easier to read than `+` or `%` formatting.
Exception: in logging calls, pass values as arguments. See [Logging](#7-logging).

---

## 2. Naming

### 2.1 Use the standard naming styles

| What | Style | Example |
|------|-------|---------|
| Variable, function, method | `snake_case` | `user_count`, `get_user()` |
| Class | `PascalCase` | `UserService` |
| Constant | `UPPER_CASE` | `MAX_RETRIES` |
| Module (file) | `snake_case` | `user_service.py` |
| Internal (private) name | starts with `_` | `_cache` |

### 2.2 Names should say what the thing is
**Do:** `failed_tests`, `retry_count`, `is_active`, `has_permission`.
**Avoid:** `x`, `data2`, `tmp`, `flag`, `do_stuff()`.
**Why:** A good name removes the need for a comment.

### 2.3 Functions are actions
**Do:** Start function names with a verb: `load_config()`, `send_alert()`, `calculate_total()`.

### 2.4 Booleans are questions
**Do:** Start true/false names with `is_`, `has_`, `can_`, or `should_`.

### 2.5 Use units in names
**Do:** `timeout_seconds`, `size_bytes`, `delay_ms`.
**Why:** It stops mistakes like mixing seconds and milliseconds.

---

## 3. Functions

### 3.1 One function, one job
**Do:** Keep each function focused on one task. If you use "and" to describe it, think about splitting it.
**Why:** Small functions are easier to name, test, and reuse.

### 3.2 Keep functions short
**Do:** Most functions should fit on one screen.

### 3.3 Add type hints
**Do:** Add types to parameters and return values.
**Why:** Editors and tools like `mypy` find mistakes before you run the code. The types also work as documentation.

```python
def get_user(user_id: int) -> dict | None:
    ...
```

### 3.4 Limit the number of parameters
**Do:** If a function needs many values, group them in a dataclass. Use keyword-only parameters (after `*`) for options.
**Why:** Long parameter lists are easy to call in the wrong order.

```python
def deploy(service: str, version: str, *, dry_run: bool = False, timeout_seconds: int = 300):
    ...

deploy("api", "1.4.2", dry_run=True)    # options must be named
```

### 3.5 Use `None` as the default for lists and dicts
**Do:** Use `None` as the default and create the list inside the function.
**Why:** A default value is created only once. A default list would be shared by every call.

```python
def add_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    tags = [] if tags is None else tags
    tags.append(tag)
    return tags
```

### 3.6 Avoid hidden side effects
**Do:** A function should either **return** a result or **change** something, and its name should make clear which one.
**Why:** Surprises cause bugs.

### 3.7 Return the same type every time
**Do:** If a function returns a list, return an empty list `[]` when there is nothing, not `None` or `False`.
**Why:** The caller does not need extra checks.

---

## 4. Classes and Design

### 4.1 Use a class only when it helps
**Do:** Use a class when data and behaviour belong together, or when you need several objects with their own state. Use a plain function otherwise.

### 4.2 Use dataclasses for data
**Do:** Use `@dataclass` for objects that mainly hold data. Use `frozen=True` if the data must not change.

### 4.3 Prefer composition to deep inheritance
**Do:** Build objects from other objects ("has a"), instead of long inheritance chains ("is a").
**Why:** Deep inheritance is hard to follow and hard to change.

### 4.4 Pass in dependencies
**Do:** Give a class what it needs (database, client, clock) through its constructor.
**Why:** You can swap in a fake for tests, or a different version later.

```python
class ReportService:
    def __init__(self, repository, mailer):
        self.repository = repository
        self.mailer = mailer
```

### 4.5 Separate layers
**Do:** Keep HTTP code, business logic, and database code in different modules.
**Why:** Each part can change without breaking the others, and business logic can be tested without a web server or database.

### 4.6 Use Enums for fixed choices
**Do:** `class Status(Enum): ACTIVE = "active"; DISABLED = "disabled"`
**Why:** Typos in strings are not caught. Wrong Enum names are caught at once.

---

## 5. Data and Collections

### 5.1 Pick the right collection
| Need | Use |
|------|-----|
| Ordered items | `list` |
| Fixed group of values | `tuple` |
| Fast "is it there?" check, unique items | `set` |
| Look up by key | `dict` |
| Add/remove at both ends | `collections.deque` |
| Count items | `collections.Counter` |

### 5.2 Use `dict.get()` for optional keys
**Do:** `timeout = config.get("timeout", 30)`

### 5.3 Use comprehensions for simple changes
**Do:** `names = [u.name for u in users if u.is_active]`
**Avoid:** Comprehensions with many conditions or nested loops. Use a normal loop then.

### 5.4 Use `enumerate` and `zip`
**Do:** `for i, item in enumerate(items):` instead of `for i in range(len(items)):`

### 5.5 Use generators for large data
**Do:** Read large files line by line and use generator expressions.
**Why:** Memory use stays small.

### 5.6 Use `Decimal` for money
**Do:** `from decimal import Decimal; price = Decimal("19.99")`
**Why:** `float` cannot store some decimal values exactly.

### 5.7 Use time zones for dates
**Do:** `datetime.now(timezone.utc)`
**Why:** Servers in different places must agree on the time.

### 5.8 Use `is` for `None`
**Do:** `if value is None:`

### 5.9 Copy on purpose
**Do:** Use `copy.deepcopy()` when you need a fully separate copy of nested data.

---

## 6. Errors and Exceptions

### 6.1 Catch specific exceptions
**Do:** `except FileNotFoundError:` or `except (ConnectionError, TimeoutError):`
**Avoid:** A bare `except:` or a broad `except Exception:` in normal code.
**Why:** Broad catches hide real bugs.

### 6.2 Never hide an error silently
**Do:** Handle it, log it, or raise it again.
**Avoid:**
```python
try:
    save(data)
except Exception:
    pass            # the error is lost
```

### 6.3 Keep the `try` block small
**Do:** Put only the line that can fail inside `try`.
**Why:** You then know exactly which line caused the error.

### 6.4 Create your own exception types
**Do:** Make a base exception for your project and child types for each kind of problem.
**Why:** Callers can handle each case clearly.

### 6.5 Keep the original error
**Do:** `raise ConfigError("Bad port") from error`
**Why:** The full cause stays in the error trace for debugging.

### 6.6 Fail early
**Do:** Check input and configuration at the start. Raise a clear error at once.
**Why:** An early, clear error is easier to fix than a strange failure later.

### 6.7 Write helpful error messages
**Do:** Say what failed, which value caused it, and what was expected.
```python
raise ValueError(f"port must be 1-65535, got {port}")
```

---

## 7. Logging

### 7.1 Use `logging`, not `print`, in real programs
**Why:** Logs have time, level, and source, and can be sent to files or log systems.

### 7.2 One logger per module
```python
import logging
logger = logging.getLogger(__name__)
```

### 7.3 Pass values as arguments
**Do:** `logger.info("User %s logged in", user_id)`
**Why:** The text is only built if the message is really written. It also keeps log lines easy to group in search tools.

### 7.4 Use the right level
| Level | Use for |
|-------|---------|
| `DEBUG` | Details for developers while fixing a problem |
| `INFO` | Normal important events (started, finished, deployed) |
| `WARNING` | Something unusual happened, but the program handled it |
| `ERROR` | Something failed |
| `CRITICAL` | The program cannot continue |

### 7.5 Log the full error trace
**Do:** Inside `except`, use `logger.exception("Could not save order %s", order_id)`.

### 7.6 Never log secrets or personal data
**Do not log:** passwords, tokens, API keys, card numbers, or full personal details.

### 7.7 Use structured logs in services
**Do:** Write logs as JSON with fields like `request_id`, `service`, and `duration_ms`.
**Why:** Log systems can search and filter by field.

---

## 8. Resources: Files, Connections, Locks

### 8.1 Always use `with`
**Do:** `with open(path) as f:`
**Why:** The file, connection, or lock is always closed, even if there is an error.

### 8.2 Set the text encoding
**Do:** `open(path, encoding="utf-8")`
**Why:** The default encoding is different on different computers.

### 8.3 Use `pathlib` for paths
**Do:** `Path("data") / "report.csv"`
**Why:** It works the same on Windows, Mac, and Linux.

### 8.4 Always set timeouts
**Do:** `requests.get(url, timeout=10)`, `subprocess.run(cmd, timeout=60)`
**Why:** Without a timeout, one stuck call can freeze the whole program.

### 8.5 Reuse connections
**Do:** Use one `requests.Session()` or one database pool for many calls.
**Why:** Opening a new connection each time is slow.

---

## 9. Testing

### 9.1 Write tests for every change
**Do:** Add or update tests when you add a feature or fix a bug.
**Why:** Tests catch problems before users do, and let you change code without fear.

### 9.2 One test checks one behaviour
**Do:** Give each test a name that says what it checks: `test_login_fails_with_wrong_password`.

### 9.3 Use the Arrange – Act – Assert pattern
```python
def test_discount_is_applied():
    cart = Cart(items=[Item(price=100)])     # Arrange: set up
    cart.apply_discount(10)                  # Act: do the action
    assert cart.total == 90                  # Assert: check the result
```

### 9.4 Keep tests independent
**Do:** Each test creates its own data and cleans up after itself. Tests must pass in any order.

### 9.5 Mock only external things
**Do:** Mock networks, payment systems, email, time, and random values.
**Avoid:** Mocking the logic you are testing.

### 9.6 Keep unit tests fast
**Do:** No real network, database, or `sleep` in unit tests.
**Why:** Fast tests are run often.

### 9.7 Test the unhappy paths
**Do:** Test bad input, empty input, missing data, timeouts, and errors, not only the normal case.

### 9.8 Replace fixed waits with polling
**Do:** Wait for a condition with a time limit, instead of `time.sleep(5)`.
**Why:** Fixed waits make tests slow and flaky.

### 9.9 Use coverage as a guide, not a goal
**Do:** Use coverage reports to find code with no tests. A high number alone does not prove the tests are good.

---

## 10. Security

### 10.1 Never put secrets in code
**Do:** Read passwords, tokens, and keys from environment variables or a secret manager.
**Do:** Add `.env` files to `.gitignore`.

### 10.2 Check all input from outside
**Do:** Check type, length, and allowed values for everything that comes from users, files, or other services.

### 10.3 Use parameters in SQL
```python
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))   # safe
```
**Never** build SQL by joining strings with user input.

### 10.4 Run commands safely
**Do:** `subprocess.run(["ls", "-l", folder])` with a list.
**Avoid:** `shell=True` with any text that comes from outside.

### 10.5 Use safe loaders
**Do:** `yaml.safe_load()` and `json.loads()`.
**Avoid:** `pickle.load()` and `eval()` on data you do not fully trust.

### 10.6 Hash passwords
**Do:** Use `bcrypt`, `argon2`, or `hashlib.pbkdf2_hmac` with a salt. Never store plain passwords.

### 10.7 Use the `secrets` module for tokens
**Do:** `secrets.token_urlsafe(32)`
**Avoid:** `random` for anything related to security.

### 10.8 Show little, log much
**Do:** Show users a short, general error message. Put the details in the logs.

### 10.9 Keep dependencies up to date
**Do:** Scan with `pip-audit` and update packages that have known security problems.

### 10.10 Give the least access needed
**Do:** Scripts and services should run with only the permissions they really need.

---

## 11. Performance

### 11.1 Make it correct first, then fast
**Do:** Write clear, correct code first. Improve speed only where it is needed.

### 11.2 Measure before you change
**Do:** Use `cProfile`, `timeit`, or real metrics to find the slow part.
**Why:** Guessing often picks the wrong place.

### 11.3 Use sets and dicts for lookups
**Do:** `if user_id in active_ids:` where `active_ids` is a `set`.
**Why:** A set finds an item instantly, however big it is. A list checks items one by one, so it gets slower as it grows.

### 11.4 Avoid work inside loops
**Do:** Move work that gives the same result every time (like `re.compile`) outside the loop.

### 11.5 Join strings with `join`
**Do:** `", ".join(names)` instead of `+=` in a loop.

### 11.6 Use batches
**Do:** Save 1,000 rows in one database call, not 1,000 calls.

### 11.7 Use caching for repeated slow work
**Do:** `@functools.lru_cache` for pure functions. Add an expiry time for data that changes.

### 11.8 Choose the right concurrency tool
| Work type | Use |
|-----------|-----|
| Waiting on network or disk | Threads or `asyncio` |
| Heavy calculation | Processes |

---

## 12. Configuration

### 12.1 Keep config out of code
**Do:** Read settings from environment variables or config files.
**Why:** The same code runs in development, test, and production with different settings.

### 12.2 Load config in one place
**Do:** Create one settings object at start-up and pass it to the parts that need it.

### 12.3 Check config at start-up
**Do:** Stop with a clear message if a required setting is missing or wrong.

### 12.4 Give safe defaults
**Do:** Default to the safe choice, for example `debug=False` and `dry_run=True` for scripts that change things.

---

## 13. Dependencies and Environments

### 13.1 Use a virtual environment for each project
```bash
python -m venv .venv
source .venv/bin/activate
```

### 13.2 List and pin your dependencies
**Do:** Keep dependencies in `pyproject.toml` or `requirements.txt`. *Pin* exact versions for applications (e.g. `requests==2.32.3`, usually kept in a *lock file*), so every install is the same.

### 13.3 Separate development tools
**Do:** Keep test and lint tools (pytest, ruff, mypy) in a separate `dev` group.

### 13.4 Add only what you need
**Do:** Before adding a package, check if the standard library already does the job.
**Why:** Each package is more code to update and to keep secure.

### 13.5 Use a supported Python version
**Do:** Use a Python version that still gets security updates, and write it in `requires-python`.

---

## 14. Project Structure

### 14.1 Use a standard layout
```
project/
├── pyproject.toml
├── README.md
├── src/
│   └── my_project/
│       ├── __init__.py
│       └── ...
└── tests/
    ├── unit/
    └── integration/
```

### 14.2 Use the main guard in scripts
```python
if __name__ == "__main__":
    main()
```
**Why:** The file can be imported (for tests) without running the script.

### 14.3 Import clearly
**Do:** Put imports at the top. Group them: standard library, then other packages, then your own code.
**Avoid:** `from module import *`.

### 14.4 Avoid global state
**Do:** Pass values as parameters. Keep module-level variables for constants only.
**Why:** Global state makes code hard to test and hard to understand.

---

## 15. Comments and Documentation

### 15.1 Explain "why", not "what"
**Do:** Write comments that explain the reason for the code.
**Avoid:** Comments that repeat what the code already says.

```python
# Not helpful
count += 1   # add one to count

# Helpful
# The API counts from 1, not 0
page = index + 1
```

### 15.2 Write docstrings for public functions and classes
```python
def retry(times: int = 3):
    """Retry the wrapped function when it raises ConnectionError.

    Args:
        times: How many times to try in total.
    """
```

### 15.3 Keep a README
**Do:** Explain what the project does, how to install it, how to run it, and how to run the tests.

### 15.4 Update docs with the code
**Do:** When code changes, change its comments and docs in the same commit.

---

## 16. Git and Code Review

### 16.1 Make small commits
**Do:** Each commit does one thing and has a clear message: "Add retry to payment client".

### 16.2 Never commit secrets or generated files
**Do:** Use `.gitignore` for `.env`, `.venv/`, `__pycache__/`, and build output.

### 16.3 Keep pull requests small
**Why:** Small changes are reviewed faster and more carefully.

### 16.4 Let tools check style
**Do:** Run formatters and *linters* (tools that spot likely bugs and style problems) automatically — with pre-commit hooks (checks that run before each `git commit`) and CI (a server that tests every push). Spend review time on logic and design, not spaces.

### 16.5 Review with care and respect
**Do:** Ask questions, explain reasons, and suggest options. Review the code, not the person.

---

## 17. Automation Scripts

These practices matter most for SRE and SDET tools, but help everyone.

### 17.1 Add `--dry-run`
**Do:** Let the user see what the script will do before it changes anything. For risky scripts, make dry-run the default.

### 17.2 Make scripts safe to run again
**Do:** Running the script twice should give the same result as running it once (this is called *idempotent*). For example, "create the folder if it does not exist".

### 17.3 Return the right exit code
**Do:** `sys.exit(0)` for success, `sys.exit(1)` (or another non-zero number) for failure.
**Why:** Cron, CI, and other tools use the exit code to decide what to do next.

### 17.4 Do not stop at the first bad item
**Do:** When working on many hosts or files, record each failure, continue, and report all failures at the end.

### 17.5 Log every change
**Do:** Log what was changed, where, and when.
**Why:** During an incident, the team needs to know what the automation did.

### 17.6 Always clean up
**Do:** Use `try`/`finally` or a context manager to undo temporary changes, even if the script fails.

### 17.7 Ask before destructive actions
**Do:** For deleting or restarting in production, require an explicit flag such as `--confirm` or `--delete`.

---

## 18. Tools That Help

| Tool | What it does |
|------|--------------|
| `ruff` | Finds common mistakes and style problems (very fast); can also format code |
| `black` | Formats code automatically |
| `mypy` or `pyright` | Checks type hints |
| `pytest` | Runs tests |
| `pytest-cov` | Measures test coverage |
| `pre-commit` | Runs checks before each commit |
| `pip-audit` | Finds packages with known security problems |
| `bandit` | Finds common security problems in code |
| `cProfile`, `py-spy` | Find slow code |

Example setup in `pyproject.toml`:
```toml
[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "S"]

[tool.mypy]
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra"
```

---

## 19. Short Checklist Before You Commit

- [ ] The code is formatted and the linter shows no problems.
- [ ] Names are clear. There are no magic numbers.
- [ ] Functions are small and have type hints.
- [ ] Errors are handled with specific exceptions and clear messages.
- [ ] Files and connections use `with`.
- [ ] Network calls and commands have timeouts.
- [ ] There are no secrets in the code or in the logs.
- [ ] Input from outside is checked.
- [ ] SQL uses parameters. Commands use lists, not `shell=True`.
- [ ] Tests are added or updated, and they all pass.
- [ ] Logs use `logging` with the right levels.
- [ ] The README and docstrings are up to date.
- [ ] The commit is small and has a clear message.
