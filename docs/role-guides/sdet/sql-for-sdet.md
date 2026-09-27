---
title: "SQL for SDET"
description: "How SQL helps test engineers — checking what the app saved, isolated test data, data-quality checks, comparing tables, testing migrations and constraints, waiting for async writes, index checks, and database tests in CI."
sidebar_position: 4
level: intermediate
tags: [sql, sdet, testing]
image: /img/social/sql-for-sdet.png
---

# SQL for SDET
## How SQL Helps You Test Software

**SDET** means **Software Development Engineer in Test**. An SDET writes code
that tests other code.

An API can answer `201 Created` and still save the wrong thing. SQL lets you
look at what the application *actually* stored, set up exact test data in
milliseconds, and check whole tables for bad data. Learn the basics first with
the [SQL cheat sheet](/cheatsheets/sql) and
[Milestones 1–7](/docs/learning-path/sql/implementation-roadmap).

Each use case has the same parts:

- **The task** – what you need to do.
- **SQL used** – which ideas solve it.
- **How it works** – the steps in plain words.
- **Code** – SQL, and Python + pytest tests you can run.
- **Try it** – a small exercise.

:::tip How to use this page

The tests use Python's built-in `sqlite3` module, so they run anywhere with
`python -m pip install pytest` and nothing else. Save the
[practice database](/cheatsheets/sql#practice-database) setup as
`tests/shop.sql` — every test starts from it. In a real project, run the same
tests against the database you use in production (see
[use case 11](#11-use-case-run-database-tests-in-ci)); only the connection and
the placeholder style change. Prefer Java? The same ideas work with JDBC and
JUnit — see [Java for SDET](/docs/role-guides/sdet/java-for-sdet).

:::

---

## Contents

1. [SQL Map for SDET](#1-sql-map-for-sdet)
2. [Use Case: Check What the App Saved](#2-use-case-check-what-the-app-saved)
3. [Use Case: Isolated Test Data](#3-use-case-isolated-test-data)
4. [Use Case: Data-Quality Checks](#4-use-case-data-quality-checks)
5. [Use Case: Compare Two Tables](#5-use-case-compare-two-tables)
6. [Use Case: Test a Migration](#6-use-case-test-a-migration)
7. [Use Case: Prove the Constraints Work](#7-use-case-prove-the-constraints-work)
8. [Use Case: Wait for Asynchronous Writes](#8-use-case-wait-for-asynchronous-writes)
9. [Use Case: Check a Query Uses an Index](#9-use-case-check-a-query-uses-an-index)
10. [Use Case: Generate Test Data in Bulk](#10-use-case-generate-test-data-in-bulk)
11. [Use Case: Run Database Tests in CI](#11-use-case-run-database-tests-in-ci)
12. [How to Organise Database Tests](#12-how-to-organise-database-tests)
13. [Practice Projects](#practice-projects)
14. [Skills Checklist](#14-skills-checklist)

---

## 1. SQL Map for SDET

**In short:** the SQL you already know, and the testing job each part does.

| SQL idea | Where an SDET uses it |
|---|---|
| `SELECT … WHERE` | Checking the exact row an API call created or changed |
| `JOIN` | Checking related rows too — an order *and* its items |
| `LEFT JOIN … IS NULL`, `NOT EXISTS` | Finding orphans: rows pointing at nothing |
| `GROUP BY … HAVING COUNT(*) > 1` | Finding duplicates |
| `EXCEPT` | Diffing two tables after a migration or data copy |
| `COUNT`, `SUM` | Before/after totals that must match |
| `INSERT` | Creating exact test data without clicking through the UI |
| Transactions, `ROLLBACK` | Undoing each test's changes, so tests can't affect each other |
| Constraints | Checking the database rejects bad data |
| `EXPLAIN` | Catching a query that stopped using its index |
| Parameters (`?`) | Safe queries in test code — the same rule as in app code |

---

## 2. Use Case: Check What the App Saved

**The task:** after the app places an order, prove the database holds exactly
the right rows — and that a failed order leaves nothing behind.

**SQL used:** `SELECT` with `JOIN`, `COUNT`, transactions.

**How it works:** call the application code, then query the database
directly and compare with what you expect. For the failure case, check the
database is *unchanged*, not just that an error was raised.

```python
# app/orders.py
import sqlite3
from datetime import date


class OrderError(Exception):
    pass


def place_order(db: sqlite3.Connection, customer_id: int, items: dict[int, int], today: date) -> int:
    """Saves an order and its items in one transaction; returns the new order id."""
    if not items:
        raise OrderError("an order needs at least one item")
    with db:                                         # commit on success, roll back on any error
        (order_id,) = db.execute("SELECT COALESCE(MAX(id), 100) + 1 FROM orders").fetchone()
        db.execute(
            "INSERT INTO orders (id, customer_id, ordered_at, status) VALUES (?, ?, ?, 'pending')",
            (order_id, customer_id, today.isoformat()),
        )
        db.executemany(
            "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
            [(order_id, product_id, qty) for product_id, qty in items.items()],
        )
    return order_id
```

```python
# tests/conftest.py
import sqlite3
from pathlib import Path

import pytest

SCHEMA = Path(__file__).with_name("shop.sql").read_text()


@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")               # a brand-new database for every test
    conn.execute("PRAGMA foreign_keys = ON")         # SQLite only checks foreign keys when asked
    conn.executescript(SCHEMA)
    yield conn
    conn.close()
```

```python
# tests/test_orders.py
import sqlite3
from datetime import date

import pytest

from app.orders import OrderError, place_order


def test_order_and_items_are_saved(db):
    order_id = place_order(db, customer_id=2, items={1: 1, 5: 3}, today=date(2026, 4, 1))

    order = db.execute(
        "SELECT customer_id, ordered_at, status FROM orders WHERE id = ?", (order_id,)
    ).fetchone()
    items = db.execute(
        "SELECT p.name, oi.quantity FROM order_items oi "
        "JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? ORDER BY p.name",
        (order_id,),
    ).fetchall()

    assert order == (2, "2026-04-01", "pending")
    assert items == [("Keyboard", 1), ("Notebook", 3)]


def test_unknown_product_saves_nothing(db):
    orders_before = db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]

    with pytest.raises(sqlite3.IntegrityError):      # product 999 doesn't exist
        place_order(db, customer_id=2, items={1: 1, 999: 1}, today=date(2026, 4, 1))

    orders_after = db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    assert orders_after == orders_before             # the order row was rolled back too


def test_empty_order_is_rejected(db):
    with pytest.raises(OrderError):
        place_order(db, customer_id=2, items={}, today=date(2026, 4, 1))
```

**Watch out for:** checking only the API response. `test_unknown_product_saves_nothing`
catches a real class of bug — an order saved without its items because the
two inserts weren't in one transaction.

**Try it:** add a test that the new order's total (price × quantity, summed)
is `59.74` (one Keyboard, three Notebooks).

---

## 3. Use Case: Isolated Test Data

**The task:** tests that share one database must not see each other's data.

**SQL used:** `BEGIN`, `ROLLBACK`.

**How it works:** the fastest clean-up is not deleting rows — it's never
keeping them. Open a transaction before each test and roll it back after. The
database is created once per test run; each test's changes vanish.

```python
# tests/test_isolation.py
import sqlite3
from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def db_file(tmp_path_factory):
    path = tmp_path_factory.mktemp("db") / "shop.db"         # created once for the whole run
    conn = sqlite3.connect(path)
    conn.executescript(Path(__file__).with_name("shop.sql").read_text())
    conn.close()
    return path


@pytest.fixture
def shared_db(db_file):
    conn = sqlite3.connect(db_file, isolation_level=None)   # we control transactions ourselves
    conn.execute("BEGIN")
    yield conn
    conn.execute("ROLLBACK")                                # every change this test made is undone
    conn.close()


@pytest.mark.parametrize("attempt", [1, 2])
def test_each_test_starts_clean(shared_db, attempt):
    # Both runs insert the same id; the second would fail if the first had been kept.
    shared_db.execute(
        "INSERT INTO customers (id, name, email, city, joined_on) "
        "VALUES (99, 'Test', 'qa@example.test', NULL, '2026-01-01')"
    )
    assert shared_db.execute("SELECT COUNT(*) FROM customers").fetchone()[0] == 6
```

| Strategy | Speed | Use when |
|---|---|---|
| Roll back each test's transaction | Fastest | The app code uses the test's connection |
| Fresh database per test (use case 2) | Fast for SQLite, slower for servers | Tests need a guaranteed clean start |
| Delete by a marker (`WHERE email LIKE '%@example.test'`) | Slow | The app commits on its own connection (end-to-end tests) |

**Try it:** add a third strategy test: insert a customer with an
`@example.test` email, then a fixture teardown that deletes by that marker.

---

## 4. Use Case: Data-Quality Checks

**The task:** find bad data before users do — orphans, duplicates, impossible
values.

**SQL used:** `LEFT JOIN … IS NULL`, `NOT EXISTS`, `GROUP BY … HAVING`, `NOT IN`
with a fixed list.

**How it works:** write each rule as a query that returns the **bad rows**.
A healthy database returns nothing, so one parametrised test runs them all
and prints the offenders when a rule fails.

```sql
-- Orders whose customer doesn't exist (orphans)
SELECT o.id FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE c.id IS NULL;

-- Orders with no items
SELECT o.id FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

-- The same email twice, ignoring case
SELECT LOWER(email) FROM customers
WHERE email IS NOT NULL
GROUP BY LOWER(email) HAVING COUNT(*) > 1;

-- Orders placed before the customer joined
SELECT o.id FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.ordered_at < c.joined_on;
```

On the practice database each query returns no rows.

```python
# tests/test_data_quality.py
import pytest

CHECKS = {
    "orders without a customer":
        "SELECT o.id FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL",
    "orders without items":
        "SELECT o.id FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)",
    "duplicate emails":
        "SELECT LOWER(email) FROM customers WHERE email IS NOT NULL GROUP BY LOWER(email) HAVING COUNT(*) > 1",
    "quantity not positive":
        "SELECT order_id, product_id FROM order_items WHERE quantity <= 0",
    "unknown order status":
        "SELECT id, status FROM orders WHERE status NOT IN ('pending', 'shipped', 'delivered', 'cancelled')",
    "ordered before joining":
        "SELECT o.id FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.ordered_at < c.joined_on",
}


@pytest.mark.parametrize("sql", CHECKS.values(), ids=CHECKS.keys())
def test_no_bad_rows(db, sql):
    bad_rows = db.execute(sql).fetchall()
    assert bad_rows == [], f"found {len(bad_rows)} bad row(s): {bad_rows[:5]}"


def test_checks_really_find_problems(db):
    # A check that can never fail is worthless: plant bad data and make sure it's caught.
    db.execute("INSERT INTO orders (id, customer_id, ordered_at, status) VALUES (900, 1, '2020-01-01', 'lost')")

    assert db.execute(CHECKS["orders without items"]).fetchall() == [(900,)]
    assert db.execute(CHECKS["unknown order status"]).fetchall() == [(900, "lost")]
    assert db.execute(CHECKS["ordered before joining"]).fetchall() == [(900,)]
```

**Watch out for:** a check that returns nothing because it's *wrong* looks
exactly like a check that passes. `test_checks_really_find_problems` plants a
bad row to prove the checks can fail.

**Try it:** add a check for customers with an email that has no `@`.

---

## 5. Use Case: Compare Two Tables

**The task:** after copying or transforming data (a migration, an ETL job — Extract,
Transform, Load), prove the target matches the source.

**SQL used:** `EXCEPT` in both directions, `COUNT`, `SUM`.

**How it works:** `source EXCEPT target` lists rows that went missing or
changed; `target EXCEPT source` lists rows that appeared or changed. Both
empty = identical. Add totals as a quick first check.

```sql
CREATE TABLE orders_copy AS SELECT * FROM orders;       -- the "migrated" table
UPDATE orders_copy SET status = 'shipped' WHERE id = 105;    -- a bug changed a row
DELETE FROM orders_copy WHERE id = 106;                      -- a bug lost a row

SELECT 'missing or changed' AS problem, * FROM (
  SELECT id, customer_id, ordered_at, status FROM orders
  EXCEPT
  SELECT id, customer_id, ordered_at, status FROM orders_copy
) a
UNION ALL
SELECT 'extra or changed', * FROM (
  SELECT id, customer_id, ordered_at, status FROM orders_copy
  EXCEPT
  SELECT id, customer_id, ordered_at, status FROM orders
) b
ORDER BY id, problem;
-- extra or changed 105 … shipped · missing or changed 105 … pending · missing or changed 106 …
```

```python
# tests/test_compare_tables.py
import re

SAFE_NAME = re.compile(r"^[a-z_][a-z0-9_]*$")


def diff_tables(db, source: str, target: str, columns: list[str]):
    """Returns (rows only in source, rows only in target)."""
    for name in [source, target, *columns]:
        # Table and column names can't be "?" parameters, so allow only plain names.
        if not SAFE_NAME.match(name):
            raise ValueError(f"unsafe identifier: {name!r}")
    cols = ", ".join(columns)
    only_source = db.execute(f"SELECT {cols} FROM {source} EXCEPT SELECT {cols} FROM {target} ORDER BY 1").fetchall()
    only_target = db.execute(f"SELECT {cols} FROM {target} EXCEPT SELECT {cols} FROM {source} ORDER BY 1").fetchall()
    return only_source, only_target


COLUMNS = ["id", "customer_id", "ordered_at", "status"]


def test_identical_copy_has_no_differences(db):
    db.execute("CREATE TABLE orders_copy AS SELECT * FROM orders")
    assert diff_tables(db, "orders", "orders_copy", COLUMNS) == ([], [])


def test_changed_and_lost_rows_are_reported(db):
    db.execute("CREATE TABLE orders_copy AS SELECT * FROM orders")
    db.execute("UPDATE orders_copy SET status = 'shipped' WHERE id = 105")
    db.execute("DELETE FROM orders_copy WHERE id = 106")

    only_source, only_target = diff_tables(db, "orders", "orders_copy", COLUMNS)

    assert [row[0] for row in only_source] == [105, 106]
    assert only_target == [(105, 1, "2026-03-20", "shipped")]
```

**Watch out for:** `EXCEPT` removes duplicates, so it can't see a row that was
copied *twice*. Always compare `COUNT(*)` of both tables as well.

**Try it:** add a check that `SUM(quantity)` is the same in `order_items` and
a copy of it.

---

## 6. Use Case: Test a Migration

**The task:** a migration adds a `total` column to `orders` and fills it in.
Prove it kept every row and calculated every total correctly.

**SQL used:** `ALTER TABLE`, `UPDATE` with a subquery, `PRAGMA table_info`
(SQLite's way to list columns; PostgreSQL uses `information_schema.columns`).

**How it works:** run the migration on a copy of realistic data, then check
three things: the structure changed as planned, no rows appeared or
disappeared, and the new values are right.

```python
# app/migrations.py
def add_order_totals(db):
    """Migration 002: store each order's total, so reports don't recompute it."""
    with db:
        db.execute("ALTER TABLE orders ADD COLUMN total NUMERIC(10, 2)")
        db.execute("""
            UPDATE orders SET total = (
                SELECT ROUND(SUM(p.price * oi.quantity), 2)
                FROM order_items oi JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = orders.id
            )
        """)
```

```python
# tests/test_migrations.py
from app.migrations import add_order_totals


def test_adds_the_column(db):
    add_order_totals(db)
    columns = [row[1] for row in db.execute("PRAGMA table_info(orders)")]
    assert "total" in columns


def test_keeps_every_row(db):
    before = db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    add_order_totals(db)
    after = db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    assert after == before == 6


def test_calculates_every_total(db):
    add_order_totals(db)
    totals = dict(db.execute("SELECT id, total FROM orders"))
    assert totals == {101: 89.97, 102: 199.0, 103: 90.99, 104: 49.99, 105: 35.5, 106: 248.99}
    assert db.execute("SELECT COUNT(*) FROM orders WHERE total IS NULL").fetchone()[0] == 0
```

**Watch out for:** an order with no items gets `total = NULL`, not `0`. The
last assertion catches that — decide whether the migration should use
`COALESCE(…, 0)`.

**Try it:** write the "down" migration that removes the column
(`ALTER TABLE orders DROP COLUMN total`) and a test that runs up, then down,
and checks the table matches the original with `EXCEPT`.

---

## 7. Use Case: Prove the Constraints Work

**The task:** the database, not just the app, must reject bad data.

**SQL used:** `UNIQUE`, `REFERENCES`, `NOT NULL`, `CHECK`.

**How it works:** try to write each kind of bad row directly and expect the
database's integrity error. If a constraint is missing, the insert succeeds
and the test fails — which is exactly what you want to know.

```python
# tests/test_constraints.py
import sqlite3

import pytest

BAD_WRITES = {
    "duplicate email":
        "INSERT INTO customers (id, name, email, joined_on) VALUES (50, 'X', 'ada@example.com', '2026-01-01')",
    "order for unknown customer":
        "INSERT INTO orders (id, customer_id, ordered_at, status) VALUES (500, 999, '2026-01-01', 'pending')",
    "customer without a name":
        "INSERT INTO customers (id, name, email, joined_on) VALUES (51, NULL, 'x@example.com', '2026-01-01')",
    "same product twice in one order":
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES (101, 1, 5)",
    "delete a customer who has orders":
        "DELETE FROM customers WHERE id = 1",
}


@pytest.mark.parametrize("sql", BAD_WRITES.values(), ids=BAD_WRITES.keys())
def test_database_rejects(db, sql):
    with pytest.raises(sqlite3.IntegrityError):
        db.execute(sql)
```

**Try it:** the practice database has no rule against a quantity of 0. Add a
test for it, watch it fail, then add `CHECK (quantity > 0)` to `shop.sql`.

---

## 8. Use Case: Wait for Asynchronous Writes

**The task:** the app saves some rows later — a background worker, a message
queue. The test must wait for them without a fixed `sleep`.

**SQL used:** a `SELECT` repeated until it finds the row.

**How it works:** **poll** — run the query every few milliseconds, return as
soon as it finds a row, and fail with a clear message at a deadline. A fixed
`sleep(5)` is either too short (a flaky test) or too long (a slow suite).

```python
# tests/test_async_write.py
import sqlite3
import threading
import time
from pathlib import Path


def wait_for_row(db, sql, params=(), timeout=5.0, every=0.05):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        row = db.execute(sql, params).fetchone()
        if row is not None:
            return row
        time.sleep(every)
    raise AssertionError(f"no row after {timeout}s for: {sql} {params}")


def test_worker_marks_order_shipped(tmp_path):
    path = tmp_path / "shop.db"
    setup = sqlite3.connect(path)
    setup.executescript(Path(__file__).with_name("shop.sql").read_text())
    setup.close()

    def worker():                                         # stands in for a background job
        time.sleep(0.3)
        conn = sqlite3.connect(path)
        with conn:
            conn.execute("UPDATE orders SET status = 'shipped' WHERE id = 105")
        conn.close()

    threading.Thread(target=worker).start()

    db = sqlite3.connect(path)
    row = wait_for_row(db, "SELECT status FROM orders WHERE id = ? AND status = 'shipped'", (105,))
    assert row == ("shipped",)
```

**Try it:** make `wait_for_row` report the *last value it saw* in the error
message (for example, "status was still pending"), which makes failures far
easier to debug.

---

## 9. Use Case: Check a Query Uses an Index

**The task:** an important query is fast today because of an index. Make a
test fail if someone drops the index or rewrites the query so it can't use it.

**SQL used:** `CREATE INDEX`, `EXPLAIN QUERY PLAN` (SQLite) or `EXPLAIN`
(PostgreSQL).

**How it works:** ask the database for its plan and check it says `SEARCH …`
with the index name, not `SCAN` (a full read).
It's a cheap guard against the classic "worked in test, timed out in
production" regression.

```python
# tests/test_query_plans.py
def plan(db, sql, params=()):
    return " ".join(row[3] for row in db.execute("EXPLAIN QUERY PLAN " + sql, params))


def test_customer_orders_query_uses_its_index(db):
    db.execute("CREATE INDEX idx_orders_customer_id ON orders (customer_id)")

    p = plan(db, "SELECT id FROM orders WHERE customer_id = ?", (1,))

    assert p.startswith("SEARCH") and "idx_orders_customer_id" in p, p
    # SEARCH = jumps via an index; SCAN = reads every row.
    # "COVERING INDEX" in the plan means the index alone answered the query.


def test_function_on_the_column_disables_the_index(db):
    db.execute("CREATE INDEX idx_customers_email ON customers (email)")

    p = plan(db, "SELECT id FROM customers WHERE LOWER(email) = ?", ("ada@example.com",))

    assert "SCAN customers" in p, p            # reads every row — see Best Practices, section 6
```

**Try it:** fix the second query's slowness by creating an index on
`LOWER(email)`, and flip the test's assertion.

---

## 10. Use Case: Generate Test Data in Bulk

**The task:** performance and pagination tests need thousands of realistic
rows — without a 10,000-line fixture file.

**SQL used:** `INSERT … SELECT`, `WITH RECURSIVE`, `%` (remainder), `CASE`.

**How it works:** generate numbers 1…N with a recursive CTE, then turn each
number into a row. The data is predictable, so you can still work out the
right answers.

```sql
INSERT INTO customers (id, name, email, city, joined_on)
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 1000)
SELECT 1000 + i,
       'Load ' || i,
       'load' || i || '@example.test',                        -- the marker for later clean-up
       CASE i % 3 WHEN 0 THEN 'London' WHEN 1 THEN 'Paris' ELSE 'Berlin' END,
       '2026-01-01'
FROM n;

SELECT city, COUNT(*) FROM customers
WHERE email LIKE '%@example.test'
GROUP BY city ORDER BY city;
-- Berlin 333 · London 333 · Paris 334
```

PostgreSQL also has `generate_series(1, 1000)`, which does the same job in one
call.

**Try it:** generate 5,000 orders spread across these customers and
statuses, then test that a paginated query returns every order exactly once.

---

## 11. Use Case: Run Database Tests in CI

**The task:** run the database tests on every change, against the same
database engine as production.

**How it works:** CI (Continuous Integration) starts a real PostgreSQL as a
**service container** next to the job. Tests read the connection details
from environment variables. With the `psycopg` driver the only code changes
are the connection and the placeholder: `%s` instead of `?`.

```yaml
# .github/workflows/db-tests.yml
name: db-tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: shop
        ports: ['5432:5432']
        options: >-                                    # wait until the database accepts connections
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgresql://postgres:test@localhost:5432/shop
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: python -m pip install pytest "psycopg[binary]"
      - run: psql "$DATABASE_URL" -f tests/shop.sql    # load the schema and seed data
      - run: python -m pytest -v
```

On a laptop, **Testcontainers** (`pip install testcontainers`) starts the same
throwaway PostgreSQL from inside a pytest fixture, so local runs match CI.

---

## 12. How to Organise Database Tests

```text
my-app/
├── app/
│   ├── orders.py
│   └── migrations.py
└── tests/
    ├── shop.sql                  ← schema + small, known seed data
    ├── conftest.py               ← db fixtures: fresh database or rolled-back transaction
    ├── test_orders.py            ← app writes the right rows (use case 2)
    ├── test_constraints.py       ← database rejects bad rows (use case 7)
    ├── test_data_quality.py      ← rules that must return no rows (use case 4)
    ├── test_migrations.py        ← structure, row counts, values (use case 6)
    └── test_query_plans.py       ← important queries keep their indexes (use case 9)
```

- Keep seed data **small and known** — you should be able to work out every
  expected answer by hand.
- Test code queries the database **its own way**, not through the app's data
  layer. Otherwise a bug in that layer can hide itself.
- Never point tests at production. Data-quality checks can run against a
  read-only replica, on a schedule.

---

## 13. Practice Projects {#practice-projects}

| # | Project | SQL practised |
|---|---------|---------------|
| 1 | Database assertions for an API you test: every write endpoint checks its rows | `SELECT`, `JOIN`, transactions |
| 2 | A data-quality suite of 10 rules for a real schema, run nightly | anti-joins, `GROUP BY … HAVING`, `NOT EXISTS` |
| 3 | A table-diff tool that compares two databases and writes a report | `EXCEPT`, counts, sums |
| 4 | Tests for three migrations, including one that renames a column | `ALTER TABLE`, schema queries |
| 5 | A load-data generator plus a pagination test over 10,000 rows | recursive CTEs, `INSERT … SELECT` |
| 6 | **Final project:** a database test suite for one application — fixtures, constraints, quality rules, migrations, plan checks — running against PostgreSQL in CI | everything above |

---

## 14. Skills Checklist

- [ ] I can check the rows an API call created, including related rows.
- [ ] I can prove a failed operation left the database unchanged.
- [ ] I can isolate tests with fresh databases or rolled-back transactions.
- [ ] I can write data-quality rules as "return the bad rows" queries, and prove they can fail.
- [ ] I can diff two tables in both directions and know why counts matter too.
- [ ] I can test a migration's structure, row counts, and values.
- [ ] I can prove each constraint rejects bad data.
- [ ] I can wait for asynchronous writes by polling, not sleeping.
- [ ] I can guard an important query's use of an index.
- [ ] I can generate predictable bulk data in SQL.
- [ ] I can run database tests against a real PostgreSQL in CI.

**Next:** read [SQL Best Practices](/docs/fundamentals/sql/coding-best-practices),
then the [complete guide](/docs/sdet-skills/sql/sql-guide)'s interview questions.
