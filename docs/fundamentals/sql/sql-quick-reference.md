---
title: "SQL Quick Reference"
description: "Copy-paste SQL reference — clause order, operators, functions, joins, window frames, DDL, types, dialect differences (PostgreSQL, MySQL, SQLite, SQL Server), CLI commands, and handy queries."
sidebar_position: 1
level: beginner
tags: [sql, fundamentals, cheat-sheet]
image: /img/social/sql-quick-reference.png
---

# SQL Quick Reference

A copy-paste reference for everyday SQL. Examples run on the
[practice database](/cheatsheets/sql#practice-database) and show their result
in a `-- →` comment. Syntax is PostgreSQL unless the
[dialect table](#dialects) says otherwise.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
SQL? Start with the [SQL cheat sheet](/cheatsheets/sql), which explains each
idea with an exercise. For the ordered plan with projects, see the
[SQL learning path](/docs/learning-path/sql/implementation-roadmap).

:::

## Quick Navigation

**Querying:** [Clause order](#clause-order) · [Operators](#operators) · [Text](#text) · [Numbers](#numbers) · [NULL](#null) · [Aggregates](#aggregates) · [Joins](#joins) · [Window functions](#window-functions)

**Structure:** [Data types](#data-types) · [Tables & constraints](#tables--constraints) · [Indexes](#indexes) · [Transactions](#transactions) · [Dialects](#dialects) · [Command-line tools](#command-line-tools)

**Recipes:** [Handy queries](#handy-queries) · [One-liners](#one-liners-to-remember)

---

## Clause order

**Written** in this order — but **run** in a different one, which explains
most "column does not exist" errors:

| Written | Run | Does |
|---|---|---|
| 1. `SELECT` | 5 | Pick and compute columns |
| 2. `FROM` / `JOIN` | 1 | Choose and combine tables |
| 3. `WHERE` | 2 | Filter rows |
| 4. `GROUP BY` | 3 | Make groups |
| 5. `HAVING` | 4 | Filter groups |
| 6. `ORDER BY` | 6 | Sort |
| 7. `LIMIT` / `OFFSET` | 7 | Keep some rows |

That's why `WHERE` can't use an alias defined in `SELECT` (it runs first), but
`ORDER BY` can.

---

## Operators

| Operator | Example | Note |
|---|---|---|
| `=`, `<>` (or `!=`), `<`, `<=`, `>`, `>=` | `price >= 20` | |
| `AND`, `OR`, `NOT` | `a AND (b OR c)` | `AND` binds tighter than `OR` — use brackets |
| `IN (…)` / `NOT IN (…)` | `status IN ('pending', 'shipped')` | `NOT IN` with a `NULL` in the list matches nothing |
| `BETWEEN a AND b` | `price BETWEEN 20 AND 50` | Includes both ends |
| `LIKE` / `ILIKE` | `name LIKE 'A%'` | `%` any text, `_` one character; `ILIKE` ignores case (PostgreSQL) |
| `IS NULL` / `IS NOT NULL` | `email IS NULL` | Never `= NULL` |
| `IS DISTINCT FROM` | `a IS DISTINCT FROM b` | Like `<>`, but treats two NULLs as equal |
| `EXISTS (subquery)` | `EXISTS (SELECT 1 FROM …)` | True if the subquery returns any row |
| `~` | `email ~ '^[a-z]+@'` | Regular-expression match (PostgreSQL) |

---

## Text

```sql
SELECT
  UPPER('ada'),                        -- → ADA
  LOWER('ADA'),                        -- → ada
  LENGTH('Ada'),                       -- → 3
  'Ada' || ' ' || 'L',                 -- → Ada L
  CONCAT('Ada', NULL, '!'),            -- → Ada!    (CONCAT skips NULLs; || gives NULL)
  SUBSTRING('keyboard' FROM 1 FOR 3),  -- → key
  TRIM('  hi  '),                      -- → hi
  REPLACE('a-b-c', '-', '+'),          -- → a+b+c
  POSITION('b' IN 'abc'),              -- → 2
  LEFT('keyboard', 3),                 -- → key
  SPLIT_PART('ada@example.com', '@', 2),   -- → example.com
  LPAD('7', 3, '0');                   -- → 007
```

Text functions differ most between databases. SQLite has no `SPLIT_PART`,
`LPAD`, `LEFT`, or `POSITION`; it spells substring `SUBSTR('keyboard', 1, 3)`
and position `INSTR('abc', 'b')`.

---

## Numbers

```sql
SELECT
  7 / 2,                  -- → 3        whole ÷ whole drops the decimals
  7 / 2.0,                -- → 3.5
  7::numeric / 2,         -- → 3.5      (CAST(7 AS NUMERIC) / 2 everywhere)
  7 % 2,                  -- → 1
  ROUND(2.567, 1),        -- → 2.6
  CEIL(2.1),              -- → 3
  FLOOR(2.9),             -- → 2
  ABS(-5),                -- → 5
  POWER(2, 10),           -- → 1024
  GREATEST(3, 9, 4),      -- → 9        (not in SQLite: use MAX(3, 9, 4))
  LEAST(3, 9, 4);         -- → 3
```

Use `NUMERIC(10, 2)` (or `DECIMAL`) for money — `REAL` and `FLOAT` round
(`0.1 + 0.2` isn't exactly `0.3`).

---

## NULL

```sql
SELECT
  COALESCE(NULL, NULL, 'x'),   -- → x       first non-NULL
  NULLIF(5, 5),                -- → NULL    NULL if equal (avoids ÷ 0: x / NULLIF(y, 0))
  NULL = NULL,                 -- → NULL    unknown, not true
  NULL IS NULL,                -- → true
  1 + NULL;                    -- → NULL    any maths with NULL is NULL
```

`COUNT(*)` counts rows; `COUNT(col)` skips NULLs; `SUM`, `AVG`, `MIN`, `MAX`
ignore NULLs. `ORDER BY col NULLS LAST` puts empty values at the end.

---

## Aggregates

```sql
SELECT
  COUNT(*) AS rows_,                          -- → 5
  COUNT(DISTINCT category) AS categories,     -- → 3
  SUM(price) AS total,                        -- → 307.73
  ROUND(AVG(price), 2) AS average,            -- → 61.55
  STRING_AGG(name, ', ' ORDER BY name) AS names   -- → Desk, Keyboard, Lamp, Mouse, Notebook
FROM products;

SELECT category, COUNT(*) FILTER (WHERE price > 30) AS over_30   -- FILTER: PostgreSQL / SQLite
FROM products GROUP BY category ORDER BY category;
-- → electronics 1 · furniture 2 · stationery 0
```

`STRING_AGG` is `GROUP_CONCAT` in MySQL and SQLite.

---

## Joins

| Join | Rows returned | Typical use |
|---|---|---|
| `a JOIN b ON …` | Pairs that match | Orders with their customer |
| `a LEFT JOIN b ON …` | All of `a`; `b` columns NULL when no match | Customers with or without orders |
| `a LEFT JOIN b ON … WHERE b.id IS NULL` | `a` rows with **no** match ("anti-join") | Customers who never ordered |
| `a FULL JOIN b ON …` | All of both | Compare two lists |
| `a CROSS JOIN b` | Every combination | Build a grid (every product × every month) |
| `a JOIN a AS a2 ON …` | A table with itself ("self-join") | Employee with their manager |
| `a JOIN b USING (col)` | Same as `ON a.col = b.col`, one output column | Tables that share a column name |

Put conditions on the **right** table of a `LEFT JOIN` in `ON`, not `WHERE`,
or the unmatched rows disappear.

---

## Window functions

```sql
SELECT name, price,
  ROW_NUMBER()  OVER w AS row_num,               -- 1, 2, 3 …
  RANK()        OVER w AS rank_,                 -- ties share, then skip
  DENSE_RANK()  OVER w AS dense,                 -- ties share, no skip
  NTILE(2)      OVER w AS half,                  -- split into 2 buckets
  LAG(price)    OVER w AS pricier_one,           -- previous row in the window
  SUM(price)    OVER w AS running_total,         -- total so far
  FIRST_VALUE(name) OVER w AS most_expensive
FROM products
WINDOW w AS (ORDER BY price DESC)                -- name a window once, reuse it
ORDER BY price DESC;
-- → Desk 199.00 1 … running_total 199.00 · Keyboard 49.99 2 … 248.99 · …
```

**Frames** — which rows `SUM`/`AVG` add up:

| Frame | Meaning |
|---|---|
| *(none, with ORDER BY)* | From the first row to this one (a running total) |
| `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` | This row and the 2 before — a 3-row moving average |
| `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` | The whole partition |

```sql
SELECT id, ordered_at,
  COUNT(*) OVER (ORDER BY ordered_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS last_3
FROM orders ORDER BY ordered_at;
-- → 101 1 · 102 2 · 103 3 · 104 3 · 105 3 · 106 3
```

---

## Data types

| Kind | PostgreSQL | MySQL | SQLite | SQL Server |
|---|---|---|---|---|
| Whole number | `INTEGER`, `BIGINT` | `INT`, `BIGINT` | `INTEGER` | `INT`, `BIGINT` |
| Exact decimal (money) | `NUMERIC(10,2)` | `DECIMAL(10,2)` | `NUMERIC` | `DECIMAL(10,2)` |
| Text | `TEXT`, `VARCHAR(n)` | `VARCHAR(n)`, `TEXT` | `TEXT` | `NVARCHAR(n)` |
| True/false | `BOOLEAN` | `BOOLEAN` (= `TINYINT(1)`) | `INTEGER` 0/1 | `BIT` |
| Date | `DATE` | `DATE` | `TEXT` `'2026-09-27'` | `DATE` |
| Moment in time | `TIMESTAMPTZ` | `DATETIME` / `TIMESTAMP` | `TEXT` (ISO 8601) | `DATETIMEOFFSET` |
| Unique id | `UUID` | `CHAR(36)` / `BINARY(16)` | `TEXT` | `UNIQUEIDENTIFIER` |
| JSON | `JSONB` | `JSON` | `TEXT` + JSON functions | `NVARCHAR(MAX)` + JSON functions |

---

## Tables & constraints

```sql
CREATE TABLE IF NOT EXISTS coupons (
  code       TEXT PRIMARY KEY,
  percent    INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 90),
  product_id INTEGER REFERENCES products (id) ON DELETE CASCADE,   -- delete coupons with the product
  expires_on DATE,
  active     BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE coupons ADD COLUMN note TEXT;
ALTER TABLE coupons RENAME COLUMN note TO description;
ALTER TABLE coupons ALTER COLUMN description SET DEFAULT '';        -- PostgreSQL
ALTER TABLE coupons ADD CONSTRAINT coupons_expiry_future CHECK (expires_on > '2026-01-01');
ALTER TABLE coupons DROP CONSTRAINT coupons_expiry_future;
ALTER TABLE coupons DROP COLUMN description;

CREATE TABLE products_backup AS SELECT * FROM products;           -- copy structure and data
TRUNCATE products_backup;                                         -- delete all rows, fast (SQLite: DELETE FROM)
DROP TABLE IF EXISTS products_backup;
```

| `ON DELETE …` | When the parent row is deleted |
|---|---|
| *(default)* `NO ACTION` / `RESTRICT` | Refuse |
| `CASCADE` | Delete the child rows too |
| `SET NULL` | Set the foreign key to NULL |

---

## Indexes

```sql
CREATE INDEX idx_orders_customer ON orders (customer_id);                  -- ordinary (B-tree)
CREATE INDEX idx_orders_status_date ON orders (status, ordered_at DESC);   -- several columns
CREATE UNIQUE INDEX idx_customers_email ON customers (LOWER(email));       -- on an expression
CREATE INDEX idx_orders_pending ON orders (ordered_at) WHERE status = 'pending';   -- partial: only some rows
DROP INDEX idx_orders_pending;
```

| Index type (PostgreSQL) | Good for |
|---|---|
| B-tree (default) | `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, `LIKE 'abc%'` |
| Hash | `=` only |
| GIN | JSONB, arrays, full-text search |
| GiST / BRIN | Geometric data / huge tables sorted by time |

An index is usually **not** used for `LIKE '%abc'`, a function on the column
(`WHERE LOWER(email) = …` needs an index on `LOWER(email)`), or a column whose
type doesn't match the value.

---

## Transactions

```sql
BEGIN;                                                  -- START TRANSACTION in MySQL
UPDATE products SET price = price * 1.1 WHERE category = 'stationery';
SAVEPOINT before_desk;                                  -- a point you can roll back to
UPDATE products SET price = 0 WHERE id = 3;
ROLLBACK TO SAVEPOINT before_desk;                      -- undo only the desk change
COMMIT;
SELECT name, price FROM products WHERE id IN (3, 5) ORDER BY id;
-- → Desk 199.00 · Notebook 3.58

BEGIN ISOLATION LEVEL SERIALIZABLE;                     -- PostgreSQL: set the level per transaction
SELECT COUNT(*) FROM orders WHERE status = 'pending';
COMMIT;
```

---

## Dialects

The same idea, spelled by each database:

| Task | PostgreSQL | MySQL | SQLite | SQL Server |
|---|---|---|---|---|
| First N rows | `LIMIT 10` | `LIMIT 10` | `LIMIT 10` | `SELECT TOP 10 …` / `FETCH FIRST 10 ROWS ONLY` |
| Auto-numbered id | `GENERATED ALWAYS AS IDENTITY` | `AUTO_INCREMENT` | `INTEGER PRIMARY KEY` | `IDENTITY(1,1)` |
| Join text | `a \|\| b` | `CONCAT(a, b)` | `a \|\| b` | `a + b` / `CONCAT(a, b)` |
| Text list per group | `STRING_AGG(x, ',')` | `GROUP_CONCAT(x)` | `GROUP_CONCAT(x)` | `STRING_AGG(x, ',')` |
| Case-insensitive match | `ILIKE` | `LIKE` (usually already) | `LIKE` (ASCII) | `LIKE` (usually already) |
| Today / now | `CURRENT_DATE` / `NOW()` | `CURDATE()` / `NOW()` | `DATE('now')` / `DATETIME('now')` | `CAST(GETDATE() AS DATE)` / `GETDATE()` |
| Add 7 days | `d + INTERVAL '7 days'` | `DATE_ADD(d, INTERVAL 7 DAY)` | `DATE(d, '+7 days')` | `DATEADD(day, 7, d)` |
| Days between | `d2 - d1` | `DATEDIFF(d2, d1)` | `JULIANDAY(d2) - JULIANDAY(d1)` | `DATEDIFF(day, d1, d2)` |
| Part of a date | `EXTRACT(MONTH FROM d)` | `MONTH(d)` | `STRFTIME('%m', d)` | `MONTH(d)` |
| First day of month | `DATE_TRUNC('month', d)` | `DATE_FORMAT(d, '%Y-%m-01')` | `DATE(d, 'start of month')` | `DATETRUNC(month, d)` |
| Format a date | `TO_CHAR(d, 'YYYY-MM')` | `DATE_FORMAT(d, '%Y-%m')` | `STRFTIME('%Y-%m', d)` | `FORMAT(d, 'yyyy-MM')` |
| Insert or update | `ON CONFLICT (k) DO UPDATE` | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT (k) DO UPDATE` | `MERGE` |
| Return changed rows | `RETURNING *` | — | `RETURNING *` | `OUTPUT inserted.*` |
| Query plan | `EXPLAIN ANALYZE` | `EXPLAIN ANALYZE` | `EXPLAIN QUERY PLAN` | `SET SHOWPLAN_TEXT ON` |
| Read a JSON field | `data ->> 'k'` | `data ->> '$.k'` | `JSON_EXTRACT(data, '$.k')` | `JSON_VALUE(data, '$.k')` |
| Quote a name | `"order"` | `` `order` `` | `"order"` | `[order]` |

---

## Command-line tools

| Task | `psql` (PostgreSQL) | `mysql` | `sqlite3` |
|---|---|---|---|
| Connect | `psql -h host -U user -d shop` | `mysql -h host -u user -p shop` | `sqlite3 shop.db` |
| List tables | `\dt` | `SHOW TABLES;` | `.tables` |
| Describe a table | `\d orders` | `DESCRIBE orders;` | `.schema orders` |
| Run a file | `\i setup.sql` | `SOURCE setup.sql;` | `.read setup.sql` |
| Show query time | `\timing` | *(shown by default)* | `.timer on` |
| Readable wide rows | `\x` | end the query with `\G` | `.mode line` |
| Export to CSV | `\copy (SELECT …) TO 'out.csv' CSV HEADER` | `SELECT … INTO OUTFILE 'out.csv'` | `.mode csv` then `.output out.csv` |
| Quit | `\q` | `exit` | `.quit` |

---

## Handy queries

```sql
-- Find duplicate values
SELECT city, COUNT(*) FROM customers
WHERE city IS NOT NULL
GROUP BY city HAVING COUNT(*) > 1;
-- → London 2

-- Second most expensive product ("Nth highest")
SELECT name, price FROM products ORDER BY price DESC LIMIT 1 OFFSET 1;
-- → Keyboard 49.99

-- Top 1 per group (most expensive product per category)
SELECT category, name, price FROM (
  SELECT p.*, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM products p
) ranked
WHERE rn = 1 ORDER BY category;
-- → electronics Keyboard 49.99 · furniture Desk 199.00 · stationery Notebook 3.25

-- Rows in one table but not the other
SELECT id FROM products
EXCEPT
SELECT product_id FROM order_items;
-- → 5

-- Fast "next page" (keyset pagination): remember the last id you showed
SELECT id, ordered_at FROM orders WHERE id > 103 ORDER BY id LIMIT 2;
-- → 104 2026-03-01 · 105 2026-03-20

-- Percentage of the total
SELECT category, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM products GROUP BY category ORDER BY category;
-- → electronics 40.0 · furniture 40.0 · stationery 20.0

```

```sql
-- Delete duplicates, keeping the lowest id in each group
CREATE TABLE signups (id INTEGER PRIMARY KEY, email TEXT);
INSERT INTO signups VALUES (1, 'a@x.io'), (2, 'b@x.io'), (3, 'a@x.io'), (4, 'a@x.io');

DELETE FROM signups
WHERE EXISTS (
  SELECT 1 FROM signups other
  WHERE other.email = signups.email AND other.id < signups.id   -- an older row with the same email exists
);

SELECT * FROM signups ORDER BY id;
-- → 1 a@x.io · 2 b@x.io
```

`OFFSET` pagination reads and throws away every skipped row, so page 1,000 is
slow; keyset pagination (`WHERE id > last_seen`) stays fast.

---

## One-liners to Remember

| Task | SQL |
|---|---|
| Count rows | `SELECT COUNT(*) FROM t;` |
| Distinct values | `SELECT DISTINCT col FROM t;` |
| How many distinct | `SELECT COUNT(DISTINCT col) FROM t;` |
| Latest row | `SELECT * FROM t ORDER BY created_at DESC LIMIT 1;` |
| Empty-safe average | `COALESCE(AVG(x), 0)` |
| Safe division | `a / NULLIF(b, 0)` |
| Text to number | `CAST('42' AS INTEGER)` or `'42'::int` |
| Yes/no as 1/0 | `CASE WHEN cond THEN 1 ELSE 0 END` |
| Does any row exist? | `SELECT EXISTS (SELECT 1 FROM t WHERE …);` |
| Copy a table's shape | `CREATE TABLE t2 (LIKE t INCLUDING ALL);` (PostgreSQL) |
| Table sizes | `SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables;` |
| Running queries | `SELECT pid, state, query FROM pg_stat_activity;` |

---

## Need More Detail?

This page is the quick answer. For explanations with exercises, use the
[SQL cheat sheet](/cheatsheets/sql). For indexing internals and interview
questions, see [SQL: The Complete Guide](/docs/sdet-skills/sql/sql-guide).
For habits that keep SQL safe and fast, see
[SQL Best Practices](/docs/fundamentals/sql/coding-best-practices).

*Last updated: September 2026*
