---
title: "SQL Cheat Sheet"
description: "Quick reference for SQL — joins, aggregates, CTEs vs window functions, indexes, and transactions."
tags: [sql, sdet, cheat-sheet]
hide_table_of_contents: true
---

# SQL cheatsheet

A one-page reference for SQL. For indexing internals and interview Q&A, see
the [complete guide](/docs/sdet-skills/sql/sql-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/sql/sql-guide">📖 Full guide: SQL →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Core DML

```sql
SELECT name, age FROM users WHERE age > 18 ORDER BY name;
INSERT INTO users (name, age) VALUES ('Abhishek', 30);
UPDATE users SET age = 31 WHERE name = 'Abhishek';
DELETE FROM users WHERE age < 0;
```

</div>

<div class="cheat-card">

#### Joins

```sql
SELECT o.id, u.name
FROM orders o
INNER JOIN users u ON o.user_id = u.id;   -- only matching rows

SELECT u.name, o.id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;   -- all users, matched orders or NULL
```

</div>

<div class="cheat-card">

#### Aggregates & grouping

```sql
SELECT user_id, COUNT(*) AS orders, SUM(total) AS spend
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;
```

`WHERE` filters rows before grouping; `HAVING` filters groups after.

</div>

<div class="cheat-card">

#### Subqueries vs CTEs vs window functions

```sql
-- CTE: named, readable, reusable within the query
WITH big_spenders AS (
  SELECT user_id FROM orders GROUP BY user_id HAVING SUM(total) > 1000
)
SELECT * FROM users WHERE id IN (SELECT user_id FROM big_spenders);

-- Window function: per-row ranking without collapsing rows
SELECT id, total, RANK() OVER (ORDER BY total DESC) AS rank FROM orders;
```

</div>

<div class="cheat-card">

#### Indexes & performance

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
EXPLAIN SELECT * FROM orders WHERE user_id = 42;
```

An index speeds up lookups/joins on that column but slows down writes —
don't index everything.

</div>

<div class="cheat-card">

#### Transactions & ACID

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- or ROLLBACK on failure
```

Atomicity, Consistency, Isolation, Durability — the guarantees that make
this transfer safe under concurrent access/crashes.

</div>

<div class="cheat-card">

#### How SDETs actually use SQL

- Verify backend state directly instead of trusting only the UI (faster, more precise test setup/teardown).
- Seed test data via `INSERT` instead of clicking through the UI.
- Debug flaky tests by querying what the app actually persisted.

<span class="cheat-see">See: How SDETs Actually Use SQL</span>

</div>

</div>
