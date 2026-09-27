---
title: "SQL Cheat Sheet"
description: "A beginner-to-advanced reference for SQL — querying, joins, grouping, changing data, CTEs, window functions, indexes, transactions, and query plans."
level: beginner
tags: [sql, sdet, sde, sre, cheat-sheet]
hide_table_of_contents: true
image: /img/social/sql.png
---

# SQL cheatsheet

Learn SQL step by step, from your first `SELECT` to reading query plans. Each
section has three parts:

- **In short** — the idea in one sentence.
- **Example** — queries on one small practice database, with the result in a comment.
- **Try it** — a tiny exercise to check you understood.

Want the longer story behind a topic? The [complete guide](/docs/sdet-skills/sql/sql-guide)
walks through it in more depth.

<a class="topic-crosslink" href="/docs/sdet-skills/sql/sql-guide">📖 Full guide: SQL →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="SQL learning sections">
  <a class="button button--primary" href="/docs/learning-path/sql/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/sql/sql-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/sql/coding-best-practices">Best Practices</a>
  <a class="button button--primary" href="/docs/role-guides/sdet/sql-for-sdet">SQL for SDET</a>
</nav>

:::tip How to use this page

First create the [practice database](#practice-database) — every example runs
against it. Then go through **Part 1** in order; each section builds on the one
before. Move to **Part 2** once you're comfortable, and **Part 3** when you
start caring about speed and safety. Type the queries yourself instead of
copying them.

The examples use **PostgreSQL**, the most widely used free database. Almost
everything also runs on SQLite and MySQL. Where a section is
PostgreSQL-only, it says so, and the [Quick Reference](/docs/fundamentals/sql/sql-quick-reference#dialects)
shows the other databases' spelling.

:::

## Contents {#contents}

**[Practice database](#practice-database)**

**[Part 1 — Beginner](#part-1)**:
[What SQL is](#what-is-sql) ·
[Choosing rows](#select-where) ·
[Sorting & limiting](#order-limit) ·
[Text, numbers & NULL](#text-numbers-null) ·
[Counting & grouping](#group-by) ·
[Joining tables](#joins) ·
[Changing data](#changing-data) ·
[Creating tables](#create-table)

**[Part 2 — Core](#part-2)**:
[Subqueries](#subqueries) ·
[CTEs](#ctes) ·
[CASE](#case) ·
[Window functions](#window-functions) ·
[Combining results](#set-operations) ·
[Dates & times](#dates) ·
[Indexes](#indexes) ·
[Transactions](#transactions) ·
[Views](#views) ·
[Insert or update (upsert)](#upsert) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Reading query plans](#explain) ·
[Isolation & locking](#isolation) ·
[Recursive queries](#recursive) ·
[JSON columns](#json) ·
[Designing tables](#normalisation) ·
[SQL from code](#sql-from-code) ·
[Words you'll meet](#glossary)

## Practice database {#practice-database}

**In short:** a tiny shop — customers place orders, and each order has items
(products and quantities). Run this once, then try every example on it.

```sql
-- Practice database: a tiny shop
CREATE TABLE customers (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  email     TEXT UNIQUE,
  city      TEXT,
  joined_on DATE NOT NULL
);

CREATE TABLE products (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  category TEXT NOT NULL,
  price    NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers (id),
  ordered_at  DATE NOT NULL,
  status      TEXT NOT NULL
);

CREATE TABLE order_items (
  order_id   INTEGER NOT NULL REFERENCES orders (id),
  product_id INTEGER NOT NULL REFERENCES products (id),
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers (id, name, email, city, joined_on) VALUES
  (1, 'Ada', 'ada@example.com', 'London', '2024-01-15'),
  (2, 'Bo',  'bo@example.com',  'Paris',  '2024-03-02'),
  (3, 'Cy',  'cy@example.com',  'London', '2025-06-20'),
  (4, 'Di',  NULL,              'Berlin', '2025-11-05'),
  (5, 'Ed',  'ed@example.com',  NULL,     '2026-02-10');

INSERT INTO products (id, name, category, price) VALUES
  (1, 'Keyboard', 'electronics', 49.99),
  (2, 'Mouse',    'electronics', 19.99),
  (3, 'Desk',     'furniture',   199.00),
  (4, 'Lamp',     'furniture',   35.50),
  (5, 'Notebook', 'stationery',  3.25);

INSERT INTO orders (id, customer_id, ordered_at, status) VALUES
  (101, 1, '2026-01-05', 'delivered'),
  (102, 1, '2026-02-11', 'delivered'),
  (103, 2, '2026-02-14', 'shipped'),
  (104, 3, '2026-03-01', 'cancelled'),
  (105, 1, '2026-03-20', 'pending'),
  (106, 4, '2026-03-22', 'delivered');

INSERT INTO order_items (order_id, product_id, quantity) VALUES
  (101, 1, 1), (101, 2, 2),
  (102, 3, 1),
  (103, 2, 1), (103, 4, 2),
  (104, 1, 1),
  (105, 4, 1),
  (106, 3, 1), (106, 1, 1);
```

**Where to run it:** install PostgreSQL and open `psql`; or run `sqlite3 shop.db`
(already installed on macOS and most Linux); or paste it into an online
playground such as DB Fiddle. Worth noticing: Di has no email, Ed has no city
and no orders, and nobody has ever bought a Notebook. Those gaps appear in
many examples.

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. What SQL is {#what-is-sql}

**In short:** SQL (Structured Query Language) is how you ask a **relational
database** for data. Data lives in **tables** — rows and columns, like a
spreadsheet with strict rules.

| Word | Meaning | In the practice database |
|---|---|---|
| **Table** | A set of rows with the same columns | `customers`, `orders` |
| **Row** | One record | Ada's customer record |
| **Column** | One field, with a fixed type | `email` (text), `price` (number) |
| **Primary key** | The column(s) that identify each row uniquely | `customers.id` |
| **Foreign key** | A column pointing at another table's primary key | `orders.customer_id` → `customers.id` |
| **NULL** | "No value" — unknown or missing | Di's `email` |

```sql
SELECT name, city FROM customers;   -- 5 rows: Ada London, Bo Paris, Cy London, Di Berlin, Ed (no city)
```

SQL says **what** you want, not how to get it — the database works out the
fastest way. Keywords aren't case-sensitive (`select` = `SELECT`), but writing
them in capitals makes queries easier to read. Text values go in **single**
quotes: `'London'`.

**Try it:** list every product's name and price.

</div>

<div class="cheat-card">

#### 2. Choosing rows {#select-where}

**In short:** `SELECT` picks the columns, `FROM` picks the table, and `WHERE`
keeps only the rows that match a condition.

```sql
SELECT * FROM products WHERE price < 40;
-- Mouse 19.99, Lamp 35.50, Notebook 3.25          (* = every column)

SELECT name FROM customers
WHERE city = 'London' AND joined_on >= '2025-01-01';
-- Cy

SELECT name FROM products WHERE category IN ('furniture', 'stationery');
-- Desk, Lamp, Notebook

SELECT name FROM products WHERE price BETWEEN 20 AND 50;
-- Keyboard, Lamp                                   (BETWEEN includes both ends)

SELECT name FROM customers WHERE email LIKE '%@example.com';
-- Ada, Bo, Cy, Ed                                  (% = any text, _ = one character)

SELECT DISTINCT city FROM customers;
-- London, Paris, Berlin, NULL                      (each value once)
```

Rows may come back in a different order on your screen — without `ORDER BY`
(next section), the database returns them in whatever order is fastest.

Combine conditions with `AND`, `OR`, and `NOT`. Use brackets when you mix
them: `WHERE (city = 'London' OR city = 'Paris') AND joined_on >= '2025-01-01'`.

**Try it:** find the orders with status `'delivered'` placed in February 2026.

</div>

<div class="cheat-card">

#### 3. Sorting & limiting {#order-limit}

**In short:** `ORDER BY` sorts the result; `LIMIT` keeps only the first few
rows. Without `ORDER BY`, row order is **not guaranteed**.

```sql
SELECT name, price FROM products ORDER BY price DESC;
-- Desk 199.00, Keyboard 49.99, Lamp 35.50, Mouse 19.99, Notebook 3.25

SELECT name, category, price FROM products ORDER BY category, price DESC;
-- electronics: Keyboard, Mouse · furniture: Desk, Lamp · stationery: Notebook

SELECT name FROM products ORDER BY price DESC LIMIT 2;
-- Desk, Keyboard                                   (top 2)

SELECT name FROM products ORDER BY price DESC LIMIT 2 OFFSET 2;
-- Lamp, Mouse                                      (the next 2: "page 2")

SELECT name AS product, price * 1.2 AS price_with_tax
FROM products
ORDER BY price_with_tax DESC
LIMIT 1;
-- Desk 238.800                                     (AS gives a column a new name)
```

`ASC` (smallest first) is the default; `DESC` means largest first.

**Try it:** show the three most recent orders, newest first.

</div>

<div class="cheat-card">

#### 4. Text, numbers & NULL {#text-numbers-null}

**In short:** SQL has functions for text and maths, and a special value,
`NULL`, that means "unknown". Anything compared with `NULL` is unknown too, so
use `IS NULL`.

```sql
SELECT UPPER(name), LENGTH(name), name || ' <' || email || '>' AS contact
FROM customers WHERE id = 1;
-- ADA, 3, Ada <ada@example.com>                    (|| joins text)

SELECT 7 / 2, 7 / 2.0, 7 % 2, ROUND(19.987, 2);
-- 3, 3.5, 1, 19.99                                 (whole / whole drops the decimals)

SELECT name FROM customers WHERE email IS NULL;
-- Di

SELECT name, COALESCE(city, 'unknown') AS city FROM customers WHERE id = 5;
-- Ed, unknown                                      (COALESCE = first non-NULL value)

SELECT COUNT(*) FROM customers WHERE city = NULL;
-- 0 — "= NULL" is never true; write IS NULL
```

**Try it:** list every customer with their email, showing `'no email'` when it's
missing.

</div>

<div class="cheat-card">

#### 5. Counting & grouping {#group-by}

**In short:** **aggregate** functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) turn
many rows into one value. `GROUP BY` does that once per group.

```sql
SELECT COUNT(*) AS customers, COUNT(email) AS with_email FROM customers;
-- 5, 4                                             (COUNT(column) skips NULLs)

SELECT MIN(price), MAX(price), ROUND(AVG(price), 2) FROM products;
-- 3.25, 199.00, 61.55

SELECT category, COUNT(*) AS products, SUM(price) AS total
FROM products
GROUP BY category
ORDER BY category;
-- electronics 2 69.98 · furniture 2 234.50 · stationery 1 3.25

SELECT customer_id, COUNT(*) AS orders
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 2;
-- 1, 3                                             (only Ada has 2 or more)

SELECT status, COUNT(*)
FROM orders
WHERE ordered_at >= '2026-02-01'                    -- WHERE filters rows before grouping
GROUP BY status
ORDER BY status;
-- cancelled 1, delivered 2, pending 1, shipped 1
```

**The rule:** every column in `SELECT` must either be in `GROUP BY` or inside
an aggregate. `WHERE` filters rows *before* grouping; `HAVING` filters groups
*after*.

**Try it:** count how many orders each status has, most common first.

</div>

<div class="cheat-card">

#### 6. Joining tables {#joins}

**In short:** a **join** puts rows from two tables side by side where a
condition matches — usually a foreign key equal to a primary key.

```sql
SELECT o.id, c.name, o.status
FROM orders o                                       -- o and c are short names ("aliases")
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;
-- 101 Ada delivered, 102 Ada delivered, 103 Bo shipped,
-- 104 Cy cancelled, 105 Ada pending, 106 Di delivered

SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id          -- keep every customer
WHERE o.id IS NULL;                                 -- ...who has no matching order
-- Ed

SELECT o.id, SUM(p.price * oi.quantity) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
GROUP BY o.id
ORDER BY o.id;
-- 101 89.97, 102 199.00, 103 90.99, 104 49.99, 105 35.50, 106 248.99
```

| Join | Keeps |
|---|---|
| `JOIN` (= `INNER JOIN`) | Only rows that match on both sides |
| `LEFT JOIN` | Every row from the left table; `NULL`s where the right has no match |
| `RIGHT JOIN` | Every row from the right table (rarely used — swap the tables and use `LEFT`) |
| `FULL JOIN` | Every row from both sides |
| `CROSS JOIN` | Every combination of rows (5 × 5 = 25) |

**Try it:** find the product nobody has ever ordered.

</div>

<div class="cheat-card">

#### 7. Changing data {#changing-data}

**In short:** `INSERT` adds rows, `UPDATE` changes them, `DELETE` removes them.
Always write the `WHERE` first — without it, *every* row is changed.

```sql
INSERT INTO customers (id, name, email, city, joined_on)
VALUES (6, 'Flo', 'flo@example.com', 'Rome', '2026-09-01');

UPDATE products
SET price = price * 0.9
WHERE category = 'furniture'
RETURNING name, price;
-- Desk 179.10, Lamp 31.95                          (RETURNING shows what changed)

DELETE FROM customers WHERE id = 5;                 -- Ed has no orders, so this is allowed
```

**Safe habit:** run a `SELECT` with the same `WHERE` first, check the rows, then
change `SELECT *` to `UPDATE` or `DELETE`. Deleting a customer who *has*
orders fails — the foreign key protects the orders from pointing at nobody.

**Try it:** mark order 105 as `'shipped'`, then check it with a `SELECT`.

</div>

<div class="cheat-card">

#### 8. Creating tables {#create-table}

**In short:** `CREATE TABLE` defines the columns, their types, and the
**constraints** — rules the database enforces on every change.

```sql
CREATE TABLE reviews (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- numbered for you (PostgreSQL)
  product_id INTEGER NOT NULL REFERENCES products (id),         -- must be a real product
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),   -- rejects 0 or 6
  body       TEXT,                                               -- optional
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP       -- filled in if you leave it out
);

INSERT INTO reviews (product_id, rating, body) VALUES (3, 5, 'Solid desk');

ALTER TABLE customers ADD COLUMN phone TEXT;        -- add a column
DROP TABLE reviews;                                 -- delete the table and its data
```

| Constraint | Rule |
|---|---|
| `PRIMARY KEY` | Unique and never NULL — identifies the row |
| `NOT NULL` | Must have a value |
| `UNIQUE` | No two rows share this value |
| `REFERENCES` (foreign key) | Must match a row in another table |
| `CHECK (...)` | Must pass this condition |
| `DEFAULT ...` | Value used when none is given |

Auto-numbered ids: `GENERATED ALWAYS AS IDENTITY` in PostgreSQL,
`INTEGER PRIMARY KEY` in SQLite, `AUTO_INCREMENT` in MySQL.

**Try it:** create a `wishlist` table (customer, product, date added) where a
customer can't add the same product twice.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 9. Subqueries {#subqueries}

**In short:** a **subquery** is a query inside another query — used as a
value, a list, or a yes/no test.

```sql
SELECT name, price FROM products
WHERE price > (SELECT AVG(price) FROM products);    -- a single value: 61.546
-- Desk 199.00

SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders)        -- a list of ids
ORDER BY name;
-- Ada, Bo, Cy, Di

SELECT c.name FROM customers c
WHERE EXISTS (                                      -- "is there at least one row?"
  SELECT 1
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.customer_id = c.id AND p.category = 'furniture'
)
ORDER BY c.name;
-- Ada, Bo, Di                                      (customers who bought furniture)
```

`EXISTS` stops at the first match, so it's usually the clearest and fastest
way to ask "has this customer ever…?".

**Try it:** list the products that cost more than the Keyboard.

</div>

<div class="cheat-card">

#### 10. CTEs {#ctes}

**In short:** a **CTE** (Common Table Expression) names a subquery with `WITH`,
so a long query reads top to bottom in steps.

```sql
WITH order_totals AS (                              -- step 1: total per order
  SELECT o.id, o.customer_id, o.status, SUM(p.price * oi.quantity) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  GROUP BY o.id, o.customer_id, o.status
)
SELECT c.name, COUNT(*) AS orders, SUM(t.total) AS spent   -- step 2: total per customer
FROM order_totals t
JOIN customers c ON c.id = t.customer_id
WHERE t.status <> 'cancelled'
GROUP BY c.name
ORDER BY spent DESC;
-- Ada 3 324.47 · Di 1 248.99 · Bo 1 90.99
```

A query can have several CTEs separated by commas:
`WITH a AS (...), b AS (SELECT ... FROM a) SELECT ... FROM b`.

**Try it:** add a second CTE that keeps only customers who spent over 100, and
select from it.

</div>

<div class="cheat-card">

#### 11. CASE {#case}

**In short:** `CASE` is SQL's `if` / `else` — it picks a value per row.

```sql
SELECT name, price,
  CASE
    WHEN price >= 100 THEN 'premium'
    WHEN price >= 20  THEN 'standard'
    ELSE 'budget'
  END AS tier
FROM products
ORDER BY price DESC;
-- Desk premium, Keyboard standard, Lamp standard, Mouse budget, Notebook budget

SELECT
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders;
-- 3, 1                                             ("conditional counting": many counts in one pass)
```

**Try it:** label each customer `'new'` if they joined in 2026, otherwise
`'existing'`.

</div>

<div class="cheat-card">

#### 12. Window functions {#window-functions}

**In short:** a **window function** calculates across related rows — a rank,
a running total, the previous row — *without* collapsing them the way
`GROUP BY` does.

```sql
SELECT name, category, price,
  RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category
FROM products
ORDER BY category, rank_in_category;
-- Keyboard 1, Mouse 2 · Desk 1, Lamp 2 · Notebook 1

SELECT id, ordered_at,
  LAG(ordered_at) OVER (ORDER BY ordered_at) AS previous_order   -- the row before
FROM orders
WHERE customer_id = 1;
-- 101 2026-01-05 NULL · 102 2026-02-11 2026-01-05 · 105 2026-03-20 2026-02-11

SELECT customer_id, id, ordered_at
FROM (
  SELECT o.*,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC) AS rn
  FROM orders o
) ranked
WHERE rn = 1                                        -- newest order per customer
ORDER BY customer_id;
-- 1 105 · 2 103 · 3 104 · 4 106
```

`PARTITION BY` = "restart for each group"; `ORDER BY` inside `OVER` = the order
to walk through the rows.

| Function | Gives |
|---|---|
| `ROW_NUMBER()` | 1, 2, 3, 4 — always unique |
| `RANK()` | 1, 2, 2, 4 — ties share a rank, then a gap |
| `DENSE_RANK()` | 1, 2, 2, 3 — ties share, no gap |
| `LAG(col)` / `LEAD(col)` | The previous / next row's value |
| `SUM(col) OVER (ORDER BY …)` | A running total |

**Try it:** show each order of customer 1 with a running count of their orders.

</div>

<div class="cheat-card">

#### 13. Combining results {#set-operations}

**In short:** `UNION`, `INTERSECT`, and `EXCEPT` combine the rows of two
queries that return the same columns.

```sql
SELECT name FROM customers WHERE city = 'London'
UNION                                               -- both lists, duplicates removed
SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'pending'
ORDER BY name;                                      -- sorts the combined result
-- Ada, Cy                                          (UNION ALL would keep Ada twice)

SELECT id FROM customers
EXCEPT                                              -- in the first, not the second
SELECT customer_id FROM orders;
-- 5

SELECT customer_id FROM orders WHERE status = 'delivered'
INTERSECT                                           -- in both
SELECT customer_id FROM orders WHERE status = 'pending';
-- 1
```

`UNION ALL` is faster than `UNION` because it skips removing duplicates —
use it when duplicates are impossible or wanted. `EXCEPT` is how testers diff
two tables (see [SQL for SDET](/docs/role-guides/sdet/sql-for-sdet)).

**Try it:** list the categories that have been ordered, using `INTERSECT`.

</div>

<div class="cheat-card">

#### 14. Dates & times {#dates}

**In short:** dates have their own type and functions. This section is
**PostgreSQL** — date functions are the part of SQL that differs most between
databases.

```sql
SELECT CURRENT_DATE, CURRENT_TIMESTAMP;             -- today; now, with the time

SELECT id, EXTRACT(MONTH FROM ordered_at) AS month  -- one part of a date
FROM orders WHERE id = 101;
-- 101, 1

SELECT (ordered_at + INTERVAL '30 days')::date AS due   -- ::date turns it back into a date
FROM orders WHERE id = 101;
-- 2026-02-04

SELECT DATE_TRUNC('month', ordered_at)::date AS month, COUNT(*) AS orders
FROM orders
GROUP BY 1                                          -- 1 = the first column in SELECT
ORDER BY 1;
-- 2026-01-01 1 · 2026-02-01 2 · 2026-03-01 3

SELECT name, CURRENT_DATE - joined_on AS days_as_customer FROM customers;
-- one row per customer; date − date = a number of days
```

Store moments in time as `TIMESTAMPTZ` (timestamp with time zone) so everyone
reads the same instant, whatever their time zone. For SQLite, MySQL, and SQL
Server spellings, see the [dialect table](/docs/fundamentals/sql/sql-quick-reference#dialects).

**Try it:** count the orders placed on a weekend (`EXTRACT(ISODOW FROM …)` is 6
or 7).

</div>

<div class="cheat-card">

#### 15. Indexes {#indexes}

**In short:** an **index** is a sorted lookup structure on one or more columns
— like a book's index — so the database finds rows without reading the whole
table.

```sql
CREATE INDEX idx_orders_customer_id ON orders (customer_id);           -- speeds up joins and filters
CREATE INDEX idx_orders_status_date ON orders (status, ordered_at);    -- for WHERE status = … AND ordered_at …
CREATE UNIQUE INDEX idx_customers_email_lower ON customers (LOWER(email));   -- no duplicates, ignoring case

DROP INDEX idx_orders_status_date;
```

- Index the columns you **filter, join, or sort** on often — foreign keys first.
- A two-column index `(status, ordered_at)` helps `WHERE status = …` and
  `WHERE status = … AND ordered_at …`, but **not** `WHERE ordered_at …` alone —
  the first column matters most.
- Every index slows down `INSERT`/`UPDATE`/`DELETE` a little and uses disk, so
  don't index everything. Primary keys and `UNIQUE` columns get one automatically.

Check whether a query uses an index with `EXPLAIN` — see [Reading query plans](#explain).

**Try it:** which index would help "all orders for product 3"? Create it.

</div>

<div class="cheat-card">

#### 16. Transactions {#transactions}

**In short:** a **transaction** groups changes so they all happen or none do.
`COMMIT` saves them; `ROLLBACK` undoes them.

```sql
BEGIN;
INSERT INTO orders (id, customer_id, ordered_at, status) VALUES (107, 2, '2026-04-01', 'pending');
INSERT INTO order_items (order_id, product_id, quantity) VALUES (107, 5, 10);
COMMIT;                                             -- the order and its item appear together

BEGIN;
UPDATE products SET price = 0 WHERE id = 3;         -- oops
ROLLBACK;                                           -- undone
SELECT price FROM products WHERE id = 3;
-- 199.00
```

Transactions give the **ACID** guarantees:

| Letter | Means |
|---|---|
| **A**tomic | All the changes happen, or none do |
| **C**onsistent | Constraints hold before and after |
| **I**solated | Other sessions don't see half-finished changes |
| **D**urable | Once committed, it survives a crash |

Without `BEGIN`, each statement is its own transaction ("autocommit").

**Try it:** start a transaction, delete order 105's items and the order, look at
the orders table, then roll back and look again.

</div>

<div class="cheat-card">

#### 17. Views {#views}

**In short:** a **view** is a saved query you can select from like a table. It
stores the query, not the data, so it's always up to date.

```sql
CREATE VIEW order_totals AS
SELECT o.id, o.customer_id, o.status, SUM(p.price * oi.quantity) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
GROUP BY o.id, o.customer_id, o.status;

SELECT id, total FROM order_totals WHERE total > 100 ORDER BY total DESC;
-- 106 248.99, 102 199.00
```

Use views to give a complicated query a name, or to show other teams only
some columns. A **materialized view** (PostgreSQL) stores the result for
speed, and you refresh it yourself.

**Try it:** create a view `customer_spend` (name, total spent) on top of
`order_totals`.

</div>

<div class="cheat-card">

#### 18. Insert or update (upsert) {#upsert}

**In short:** an **upsert** inserts a row, or updates it if the key already
exists — in one safe statement.

```sql
INSERT INTO products (id, name, category, price)
VALUES (2, 'Mouse', 'electronics', 17.99)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;   -- EXCLUDED = the row you tried to insert

SELECT price FROM products WHERE id = 2;
-- 17.99

INSERT INTO products (id, name, category, price)
VALUES (1, 'Keyboard', 'electronics', 0)
ON CONFLICT (id) DO NOTHING;                        -- keep the existing row
```

This works in PostgreSQL and SQLite. MySQL writes it
`INSERT … ON DUPLICATE KEY UPDATE price = VALUES(price)`; SQL Server uses `MERGE`.

**Try it:** upsert a customer by `email` — you'll need `ON CONFLICT (email)`,
which works because `email` is `UNIQUE`.

</div>

<div class="cheat-card">

#### 19. Common mistakes {#gotchas}

**In short:** the classic SQL traps, and how to avoid each one.

```sql
-- 1. "= NULL" is never true
SELECT COUNT(*) FROM customers WHERE city = NULL;         -- 0
SELECT COUNT(*) FROM customers WHERE city IS NULL;        -- 1

-- 2. NOT IN with a NULL in the list returns nothing
SELECT name FROM customers WHERE city NOT IN ('Paris', NULL);   -- no rows!
SELECT name FROM customers WHERE city <> 'Paris' OR city IS NULL;
-- Ada, Cy, Di, Ed

-- 3. Whole-number division
SELECT 1 / 2, 1 / 2.0;                                    -- 0, 0.5

-- 4. A WHERE on the right table turns a LEFT JOIN into an inner join
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'delivered';                             -- Bo, Cy and Ed vanish
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
ORDER BY c.name, o.id;
-- Ada 101, Ada 102, Bo NULL, Cy NULL, Di 106, Ed NULL    (condition moved into ON)

-- 5. COUNT(column) skips NULLs
SELECT COUNT(*), COUNT(city) FROM customers;              -- 5, 4

-- 6. UPDATE or DELETE without WHERE changes every row
-- DELETE FROM order_items;                               -- all gone
```

Also: never rely on row order without `ORDER BY`, and never build SQL by
gluing user input into a string (see [SQL from code](#sql-from-code)).

**Try it:** run query 2 with `NOT IN ('Paris')` (no NULL). Why does Ed still
not appear?

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 20. Reading query plans {#explain}

**In short:** `EXPLAIN` shows **how** the database plans to run a query;
`EXPLAIN ANALYZE` runs it and shows the real time and row counts.

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 1;
```

```text
Seq Scan on orders  (cost=0.00..24.12 rows=6 width=44) (actual time=0.014..0.019 rows=3.00 loops=1)
  Filter: (customer_id = 1)
  Rows Removed by Filter: 3
  Buffers: shared hit=1
Planning Time: 0.036 ms
Execution Time: 0.053 ms
```

| You see | It means |
|---|---|
| `Seq Scan` | Reads every row. Fine for tiny tables; slow for big ones |
| `Index Scan` / `Index Only Scan` | Uses an index to jump to the rows |
| `Nested Loop` / `Hash Join` / `Merge Join` | How two tables are joined |
| `cost=…` | The planner's estimate (in its own units) — compare, don't read literally |
| `rows=` estimated vs `actual … rows=` | Here 6 estimated vs 3 real. Big differences mean stale statistics — run `ANALYZE orders` |
| `Buffers: shared hit=1` | Pages read from memory (PostgreSQL 18 shows this by default) |

On a table this small, PostgreSQL chooses a sequential scan even when an index
exists, because reading one page is cheapest. Plans only become interesting
with thousands of rows. SQLite uses `EXPLAIN QUERY PLAN`; MySQL uses `EXPLAIN`.

</div>

<div class="cheat-card">

#### 21. Isolation & locking {#isolation}

**In short:** when two sessions change the same rows at once, the **isolation
level** decides what each one sees, and **locks** make one wait for the other.

```sql
BEGIN;
SELECT price FROM products WHERE id = 3 FOR UPDATE;   -- lock this row until COMMIT (PostgreSQL, MySQL)
UPDATE products SET price = price - 10 WHERE id = 3;
COMMIT;

UPDATE products SET price = price - 10 WHERE id = 3;  -- one statement: read and write together, safe
```

The classic bug is the **lost update**: two sessions both read `price = 199`,
both write `199 - 10`, and one discount disappears. Fix it by doing the maths
in one `UPDATE` (above), or by locking the row with `SELECT … FOR UPDATE`.

| Level | Stops | Cost |
|---|---|---|
| `READ COMMITTED` (PostgreSQL default) | Reading uncommitted changes | Low |
| `REPEATABLE READ` (MySQL default) | Rows changing between two reads in one transaction | Medium |
| `SERIALIZABLE` | Every anomaly — as if transactions ran one at a time | Highest; some transactions must be retried |

A **deadlock** is two transactions each waiting for a lock the other holds; the
database kills one. Avoid it by always updating rows in the same order.

</div>

<div class="cheat-card">

#### 22. Recursive queries {#recursive}

**In short:** `WITH RECURSIVE` repeats a query on its own output — for trees
(managers → reports, folders, categories) and sequences.

```sql
WITH RECURSIVE counter(n) AS (
  SELECT 1                                          -- start
  UNION ALL
  SELECT n + 1 FROM counter WHERE n < 5             -- repeat until the WHERE stops it
)
SELECT n FROM counter;
-- 1, 2, 3, 4, 5

CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER REFERENCES staff (id));
INSERT INTO staff VALUES (1, 'Grace', NULL), (2, 'Alan', 1), (3, 'Linus', 2), (4, 'Ken', 2);

WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 0 AS depth FROM staff WHERE id = 1   -- the top of the tree
  UNION ALL
  SELECT s.id, s.name, s.manager_id, c.depth + 1
  FROM staff s JOIN chain c ON s.manager_id = c.id                  -- everyone reporting to someone found
)
SELECT name, depth FROM chain ORDER BY depth, name;
-- Grace 0, Alan 1, Ken 2, Linus 2
```

Always make sure the recursive part eventually returns no rows, or the query
never ends.

</div>

<div class="cheat-card">

#### 23. JSON columns {#json}

**In short:** a `JSONB` column (PostgreSQL) stores flexible JSON data that you
can still filter and index. Use it for attributes that vary between rows,
not to avoid designing tables.

```sql
ALTER TABLE products ADD COLUMN attrs JSONB;
UPDATE products SET attrs = '{"color": "black", "wireless": true}'  WHERE id = 2;
UPDATE products SET attrs = '{"color": "white", "wireless": false}' WHERE id = 1;

SELECT name, attrs ->> 'color' AS color             -- ->> gives text, -> gives JSON
FROM products
WHERE attrs @> '{"wireless": true}';                -- @> = "contains"
-- Mouse, black

CREATE INDEX idx_products_attrs ON products USING GIN (attrs);   -- makes @> fast
```

SQLite and MySQL have `JSON_EXTRACT(attrs, '$.color')` instead.

</div>

<div class="cheat-card">

#### 24. Designing tables {#normalisation}

**In short:** **normalisation** means storing each fact exactly once, so it
can't get out of sync. The practice database is normalised: a customer's city
is stored once, not copied onto every order.

```text
Not normalised — one wide table:
order_id | customer_name | customer_city | product_names
101      | Ada           | London        | Keyboard, Mouse      ← a list in one cell
102      | Ada           | London        | Desk                 ← Ada's city copied again

Normalised — four tables joined by keys (the practice database):
customers(id, name, city)   orders(id, customer_id, …)
products(id, name, price)   order_items(order_id, product_id, quantity)
```

| Rule | In plain words |
|---|---|
| **1NF** (first normal form) | One value per cell — no lists, no `phone1, phone2, phone3` columns |
| **2NF** | Every column depends on the *whole* key (a product's price belongs in `products`, not `order_items`) |
| **3NF** | Columns depend only on the key, not on other columns (store `city_id`, look the country up from the city) |

**When to break the rules ("denormalise"):** reporting tables and caches where
read speed matters more — for example, saving the price paid on
`order_items`, because the product's price may change later. That's a
different fact ("price at the time"), so it's still correct.

</div>

<div class="cheat-card">

#### 25. SQL from code {#sql-from-code}

**In short:** always pass values as **parameters**, never by joining strings.
Joining strings lets a user's input become part of your SQL — **SQL
injection**, one of the most common security holes.

```python
import sqlite3

db = sqlite3.connect("shop.db")
city = "London' OR '1'='1"                     # hostile input

# BAD: the input becomes SQL — this returns every customer
# db.execute(f"SELECT name FROM customers WHERE city = '{city}'")

# GOOD: the ? placeholder sends city as a plain value
rows = db.execute("SELECT name FROM customers WHERE city = ?", (city,)).fetchall()
print(rows)                                     # [] — no city has that odd name
```

```java
// Java (JDBC): the same idea with PreparedStatement
static List<String> customersIn(java.sql.Connection db, String city) throws java.sql.SQLException {
    var ps = db.prepareStatement("SELECT name FROM customers WHERE city = ?");
    ps.setString(1, city);                      // sent as a value, never as SQL
    var names = new ArrayList<String>();
    try (var rs = ps.executeQuery()) {
        while (rs.next()) names.add(rs.getString("name"));
    }
    return names;
}
```

Placeholders differ by library: `?` (SQLite, JDBC), `%s` (psycopg, Python's
PostgreSQL driver), `:name` (SQLAlchemy). An **ORM** (Object-Relational
Mapper, like Hibernate or SQLAlchemy) writes most SQL for you — but you still
need to read the SQL it produces when something is slow.

</div>

<div class="cheat-card">

#### 26. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **RDBMS** | Relational Database Management System — PostgreSQL, MySQL, SQL Server, Oracle, SQLite |
| **DDL** | Data Definition Language — `CREATE`, `ALTER`, `DROP` (the structure) |
| **DML** | Data Manipulation Language — `SELECT`, `INSERT`, `UPDATE`, `DELETE` (the data) |
| **CRUD** | Create, Read, Update, Delete — the four basic operations |
| **Schema** | The set of tables and their columns; in PostgreSQL also a named folder of tables |
| **Query plan** | The steps the database chose to run your query |
| **Cardinality** | How many distinct values a column has (high = good for an index) |
| **OLTP / OLAP** | Many small fast transactions (a shop) / big analytical queries (a report warehouse) |
| **Migration** | A versioned script that changes the schema (tools: Flyway, Liquibase, Alembic) |
| **Replica** | A read-only copy of the database, kept up to date from the main one |
| **Connection pool** | A set of open connections an app reuses, because opening one is slow |
| **Dialect** | One database's flavour of SQL |

For role-specific examples, see [SQL for SDET](/docs/role-guides/sdet/sql-for-sdet)
and the [complete guide](/docs/sdet-skills/sql/sql-guide).

</div>

</div>
