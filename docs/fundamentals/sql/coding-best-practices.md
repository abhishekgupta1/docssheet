---
title: "SQL Best Practices"
description: "Habits that make SQL easier to read, faster, and safe to run — formatting, naming, NULLs, joins, index-friendly filters, safe changes, schema design, migrations, security, testing, and a pre-merge checklist."
sidebar_position: 2
level: intermediate
tags: [sql, fundamentals, best-practices]
image: /img/social/sql-best-practices.png
---

# SQL Best Practices

This page lists good habits for writing SQL and designing tables.
These habits make queries easier to read, faster, and safe to run against
real data. They apply to everyone: SDET, SDE, and SRE.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example, where it helps. Examples run on the
  [practice database](/cheatsheets/sql#practice-database).

:::tip How to use this page

Read it once after you finish Part 2 of the [SQL cheat sheet](/cheatsheets/sql),
then use [the checklist at the end](#13-short-checklist-before-you-merge) before
merging any query or migration. Pick two or three habits to practise each week.

:::

---

## Contents

1. [Formatting](#1-formatting)
2. [Naming](#2-naming)
3. [Selecting Columns](#3-selecting-columns)
4. [NULLs](#4-nulls)
5. [Joins](#5-joins)
6. [Index-Friendly Filters](#6-index-friendly-filters)
7. [Performance](#7-performance)
8. [Changing Data Safely](#8-changing-data-safely)
9. [Schema Design](#9-schema-design)
10. [Migrations](#10-migrations)
11. [Security](#11-security)
12. [Testing SQL](#12-testing-sql)
13. [Short Checklist Before You Merge](#13-short-checklist-before-you-merge)

---

## 1. Formatting

**In short:** one clause per line, keywords in capitals, and the query reads
top to bottom.

```sql
-- Hard to read
select c.name,count(*) from customers c join orders o on o.customer_id=c.id where o.status<>'cancelled' group by c.name order by 2 desc;

-- Easy to read
SELECT c.name, COUNT(*) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status <> 'cancelled'
GROUP BY c.name
ORDER BY orders DESC;
```

- **Do** give every computed column a name with `AS`.
  **Why:** `ORDER BY orders` explains itself; `ORDER BY 2` breaks when someone
  adds a column.
- **Do** use a CTE for each step of a long query instead of nesting
  subqueries three deep.
  **Why:** each step has a name and can be run on its own while debugging.
- **Do** use a formatter (SQLFluff, pgFormatter, or your editor's) so the team
  doesn't argue about spaces.

---

## 2. Naming

**In short:** predictable names mean nobody has to look them up.

| Thing | Style | Example |
|---|---|---|
| Table | `snake_case`, plural (pick one rule and keep it) | `customers`, `order_items` |
| Column | `snake_case`, singular | `email`, `ordered_at` |
| Primary key | `id` | `customers.id` |
| Foreign key | `<table singular>_id` | `orders.customer_id` |
| Boolean | a yes/no question | `is_active`, `has_paid` |
| Timestamp | ends in `_at`; dates end in `_on` | `created_at`, `joined_on` |
| Index | `idx_<table>_<columns>` | `idx_orders_customer_id` |

- **Don't** use reserved words as names (`order`, `user`, `group`).
  **Why:** you'd have to quote them everywhere: `"order"`.
- **Don't** use spaces or capitals in names.
  **Why:** PostgreSQL folds unquoted names to lower case, so `CustomerName`
  becomes `customername` unless you quote it every time.

---

## 3. Selecting Columns

**In short:** ask only for what you need.

- **Do** list columns instead of `SELECT *` in application code, views, and
  reports.
  **Why:** `*` sends columns you don't use, breaks when a column is added or
  reordered, and stops the database using "index-only" scans.
- **Do** use `SELECT *` freely when *exploring* data by hand.
- **Do** use `EXISTS` for "is there any?", not `COUNT(*) > 0`.
  **Why:** `EXISTS` stops at the first match; `COUNT` counts everything.

```sql
SELECT EXISTS (SELECT 1 FROM orders WHERE customer_id = 1 AND status = 'pending') AS has_pending;
-- true
```

---

## 4. NULLs

**In short:** decide what "missing" means for every column, and make the
database enforce it.

- **Do** mark columns `NOT NULL` unless "unknown" is a real, meaningful state.
  **Why:** every nullable column needs extra care in every query forever.
- **Do** compare with `IS NULL` / `IS NOT NULL`, never `= NULL`.
- **Do** replace `NOT IN (subquery)` with `NOT EXISTS`.
  **Why:** if the subquery returns a single `NULL`, `NOT IN` matches nothing.

```sql
-- Customers with no orders, safe even if customer_id could be NULL
SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
-- Ed
```

- **Do** use `COALESCE` for display defaults, not to hide bad data:
  `COALESCE(city, 'unknown')` in a report is fine; storing `'unknown'` instead
  of `NULL` makes counts wrong.

---

## 5. Joins

**In short:** always write the join condition in `ON`, and check the row
count after every join.

- **Do** use explicit `JOIN … ON`, never commas in `FROM`.
  **Why:** `FROM a, b WHERE …` turns into a huge `CROSS JOIN` the moment
  someone forgets the `WHERE`.
- **Do** know how many rows each join can produce. Joining a customer to their
  orders multiplies rows; summing a customer column afterwards double-counts.

```sql
-- Wrong: counts item rows, not orders (Ada has 3 orders but 4 item rows)
SELECT c.name, COUNT(*) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE c.id = 1
GROUP BY c.name;
-- Ada 4

-- Right: count distinct orders (or aggregate items in a CTE first)
SELECT c.name, COUNT(DISTINCT o.id) AS orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE c.id = 1
GROUP BY c.name;
-- Ada 3
```

- **Do** put filters for the optional side of a `LEFT JOIN` in `ON`, not
  `WHERE`.

---

## 6. Index-Friendly Filters

**In short:** write `WHERE` so the database can use an index — leave the
column "bare" on one side.

| Slow (index can't be used) | Fast (index can be used) |
|---|---|
| `WHERE EXTRACT(YEAR FROM ordered_at) = 2026` | `WHERE ordered_at >= '2026-01-01' AND ordered_at < '2027-01-01'` |
| `WHERE LOWER(email) = 'ada@example.com'` | Index on `LOWER(email)`, or store emails lower-case |
| `WHERE price * 1.2 > 60` | `WHERE price > 50` |
| `WHERE name LIKE '%board'` | `WHERE name LIKE 'Key%'` (or a full-text / trigram index) |
| `WHERE id::text = '42'` | `WHERE id = 42` (match the column's type) |

**Why:** an index is sorted by the column's value. Wrap the column in a
function and the database has to compute it for every row.

---

## 7. Performance

**In short:** measure with `EXPLAIN ANALYZE`, fix the biggest cost, measure
again.

- **Do** index foreign keys and the columns in your most common `WHERE`,
  `JOIN`, and `ORDER BY`.
- **Do** use keyset pagination (`WHERE id > :last_id ORDER BY id LIMIT 50`)
  for deep pages, not large `OFFSET`s.
- **Do** avoid the **N+1 problem**: one query for a list, then one more query
  per item. Fetch the items with one `JOIN` or `WHERE id IN (…)`.
  **Why:** 1 query of 10 ms beats 101 queries of 2 ms each.
- **Do** batch big writes: insert many rows per statement; update or delete in
  chunks of a few thousand.
  **Why:** one huge transaction holds locks for a long time and blocks others.
- **Don't** add an index without checking the plan improves — every index
  slows every write.

---

## 8. Changing Data Safely

**In short:** check first, change inside a transaction, confirm, then commit.

```sql
-- 1. See exactly what will change
SELECT id, status FROM orders WHERE status = 'pending' AND ordered_at < '2026-03-21';
-- 105 pending

-- 2. Change it inside a transaction, and look at what changed
BEGIN;
UPDATE orders SET status = 'cancelled'
WHERE status = 'pending' AND ordered_at < '2026-03-21'
RETURNING id, status;
-- 105 cancelled   ← expected 1 row, got 1 row

-- 3. Only now make it permanent (or ROLLBACK if the count surprised you)
COMMIT;
```

- **Do** write the `WHERE` before the `SET` when typing an `UPDATE` by hand.
- **Do** take a backup or snapshot before large manual changes in production.
- **Do** prefer "soft delete" (`deleted_at` timestamp) for data people may want
  back, and hard delete for data you're obliged to remove.
- **Don't** run ad-hoc changes on production from your laptop without a second
  person reviewing the query.

---

## 9. Schema Design

**In short:** let the database enforce your rules — constraints are free
tests that run on every write.

- **Do** give every table a primary key.
- **Do** add foreign keys, `NOT NULL`, `UNIQUE`, and `CHECK` constraints.
  **Why:** application bugs come and go; constraints stop bad data at the door.
- **Do** store money as `NUMERIC(p, s)` or integer cents — never `REAL`/`FLOAT`.
- **Do** store moments in time as `TIMESTAMPTZ` in UTC.
- **Do** normalise first (each fact stored once); denormalise only for a
  measured reason, such as a reporting table.
- **Don't** store lists in one column (`'Keyboard,Mouse'`) — use a linking
  table like `order_items`.

```sql
CREATE TABLE payments (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders (id),
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency   CHAR(3) NOT NULL DEFAULT 'EUR',
  paid_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id)                                -- one payment per order
);
```

---

## 10. Migrations

**In short:** every schema change is a versioned, reviewed script — never a
hand edit on a live database.

- **Do** use a migration tool (Flyway, Liquibase, Alembic, Rails/Django
  migrations) and commit the scripts with the code that needs them.
- **Do** make changes in backwards-compatible steps when the app runs on
  several servers ("expand, then contract"):
  1. add the new column (nullable), 2. deploy code that writes both,
  3. backfill old rows, 4. switch reads, 5. drop the old column later.
- **Do** create indexes on big tables without blocking writes:
  `CREATE INDEX CONCURRENTLY …` (PostgreSQL).
- **Don't** edit a migration that has already run anywhere — write a new one.

---

## 11. Security

**In short:** never trust input, and give each user only the access it needs.

- **Do** use parameterised queries in code — never build SQL by joining
  strings (see [SQL from code](/cheatsheets/sql#sql-from-code)).
- **Do** give applications their own database users with only the rights they
  need ("least privilege"). A reporting tool gets `SELECT`, not `DROP`.
- **Do** keep credentials in a secrets manager or environment variables, not in
  scripts or the repository.
- **Do** mask or remove personal data before copying production data into test
  environments.
- **Don't** log full queries with their values if they can contain personal
  data or secrets.

---

## 12. Testing SQL

**In short:** queries are code — test them against a real database with
known data.

- **Do** run tests against the same database engine as production (a
  PostgreSQL container, not SQLite pretending to be PostgreSQL).
- **Do** seed small, known data where you can work out the right answer by
  hand — like the practice database.
- **Do** test the edge cases: no rows, NULLs, duplicates, ties in `ORDER BY`,
  boundaries of date ranges.
- **Do** check row counts before and after migrations and data fixes.

See [SQL for SDET](/docs/role-guides/sdet/sql-for-sdet) for ready-to-use test
patterns.

---

## 13. Short Checklist Before You Merge

- [ ] Every column in the result is listed and named; no `SELECT *` in app code.
- [ ] Every join has an `ON` condition, and the row count is what you expect.
- [ ] `NULL` is handled: `IS NULL`, `NOT EXISTS` instead of `NOT IN`, `COALESCE` only for display.
- [ ] Filters leave the indexed column bare; `EXPLAIN ANALYZE` looks sensible on realistic data.
- [ ] `ORDER BY` is present wherever the order matters.
- [ ] Changes run in a transaction, and `RETURNING` or a `SELECT` confirmed the row count.
- [ ] New tables have a primary key, foreign keys, and `NOT NULL` where it applies.
- [ ] Schema changes are in a migration script, backwards-compatible.
- [ ] Values are passed as parameters, never glued into the SQL string.
- [ ] Tests cover empty results, NULLs, and duplicates.
