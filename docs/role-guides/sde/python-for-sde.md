---
title: "Python for SDE"
description: "How Python fundamentals map to building software \u2014 data models, config, REST APIs, repositories, DI, retries, async, background jobs, and packaging."
sidebar_position: 1
level: intermediate
tags: [python, sde]
image: /img/mental-model-share.png
---

# Python for SDE
## How the Fundamentals Help You Build Software

**SDE** means **Software Development Engineer**.
An SDE designs, builds, and ships software: services, APIs, libraries, and background jobs.

This guide shows how each Python fundamental helps in real development work.
Learn the basics first with the [Python cheat sheet](/cheatsheets/python) or [Python Fundamentals](/docs/fundamentals/python/fundamentals-basic-to-advanced).

Each use case in this guide has the same parts:

- **The task** – what you need to build.
- **Fundamentals used** – which basic ideas solve it.
- **How it works** – the steps in plain words.
- **Code** – an example you can copy and change.
- **Try it** – a small exercise, on some use cases.

:::tip How to use this page

The use cases build one small order service step by step: data models, then
config, errors, an API, a database, and so on. Read them in order the first
time; later, jump to the one you need.

:::

---

## Contents

1. [Fundamentals Map for SDE](#1-fundamentals-map-for-sde)
2. [Use Case: Model Your Data](#2-use-case-model-your-data)
3. [Use Case: Load and Check Configuration](#3-use-case-load-and-check-configuration)
4. [Use Case: Clear Error Handling with Custom Exceptions](#4-use-case-clear-error-handling-with-custom-exceptions)
5. [Use Case: Build a REST API](#5-use-case-build-a-rest-api)
6. [Use Case: Store Data in a Database (Repository Pattern)](#6-use-case-store-data-in-a-database-repository-pattern)
7. [Use Case: Make Code Easy to Test (Dependency Injection)](#7-use-case-make-code-easy-to-test-dependency-injection)
8. [Use Case: Retry and Rate Limit Calls](#8-use-case-retry-and-rate-limit-calls)
9. [Use Case: Process Large Data with Generators](#9-use-case-process-large-data-with-generators)
10. [Use Case: Call Many Services at Once (Async)](#10-use-case-call-many-services-at-once-async)
11. [Use Case: Run Background Jobs (Task Queue)](#11-use-case-run-background-jobs-task-queue)
12. [Use Case: Speed Up with Caching](#12-use-case-speed-up-with-caching)
13. [Use Case: Store Passwords and Secrets Safely](#13-use-case-store-passwords-and-secrets-safely)
14. [Use Case: Package and Share Your Code](#14-use-case-package-and-share-your-code)
15. [Use Case: Get Ready for Production](#15-use-case-get-ready-for-production)
16. [How to Organise a Service Project](#16-how-to-organise-a-service-project)
17. [Practice Projects](#17-practice-projects)
18. [Skills Checklist](#18-skills-checklist)

---

## 1. Fundamentals Map for SDE

| Fundamental | Where an SDE uses it |
|-------------|-----------------------|
| Data types and type hints | Clear function contracts; early error finding with type checkers |
| Strings and f-strings | Messages, URLs, SQL parameters, log text |
| Lists, sets, dicts | Request and response bodies, lookups, grouping |
| Comprehensions | Transforming data in one clear step |
| Conditions and guard clauses | Input checks, business rules |
| Functions | Small, testable pieces of logic |
| Closures and decorators | Retry, rate limit, caching, auth checks, route definitions |
| Exceptions | Clear error types that map to HTTP status codes |
| Classes and dataclasses | Domain models, services, repositories |
| Inheritance and abstract classes | Shared behaviour; swappable parts (e.g. different databases) |
| Properties | Validating data when it changes |
| Dependency injection | Passing a class the things it needs, so parts can be swapped (e.g. a fake database in tests) |
| Context managers | Database sessions, transactions, locks |
| Generators | Streaming large files and query results |
| async / await | Many network calls at the same time |
| Modules and packages | Clean project layout; publishing libraries |
| Environment variables | Configuration and secrets |
| JSON | APIs and message formats |
| Logging | Understanding what the service does in production |
| Speed of lookups ("Big-O") | Choosing fast data structures: a `set` or `dict` finds items instantly, a `list` searches one by one |

---

## 2. Use Case: Model Your Data

**The task:** Represent the main things in your system (users, orders, products) in a clear, safe way.

**Fundamentals used:** classes, dataclasses, type hints, enums, properties, `__post_init__`.

**How it works:**
1. Use a **dataclass** for each kind of thing. Python writes `__init__`, `__repr__`, and `__eq__` for you.
2. Use **type hints** on every field.
3. Use an **Enum** for fixed choices (like order status), so wrong values are not possible.
4. Check the values in `__post_init__`, which runs right after `__init__`.
5. Use `frozen=True` when the object must never change.

**Code:**
```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum

class OrderStatus(Enum):
    NEW = "new"
    PAID = "paid"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"

@dataclass(frozen=True)
class OrderLine:
    product_id: str
    quantity: int
    unit_price: Decimal

    def __post_init__(self):
        if self.quantity <= 0:
            raise ValueError("quantity must be positive")

    @property
    def total(self) -> Decimal:
        return self.unit_price * self.quantity

@dataclass
class Order:
    id: str
    customer_id: str
    lines: list[OrderLine] = field(default_factory=list)
    status: OrderStatus = OrderStatus.NEW
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def total(self) -> Decimal:
        return sum((line.total for line in self.lines), Decimal("0"))

    def mark_paid(self):
        if self.status is not OrderStatus.NEW:
            raise ValueError(f"cannot pay an order that is {self.status.value}")
        self.status = OrderStatus.PAID
```

**Why the fundamental matters:** Use `Decimal` for money, not `float`. A `float` cannot store some decimal values exactly (try `0.1 + 0.2` in Python). A **property** gives a computed value (`total`) that always stays correct.

**Try it:** add a `mark_shipped()` method that only works when the order is `PAID`, and raises `ValueError` otherwise.

---

## 3. Use Case: Load and Check Configuration

**The task:** Your service needs settings: database URL, port, debug mode. They come from environment variables and must be checked when the service starts.

**Fundamentals used:** environment variables, dicts, type conversion, dataclasses, class methods, custom exceptions.

**How it works:**
1. Read each setting from `os.environ`, with a default when it is safe to have one.
2. Convert text to the right type (`int`, `bool`).
3. Put all settings in one **frozen dataclass**, so they cannot be changed by mistake.
4. Fail at start-up with a clear message if a required setting is missing. It is better to fail early than to fail later during a user request.

**Code:**
```python
# app/config.py
import os
from dataclasses import dataclass

class ConfigError(Exception):
    """Raised when configuration is missing or wrong."""

def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise ConfigError(f"Environment variable {name} is required")
    return value

def _as_bool(text: str) -> bool:
    return text.strip().lower() in {"1", "true", "yes", "on"}

@dataclass(frozen=True)
class Settings:
    database_url: str
    port: int = 8000
    debug: bool = False
    allowed_hosts: tuple[str, ...] = ("localhost",)

    @classmethod
    def from_env(cls) -> "Settings":
        try:
            port = int(os.environ.get("PORT", "8000"))
        except ValueError as e:
            raise ConfigError("PORT must be a number") from e

        hosts = os.environ.get("ALLOWED_HOSTS", "localhost")
        return cls(
            database_url=_require("DATABASE_URL"),
            port=port,
            debug=_as_bool(os.environ.get("DEBUG", "false")),
            allowed_hosts=tuple(h.strip() for h in hosts.split(",") if h.strip()),
        )
```

```python
# app/main.py
from app.config import Settings
settings = Settings.from_env()   # the service stops here if config is wrong
```

**Try it:** run `Settings.from_env()` without `DATABASE_URL` set and read the error. Then set it (`export DATABASE_URL=sqlite:///app.db`) and try again.

---

## 4. Use Case: Clear Error Handling with Custom Exceptions

**The task:** Your code can fail in different ways: not found, bad input, no permission. The API must return the right HTTP status for each, and the logs must be clear.

**Fundamentals used:** classes, inheritance, exceptions, `raise ... from`, dicts.

**How it works:**
1. Make one base exception for your app.
2. Make child exceptions for each kind of problem.
3. Store the HTTP status on each class.
4. Business code raises these exceptions. It does not know about HTTP.
5. One handler at the edge of the app turns the exception into a response.

**Code:**
```python
# app/errors.py
class AppError(Exception):
    status_code = 500
    code = "internal_error"

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

class NotFoundError(AppError):
    status_code = 404
    code = "not_found"

class ValidationError(AppError):
    status_code = 422
    code = "invalid_input"

class PermissionDeniedError(AppError):
    status_code = 403
    code = "forbidden"
```

```python
# app/services/orders.py
from app.errors import NotFoundError, PermissionDeniedError

def get_order(repo, order_id: str, user):
    order = repo.get(order_id)
    if order is None:
        raise NotFoundError(f"Order {order_id} not found")
    if order.customer_id != user.id and not user.is_admin:
        raise PermissionDeniedError("You cannot view this order")
    return order
```

The handler that turns errors into responses is shown in the next use case.

---

## 5. Use Case: Build a REST API

**The task:** Give other programs a way to create and read orders over HTTP. A **REST API** is a set of URLs (like `/orders/42`) that programs call with HTTP methods — `GET` to read, `POST` to create — usually sending and receiving JSON.

**Fundamentals used:** functions, decorators, type hints, classes (Pydantic models), exceptions, dicts, dependency injection.

**How it works (with FastAPI):**
1. Each endpoint is a normal **function**.
2. A **decorator** (`@app.get`, `@app.post`) links the function to a URL and HTTP method.
3. **Type hints** tell FastAPI how to read and check the request. Bad input is rejected with a `422` before your code runs.
4. A **Pydantic model** (a class from the Pydantic library that checks data types) describes the request and response body.
5. `Depends(...)` gives the function what it needs (a repository, the current user). This is dependency injection.
6. An exception handler turns your `AppError` into a JSON response.

**Code:**
```python
# app/api.py
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.errors import AppError
from app.repository import OrderRepository, get_repository
from app.services.orders import get_order

app = FastAPI()

class CreateOrder(BaseModel):
    customer_id: str
    product_id: str
    quantity: int = Field(gt=0, le=100)

class OrderOut(BaseModel):
    id: str
    customer_id: str
    status: str

@app.exception_handler(AppError)
async def handle_app_error(request: Request, error: AppError):
    return JSONResponse(
        status_code=error.status_code,
        content={"error": error.code, "message": error.message},
    )

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/orders", response_model=OrderOut, status_code=201)
def create_order(body: CreateOrder, repo: OrderRepository = Depends(get_repository)):
    order = repo.create(body.customer_id, body.product_id, body.quantity)
    return OrderOut(id=order.id, customer_id=order.customer_id, status=order.status.value)

@app.get("/orders/{order_id}", response_model=OrderOut)
def read_order(order_id: str, repo: OrderRepository = Depends(get_repository),
               user=Depends(current_user)):
    order = get_order(repo, order_id, user)
    return OrderOut(id=order.id, customer_id=order.customer_id, status=order.status.value)
```

Testing the API:
```python
from fastapi.testclient import TestClient
from app.api import app

client = TestClient(app)

def test_quantity_must_be_positive():
    response = client.post("/orders", json={"customer_id": "c1", "product_id": "p1", "quantity": 0})
    assert response.status_code == 422
```

**Try it:** run the app with `uvicorn app.api:app --reload` and open `http://localhost:8000/docs` — FastAPI builds an interactive page where you can call each endpoint.

**Common HTTP status codes:**

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | Done, nothing to return |
| 400 | Bad request |
| 401 | Not logged in |
| 403 | Logged in, but not allowed |
| 404 | Not found |
| 409 | Conflict (e.g. already exists) |
| 422 | Input failed validation |
| 429 | Too many requests |
| 500 | Server error |
| 503 | Service not available right now |

---

## 6. Use Case: Store Data in a Database (Repository Pattern)

**The task:** Save and load orders from a database, without spreading SQL all over the code.

**Fundamentals used:** classes, abstract base classes, context managers, dicts, exceptions, parameterised queries.

**How it works:**
1. Define an **abstract class** that lists what a repository can do: `get`, `add`, `list`.
2. Write one real version (SQL) and one simple in-memory version (for tests).
3. The rest of the app uses only the abstract methods. It does not care which version it gets.
4. Use a **context manager** for the database connection, so it always commits or rolls back and then closes.
5. Always pass values to SQL as **parameters** (`?`), never by joining strings. This stops SQL injection attacks.

**Code:**
```python
# app/repository.py
import sqlite3
from abc import ABC, abstractmethod
from contextlib import contextmanager

class UserRepository(ABC):
    @abstractmethod
    def get(self, user_id: int) -> dict | None: ...

    @abstractmethod
    def add(self, name: str, email: str) -> int: ...

class SqliteUserRepository(UserRepository):
    def __init__(self, path: str):
        self.path = path

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()           # save changes if all went well
        except Exception:
            conn.rollback()         # undo changes on error
            raise
        finally:
            conn.close()

    def get(self, user_id: int) -> dict | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id, name, email FROM users WHERE id = ?", (user_id,)   # safe parameter
            ).fetchone()
        return dict(row) if row else None

    def add(self, name: str, email: str) -> int:
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO users (name, email) VALUES (?, ?)", (name, email)
            )
            return cursor.lastrowid

class InMemoryUserRepository(UserRepository):
    """Simple version for unit tests."""
    def __init__(self):
        self._rows: dict[int, dict] = {}

    def get(self, user_id):
        return self._rows.get(user_id)

    def add(self, name, email):
        new_id = len(self._rows) + 1
        self._rows[new_id] = {"id": new_id, "name": name, "email": email}
        return new_id
```

**Never do this:**
```python
conn.execute(f"SELECT * FROM users WHERE email = '{email}'")   # open to SQL injection
```

**SQL injection** means a user types SQL into a form field, and your code runs it. With `?` parameters the database treats the value as plain data.

**Try it:** add a `list_all()` method to both repository classes, and a test that uses `InMemoryUserRepository`.

---

## 7. Use Case: Make Code Easy to Test (Dependency Injection)

**The task:** A service sends emails and saves users. You want to test it without a real mail server or database.

**Fundamentals used:** classes, constructors, protocols, dependency injection.

**How it works:**
1. The service does **not** create its own database or email client.
2. It receives them in its constructor (`__init__`).
3. In production, you pass the real ones.
4. In tests, you pass simple fakes.
5. A `Protocol` documents what methods the fake must have.

**Code:**
```python
from typing import Protocol

class EmailSender(Protocol):
    def send(self, to: str, subject: str, body: str) -> None: ...

class SignupService:
    def __init__(self, users: UserRepository, email: EmailSender):
        self.users = users
        self.email = email

    def sign_up(self, name: str, email_address: str) -> int:
        if "@" not in email_address:
            raise ValidationError("Invalid email")
        user_id = self.users.add(name, email_address)
        self.email.send(email_address, "Welcome", f"Hi {name}, welcome!")
        return user_id
```

```python
class FakeEmail:
    def __init__(self):
        self.sent = []
    def send(self, to, subject, body):
        self.sent.append((to, subject))

def test_sign_up_sends_welcome_email():
    email = FakeEmail()
    service = SignupService(InMemoryUserRepository(), email)

    service.sign_up("Asha", "asha@x.com")

    assert email.sent == [("asha@x.com", "Welcome")]
```

**Try it:** write a test that checks an invalid email raises `ValidationError` and that **no** email was sent (`email.sent == []`).

---

## 8. Use Case: Retry and Rate Limit Calls

**The task:** Calls to other services sometimes fail for a moment. You want to retry them with a growing wait. You also must not send more than N calls per second.

**Fundamentals used:** closures, decorators with parameters, loops, exceptions, `time`, `deque`.

**How it works (retry):**
1. A decorator wraps the function.
2. It calls the function in a **loop**.
3. On a known temporary error, it waits and tries again. The wait grows each time (**exponential backoff**: 1s, 2s, 4s…).
4. After the last try, it raises the error.

**How it works (rate limit):**
1. A **closure** keeps a `deque` of the times of recent calls.
2. Before each call, remove times older than the window.
3. If the window is full, wait until the oldest call leaves the window.

**Code:**
```python
# app/resilience.py
import functools
import random
import time
from collections import deque

def retry(times: int = 3, base_delay: float = 0.5, errors=(ConnectionError, TimeoutError)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except errors:
                    if attempt == times:
                        raise
                    delay = base_delay * 2 ** (attempt - 1)
                    time.sleep(delay + random.uniform(0, delay / 2))   # add "jitter"
        return wrapper
    return decorator

def rate_limit(max_calls: int, per_seconds: float):
    calls = deque()

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.monotonic()
            while calls and now - calls[0] > per_seconds:
                calls.popleft()
            if len(calls) >= max_calls:
                time.sleep(per_seconds - (now - calls[0]))
            calls.append(time.monotonic())
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

```python
import requests

@rate_limit(max_calls=10, per_seconds=1)
@retry(times=3)
def fetch_price(product_id: str) -> dict:
    return requests.get(f"https://prices.example.com/{product_id}", timeout=5).json()
```

**Jitter** is a small random extra wait. It stops many clients from retrying at exactly the same moment.

Only retry actions that are safe to repeat (for example, reading data). Repeating a payment can charge a customer twice.

---

## 9. Use Case: Process Large Data with Generators

**The task:** Import a very large CSV file (millions of rows) into the database, without running out of memory.

**Fundamentals used:** generators, `yield`, file I/O, CSV, lists (batches), functions.

**How it works:**
1. Read the file one row at a time with a **generator**. Only one row is in memory at once.
2. Clean each row in another generator.
3. Group rows into **batches** of, for example, 1,000 rows.
4. Save each batch in one database call. This is much faster than one call per row.
5. The steps link together like a pipe. Each step pulls data from the one before it.

**Code:**
```python
import csv
from itertools import islice
from typing import Iterable, Iterator

def read_rows(path: str) -> Iterator[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)

def clean(rows: Iterable[dict]) -> Iterator[dict]:
    for row in rows:
        email = row.get("email", "").strip().lower()
        if "@" not in email:
            continue                    # skip bad rows
        yield {"name": row["name"].strip(), "email": email}

def batches(items: Iterable[dict], size: int) -> Iterator[list[dict]]:
    iterator = iter(items)
    while batch := list(islice(iterator, size)):
        yield batch

def import_users(path: str, repo) -> int:
    total = 0
    for batch in batches(clean(read_rows(path)), size=1000):
        repo.add_many(batch)
        total += len(batch)
    return total
```

The `:=` sign (the "walrus" operator) saves a value and checks it in the same line.

**Try it:** make a CSV with 10 rows (include two bad emails), and print how many rows `clean(read_rows(path))` keeps.

---

## 10. Use Case: Call Many Services at Once (Async)

**The task:** A page needs data from three services: user, orders, and recommendations. Calling them one after another is slow. You want to call them at the same time.

**Fundamentals used:** `async def`, `await`, `asyncio.gather`, timeouts, exceptions, dicts.

**How it works:**
1. Write each call as an `async` function.
2. Start all calls together with `asyncio.gather`.
3. The total wait is about as long as the **slowest** call, not the sum of all calls.
4. Put a timeout on each call.
5. Use `return_exceptions=True` so one failed call does not break the others. Then give a fallback value for the failed part.

**Code:**
```python
import asyncio
import httpx

async def get_json(client: httpx.AsyncClient, url: str) -> dict:
    response = await client.get(url, timeout=2.0)
    response.raise_for_status()
    return response.json()

async def load_dashboard(user_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        user, orders, recs = await asyncio.gather(
            get_json(client, f"http://users/api/{user_id}"),
            get_json(client, f"http://orders/api/{user_id}"),
            get_json(client, f"http://recs/api/{user_id}"),
            return_exceptions=True,
        )

    if isinstance(user, Exception):
        raise user                           # user data is required
    return {
        "user": user,
        "orders": [] if isinstance(orders, Exception) else orders,
        "recommendations": [] if isinstance(recs, Exception) else recs,
    }
```

**When to use which tool:**
- Waiting for network or disk → `async` or threads.
- Heavy calculation → processes (`ProcessPoolExecutor`).

---

## 11. Use Case: Run Background Jobs (Task Queue)

**The task:** Sending an email or making a PDF takes time. The user should not wait for it. You want to do it in the background.

**Fundamentals used:** decorators, functions, retry with exceptions, JSON-friendly arguments.

**How it works:**
1. The web request puts a **task** on a **queue** (for example Redis or RabbitMQ) and returns at once.
2. A separate **worker** program takes tasks from the queue and runs them.
3. A decorator (`@app.task`) turns a normal function into a task.
4. If the task fails for a temporary reason, it retries with a growing delay.
5. Pass simple values (IDs, strings) to tasks, not full objects. Tasks are sent as JSON.

**Code (Celery):**
```python
# app/tasks.py
from celery import Celery

celery_app = Celery("app", broker="redis://localhost:6379/0")

@celery_app.task(bind=True, max_retries=3)
def send_welcome_email(self, user_id: int):
    user = user_repository.get(user_id)
    if user is None:
        return                                  # nothing to do
    try:
        mailer.send(user["email"], "Welcome", "Thanks for joining!")
    except ConnectionError as error:
        raise self.retry(exc=error, countdown=5 * 2 ** self.request.retries)
```

```python
# in the API
send_welcome_email.delay(user_id)   # put on the queue and return at once
```

Design tasks so that running them twice is safe. This is called **idempotent**. A queue may deliver a task more than once.

---

## 12. Use Case: Speed Up with Caching

**The task:** Some results are slow to compute or fetch but do not change often. You want to save and reuse them.

**Fundamentals used:** dicts, decorators, `functools.lru_cache`, time, closures.

**How it works:**
1. For pure functions (same input always gives same output), use `@lru_cache`.
2. For data that becomes old, store the value **and the time** it was saved. Treat it as missing after a set time (**TTL**, "time to live"). `lru_cache` means "least recently used": when full, it forgets the entry that was used longest ago.

**Code:**
```python
import functools
import time
import requests

@functools.lru_cache(maxsize=1024)
def country_for_code(code: str) -> str:
    return load_country_table()[code]      # loaded once per code

def ttl_cache(seconds: float):
    def decorator(func):
        store: dict = {}

        @functools.wraps(func)
        def wrapper(*args):
            now = time.monotonic()
            if args in store:
                value, saved_at = store[args]
                if now - saved_at < seconds:
                    return value
            value = func(*args)
            store[args] = (value, now)
            return value
        return wrapper
    return decorator

@ttl_cache(seconds=60)
def exchange_rate(currency: str) -> float:
    return requests.get(f"https://rates.example.com/{currency}", timeout=5).json()["rate"]
```

---

## 13. Use Case: Store Passwords and Secrets Safely

**The task:** Save user passwords so that even if the database is stolen, the passwords are not readable. Keep API keys out of the code.

**Fundamentals used:** bytes and strings, the `secrets` and `hashlib` modules, environment variables, functions.

**How it works:**
1. Never store the password itself. Store a **hash**: a one-way scramble that cannot be turned back.
2. Add a random **salt** for each user, so two equal passwords give different hashes.
3. Use a slow hash made for passwords (PBKDF2, bcrypt, or argon2). Slow hashing makes guessing expensive for attackers.
4. Compare hashes with `secrets.compare_digest`. It takes the same time for every input, so attackers learn nothing from timing.
5. Read secrets from environment variables or a secret manager. Never write them in code or commit them to git.

**Code:**
```python
import hashlib
import os
import secrets

ITERATIONS = 600_000

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"

def verify_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split("$")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), ITERATIONS)
    return secrets.compare_digest(digest.hex(), digest_hex)

API_KEY = os.environ["PAYMENT_API_KEY"]         # from the environment, not the code
reset_token = secrets.token_urlsafe(32)         # safe random token for links
```

**Other safety rules for SDEs:**
- Check all input from outside (use Pydantic or your own checks).
- Use parameters in SQL queries (see [Use Case 6](#6-use-case-store-data-in-a-database-repository-pattern)).
- Run commands with `subprocess.run([...])` using a list, not `shell=True` with user text.
- Do not load untrusted data with `pickle`. Use JSON.
- Do not show internal error details to users. Log them instead.
- Scan dependencies for known problems: `pip-audit`.

---

## 14. Use Case: Package and Share Your Code

**The task:** Share a library with other teams, or publish a command-line tool.

**Fundamentals used:** modules, packages, `__init__.py`, the main guard, version numbers.

**How it works:**
1. Put your code in a `src/` folder, inside a package folder.
2. Describe the package in `pyproject.toml`: name, version, dependencies.
3. Add a `[project.scripts]` entry to create a command-line command (a CLI — command-line interface).
4. Follow **semantic versioning**: `MAJOR.MINOR.PATCH`.
   - PATCH (1.0.**1**) – bug fix only.
   - MINOR (1.**1**.0) – new feature; old code still works.
   - MAJOR (**2**.0.0) – change that can break old code.
5. Build the package and upload it to PyPI (the Python Package Index — where `pip install` downloads from) or a private index.

**Code:**
```text
my-tool/
├── pyproject.toml
├── README.md
├── src/
│   └── my_tool/
│       ├── __init__.py
│       ├── core.py
│       └── cli.py
└── tests/
    └── test_core.py
```

```toml
# pyproject.toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-tool"
version = "1.2.0"
requires-python = ">=3.10"
dependencies = ["requests>=2.31"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[project.scripts]
my-tool = "my_tool.cli:main"
```

```python
# src/my_tool/cli.py
import argparse
from my_tool.core import run

def main():
    parser = argparse.ArgumentParser(prog="my-tool")
    parser.add_argument("target")
    args = parser.parse_args()
    run(args.target)

if __name__ == "__main__":
    main()
```

```bash
pip install -e ".[dev]"      # install for local development
python -m build              # make the package files
twine upload dist/*          # publish
```

---

## 15. Use Case: Get Ready for Production

**The task:** Before the service goes live, make sure the team can see what it is doing and that it can be deployed safely.

**Fundamentals used:** logging, dicts and JSON, functions, try/finally, context managers.

**What to add:**

| Need | What to do |
|------|-----------|
| See what happens | Structured (JSON) logs with a request ID |
| Know it is alive | A `/health` endpoint |
| Know it is ready | A `/ready` endpoint that checks the database |
| Measure speed and errors | Metrics (see the [SRE guide](/docs/role-guides/sre/python-for-sre)) |
| Stop cleanly | Close connections and finish work when the process is told to stop |
| Safe release | Blue-green or canary deployment, with smoke tests |

**Code (request ID in every log line):**
```python
import contextvars
import json
import logging
import time
import uuid

request_id = contextvars.ContextVar("request_id", default="-")

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "time": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id.get(),
        })

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger("app")

@app.middleware("http")
async def add_request_id(request, call_next):
    request_id.set(request.headers.get("X-Request-ID", str(uuid.uuid4())))
    start = time.monotonic()
    try:
        response = await call_next(request)
    finally:
        logger.info("%s %s done in %.0f ms", request.method, request.url.path,
                    (time.monotonic() - start) * 1000)
    response.headers["X-Request-ID"] = request_id.get()
    return response
```

---

## 16. How to Organise a Service Project

```text
order-service/
├── pyproject.toml
├── src/
│   └── order_service/
│       ├── __init__.py
│       ├── config.py         # settings from environment
│       ├── errors.py         # custom exceptions
│       ├── models.py         # dataclasses and enums
│       ├── repository.py     # database access
│       ├── services/         # business logic (no HTTP here)
│       ├── api.py            # HTTP endpoints only
│       └── tasks.py          # background jobs
└── tests/
    ├── unit/                 # fast tests with fakes
    └── integration/          # tests with a real database
```

**Layers:** The API layer talks to the service layer. The service layer talks to the repository layer. Each layer only knows about the layer below it. This makes each part easy to change and test.

---

## 17. Practice Projects

| # | Project | Fundamentals practised |
|---|---------|------------------------|
| 1 | Config loader with checks and clear errors | env variables, dataclasses, exceptions |
| 2 | JSON API response parser | dicts, lists, comprehensions |
| 3 | Retry and rate-limit decorators, with tests | closures, decorators, loops |
| 4 | User management with roles | classes, inheritance, properties |
| 5 | Large CSV importer | generators, batching, file I/O |
| 6 | Repository with SQLite plus an in-memory version | abstract classes, context managers, SQL parameters |
| 7 | REST API for orders with FastAPI | decorators, type hints, Pydantic, exceptions |
| 8 | Background email task with retries | task queues, retry |
| 9 | Publish your helpers as a package with a CLI | packages, `pyproject.toml`, `argparse` |
| 10 | **Final project:** production-ready microservice: API + database + background jobs + auth + logs + tests | everything above |

---

## 18. Skills Checklist

- [ ] I can model data with dataclasses, enums, and type hints.
- [ ] I can load settings from the environment and fail early when they are wrong.
- [ ] I can design a custom exception hierarchy and map it to HTTP codes.
- [ ] I can build REST endpoints with input checks.
- [ ] I can hide database code behind a repository class.
- [ ] I always use parameters in SQL queries.
- [ ] I can inject dependencies so code is easy to test.
- [ ] I can write retry and rate-limit decorators.
- [ ] I can process very large files with generators.
- [ ] I can call many services at once with `asyncio.gather`.
- [ ] I can move slow work to a background task.
- [ ] I can add caching with and without an expiry time.
- [ ] I can hash passwords safely and keep secrets out of code.
- [ ] I can package code and publish it with a version number.
- [ ] I can add structured logs and health checks.

**Next:** read [Coding Best Practices](/docs/fundamentals/python/coding-best-practices).
