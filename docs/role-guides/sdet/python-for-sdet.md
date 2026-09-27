---
title: "Python for SDET"
description: "How Python fundamentals map to test engineering \u2014 pytest, fixtures, mocking, page objects, flaky-test waits, factories, reporting, and CI."
sidebar_position: 1
level: intermediate
tags: [python, sdet, testing]
image: /img/mental-model-share.png
---

# Python for SDET
## How the Fundamentals Help You Test Software

**SDET** means **Software Development Engineer in Test**.
An SDET writes code that tests other code. An SDET also builds the tools and frameworks that other people use to test.

This guide shows how each Python fundamental helps in real testing work.
Learn the basics first with the [Python cheat sheet](/cheatsheets/python) or [Python Fundamentals](/docs/fundamentals/python/fundamentals-basic-to-advanced).

Each use case in this guide has the same parts:

- **The task** – what you need to do.
- **Fundamentals used** – which basic ideas solve it.
- **How it works** – the steps in plain words.
- **Code** – an example you can copy and change.
- **Try it** – a small exercise, on some use cases.

:::tip How to use this page

Work through the use cases in order — later ones reuse earlier code (the
`APIClient` from use case 5 is used by later tests). Install the tools with
`python -m pip install pytest pytest-asyncio requests selenium`.

:::

---

## Contents

1. [Fundamentals Map for SDET](#1-fundamentals-map-for-sdet)
2. [Use Case: Write Your First Unit Test](#2-use-case-write-your-first-unit-test)
3. [Use Case: Share Set-up with Fixtures](#3-use-case-share-set-up-with-fixtures)
4. [Use Case: Data-Driven Tests](#4-use-case-data-driven-tests)
5. [Use Case: Test an API](#5-use-case-test-an-api)
6. [Use Case: Replace Real Services with Mocks](#6-use-case-replace-real-services-with-mocks)
7. [Use Case: Test Retry Logic](#7-use-case-test-retry-logic)
8. [Use Case: Build a UI Framework with Page Objects](#8-use-case-build-a-ui-framework-with-page-objects)
9. [Use Case: Wait for Slow Pages (Avoid Flaky Tests)](#9-use-case-wait-for-slow-pages-avoid-flaky-tests)
10. [Use Case: Group and Filter Tests with Markers](#10-use-case-group-and-filter-tests-with-markers)
11. [Use Case: Create Test Data with Factories](#11-use-case-create-test-data-with-factories)
12. [Use Case: Test Async Code](#12-use-case-test-async-code)
13. [Use Case: Parse Test Results and Build a Report](#13-use-case-parse-test-results-and-build-a-report)
14. [Use Case: Run Tests in CI/CD](#14-use-case-run-tests-in-cicd)
15. [Use Case: Smoke Tests After a Release](#15-use-case-smoke-tests-after-a-release)
16. [How to Organise a Test Project](#16-how-to-organise-a-test-project)
17. [Practice Projects](#17-practice-projects)
18. [Skills Checklist](#18-skills-checklist)

---

## 1. Fundamentals Map for SDET

This table links each fundamental to the testing work it supports.

| Fundamental | Where an SDET uses it |
|-------------|------------------------|
| Variables and data types | Expected values, test inputs, status codes |
| Strings and f-strings | Checking messages, building URLs, readable failure messages |
| Lists and tuples | Many test inputs, parameter sets |
| Dictionaries | JSON bodies, API responses, headers, config |
| Sets | Comparing expected and actual items when order does not matter |
| Conditions (`if`) | Skipping tests, choosing browser, checking results |
| Loops | Retrying, waiting, checking many items |
| Functions | Each test is a function; helper functions remove repeated steps |
| Decorators | `@pytest.fixture`, `@pytest.mark.parametrize`, `@patch` |
| Generators (`yield`) | Fixtures with set-up and clean-up |
| Context managers (`with`) | `pytest.raises`, `patch(...)`, temporary files, browser sessions |
| Exceptions | Checking that code fails the right way; custom test errors |
| Classes and inheritance | Page Object Model, API clients, base test classes |
| Dependency injection | Passing fake services into code under test |
| Modules and packages | Organising tests, `conftest.py`, shared helpers |
| File I/O, JSON, CSV | Loading test data, saving reports |
| Regex | Checking formats (emails, IDs, log lines) |
| async / await | Testing async APIs and services |
| Logging | Clear test run logs for debugging failures |
| Speed of lookups ("Big-O") | Fast test suites: checking "is X in here?" is instant with a `set` or `dict`, slow with a `list` |

---

## 2. Use Case: Write Your First Unit Test

**The task:** Check that a function gives the right answer, and that it fails correctly on bad input.

**Fundamentals used:** functions, `assert`, exceptions, `with` (context manager).

**How it works:**
1. Write the code under test as a function.
2. Write a test function whose name starts with `test_`.
3. Call the code and use `assert` to compare the result with the expected value.
4. Use `pytest.raises` to check that bad input raises the right exception.

**Code:**
```python
# app/discount.py
def apply_discount(price: float, percent: float) -> float:
    if not 0 <= percent <= 100:
        raise ValueError("percent must be between 0 and 100")
    return round(price * (1 - percent / 100), 2)
```

```python
# tests/unit/test_discount.py
import pytest
from app.discount import apply_discount

def test_ten_percent_discount():
    assert apply_discount(100, 10) == 90.0

def test_zero_discount_keeps_price():
    assert apply_discount(50, 0) == 50.0

def test_discount_over_100_is_rejected():
    with pytest.raises(ValueError, match="between 0 and 100"):
        apply_discount(100, 150)
```

**Good to know:** One test checks one behaviour. The test name says what is checked. When the test fails, the name tells you what broke.

**Try it:** add a test that checks a negative percent (like `-5`) is also rejected. Run it with `pytest -v`.

---

## 3. Use Case: Share Set-up with Fixtures

**The task:** Many tests need the same thing: an API client, a logged-in user, a browser, or a database. You want to create it once and clean it up afterwards.

**Fundamentals used:** functions, decorators, generators (`yield`), scope.

**How it works:**
1. Write a function and mark it with `@pytest.fixture`.
2. Code **before** `yield` is the set-up.
3. The value after `yield` is given to the test.
4. Code **after** `yield` is the clean-up. It runs even if the test fails.
5. `scope` decides how often the fixture runs: for every test (`function`), once per class (`class`), once per file (`module`), or once for the whole run (`session`).
6. Put shared fixtures in `conftest.py`. pytest finds them without an import.

**Code:**
```python
# tests/conftest.py
import pytest
from app.client import APIClient

@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:8000"

@pytest.fixture
def api_client(base_url):          # a fixture can use another fixture
    client = APIClient(base_url)
    yield client                   # the test runs here
    client.close()                 # clean-up

@pytest.fixture
def temp_config(tmp_path):         # tmp_path is a built-in pytest fixture
    file = tmp_path / "config.json"
    file.write_text('{"debug": true}')
    return file
```

```python
# tests/integration/test_users.py
def test_get_user(api_client):
    response = api_client.get("/users/1")
    assert response.status_code == 200

def test_config_file_exists(temp_config):
    assert temp_config.exists()
```

**Why the fundamental matters:** A fixture is a **generator**. `yield` pauses the function, lets the test run, then continues to do the clean-up. If you understand generators, fixtures are easy.

**Try it:** add `print("set-up")` before `yield` and `print("clean-up")` after it, then run `pytest -s` to watch the order.

---

## 4. Use Case: Data-Driven Tests

**The task:** Test the same logic with many inputs, without writing many almost-equal test functions.

**Fundamentals used:** lists, tuples, dictionaries, decorators, file I/O, CSV/JSON.

**How it works:**
1. Put the inputs and expected results in a list of tuples.
2. Use `@pytest.mark.parametrize` to run the test once per tuple.
3. For large data, keep the data in a CSV or JSON file and load it with a function.
4. Use `ids` to give each case a readable name in the report.

**Code:**
```python
import pytest

@pytest.mark.parametrize(
    "username, password, should_pass",
    [
        ("alice", "correct-pass", True),
        ("alice", "wrong-pass", False),
        ("", "", False),
    ],
    ids=["valid-user", "wrong-password", "empty-fields"],
)
def test_login(username, password, should_pass):
    assert authenticate(username, password) is should_pass
```

Loading cases from a file:
```python
import csv
from pathlib import Path

def load_cases(file_name):
    path = Path(__file__).parent / "data" / file_name
    with path.open(newline="") as f:
        return list(csv.DictReader(f))      # list of dicts

@pytest.mark.parametrize("case", load_cases("signup_cases.csv"),
                         ids=lambda c: c["case_id"])
def test_signup(case):
    result = signup(case["email"], case["password"])
    assert str(result.ok) == case["expected_ok"]
```

**Why the fundamental matters:** Parametrize is just a **list** of **tuples** plus a **decorator**. `csv.DictReader` turns every row into a **dict**, so you read columns by name.

**Try it:** add a fourth case, `("ALICE", "correct-pass", ...)`, and decide whether usernames should be case-sensitive.

---

## 5. Use Case: Test an API

**The task:** Check that a REST API (a web service you talk to with HTTP requests like GET and POST, usually sending JSON) returns the right status code, headers, and JSON body.

**Fundamentals used:** dictionaries, JSON, classes, functions, sets, `assert`.

**How it works:**
1. Send a request with the `requests` library.
2. Check the status code.
3. Turn the body into a dict with `.json()`.
4. Check required keys with a **set** (order does not matter).
5. Check values and types.
6. Wrap repeated request code in a small **class** (an API client), so tests stay short.

**Code:**
```python
# app/client.py
import requests

class APIClient:
    def __init__(self, base_url: str, token: str | None = None):
        self.base_url = base_url
        self.session = requests.Session()
        if token:
            self.session.headers["Authorization"] = f"Bearer {token}"

    def get(self, path: str, **kwargs):
        return self.session.get(f"{self.base_url}{path}", timeout=10, **kwargs)

    def post(self, path: str, body: dict):
        return self.session.post(f"{self.base_url}{path}", json=body, timeout=10)

    def close(self):
        self.session.close()
```

```python
# tests/integration/test_user_api.py
REQUIRED_FIELDS = {"id", "name", "email", "created_at"}

def test_create_user_returns_201(api_client):
    response = api_client.post("/users", {"name": "Asha", "email": "asha@x.com"})
    assert response.status_code == 201

    body = response.json()
    missing = REQUIRED_FIELDS - body.keys()          # set difference
    assert not missing, f"Missing fields: {missing}"
    assert body["email"] == "asha@x.com"
    assert isinstance(body["id"], int)

def test_unknown_user_returns_404(api_client):
    response = api_client.get("/users/999999")
    assert response.status_code == 404
```

**Why the fundamental matters:** API responses are **dicts**. Set difference (`-`) finds missing fields in one line. An f-string in the `assert` gives a clear failure message.

---

## 6. Use Case: Replace Real Services with Mocks

**The task:** Test your code without calling a real payment service, email server, or third-party API. These can be slow, cost money, or be down.

**Fundamentals used:** objects and attributes, modules and import paths, decorators, context managers, dependency injection.

**How it works:**
1. `patch` replaces a real object with a `Mock` while the test runs.
2. Set `return_value` to control what the fake gives back.
3. Set `side_effect` to raise an error, or to return different values on each call.
4. After the call, check how the mock was used: `assert_called_once_with(...)`.
5. **Patch the name where it is used**, not where it was first defined. This comes from how Python imports work: `from x import y` makes a new name `y` in your module.
6. If the code accepts its services as parameters (dependency injection), you can pass a fake directly with no patching.

**Code:**
```python
# app/orders.py
from app import payments

def place_order(order_id: str, amount: float) -> str:
    result = payments.charge(order_id, amount)
    return "confirmed" if result["status"] == "ok" else "failed"
```

```python
# tests/unit/test_orders.py
from unittest.mock import patch
from app.orders import place_order

@patch("app.orders.payments.charge")          # patch where it is used
def test_order_confirmed_when_payment_ok(mock_charge):
    mock_charge.return_value = {"status": "ok"}

    assert place_order("A1", 20.0) == "confirmed"
    mock_charge.assert_called_once_with("A1", 20.0)

def test_order_fails_when_payment_declined():
    with patch("app.orders.payments.charge") as mock_charge:   # context manager form
        mock_charge.return_value = {"status": "declined"}
        assert place_order("A2", 20.0) == "failed"
```

With dependency injection (no patching needed):
```python
from unittest.mock import Mock

class UserService:
    def __init__(self, db, cache):
        self.db = db
        self.cache = cache

    def get_user(self, user_id):
        cached = self.cache.get(user_id)
        if cached:
            return cached
        user = self.db.find(user_id)
        self.cache.set(user_id, user)
        return user

def test_user_is_loaded_from_db_on_cache_miss():
    db, cache = Mock(), Mock()
    cache.get.return_value = None
    db.find.return_value = {"id": 1}

    user = UserService(db, cache).get_user(1)

    assert user == {"id": 1}
    cache.set.assert_called_once_with(1, {"id": 1})
```

**When to mock and when not to:**
- Mock things **outside** your code: networks, payment systems, email, time, random values.
- Do not mock the logic you are trying to test.
- Use real parts in integration tests. Use mocks mostly in unit tests.

---

## 7. Use Case: Test Retry Logic

**The task:** Your code retries a call when it fails. You need to prove that it retries the right number of times and then gives up.

**Fundamentals used:** loops, exceptions, decorators, lists (`side_effect`), counting calls.

**How it works:**
1. Give the mock a **list** in `side_effect`. Each call takes the next item.
2. If an item is an exception, the mock raises it.
3. Check `call_count` to prove the retries happened.
4. Patch `time.sleep` so the test does not wait for real.

**Code:**
```python
# app/http_utils.py
import time
import requests

def get_with_retry(url: str, attempts: int = 3, delay: float = 1.0):
    for attempt in range(1, attempts + 1):
        try:
            return requests.get(url, timeout=5)
        except requests.ConnectionError:
            if attempt == attempts:
                raise
            time.sleep(delay * attempt)
```

```python
# tests/unit/test_http_utils.py
import pytest
import requests
from unittest.mock import patch, Mock
from app.http_utils import get_with_retry

@patch("app.http_utils.time.sleep")          # do not really wait
@patch("app.http_utils.requests.get")
def test_succeeds_on_third_try(mock_get, mock_sleep):
    ok = Mock(status_code=200)
    mock_get.side_effect = [requests.ConnectionError(), requests.ConnectionError(), ok]

    response = get_with_retry("http://service/health")

    assert response.status_code == 200
    assert mock_get.call_count == 3
    assert mock_sleep.call_count == 2

@patch("app.http_utils.time.sleep")
@patch("app.http_utils.requests.get", side_effect=requests.ConnectionError())
def test_gives_up_after_all_attempts(mock_get, mock_sleep):
    with pytest.raises(requests.ConnectionError):
        get_with_retry("http://service/health", attempts=3)
    assert mock_get.call_count == 3
```

Note: when you stack `@patch` decorators, the one **closest to the function** is the **first** parameter.

---

## 8. Use Case: Build a UI Framework with Page Objects

**The task:** Write browser tests that are easy to read and easy to fix when the web page changes.

**Fundamentals used:** classes, inheritance, encapsulation, methods, fixtures, tuples.

**How it works (Page Object Model, POM):**
1. Make one **class** per page of the website.
2. Keep the page's element locators inside the class (encapsulation).
3. Give the class **methods** for user actions: `login()`, `search()`.
4. Put shared code (open page, wait for element) in a **base class**. Each page class **inherits** from it.
5. Tests call page methods. Tests never touch locators directly.
6. When the page changes, you fix one class, not every test.

**Code:**
```python
# framework/pages/base_page.py
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    URL = ""

    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, timeout=10)

    def open(self):
        self.driver.get(self.base_url + self.URL)
        return self

    def find(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()
```

```python
# framework/pages/login_page.py
from selenium.webdriver.common.by import By
from framework.pages.base_page import BasePage

class LoginPage(BasePage):
    URL = "/login"
    USERNAME = (By.ID, "username")          # locators are tuples
    PASSWORD = (By.ID, "password")
    SUBMIT = (By.CSS_SELECTOR, "button[type=submit]")
    ERROR = (By.CLASS_NAME, "error-message")

    def login(self, username: str, password: str):
        self.find(self.USERNAME).send_keys(username)
        self.find(self.PASSWORD).send_keys(password)
        self.click(self.SUBMIT)

    def error_text(self) -> str:
        return self.find(self.ERROR).text
```

```python
# tests/e2e/conftest.py
import pytest
from selenium import webdriver
from framework.pages.login_page import LoginPage

@pytest.fixture(scope="session")
def driver():
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

@pytest.fixture
def login_page(driver):
    return LoginPage(driver, "https://staging.example.com").open()
```

```python
# tests/e2e/test_login.py
def test_wrong_password_shows_error(login_page):
    login_page.login("alice", "wrong-password")
    assert "Invalid" in login_page.error_text()
```

**Why the fundamental matters:** POM is plain OOP (object-oriented programming — organising code into classes). **Inheritance** removes repeated waiting code. **Encapsulation** (keeping details inside the class) keeps locators in one place.

**Try it:** write a `SearchPage` class with a `search(text)` method, reusing `BasePage`.

---

## 9. Use Case: Wait for Slow Pages (Avoid Flaky Tests)

**The task:** A test sometimes passes and sometimes fails, because the page or service is not ready yet. This is called a **flaky test**.

**Fundamentals used:** `while` loops, time, functions as parameters (higher-order functions), exceptions.

**How it works:**
1. Do not use a fixed `time.sleep(5)`. It is too short on slow days and wastes time on fast days.
2. Instead, **poll**: check a condition again and again, with a short pause, until it is true or a time limit is reached.
3. Pass the condition as a **function**, so one helper works for any check.
4. If time runs out, raise a clear error.

**Code:**
```python
# framework/wait.py
import time
from typing import Callable

def wait_until(condition: Callable[[], bool], timeout: float = 10, interval: float = 0.5,
               message: str = "condition was not met"):
    end_time = time.monotonic() + timeout
    while time.monotonic() < end_time:
        if condition():
            return
        time.sleep(interval)
    raise TimeoutError(f"Waited {timeout}s: {message}")
```

```python
def test_job_finishes(api_client):
    job_id = api_client.post("/jobs", {"type": "export"}).json()["id"]

    wait_until(
        lambda: api_client.get(f"/jobs/{job_id}").json()["status"] == "done",
        timeout=30,
        message=f"job {job_id} did not finish",
    )
```

Other ways to reduce flaky tests:
- Give each test its own data. Do not share state between tests.
- Clean up in fixtures, after `yield`.
- Mock time and random values in unit tests.
- Re-run failed tests only to **find** flaky tests, then fix the cause.

---

## 10. Use Case: Group and Filter Tests with Markers

**The task:** Run only fast tests on every commit, and run slow tests at night. Run only smoke tests after a release.

**Fundamentals used:** decorators, conditions, modules (`sys`), config files.

**How it works:**
1. Add a marker decorator to each test: `@pytest.mark.smoke`, `@pytest.mark.slow`.
2. List your markers in `pytest.ini` (or `pyproject.toml`).
3. Choose tests with `-m` on the command line.
4. Use `skipif` to skip a test when a condition is true.
5. Use `xfail` for a known bug, so the run stays green and the bug stays visible.

**Code:**
```ini
# pytest.ini
[pytest]
markers =
    smoke: most important checks, run after every release
    slow: takes a long time
    integration: needs real services
```

```python
import sys
import pytest

@pytest.mark.smoke
def test_home_page_loads(api_client):
    assert api_client.get("/").status_code == 200

@pytest.mark.slow
def test_export_large_report():
    ...

@pytest.mark.skipif(sys.platform == "win32", reason="Linux-only tool")
def test_disk_usage_script():
    ...

@pytest.mark.xfail(reason="Bug #1234: rounding error")
def test_tax_rounding():
    assert calculate_tax(0.105) == 0.11
```

```bash
pytest -m smoke                       # only smoke tests
pytest -m "not slow"                  # everything except slow tests
pytest -m "integration and not slow"
```

---

## 11. Use Case: Create Test Data with Factories

**The task:** Many tests need users, orders, or products with slightly different values. Writing full objects in every test is long and hard to change.

**Fundamentals used:** dataclasses, default values, `**kwargs`, class methods, counters.

**How it works:**
1. Describe the data with a **dataclass**.
2. Write a factory function that fills in sensible default values.
3. Let the test change only the fields it cares about, using keyword arguments.
4. Use a counter (`itertools.count`) so every object gets a unique ID.

**Code:**
```python
# tests/factories.py
import itertools
from dataclasses import dataclass, field, replace

_ids = itertools.count(1)

@dataclass
class User:
    id: int
    name: str
    email: str
    role: str = "member"
    active: bool = True
    tags: list[str] = field(default_factory=list)

def make_user(**overrides) -> User:
    user_id = next(_ids)
    base = User(id=user_id, name=f"user{user_id}", email=f"user{user_id}@test.com")
    return replace(base, **overrides)       # copy with some fields changed
```

```python
def test_admin_can_delete_users():
    admin = make_user(role="admin")
    target = make_user()
    assert can_delete(admin, target)

def test_inactive_user_cannot_login():
    user = make_user(active=False)
    assert not can_login(user)
```

---

## 12. Use Case: Test Async Code

**The task:** The service uses `async` functions. You need to test them, including timeouts and many calls at the same time.

**Fundamentals used:** `async`/`await`, `asyncio.gather`, `asyncio.wait_for`, `AsyncMock`, exceptions.

**How it works:**
1. Install `pytest-asyncio`. Mark async tests with `@pytest.mark.asyncio`.
2. Use `await` inside the test to call the code.
3. Use `AsyncMock` to fake async calls.
4. Use `asyncio.wait_for` to test timeouts.
5. Use `asyncio.gather` to test many calls at once.

**Code:**
```python
import asyncio
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_fetch_many_users():
    client = UserClient()
    with patch.object(client, "fetch_user", new=AsyncMock(side_effect=lambda i: {"id": i})):
        users = await asyncio.gather(*(client.fetch_user(i) for i in range(1, 4)))
    assert [u["id"] for u in users] == [1, 2, 3]

@pytest.mark.asyncio
async def test_slow_call_times_out():
    async def slow():
        await asyncio.sleep(5)

    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow(), timeout=0.1)
```

---

## 13. Use Case: Parse Test Results and Build a Report

**The task:** After a test run, read the results file and make a short summary: how many passed, which failed, and which tests are slowest. (JUnit XML is a standard results-file format that most CI tools understand.)

**Fundamentals used:** file I/O, XML/JSON parsing, `Counter`, `defaultdict`, sorting with `key`, f-strings.

**How it works:**
1. Ask pytest to write a JUnit XML file: `pytest --junitxml=results.xml`.
2. Read the file with `xml.etree.ElementTree`.
3. Count results with `Counter`.
4. Group failures by file with `defaultdict(list)`.
5. Sort by time to find the slowest tests.

**Code:**
```python
# tools/summarise_results.py
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict

def summarise(path: str) -> str:
    root = ET.parse(path).getroot()
    status = Counter()
    failures_by_file = defaultdict(list)
    durations = []

    for case in root.iter("testcase"):
        name = f"{case.get('classname')}.{case.get('name')}"
        durations.append((float(case.get("time", 0)), name))
        if case.find("failure") is not None or case.find("error") is not None:
            status["failed"] += 1
            failures_by_file[case.get("classname")].append(case.get("name"))
        elif case.find("skipped") is not None:
            status["skipped"] += 1
        else:
            status["passed"] += 1

    lines = [f"Passed: {status['passed']}  Failed: {status['failed']}  Skipped: {status['skipped']}"]
    for file_name, tests in failures_by_file.items():
        lines.append(f"  {file_name}: {', '.join(tests)}")
    lines.append("Slowest tests:")
    for seconds, name in sorted(durations, reverse=True)[:5]:
        lines.append(f"  {seconds:6.2f}s  {name}")
    return "\n".join(lines)

if __name__ == "__main__":
    print(summarise("results.xml"))
```

---

## 14. Use Case: Run Tests in CI/CD

**CI/CD** means *continuous integration / continuous delivery*: a server automatically tests (and then releases) every code change.

**The task:** Run the tests automatically on every code change, on more than one Python version, and save reports.

**Fundamentals used:** virtual environments, `pip`, command-line options, exit codes, environment variables.

**How it works:**
1. The CI server creates a clean environment and installs packages.
2. It runs `pytest`. pytest ends with exit code `0` if all tests pass, and a non-zero code if any test fails. CI uses this to mark the build green or red.
3. A **matrix** runs the same job on several Python versions.
4. Secrets (tokens, passwords) come from **environment variables**, never from the code.
5. Reports and screenshots are saved as **artifacts**.

**Code (GitHub Actions):**
```yaml
# .github/workflows/tests.yml
name: tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements-test.txt
      - name: Unit tests
        run: pytest tests/unit --cov=app --junitxml=unit.xml
      - name: Integration tests
        run: pytest tests/integration -m "not slow"
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
      - name: Save reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: reports-${{ matrix.python-version }}
          path: "*.xml"
```

Reading the secret in Python:
```python
import os
import pytest

@pytest.fixture(scope="session")
def api_token():
    token = os.environ.get("API_TOKEN")
    if not token:
        pytest.skip("API_TOKEN is not set")
    return token
```

---

## 15. Use Case: Smoke Tests After a Release

**The task:** Right after a new version goes live, check that the most important paths work. If they do not, the team must know at once.

**Fundamentals used:** lists of dicts, loops, functions, exceptions, exit codes, `argparse`.

**How it works:**
1. Keep a short list of critical checks as data (URL and expected status).
2. Loop over the checks and record each result.
3. Print a clear summary.
4. Exit with code `1` if anything failed, so the release pipeline can stop or roll back.

**Code:**
```python
# tools/smoke.py
import argparse
import sys
import requests

CHECKS = [
    {"name": "home page", "path": "/", "status": 200},
    {"name": "health", "path": "/health", "status": 200},
    {"name": "login page", "path": "/login", "status": 200},
    {"name": "api version", "path": "/api/version", "status": 200},
]

def run_checks(base_url: str) -> list[str]:
    failures = []
    for check in CHECKS:
        try:
            response = requests.get(base_url + check["path"], timeout=10)
            if response.status_code != check["status"]:
                failures.append(f"{check['name']}: got {response.status_code}")
        except requests.RequestException as error:
            failures.append(f"{check['name']}: {error}")
    return failures

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("base_url")
    args = parser.parse_args()

    failures = run_checks(args.base_url)
    if failures:
        print("SMOKE TEST FAILED")
        for failure in failures:
            print("  -", failure)
        sys.exit(1)
    print(f"All {len(CHECKS)} smoke checks passed")

if __name__ == "__main__":
    main()
```

---

## 16. How to Organise a Test Project

**Fundamentals used:** modules, packages, `conftest.py`, imports.

```text
project/
├── app/                      # code under test
├── framework/                # your reusable test tools
│   ├── __init__.py
│   ├── pages/                # page objects
│   ├── clients/              # API clients
│   └── wait.py               # helpers
├── tests/
│   ├── conftest.py           # fixtures for all tests
│   ├── factories.py          # test data builders
│   ├── unit/                 # fast, no real services
│   │   └── test_*.py
│   ├── integration/          # real database or API
│   │   ├── conftest.py
│   │   └── test_*.py
│   ├── e2e/                  # full browser journeys
│   │   ├── conftest.py
│   │   └── test_*.py
│   └── data/                 # CSV / JSON test data
├── pytest.ini
└── requirements-test.txt
```

**The test pyramid:** Write many unit tests, fewer integration tests, and only a few end-to-end tests. Unit tests are fast and exact. End-to-end tests are slow, but they prove the whole system works together.

```text
        /\        E2E: few, slow, full journeys
       /  \
      /----\      Integration: some, medium speed
     /      \
    /--------\    Unit: many, very fast
```

---

## 17. Practice Projects

Build these in order. Each one uses more fundamentals.

| # | Project | Fundamentals practised |
|---|---------|------------------------|
| 1 | Unit tests for a small calculator or discount module | functions, `assert`, exceptions |
| 2 | Data-driven login tests from a CSV file | lists, dicts, CSV, parametrize |
| 3 | API test suite with an `APIClient` class and fixtures | classes, dicts, JSON, fixtures |
| 4 | Retry helper and its tests with mocks | loops, exceptions, decorators, mocks |
| 5 | Page Object framework for a demo website | classes, inheritance, waits |
| 6 | Test results summary tool | file I/O, XML, `Counter`, sorting |
| 7 | CI pipeline that runs unit, integration, and smoke tests | environments, exit codes, YAML |
| 8 | **Final project:** full automation suite for one application: unit + integration + E2E tests, CI, and a report | everything above |

---

## 18. Skills Checklist

- [ ] I can write a test with `assert` and `pytest.raises`.
- [ ] I can write fixtures with set-up and clean-up using `yield`.
- [ ] I can choose the right fixture `scope`.
- [ ] I can run one test many times with `parametrize`.
- [ ] I can load test data from CSV or JSON.
- [ ] I can test a REST API and check status, keys, and values.
- [ ] I can mock an external service and check how it was called.
- [ ] I know to patch a name where it is used.
- [ ] I can test retry and timeout logic.
- [ ] I can build page objects with a base class.
- [ ] I can replace fixed sleeps with polling waits.
- [ ] I can group tests with markers and run a subset.
- [ ] I can test async code.
- [ ] I can run tests in CI with secrets from environment variables.
- [ ] I can write a smoke test script that returns the right exit code.

**Next:** read [Coding Best Practices](/docs/fundamentals/python/coding-best-practices).
