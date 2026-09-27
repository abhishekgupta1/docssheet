---
title: "SQL Milestones & Mini-Projects"
description: "A small dataset and a set of tasks with expected results for each of the seven core SQL milestones — library catalogue, weather report, loans, a to-do schema, customer segments, a leaderboard, and a bank ledger."
sidebar_position: 2
level: beginner
tags: [sql, learning-path, projects]
image: /img/social/sql-milestones.png
---

# SQL Milestones & Mini-Projects

**In short:** one small dataset per milestone, with tasks that use only what
that milestone teaches. Every task shows the **expected result**, so you know
when you've got it right. Solutions are folded away — try first.

:::tip How to use this page

First read the milestone in the [Roadmap](/docs/learning-path/sql/implementation-roadmap)
and the cheat-sheet sections it links to. Then run the milestone's **Setup**
block, write each query yourself, and compare your result with the expected
one. Open a solution only after you have a result, right or wrong. Save your
queries in one `.sql` file per milestone and commit them.

:::

## Contents

- [Milestone 1: Library catalogue](#milestone-1)
- [Milestone 2: Weather report](#milestone-2)
- [Milestone 3: Library loans](#milestone-3)
- [Milestone 4: To-do app schema](#milestone-4)
- [Milestone 5: Customer segments](#milestone-5)
- [Milestone 6: Game leaderboard](#milestone-6)
- [Milestone 7: Bank ledger](#milestone-7)
- [After Milestone 7](#after)

Everything runs on PostgreSQL. Tasks that are PostgreSQL-only are marked; the
rest also run on SQLite (`sqlite3 m1.db < setup.sql`).

---

## Milestone 1: Library catalogue {#milestone-1}

**Practises:** `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `LIKE`, `IS NULL`,
`DISTINCT`, simple maths.

```sql
-- Setup: Milestone 1 — library catalogue
CREATE TABLE books (
  id        INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  author    TEXT NOT NULL,
  year      INTEGER,
  genre     TEXT,
  pages     INTEGER,
  available BOOLEAN NOT NULL
);

INSERT INTO books VALUES
  (1, 'Dune',             'Frank Herbert',  1965, 'sci-fi',  412, TRUE),
  (2, 'Neuromancer',      'William Gibson', 1984, 'sci-fi',  271, FALSE),
  (3, 'The Hobbit',       'J.R.R. Tolkien', 1937, 'fantasy', 310, TRUE),
  (4, 'Emma',             'Jane Austen',    1815, 'classic', 474, TRUE),
  (5, 'Foundation',       'Isaac Asimov',   1951, 'sci-fi',  255, TRUE),
  (6, 'The Silmarillion', 'J.R.R. Tolkien', 1977, 'fantasy', 365, FALSE),
  (7, 'Persuasion',       'Jane Austen',    1817, 'classic', 249, TRUE),
  (8, 'Untitled Draft',   'Anonymous',      NULL, NULL,      120, FALSE);
```

| # | Task | Expected result |
|---|---|---|
| 1 | Every title and author, A to Z by title | 8 rows, from Dune to Untitled Draft |
| 2 | Sci-fi books that are available | Dune, Foundation |
| 3 | Books published before 1950, oldest first | Emma 1815 · Persuasion 1817 · The Hobbit 1937 |
| 4 | The three longest books | Emma 474 · Dune 412 · The Silmarillion 365 |
| 5 | Titles starting with "The" | The Hobbit, The Silmarillion |
| 6 | Books with no publication year | Untitled Draft |
| 7 | The three oldest books with their age in 2026 | Emma 211 · Persuasion 209 · The Hobbit 89 |
| 8 | Every genre once, A to Z, without the empty one | classic, fantasy, sci-fi |

<details>
<summary>Solutions</summary>

```sql
SELECT title, author FROM books ORDER BY title;                          -- 1
SELECT title FROM books WHERE genre = 'sci-fi' AND available ORDER BY title;   -- 2
SELECT title, year FROM books WHERE year < 1950 ORDER BY year;           -- 3
SELECT title, pages FROM books ORDER BY pages DESC LIMIT 3;              -- 4
SELECT title FROM books WHERE title LIKE 'The %' ORDER BY title;         -- 5
SELECT title FROM books WHERE year IS NULL;                              -- 6
SELECT title, 2026 - year AS age FROM books
WHERE year IS NOT NULL ORDER BY age DESC LIMIT 3;                        -- 7
SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre; -- 8
```

</details>

**Watch out for:** in task 3, `WHERE year < 1950` quietly skips the book with
no year — `NULL < 1950` is unknown, not true. That's what you want here, but
always ask yourself where the `NULL` rows went.

**Try it:** write a query that shows each book's title and `'short'` or
`'long'` depending on whether it has more than 300 pages. (You'll meet `CASE`
properly in Milestone 5 — look it up in the cheat sheet.)

---

## Milestone 2: Weather report {#milestone-2}

**Practises:** `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `ROUND`, `GROUP BY`,
`HAVING`.

```sql
-- Setup: Milestone 2 — weather readings
CREATE TABLE readings (
  city    TEXT NOT NULL,
  day     DATE NOT NULL,
  temp_c  NUMERIC(4, 1) NOT NULL,
  rain_mm NUMERIC(5, 1),                      -- NULL = sensor broken that day
  PRIMARY KEY (city, day)
);

INSERT INTO readings VALUES
  ('London', '2026-03-01',  8.5, 2.0), ('London', '2026-03-02', 10.0, 0.0),
  ('London', '2026-03-03',  7.0, 5.5), ('London', '2026-03-04',  9.5, 1.0),
  ('Madrid', '2026-03-01', 15.0, 0.0), ('Madrid', '2026-03-02', 17.5, 0.0),
  ('Madrid', '2026-03-03', 16.0, 0.5), ('Madrid', '2026-03-04', 18.5, 0.0),
  ('Oslo',   '2026-03-01', -2.0, 1.5), ('Oslo',   '2026-03-02',  0.5, 3.0),
  ('Oslo',   '2026-03-03', -4.5, 0.0), ('Oslo',   '2026-03-04',  1.0, NULL);
```

| # | Task | Expected result |
|---|---|---|
| 1 | How many readings, and how many have rain recorded? | 12, 11 |
| 2 | Average temperature per city (1 decimal), warmest first | Madrid 16.8 · London 8.8 · Oslo -1.3 |
| 3 | Total rain per city, A to Z | London 8.5 · Madrid 0.5 · Oslo 4.5 |
| 4 | Coldest, warmest, and the difference, per city | London 7.0 10.0 3.0 · Madrid 15.0 18.5 3.5 · Oslo -4.5 1.0 5.5 |
| 5 | Cities where it rained (more than 0 mm) on at least 3 days | London |
| 6 | The day with the lowest average temperature across all cities | 2026-03-03, 6.2 |

<details>
<summary>Solutions</summary>

```sql
SELECT COUNT(*) AS readings, COUNT(rain_mm) AS with_rain FROM readings;          -- 1

SELECT city, ROUND(AVG(temp_c), 1) AS avg_temp
FROM readings GROUP BY city ORDER BY avg_temp DESC;                              -- 2

SELECT city, SUM(rain_mm) AS total_rain FROM readings GROUP BY city ORDER BY city;   -- 3

SELECT city, MIN(temp_c) AS coldest, MAX(temp_c) AS warmest,
       MAX(temp_c) - MIN(temp_c) AS difference
FROM readings GROUP BY city ORDER BY city;                                       -- 4

SELECT city FROM readings
WHERE rain_mm > 0
GROUP BY city
HAVING COUNT(*) >= 3;                                                            -- 5

SELECT day, ROUND(AVG(temp_c), 1) AS avg_temp
FROM readings GROUP BY day ORDER BY avg_temp LIMIT 1;                            -- 6
```

</details>

**Watch out for:** task 3's Oslo total is 4.5 — the broken sensor's `NULL` is
ignored, not counted as 0. Averages work the same way: `AVG` divides by the
number of non-NULL values.

**Try it:** show each city's number of dry days (0 mm) and the percentage of
its readings they make up.

---

## Milestone 3: Library loans {#milestone-3}

**Practises:** `JOIN`, `LEFT JOIN`, finding missing matches, joining three
tables, grouping after a join.

```sql
-- Setup: Milestone 3 — library loans (books as in Milestone 1)
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
INSERT INTO books VALUES
  (1, 'Dune'), (2, 'Neuromancer'), (3, 'The Hobbit'), (4, 'Emma'),
  (5, 'Foundation'), (6, 'The Silmarillion'), (7, 'Persuasion'), (8, 'Untitled Draft');

CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO members VALUES (1, 'Maya'), (2, 'Omar'), (3, 'Lin'), (4, 'Zoe');

CREATE TABLE loans (
  id          INTEGER PRIMARY KEY,
  book_id     INTEGER NOT NULL REFERENCES books (id),
  member_id   INTEGER NOT NULL REFERENCES members (id),
  loaned_on   DATE NOT NULL,
  returned_on DATE                            -- NULL = still out
);
INSERT INTO loans VALUES
  (1, 1, 1, '2026-01-10', '2026-01-24'),
  (2, 2, 1, '2026-02-01', NULL),
  (3, 3, 2, '2026-02-03', '2026-02-20'),
  (4, 6, 3, '2026-02-15', NULL),
  (5, 1, 2, '2026-03-01', '2026-03-12'),
  (6, 5, 3, '2026-03-05', '2026-03-09');
```

| # | Task | Expected result |
|---|---|---|
| 1 | Every loan: date, book title, member name, by date | 6 rows, from 2026-01-10 Dune Maya to 2026-03-05 Foundation Lin |
| 2 | Books on loan right now, and who has them | Neuromancer Maya · The Silmarillion Lin |
| 3 | Members who have never borrowed | Zoe |
| 4 | Books never borrowed, A to Z | Emma, Persuasion, Untitled Draft |
| 5 | Loans per member, including zero, most first then A to Z | Lin 2 · Maya 2 · Omar 2 · Zoe 0 |
| 6 | The most borrowed book | Dune 2 |
| 7 | *(PostgreSQL)* Average days per returned loan, per member | Lin 4 · Maya 14 · Omar 14 |

<details>
<summary>Solutions</summary>

```sql
SELECT l.loaned_on, b.title, m.name
FROM loans l
JOIN books b ON b.id = l.book_id
JOIN members m ON m.id = l.member_id
ORDER BY l.loaned_on;                                              -- 1

SELECT b.title, m.name
FROM loans l
JOIN books b ON b.id = l.book_id
JOIN members m ON m.id = l.member_id
WHERE l.returned_on IS NULL
ORDER BY b.title;                                                  -- 2

SELECT m.name FROM members m
LEFT JOIN loans l ON l.member_id = m.id
WHERE l.id IS NULL;                                                -- 3

SELECT b.title FROM books b
LEFT JOIN loans l ON l.book_id = b.id
WHERE l.id IS NULL
ORDER BY b.title;                                                  -- 4

SELECT m.name, COUNT(l.id) AS loans                                -- COUNT(l.id), not COUNT(*): Zoe gets 0
FROM members m
LEFT JOIN loans l ON l.member_id = m.id
GROUP BY m.name
ORDER BY loans DESC, m.name;                                       -- 5

SELECT b.title, COUNT(*) AS times
FROM loans l JOIN books b ON b.id = l.book_id
GROUP BY b.title
ORDER BY times DESC
LIMIT 1;                                                           -- 6

SELECT m.name, ROUND(AVG(l.returned_on - l.loaned_on)) AS avg_days
FROM loans l JOIN members m ON m.id = l.member_id
WHERE l.returned_on IS NOT NULL
GROUP BY m.name
ORDER BY m.name;                                                   -- 7
```

</details>

**Watch out for:** in task 5, `COUNT(*)` would give Zoe 1 — the `LEFT JOIN`
produces one row for her, with `NULL` loan columns. Count a column from the
right-hand table instead.

**Try it:** task 6 hides ties — if two books were each borrowed twice, you'd
only see one. Rewrite it to return every book with the top count.

---

## Milestone 4: To-do app schema {#milestone-4}

**Practises:** `CREATE TABLE`, primary and foreign keys, `NOT NULL`, `UNIQUE`,
`CHECK`, `DEFAULT`, `ON DELETE CASCADE`, `INSERT`, `UPDATE`, `DELETE`.

**The task:** design the tables for a to-do app, then *prove* each rule works
by running statements that must be rejected. Each statement marked `✗ fails`
should give an error.

```sql
-- Setup: Milestone 4 — to-do app
CREATE TABLE users (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL
);

CREATE TABLE lists (
  id      INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title   TEXT NOT NULL,
  UNIQUE (user_id, title)                           -- no two lists with the same name per user
);

CREATE TABLE tasks (
  id       INTEGER PRIMARY KEY,
  list_id  INTEGER NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
  title    TEXT NOT NULL CHECK (LENGTH(title) > 0),
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),   -- 1 high, 3 low
  due_on   DATE,
  done     BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO users VALUES (1, 'ada@example.com', 'Ada'), (2, 'bo@example.com', 'Bo');
INSERT INTO lists VALUES (10, 1, 'Home'), (11, 1, 'Work'), (12, 2, 'Home');
INSERT INTO tasks (id, list_id, title, priority, due_on) VALUES
  (100, 10, 'Buy milk', 1, '2026-10-01'),
  (101, 10, 'Fix tap', 2, NULL),
  (102, 11, 'Write report', 1, '2026-09-30'),
  (103, 12, 'Call mum', 3, NULL);
```

**Part A — the rules hold.** Every statement here must fail:

```sql
-- ✗ fails: that email is taken (UNIQUE)
INSERT INTO users VALUES (3, 'ada@example.com', 'Another Ada');

-- ✗ fails: Ada already has a list called Home (UNIQUE on two columns)
INSERT INTO lists VALUES (13, 1, 'Home');

-- ✗ fails: list 99 doesn't exist (foreign key)
INSERT INTO tasks (id, list_id, title) VALUES (104, 99, 'Orphan');

-- ✗ fails: priority must be 1-3 (CHECK)
INSERT INTO tasks (id, list_id, title, priority) VALUES (105, 10, 'Too urgent', 5);

-- ✗ fails: empty title (CHECK)
INSERT INTO tasks (id, list_id, title) VALUES (106, 10, '');
```

**Part B — changing data.** Do these in order — each task builds on the one before.

| # | Task | Expected result |
|---|---|---|
| 1 | Add task 107 "Pay rent" to Ada's Home list without giving a priority or done flag, then read it back | 107, Pay rent, priority 2, done false |
| 2 | Mark every high-priority (1) task as done; how many changed? | 2 rows |
| 3 | Count Ada's open (not done) tasks | 2 (Fix tap, Pay rent) |
| 4 | Delete Ada's Work list, then count all tasks | 4 (Write report went with its list) |

<details>
<summary>Solutions</summary>

```sql
INSERT INTO tasks (id, list_id, title) VALUES (107, 10, 'Pay rent');
SELECT id, title, priority, done FROM tasks WHERE id = 107;            -- 1

UPDATE tasks SET done = TRUE WHERE priority = 1 RETURNING id;           -- 2: 100, 102

SELECT COUNT(*) AS open_tasks
FROM tasks t JOIN lists l ON l.id = t.list_id
WHERE l.user_id = 1 AND NOT t.done;                                     -- 3

DELETE FROM lists WHERE id = 11;
SELECT COUNT(*) FROM tasks;                                             -- 4
```

</details>

**Watch out for:** SQLite doesn't enforce foreign keys unless you turn them
on with `PRAGMA foreign_keys = ON;` at the start of each connection. Without
it, the "list 99" insert succeeds.

**Try it:** add a `tags` table and a `task_tags` linking table so one task
can have many tags and one tag many tasks. Which primary key does
`task_tags` need?

---

## Milestone 5: Customer segments {#milestone-5}

**Practises:** subqueries, CTEs, `CASE`, `COALESCE`, `LEFT JOIN` with
aggregates. Uses the [practice database](/cheatsheets/sql#practice-database)
from the cheat sheet — run its setup first.

| # | Task | Expected result |
|---|---|---|
| 1 | Each customer's spend on orders that weren't cancelled — including customers who spent nothing — most first | Ada 324.47 · Di 248.99 · Bo 90.99 · Cy 0 · Ed 0 |
| 2 | Add a segment: `VIP` (200 or more), `regular` (more than 0), `inactive` (0) | Ada VIP · Di VIP · Bo regular · Cy inactive · Ed inactive |
| 3 | How many customers are in each segment, in the order VIP, regular, inactive | VIP 2 · regular 1 · inactive 2 |
| 4 | Products bought by 3 or more different customers (any status) | Keyboard |
| 5 | Customers whose average order value is above the average of all orders (not cancelled) | Di |

<details>
<summary>Solutions</summary>

```sql
WITH order_totals AS (
  SELECT o.id, o.customer_id, SUM(p.price * oi.quantity) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id, o.customer_id
),
spend AS (
  SELECT c.name, COALESCE(SUM(t.total), 0) AS spent            -- 0, not NULL, for Cy and Ed
  FROM customers c
  LEFT JOIN order_totals t ON t.customer_id = c.id
  GROUP BY c.name
),
segments AS (
  SELECT name, spent,
    CASE WHEN spent >= 200 THEN 'VIP'
         WHEN spent > 0    THEN 'regular'
         ELSE 'inactive' END AS segment
  FROM spend
)
SELECT name, spent, segment FROM segments ORDER BY spent DESC, name;   -- 1 and 2

WITH order_totals AS (
  SELECT o.id, o.customer_id, SUM(p.price * oi.quantity) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id, o.customer_id
),
spend AS (
  SELECT c.name, COALESCE(SUM(t.total), 0) AS spent
  FROM customers c LEFT JOIN order_totals t ON t.customer_id = c.id
  GROUP BY c.name
)
SELECT CASE WHEN spent >= 200 THEN 'VIP' WHEN spent > 0 THEN 'regular' ELSE 'inactive' END AS segment,
       COUNT(*) AS customers
FROM spend
GROUP BY 1
ORDER BY CASE WHEN MIN(spent) >= 200 THEN 1 WHEN MIN(spent) > 0 THEN 2 ELSE 3 END;   -- 3

SELECT p.name
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
GROUP BY p.name
HAVING COUNT(DISTINCT o.customer_id) >= 3;                           -- 4

WITH order_totals AS (
  SELECT o.id, o.customer_id, SUM(p.price * oi.quantity) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id, o.customer_id
)
SELECT c.name
FROM order_totals t JOIN customers c ON c.id = t.customer_id
GROUP BY c.name
HAVING AVG(t.total) > (SELECT AVG(total) FROM order_totals);         -- 5
```

</details>

**Watch out for:** sorting task 3 by name (`ORDER BY segment`) puts `VIP`
first on some databases and last on others. Capital letters sort differently
depending on the database's **collation** — its rules for comparing text. When
the order matters, sort by a number (`CASE … THEN 1 …`), as the solution does.

**Try it:** turn the `order_totals` CTE into a view so tasks 1, 3, and 5
don't repeat it.

---

## Milestone 6: Game leaderboard {#milestone-6}

**Practises:** window functions — `RANK`, `DENSE_RANK`, `ROW_NUMBER`, running
totals, `LAG`, and shares of a total.

```sql
-- Setup: Milestone 6 — game leaderboard
CREATE TABLE scores (
  player   TEXT NOT NULL,
  game_day DATE NOT NULL,
  points   INTEGER NOT NULL,
  PRIMARY KEY (player, game_day)
);

INSERT INTO scores VALUES
  ('ana', '2026-05-01', 120), ('ana', '2026-05-02',  90), ('ana', '2026-05-03', 150),
  ('ben', '2026-05-01', 100), ('ben', '2026-05-02', 130), ('ben', '2026-05-03', 150),
  ('cai', '2026-05-01', 120), ('cai', '2026-05-02',  80), ('cai', '2026-05-03',  60);
```

| # | Task | Expected result |
|---|---|---|
| 1 | Overall ranking by total points | ben 380 1 · ana 360 2 · cai 260 3 |
| 2 | Each day's ranking, ties sharing a place with no gaps | 05-01: ana 1, cai 1, ben 2 · 05-02: ben 1, ana 2, cai 3 · 05-03: ana 1, ben 1, cai 2 |
| 3 | Each player's running total, day by day | ana 120, 210, 360 · ben 100, 230, 380 · cai 120, 200, 260 |
| 4 | Change from each player's previous day | ana —, -30, +60 · ben —, +30, +20 · cai —, -40, -20 |
| 5 | Each player's best day (earliest if tied) | ana 05-03 150 · ben 05-03 150 · cai 05-01 120 |
| 6 | Each score as a % of that day's points (1 decimal), 1 May only | ana 35.3 · ben 29.4 · cai 35.3 |

<details>
<summary>Solutions</summary>

```sql
SELECT player, SUM(points) AS total,
       RANK() OVER (ORDER BY SUM(points) DESC) AS place           -- a window over grouped rows
FROM scores GROUP BY player ORDER BY place;                        -- 1

SELECT game_day, player, points,
       DENSE_RANK() OVER (PARTITION BY game_day ORDER BY points DESC) AS place
FROM scores ORDER BY game_day, place, player;                      -- 2

SELECT player, game_day,
       SUM(points) OVER (PARTITION BY player ORDER BY game_day) AS running_total
FROM scores ORDER BY player, game_day;                             -- 3

SELECT player, game_day,
       points - LAG(points) OVER (PARTITION BY player ORDER BY game_day) AS change
FROM scores ORDER BY player, game_day;                             -- 4

SELECT player, game_day, points FROM (
  SELECT s.*, ROW_NUMBER() OVER (PARTITION BY player ORDER BY points DESC, game_day) AS rn
  FROM scores s
) best
WHERE rn = 1 ORDER BY player;                                      -- 5

SELECT player,
       ROUND(100.0 * points / SUM(points) OVER (PARTITION BY game_day), 1) AS pct
FROM scores WHERE game_day = '2026-05-01' ORDER BY player;         -- 6
```

</details>

**Watch out for:** in task 6, the `WHERE` runs *before* the window function.
Here that's fine because you filter to one whole day; filtering to one player
first would make every share 100%.

**Try it:** show a 2-day moving average of each player's points
(`ROWS BETWEEN 1 PRECEDING AND CURRENT ROW`).

---

## Milestone 7: Bank ledger {#milestone-7}

**Practises:** transactions, `ROLLBACK` after a failure, generating test data
with a recursive CTE, indexes, and reading `EXPLAIN` output.

```sql
-- Setup: Milestone 7 — bank ledger
CREATE TABLE accounts (
  id      INTEGER PRIMARY KEY,
  owner   TEXT NOT NULL,
  balance NUMERIC(12, 2) NOT NULL CHECK (balance >= 0)   -- no overdrafts
);
INSERT INTO accounts VALUES (1, 'Ada', 100.00), (2, 'Bo', 50.00);

CREATE TABLE events (
  id         INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  kind       TEXT NOT NULL
);

INSERT INTO events (id, account_id, kind)              -- 50,000 rows of test data
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 50000)
SELECT i, i % 1000, CASE WHEN i % 7 = 0 THEN 'withdrawal' ELSE 'deposit' END FROM n;
```

| # | Task | Expected result |
|---|---|---|
| 1 | In one transaction, move 30.00 from Ada to Bo; then show both balances | Ada 70.00 · Bo 80.00 |
| 2 | Try to move 500.00 from Ada to Bo in a transaction. The first `UPDATE` must fail; roll back and show nothing changed | Ada 100.00 · Bo 50.00 |
| 3 | How many events does account 7 have, and how many are withdrawals? | 50, 8 |
| 4 | *(PostgreSQL)* `EXPLAIN` task 3's count, add an index on `account_id`, and `EXPLAIN` again | `Seq Scan` before; `Bitmap Index Scan` after |

<details>
<summary>Solutions</summary>

```sql
BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE id = 1;
UPDATE accounts SET balance = balance + 30 WHERE id = 2;
COMMIT;
SELECT owner, balance FROM accounts ORDER BY id;                 -- 1
```

```sql
BEGIN;
-- ✗ fails: Ada would go below zero (CHECK)
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
ROLLBACK;                                                        -- the transaction can't continue after an error
SELECT owner, balance FROM accounts ORDER BY id;                 -- 2
```

```sql
SELECT COUNT(*) AS events,
       SUM(CASE WHEN kind = 'withdrawal' THEN 1 ELSE 0 END) AS withdrawals
FROM events WHERE account_id = 7;                                -- 3

EXPLAIN SELECT COUNT(*) FROM events WHERE account_id = 7;        -- 4: before
CREATE INDEX idx_events_account_id ON events (account_id);
ANALYZE events;                                                  -- refresh the planner's statistics
EXPLAIN SELECT COUNT(*) FROM events WHERE account_id = 7;        -- 4: after
```

</details>

What task 4's plans look like (numbers vary from machine to machine):

```text
Before:  Aggregate  (cost=695.42..695.43 rows=1 width=8)
           ->  Seq Scan on events  (cost=0.00..695.00 rows=167 width=0)
                 Filter: (account_id = 7)

After:   Aggregate  (cost=133.29..133.30 rows=1 width=8)
           ->  Bitmap Heap Scan on events  (cost=4.68..133.17 rows=50 width=0)
                 Recheck Cond: (account_id = 7)
                 ->  Bitmap Index Scan on idx_events_account_id  (cost=0.00..4.67 rows=50 width=0)
                       Index Cond: (account_id = 7)
```

Read it from the most-indented line outwards. The cost falls from about 700 to
about 130: the index finds account 7's 50 rows directly (`Bitmap Index Scan`),
then only those rows are fetched from the table (`Bitmap Heap Scan`) instead
of reading all 50,000. The estimate also improves from 167 rows to the real 50,
thanks to `ANALYZE`.

**Watch out for:** in PostgreSQL, once a statement fails inside a
transaction, every later statement fails too ("current transaction is
aborted") until you `ROLLBACK`. That's a safety feature, not a bug.

**Try it:** add a `transfers` table and write the transfer as: insert a
transfer row, then update both balances — all in one transaction. Check that
a failed transfer leaves no transfer row behind.

---

## After Milestone 7 {#after}

**In short:** you now have seven `.sql` files with queries that give the
right answers — proof you can write real SQL.

- [ ] Every task's result matches the expected one.
- [ ] You did each milestone's **Try it**.
- [ ] Your git history has one or more commits per milestone.

Next, go back to the [Roadmap](/docs/learning-path/sql/implementation-roadmap#tracks)
and start your role track.
