---
title: "SQL: The Complete Guide"
description: "End-to-end reference for SQL — DML/DDL, joins, aggregates, subqueries vs CTEs vs window functions, indexes, transactions, and interview-ready Q&A."
sidebar_position: 1
tags: [sql, sdet, database]
---

# SQL — The Complete Guide

A single-read, end-to-end reference for SQL: enough to set up and validate
test data against a database, write backend assertions in an API/E2E test,
or walk into an SDET interview. Organized as a lookup you can also read
top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/sql">📋 Quick reference: SQL →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-sql-title mm-sql-desc">
<title id="mm-sql-title">SQL's four sub-languages</title>
<desc id="mm-sql-desc">SQL splits into four sub-languages around one core: DDL for defining schema objects, DML for manipulating data, DCL for controlling access, and TCL for controlling transactions.</desc>
<defs>
  <marker id="mm-sql-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n5" x="305" y="115" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="390" y="145" text-anchor="middle">SQL</text>
<text class="mm-node-sub" x="390" y="162" text-anchor="middle">relational query language</text>

<path class="mm-arrow" d="M330,130 L210,60" marker-end="url(#mm-sql-arrow)"/>
<path class="mm-arrow" d="M450,130 L585,60" marker-end="url(#mm-sql-arrow)"/>
<path class="mm-arrow" d="M330,170 L210,235" marker-end="url(#mm-sql-arrow)"/>
<path class="mm-arrow" d="M450,170 L585,235" marker-end="url(#mm-sql-arrow)"/>

<rect class="mm-n3" x="20" y="20" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="115" y="50" text-anchor="middle">DDL</text>
<text class="mm-node-sub" x="115" y="67" text-anchor="middle">CREATE, ALTER, DROP</text>

<rect class="mm-n2" x="590" y="20" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="685" y="50" text-anchor="middle">DML</text>
<text class="mm-node-sub" x="685" y="67" text-anchor="middle">SELECT, INSERT, UPDATE</text>

<rect class="mm-n4" x="20" y="215" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="115" y="245" text-anchor="middle">DCL</text>
<text class="mm-node-sub" x="115" y="262" text-anchor="middle">GRANT, REVOKE</text>

<rect class="mm-n6" x="590" y="215" width="190" height="70" rx="10"/>
<text class="mm-node-title" x="685" y="245" text-anchor="middle">TCL</text>
<text class="mm-node-sub" x="685" y="262" text-anchor="middle">COMMIT, ROLLBACK</text>
</svg>

<p class="mental-model__caption">SQL isn't one language but four working together: DDL shapes the schema itself, DML reads and writes the rows inside it, DCL controls who can touch it, and TCL wraps changes in transactions you can commit or roll back — for an SDET, DML and TCL are the daily tools, DDL mostly for throwaway test schemas.</p>
</div>

## 1. What SQL Is, in Practical Terms

SQL (Structured Query Language) is the standard language for querying and
manipulating **relational databases** — tables of rows and columns related
to each other via keys. Every major relational database (PostgreSQL, MySQL,
SQL Server, Oracle, SQLite) implements the same core language with vendor-
specific extensions; the fundamentals below are portable across all of
them, with dialect notes called out where it matters.

SQL splits into sub-languages:

| Sub-language | Stands for | Commands |
|---|---|---|
| **DDL** | Data Definition Language | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| **DML** | Data Manipulation Language | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** | Data Control Language | `GRANT`, `REVOKE` |
| **TCL** | Transaction Control Language | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

For an SDET, DML (especially `SELECT`) and transaction control are the
day-to-day workhorses; DDL shows up mainly when standing up throwaway test
schemas.

---

## 2. DDL — Defining Structure

```sql
CREATE TABLE customers (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    status      VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    total       NUMERIC(10, 2) NOT NULL,
    placed_at   TIMESTAMP DEFAULT NOW()
);

ALTER TABLE customers ADD COLUMN phone VARCHAR(20);
ALTER TABLE orders    ALTER COLUMN total SET DEFAULT 0;

DROP TABLE orders;        -- removes table + all data + structure
TRUNCATE TABLE orders;    -- removes all rows, keeps structure — fast, resets identity counters
```

- **`REFERENCES`** declares a **foreign key** — enforces that
  `orders.customer_id` must match an existing `customers.id`, protecting
  referential integrity. Attempting to insert an order for a nonexistent
  customer fails at the database level.
- **`TRUNCATE` vs `DELETE FROM table`**: `TRUNCATE` is typically faster (it
  deallocates pages rather than logging row-by-row deletes) and resets
  auto-increment counters, but can't be filtered with `WHERE` and, on some
  databases, can't be rolled back mid-transaction as granularly.

---

## 3. Core DML

### `INSERT`

```sql
INSERT INTO customers (email, status) VALUES ('ada@example.com', 'active');

INSERT INTO customers (email, status) VALUES
    ('grace@example.com', 'active'),
    ('alan@example.com', 'pending');   -- bulk insert, one round trip

INSERT INTO customers_archive SELECT * FROM customers WHERE status = 'inactive';  -- insert from select
```

### `UPDATE`

```sql
UPDATE orders SET total = total * 0.9 WHERE customer_id = 42;

-- ALWAYS include a WHERE clause on UPDATE/DELETE unless you truly mean every row
UPDATE customers SET status = 'inactive'
WHERE created_at < NOW() - INTERVAL '1 year';
```

### `DELETE`

```sql
DELETE FROM orders WHERE id = 101;
DELETE FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE status = 'inactive');
```

### `SELECT` — full clause order (as written vs. as logically evaluated)

```sql
SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS lifetime_value
FROM orders
WHERE placed_at >= '2026-01-01'
GROUP BY customer_id
HAVING COUNT(*) > 3
ORDER BY lifetime_value DESC
LIMIT 10;
```

| Written order | Logical evaluation order |
|---|---|
| `SELECT` | `FROM` / `JOIN` |
| `FROM` | `WHERE` |
| `WHERE` | `GROUP BY` |
| `GROUP BY` | `HAVING` |
| `HAVING` | `SELECT` |
| `ORDER BY` | `ORDER BY` |
| `LIMIT` | `LIMIT` |

This mismatch is a classic interview question and explains real bugs: you
**can't** reference a `SELECT`-aliased column in `WHERE` (WHERE evaluates
before SELECT), but you **can** in `ORDER BY` or `HAVING` (they evaluate
after).

---

## 4. Joins

Joins combine rows from two or more tables based on a related column.

```sql
-- Sample data
-- customers: id=1 Ada, id=2 Grace, id=3 Alan (no orders)
-- orders: id=101 customer_id=1, id=102 customer_id=1, id=103 customer_id=2, id=104 customer_id=99 (orphaned)
```

| Join type | Returns |
|---|---|
| **INNER JOIN** | Only rows with a match in both tables |
| **LEFT JOIN** | All rows from the left table, matched rows from the right (NULLs where no match) |
| **RIGHT JOIN** | All rows from the right table, matched rows from the left (NULLs where no match) |
| **FULL OUTER JOIN** | All rows from both tables, NULLs on whichever side has no match |
| **CROSS JOIN** | Cartesian product — every row of A paired with every row of B |
| **SELF JOIN** | A table joined to itself (e.g., employee → manager, both in the same `employees` table) |

```sql
-- INNER JOIN — Ada and Grace's orders only; Alan (no orders) excluded
SELECT c.email, o.id AS order_id, o.total
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;

-- LEFT JOIN — every customer, Alan's row shows NULL order columns
SELECT c.email, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;

-- Find customers with NO orders at all — classic LEFT JOIN + IS NULL pattern
SELECT c.email
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- FULL OUTER JOIN — everything from both sides, including the orphaned order (customer_id=99)
SELECT c.email, o.id AS order_id
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;

-- SELF JOIN — employees and their managers, same table
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

**MySQL note:** MySQL doesn't support `FULL OUTER JOIN` directly — emulate
it with `LEFT JOIN UNION RIGHT JOIN` (or `UNION ALL` + dedup logic).

---

## 5. Aggregate Functions, GROUP BY, HAVING

| Function | Purpose |
|---|---|
| `COUNT(*)` / `COUNT(col)` | Row count / non-NULL value count |
| `SUM(col)` | Total |
| `AVG(col)` | Mean |
| `MIN(col)` / `MAX(col)` | Extremes |
| `GROUP_CONCAT` (MySQL) / `STRING_AGG` (Postgres/SQL Server) | Concatenate grouped values into one string |

```sql
SELECT customer_id, COUNT(*) AS order_count, AVG(total) AS avg_order_value
FROM orders
GROUP BY customer_id;

-- WHERE filters rows BEFORE grouping; HAVING filters groups AFTER aggregation
SELECT customer_id, SUM(total) AS lifetime_value
FROM orders
WHERE placed_at >= '2026-01-01'      -- row-level filter, applied first
GROUP BY customer_id
HAVING SUM(total) > 1000;             -- group-level filter, applied after SUM()
```

**Rule:** every non-aggregated column in `SELECT` must appear in `GROUP BY`
(strict SQL databases like Postgres enforce this; MySQL historically
allowed it but it's undefined which row's value you get — don't rely on it).

---

## 6. Subqueries vs. CTEs vs. Window Functions

### Subqueries

A query nested inside another, evaluated first (or per-row, if correlated).

```sql
-- Scalar subquery
SELECT email FROM customers
WHERE id = (SELECT customer_id FROM orders ORDER BY total DESC LIMIT 1);

-- Correlated subquery — re-evaluated once per outer row, can be slow at scale
SELECT c.email,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
FROM customers c;

-- IN subquery
SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 500);
```

### CTEs (Common Table Expressions)

`WITH` clauses name a subquery upfront — readable, and reusable multiple
times within the same statement (a plain subquery would need repeating).

```sql
WITH high_value_orders AS (
    SELECT customer_id, total
    FROM orders
    WHERE total > 500
)
SELECT c.email, COUNT(*) AS big_order_count
FROM customers c
JOIN high_value_orders h ON h.customer_id = c.id
GROUP BY c.email;
```

**Recursive CTE** (hierarchies — org charts, category trees):

```sql
WITH RECURSIVE org_chart AS (
    SELECT id, name, manager_id, 1 AS level
    FROM employees WHERE manager_id IS NULL       -- anchor: the root(s)
    UNION ALL
    SELECT e.id, e.name, e.manager_id, oc.level + 1
    FROM employees e
    JOIN org_chart oc ON e.manager_id = oc.id      -- recursive step
)
SELECT * FROM org_chart ORDER BY level;
```

### Window functions

Perform a calculation **across a set of rows related to the current row**
without collapsing them into a single group-by row — the key difference
from `GROUP BY` aggregation, which *does* collapse rows.

```sql
SELECT
    customer_id,
    id AS order_id,
    total,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY placed_at) AS order_sequence,
    RANK()       OVER (ORDER BY total DESC)                          AS overall_rank,
    SUM(total)   OVER (PARTITION BY customer_id)                     AS customer_lifetime_total,
    LAG(total)   OVER (PARTITION BY customer_id ORDER BY placed_at)  AS prev_order_total
FROM orders;
```

| Function | Behavior |
|---|---|
| `ROW_NUMBER()` | Unique sequential number per partition, no ties |
| `RANK()` | Same rank for ties, gaps after ties (1,2,2,4) |
| `DENSE_RANK()` | Same rank for ties, no gaps (1,2,2,3) |
| `LAG()` / `LEAD()` | Value from the previous/next row in the ordered partition |
| `SUM()/AVG()/COUNT() OVER (...)` | Running/partitioned aggregate without collapsing rows |

**When to use which:**
- **Subquery** — one-off, simple lookups, not reused elsewhere in the query.
- **CTE** — improves readability for multi-step logic, or when the same
  derived result is referenced more than once in the query.
- **Window function** — you need per-row detail *and* an aggregate
  side-by-side (e.g., "this order's total, next to the customer's running
  total") — a plain `GROUP BY` can't do this because it collapses rows.

---

## 7. Indexes and Query Performance Basics

An **index** is a separate, ordered data structure (typically a B-tree)
that lets the database find matching rows without scanning the entire
table — the single-column-lookup equivalent of a book's index vs. reading
every page.

```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE UNIQUE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, placed_at);  -- composite index

EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42;
```

`EXPLAIN` (or `EXPLAIN ANALYZE` for actual runtime, not just the plan)
shows whether the database used an **index scan** (fast, targeted) or a
**sequential/full table scan** (reads every row — fine for small tables,
expensive at scale).

| Trade-off | Detail |
|---|---|
| **Read speed** | Indexes make `WHERE`/`JOIN`/`ORDER BY` on the indexed column(s) much faster |
| **Write cost** | Every `INSERT`/`UPDATE`/`DELETE` must also update every index on that table — over-indexing slows writes |
| **Storage** | Indexes take disk space, sometimes comparable to the table itself |
| **Column order in composite indexes matters** | An index on `(customer_id, placed_at)` speeds queries filtering by `customer_id` alone or by both columns, but does **not** help a query filtering by `placed_at` alone — leftmost-prefix rule |

**Practical rule:** index columns used in `WHERE`, `JOIN ON`, and
`ORDER BY` on large/frequently-queried tables; don't blindly index every
column — each index has a real write-cost tax.

---

## 8. Transactions and ACID

A **transaction** groups multiple statements into one all-or-nothing unit.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;   -- both changes persist together
-- or: ROLLBACK;  -- undo both if something went wrong mid-transaction
```

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SAVEPOINT before_credit;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
ROLLBACK TO before_credit;   -- undo just the credit, keep the debit
COMMIT;
```

### ACID properties

| Property | Guarantee |
|---|---|
| **Atomicity** | All statements in a transaction succeed, or none do — no partial writes |
| **Consistency** | A transaction moves the database from one valid state to another (constraints, foreign keys always hold) |
| **Isolation** | Concurrent transactions don't see each other's uncommitted intermediate state (degree depends on isolation level) |
| **Durability** | Once committed, data survives a crash (written to disk/WAL) |

### Isolation levels (weakest → strongest, more isolation = more locking cost)

| Level | Prevents |
|---|---|
| `READ UNCOMMITTED` | Nothing — dirty reads possible (rarely used in practice) |
| `READ COMMITTED` | Dirty reads (default in Postgres, SQL Server) |
| `REPEATABLE READ` | Dirty + non-repeatable reads (default in MySQL/InnoDB) |
| `SERIALIZABLE` | Everything, including phantom reads — behaves as if transactions ran one at a time |

For test data setup, wrapping each test in a transaction and rolling it
back at teardown is a common, fast isolation pattern — no need to actually
delete rows between tests.

---

## 9. How SDETs Actually Use SQL

SQL shows up constantly in day-to-day testing work, distinct from
application-level assertions:

- **Test data setup/teardown** — seed known fixture rows before a test,
  clean them up after (`DELETE ... WHERE test_run_id = ?`, or wrap the test
  in a transaction and `ROLLBACK`).
  ```sql
  INSERT INTO customers (id, email, status) VALUES (99001, 'qa-fixture@example.com', 'active');
  -- ... run the test against the API ...
  DELETE FROM customers WHERE id = 99001;
  ```
- **Backend/state validation in API and E2E tests** — after calling
  `POST /orders`, query the database directly to confirm the row was
  actually persisted correctly, not just that the API returned 201.
  ```sql
  SELECT status, total FROM orders WHERE id = :createdOrderId;
  ```
- **Verifying side effects** the API response doesn't expose — an audit
  log row, a queued outbox event, a denormalized cache table.
- **Diagnosing flaky/failing tests** — querying application logs or
  event tables stored in SQL to reconstruct what actually happened during
  a failed run.
- **Data-driven test generation** — pulling a representative sample of
  real (anonymized) production-shaped rows as test fixtures instead of
  hand-writing every edge case.
- **Cross-checking migrations** — before/after row counts, checksums, or
  `EXCEPT`/`MINUS` queries to diff two tables and confirm a migration
  didn't silently drop or duplicate rows.
  ```sql
  SELECT * FROM orders_old
  EXCEPT
  SELECT * FROM orders_new;   -- rows present in old but missing from new
  ```

In Java (Rest Assured-style) or Python test suites, this is typically
wired through a lightweight JDBC/DB-API connection in a test fixture/setup
hook, kept clearly separate from the application's own data access layer
so a bug in app code can't mask itself by using the same faulty query path
the test uses to verify it.

---

## 10. Interview-Ready Q&A

**Q: What's the difference between `WHERE` and `HAVING`?**
A: `WHERE` filters individual rows before any grouping/aggregation happens;
`HAVING` filters groups after `GROUP BY` and aggregate functions have been
applied. You can't use an aggregate function like `SUM()` in a `WHERE`
clause because aggregation hasn't happened yet at that point in query
evaluation — that's exactly what `HAVING` is for.

**Q: Explain the difference between `INNER JOIN` and `LEFT JOIN`, with an
example of when you'd specifically need `LEFT JOIN`.**
A: `INNER JOIN` returns only rows with a match in both tables; `LEFT JOIN`
returns all rows from the left table regardless of a match, filling in
NULLs for right-table columns when there's no match. You need `LEFT JOIN`
whenever you want to find records that *don't* have a related row — e.g.,
"customers with no orders" — implemented as a `LEFT JOIN` from customers to
orders followed by `WHERE orders.id IS NULL`; an `INNER JOIN` would exclude
exactly the rows you're trying to find.

**Q: When would you use a window function instead of `GROUP BY`?**
A: `GROUP BY` collapses multiple rows into one row per group, losing
row-level detail. A window function computes an aggregate or ranking
across a partition of rows *without* collapsing them, so you keep every
original row and get the aggregate alongside it — e.g., showing each
individual order next to that customer's running total, or ranking each
order within its customer's order history. Whenever you need per-row
detail and a group-level calculation in the same result set, that's a
window function, not `GROUP BY`.

**Q: What is a CTE, and how is it different from a subquery?**
A: A CTE (`WITH name AS (...)`) names a subquery upfront so it can be
referenced by that name later in the statement, improving readability for
multi-step logic and allowing the same derived result to be reused multiple
times without repeating the subquery. A plain (non-CTE) subquery is
typically inline and single-use; if you need the same derived set twice,
a CTE avoids duplicating the logic. CTEs also support recursion
(`WITH RECURSIVE`), which plain subqueries can't do — used for hierarchical
data like org charts or category trees.

**Q: What are the four ACID properties and why do they matter for a
system you're testing?**
A: Atomicity (all-or-nothing execution), Consistency (valid state to valid
state, constraints always hold), Isolation (concurrent transactions don't
see each other's uncommitted changes), and Durability (committed data
survives a crash). As a tester, these are exactly what you're implicitly
verifying in concurrency and failure-injection tests — e.g., killing a
process mid-transaction should never leave a partial write (atomicity), and
two simultaneous requests modifying the same row shouldn't silently
overwrite each other's changes in unexpected ways (isolation).

**Q: How would you use SQL to verify that an API call actually persisted
data correctly, beyond just checking the HTTP response code?**
A: After calling the API (e.g., `POST /orders` returning 201), query the
underlying table directly for the created row and assert its actual
persisted values match what was sent — this catches bugs where the API
returns a success status but silently drops a field, applies wrong
defaults, or fails to write a related row (like an audit log or outbox
event) that the HTTP response alone wouldn't reveal.

**Q: Why might adding an index make writes slower, and how do you decide
which columns to index?**
A: Every index is a separate data structure that must be updated on every
`INSERT`/`UPDATE`/`DELETE` that touches an indexed column, so more indexes
means more write-side work and more storage, even though reads get faster.
The practical rule is to index columns that are actually used in `WHERE`
clauses, `JOIN` conditions, and `ORDER BY` on tables that are large or
queried frequently, and avoid indexing columns just because they exist —
verify with `EXPLAIN ANALYZE` that a query is actually doing a slow
sequential scan before adding an index to fix it.

**Q: How do you keep test data isolated between test runs without manually
deleting rows after every test?**
A: A common pattern is wrapping each test in a database transaction —
`BEGIN` before the test, `ROLLBACK` after, regardless of pass/fail — so any
inserts/updates the test made are automatically undone without explicit
cleanup logic, and tests can run in any order without leftover state
polluting each other. This only works cleanly when the code under test
doesn't itself commit/manage transactions in a way that conflicts with the
outer test transaction, which is worth confirming before relying on it.

---

## 11. One-Line Summary

**SQL for an SDET isn't about writing the application's queries — it's
about independently verifying what actually landed in the database, using
joins, aggregates, and transactions correctly enough to trust your own
assertions as much as the code under test.**
