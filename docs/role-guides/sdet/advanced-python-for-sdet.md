---
title: "Advanced Python for SDET"
description: "SDET-focused advanced Python topics: advanced testing, automation frameworks, mocking and patching, CI/CD integration, and async testing."
sidebar_position: 2
level: advanced
tags: [python, sdet, testing]
image: /img/mental-model-share.png
---

# Advanced Python for SDET

The bigger testing topics an SDET (Software Development Engineer in Test)
meets on the job. Part of the [Role Guides](/docs/role-guides/role-guides-overview).

:::tip How to use this page

Read [Python for SDET](/docs/role-guides/sdet/python-for-sdet) first. Each
section here has **In short** (the idea), an **Example** (working code), and
**Try it** (a small exercise). Install what you need with
`python -m pip install pytest pytest-asyncio responses`.

:::

## 1. Organising tests {#organising}

**In short:** good tests follow the same three steps — set up, do the thing,
check the result — and share setup through *fixtures*.

The three steps are often called **Arrange, Act, Assert**:

```python
def test_total_price():
    cart = Cart()                     # Arrange — set up what you need
    cart.add("apple", price=2)
    total = cart.total()              # Act — do the one thing being tested
    assert total == 2                 # Assert — check the result
```

A **fixture** is reusable setup. `pytest` passes it to any test that names it
as an argument. The `scope` decides how often it is recreated:

| `scope=` | Created once per… | Good for |
|---|---|---|
| `"function"` (default) | test | Anything a test might change |
| `"module"` | test file | Slow setup shared by one file |
| `"session"` | whole test run | Very slow setup, like starting a browser |

```python
import pytest
from selenium import webdriver

@pytest.fixture(scope="session")
def browser():
    driver = webdriver.Chrome()       # start the browser once
    yield driver                      # hand it to the tests
    driver.quit()                     # runs after all tests finish

@pytest.fixture
def login_page(browser):              # fixtures can use other fixtures
    return LoginPage(browser)

# a list of (username, password, should_succeed) tuples — one test run each
@pytest.mark.parametrize("username, password, should_succeed", [
    ("valid_user", "valid_pass", True),
    ("invalid_user", "wrong_pass", False),
    ("", "", False),
])
def test_login(login_page, username, password, should_succeed):
    login_page.login(username, password)
    assert login_page.error_message_visible == (not should_succeed)
```

**Markers** tag tests so you can run a subset: mark with
`@pytest.mark.smoke`, run with `pytest -m smoke`.

**Try it:** write a fixture that creates a temporary `dict` of settings, and two
tests that use it. Change the dict in one test and confirm the other test still
sees the original.

## 2. Mocking & patching {#mocking}

**In short:** a *mock* is a fake object that stands in for something slow or
outside your control — a web API, a database, the clock — so tests are fast
and predictable.

| Tool | What it does |
|---|---|
| `Mock` / `MagicMock` | A fake object. Any attribute or method you call on it just works. |
| `patch("path.to.thing")` | Temporarily swaps a real object for a mock during a test. |
| `.return_value` | What the fake returns when called. |
| `.side_effect` | Raise an error, or return a different value on each call. |
| `AsyncMock` | A mock for `async` functions. |

**Faking a web API** with the `responses` library:

```python
import responses

@responses.activate
def test_get_users():
    responses.add(
        responses.GET,
        "https://api.example.com/users",
        json={"users": [{"id": 1, "name": "Alice"}]},   # dict with a list of dicts
        status=200,
    )

    users = api_client.get_users()        # list of dicts
    assert len(users) == 1
    assert users[0]["name"] == "Alice"
```

**Patching a function** — patch it *where it is used*, not where it is defined:

```python
from unittest.mock import patch

def test_save_user():
    # myapp.users does "from myapp.database import save", so patch it there
    with patch("myapp.users.save") as mock_save:
        mock_save.return_value = True

        result = save_user({"name": "Bob"})    # dict

        assert result is True
        mock_save.assert_called_once_with({"name": "Bob"})
```

**Simulating failures** with `side_effect`:

```python
def test_retry_on_timeout():
    with patch("myapp.client.send") as mock_send:
        # a list: first call raises, second call returns a dict
        mock_send.side_effect = [TimeoutError(), {"status": "ok"}]

        result = send_with_retry("/api/data")

        assert result == {"status": "ok"}
        assert mock_send.call_count == 2
```

**Passing fakes in directly** is often simpler than patching. If a class
receives its helpers as arguments, give it mocks:

```python
from unittest.mock import Mock

class OrderService:
    def __init__(self, db, payments):
        self.db = db
        self.payments = payments

    def create_order(self, user_id, items):          # items: list of dicts
        total = sum(item["price"] for item in items)
        charge_id = self.payments.charge(user_id, total)
        return self.db.save_order(user_id, items, charge_id)

def test_create_order():
    db, payments = Mock(), Mock()
    payments.charge.return_value = "charge_123"
    db.save_order.return_value = {"id": 1, "status": "pending"}

    order = OrderService(db, payments).create_order(1, [{"price": 5}])

    payments.charge.assert_called_once_with(1, 5)
    assert order["status"] == "pending"
```

**Common mistakes:**

- Patching the wrong path (where it is *defined* instead of where it is *used*).
- Mixing up `return_value` (one answer) and `side_effect` (errors or a sequence).
- Mocking so much that the test no longer checks anything real. If you're
  mocking everything, write an integration test instead.

**Try it:** write a function that calls `requests.get` and returns
`response.json()["name"]`. Test it by patching `requests.get` so no real
network call happens.

## 3. Types of tests {#test-types}

**In short:** different tests trade speed for realism. You want many fast
tests and a few slow, realistic ones.

| Type | Checks | Uses real services? | Speed | When it runs |
|---|---|---|---|---|
| **Unit** | One function or class | No — everything else mocked | Milliseconds | Every commit |
| **Integration** | Several parts together | Yes — real database/API | Seconds | Every merge or nightly |
| **End-to-end** | A full user journey | Yes — real browser | Minutes | Before release |
| **Smoke** | The critical paths still work | Yes | Fast | Right after deploying |
| **Chaos** | The system survives failures | Yes, with failures injected | Varies | Scheduled |

**Measuring and speeding up tests:**

- `pytest --cov=src` — *coverage*: which lines your tests ran (needs `pytest-cov`).
- `pytest --durations=10` — list the 10 slowest tests.
- `pytest -n auto` — run tests in parallel on all CPU cores (needs `pytest-xdist`).

## 4. Automation frameworks {#frameworks}

**In short:** an SDET builds the *framework* — the shared helpers, page
objects, and reports — that makes writing each new test quick.

| Area | Common tools | Key idea |
|---|---|---|
| Web UI | Selenium, Playwright | **Page Object Model**: one class per page, holding its locators and actions |
| APIs | `requests`, `httpx` | Check status codes, response shape, and error cases |
| Reports | Allure, JUnit XML | Screenshots and logs attached to failures |
| Mobile | Appium | Same page-object idea, for app screens |
| Load | Locust | Many simulated users hitting the system at once |

A tiny page object:

```python
class LoginPage:
    def __init__(self, driver):
        self.driver = driver

    def login(self, username, password):
        self.driver.find_element("id", "username").send_keys(username)
        self.driver.find_element("id", "password").send_keys(password)
        self.driver.find_element("id", "submit").click()
```

Tests now read like steps (`login_page.login("ada", "secret")`), and if the page
changes you fix one class instead of every test.

## 5. Running tests automatically (CI/CD) {#ci-cd}

**In short:** CI (continuous integration) runs your tests on every push, so
nobody has to remember to. Tests only protect you if they run automatically.

A GitHub Actions workflow, saved as `.github/workflows/tests.yml`:

```yaml
name: Tests
on: [push, pull_request]            # run on every push and pull request

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12", "3.13"]   # test on three versions

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip                               # reuse downloaded packages
      - run: python -m pip install -r requirements-test.txt

      - name: Unit tests
        run: pytest tests/unit --cov=src

      - name: Integration tests
        run: pytest tests/integration

      - name: Keep screenshots if something failed
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: screenshots/
```

**Flaky tests** pass sometimes and fail sometimes. Don't just re-run them:

- Replace `time.sleep()` with waits that check for a condition.
- Make sure tests don't share data or depend on running order.
- Use retries (`pytest-rerunfailures`) only as a short-term patch while you
  find the real cause.

**Try it:** add the workflow above to a small project with one test, push it,
and watch it run in the repository's **Actions** tab.

## 6. Testing async code {#async-testing}

**In short:** `async` functions must be awaited, so their tests must be
`async` too. The `pytest-asyncio` plugin runs them for you.

```python
import asyncio
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_fetch_user():
    user = await api_client.get_user(1)
    assert user.id == 1

@pytest.mark.asyncio
async def test_several_at_once():
    users = await asyncio.gather(          # returns a list, in the same order
        api_client.get_user(1),
        api_client.get_user(2),
    )
    assert [u.id for u in users] == [1, 2]

@pytest.mark.asyncio
async def test_timeout():
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow_operation(), timeout=1.0)

@pytest.mark.asyncio
async def test_database_down():
    with patch("myapp.db.query", new_callable=AsyncMock) as mock_query:
        mock_query.side_effect = ConnectionError("database down")
        with pytest.raises(ServiceUnavailable):
            await UserService().get_user(1)
```

**Try it:** write an `async def double(n)` that awaits `asyncio.sleep(0.1)`
and returns `n * 2`, then test it with `pytest-asyncio`.
