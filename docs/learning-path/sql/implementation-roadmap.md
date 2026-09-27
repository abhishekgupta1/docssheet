---
title: "SQL Learning Path: Start Here"
description: "How to learn SQL in seven milestones — what to learn in each, the dataset and tasks you work through, how to check yourself, and the role track that follows."
sidebar_position: 1
level: beginner
tags: [sql, learning-path]
image: /img/social/sql-learning-path.png
---

# SQL Learning Path: Start Here

**In short:** you learn SQL in **7 milestones**. Each one has a small dataset
and a set of tasks with the expected answers, so you always know whether
you're right. Then you apply SQL to your role.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → solve → check → commit**. Come back here whenever you're
unsure what to do next.

:::

## The pages in this learning path {#pages}

**In short:** each page has one job, so nothing is explained twice.

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan: what each milestone covers and how to check yourself | At the start of each milestone |
| [SQL cheat sheet](/cheatsheets/sql) | Learn each idea: short explanation, example, exercise | The "learn" step of every milestone |
| [Milestones & Mini-Projects](/docs/learning-path/sql/milestones-and-mini-projects) | A dataset and tasks with expected results for each milestone | The "solve" and "check" steps |
| [Quick Reference](/docs/fundamentals/sql/sql-quick-reference) | Look up syntax, functions, and other databases' spellings | Any time you're writing SQL |
| [SQL Best Practices](/docs/fundamentals/sql/coding-best-practices) | Habits that keep SQL readable, fast, and safe | After Milestone 4, then before every merge |
| [SQL: The Complete Guide](/docs/sdet-skills/sql/sql-guide) | Internals and interview questions | When you want the deeper "why" |

## Part 1 — Core SQL: Milestones 1–7 {#core}

**In short:** everyone does these seven, in order.

| Milestone | You learn | You work on |
|---|---|---|
| [1](#milestone-1) | Choosing, sorting, and limiting rows | Library catalogue |
| [2](#milestone-2) | Counting, grouping, and summarising | Weather report |
| [3](#milestone-3) | Joining tables | Library loans |
| [4](#milestone-4) | Creating tables, constraints, changing data | To-do app schema |
| [5](#milestone-5) | Subqueries, CTEs, `CASE` | Customer segments |
| [6](#milestone-6) | Window functions | Game leaderboard |
| [7](#milestone-7) | Transactions, indexes, query plans | Bank ledger |

**For each milestone:**

1. **Learn** — read the cheat-sheet sections listed below, and run every
   example on the [practice database](/cheatsheets/sql#practice-database).
2. **Solve** — run the milestone's setup in
   [Milestones & Mini-Projects](/docs/learning-path/sql/milestones-and-mini-projects),
   then write a query for each task.
3. **Check** — compare your result with the expected one. Only then open the
   solution, and compare the two queries too.
4. **Commit** — save your queries in `milestone-N.sql` and commit:

```bash
git add milestone-1.sql
git commit -m "Milestone 1: library catalogue, 8/8 tasks correct"
```

### Milestone 1: Choosing rows {#milestone-1}

**Learn:** [What SQL is](/cheatsheets/sql#what-is-sql) ·
[Choosing rows](/cheatsheets/sql#select-where) ·
[Sorting & limiting](/cheatsheets/sql#order-limit) ·
[Text, numbers & NULL](/cheatsheets/sql#text-numbers-null)

**Work on:** [Library catalogue](/docs/learning-path/sql/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] Why does `WHERE email = NULL` never match anything?
- [ ] What's the difference between `LIKE 'The%'` and `LIKE 'The %'`?
- [ ] Why can't you rely on row order without `ORDER BY`?

### Milestone 2: Counting & grouping {#milestone-2}

**Learn:** [Counting & grouping](/cheatsheets/sql#group-by) ·
Quick Reference: [Aggregates](/docs/fundamentals/sql/sql-quick-reference#aggregates),
[Clause order](/docs/fundamentals/sql/sql-quick-reference#clause-order)

**Work on:** [Weather report](/docs/learning-path/sql/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] What's the difference between `COUNT(*)` and `COUNT(column)`?
- [ ] When do you use `WHERE`, and when `HAVING`?
- [ ] Why must every selected column be grouped or aggregated?

### Milestone 3: Joining tables {#milestone-3}

**Learn:** [Joining tables](/cheatsheets/sql#joins) ·
Quick Reference: [Joins](/docs/fundamentals/sql/sql-quick-reference#joins)

**Work on:** [Library loans](/docs/learning-path/sql/milestones-and-mini-projects#milestone-3)

**Check yourself:**
- [ ] When do you need a `LEFT JOIN` instead of a `JOIN`?
- [ ] How do you find rows in one table with no match in another?
- [ ] Why can a join make a `SUM` or `COUNT` too big?

### Milestone 4: Building tables & changing data {#milestone-4}

**Learn:** [Changing data](/cheatsheets/sql#changing-data) ·
[Creating tables](/cheatsheets/sql#create-table) ·
[Insert or update (upsert)](/cheatsheets/sql#upsert)

**Work on:** [To-do app schema](/docs/learning-path/sql/milestones-and-mini-projects#milestone-4)

**Then read:** [SQL Best Practices](/docs/fundamentals/sql/coding-best-practices), sections 1–5 and 8–9.

**Check yourself:**
- [ ] What does each constraint type protect against?
- [ ] What does `ON DELETE CASCADE` do, and when is it dangerous?
- [ ] What's your routine before running an `UPDATE` on real data?

### Milestone 5: Subqueries, CTEs & CASE {#milestone-5}

**Learn:** [Subqueries](/cheatsheets/sql#subqueries) ·
[CTEs](/cheatsheets/sql#ctes) ·
[CASE](/cheatsheets/sql#case) ·
[Combining results](/cheatsheets/sql#set-operations) ·
[Views](/cheatsheets/sql#views)

**Work on:** [Customer segments](/docs/learning-path/sql/milestones-and-mini-projects#milestone-5)

**Check yourself:**
- [ ] When is a CTE clearer than a subquery?
- [ ] Why is `NOT EXISTS` safer than `NOT IN`?
- [ ] How do you count several conditions in one pass?

### Milestone 6: Window functions {#milestone-6}

**Learn:** [Window functions](/cheatsheets/sql#window-functions) ·
[Dates & times](/cheatsheets/sql#dates) ·
Quick Reference: [Window functions](/docs/fundamentals/sql/sql-quick-reference#window-functions)

**Work on:** [Game leaderboard](/docs/learning-path/sql/milestones-and-mini-projects#milestone-6)

**Check yourself:**
- [ ] What's the difference between `GROUP BY` and `PARTITION BY`?
- [ ] When do `RANK`, `DENSE_RANK`, and `ROW_NUMBER` give different answers?
- [ ] How do you get the top row per group?

### Milestone 7: Transactions & performance {#milestone-7}

**Learn:** [Indexes](/cheatsheets/sql#indexes) ·
[Transactions](/cheatsheets/sql#transactions) ·
[Reading query plans](/cheatsheets/sql#explain) ·
[Isolation & locking](/cheatsheets/sql#isolation) ·
[Recursive queries](/cheatsheets/sql#recursive)

**Work on:** [Bank ledger](/docs/learning-path/sql/milestones-and-mini-projects#milestone-7)

**Check yourself:**
- [ ] What do the four letters of ACID promise?
- [ ] Which columns would you index first, and what does each index cost?
- [ ] How do you spot a full-table scan in a plan?

## Part 2 — Your role track {#tracks}

**In short:** SQL is used differently by each role. Pick yours.

| Role | Read next | Final project |
|---|---|---|
| **SDET** (test engineer) | [SQL for SDET](/docs/role-guides/sdet/sql-for-sdet) — checking what the app saved, test data, data-quality checks, comparing tables, testing migrations | A database test suite that runs in CI |
| **SDE** (software developer) | [SQL Best Practices](/docs/fundamentals/sql/coding-best-practices) sections 6–11, then the [complete guide](/docs/sdet-skills/sql/sql-guide) on indexes and transactions | A small app with migrations and parameterised queries |
| **SRE** (reliability engineer) | [Isolation & locking](/cheatsheets/sql#isolation), [Reading query plans](/cheatsheets/sql#explain), and the Quick Reference's [monitoring one-liners](/docs/fundamentals/sql/sql-quick-reference#one-liners-to-remember) | A runbook for "the database is slow": find the query, read its plan, fix it |

Also finish the cheat sheet's Part 3: [JSON columns](/cheatsheets/sql#json),
[Designing tables](/cheatsheets/sql#normalisation), and
[SQL from code](/cheatsheets/sql#sql-from-code).

## How you know you're ready to move on {#checkpoints}

**After Milestone 7:**

- [ ] Every task in all seven milestones gives the expected result.
- [ ] You can write a three-table join with grouping without looking anything up.
- [ ] You can explain a query plan's main line to someone else.
- [ ] Your git history shows steady progress.

## If you get stuck {#troubleshooting}

| Problem | What to do |
|---|---|
| "column … does not exist" | Check the [clause order](/docs/fundamentals/sql/sql-quick-reference#clause-order): `WHERE` can't use a `SELECT` alias. Also check spelling and table aliases. |
| "must appear in the GROUP BY clause" | Every selected column must be grouped or inside `COUNT`/`SUM`/…. |
| Too many rows after a join | A join condition is missing or matches more than you expected — count rows after each join. |
| Right numbers, wrong order | Add or fix `ORDER BY`. |
| Your answer differs from the expected one | Run the setup again on a fresh database — earlier experiments may have changed the data. |

## Start now {#start}

Install PostgreSQL (or use SQLite, already on macOS and most Linux), create a
database, and load the practice data from the
[cheat sheet](/cheatsheets/sql#practice-database).

```bash
createdb shop                       # PostgreSQL: create a database
psql shop                           # open it, then paste the practice setup
# or, with SQLite:
sqlite3 shop.db                     # creates the file on first use
```

**Helpful tools:**

| Tool | What it does |
|---|---|
| DBeaver or pgAdmin | Free desktop apps to browse tables and run queries |
| `psql` / `sqlite3` | Command-line clients — see the [command table](/docs/fundamentals/sql/sql-quick-reference#command-line-tools) |
| Docker | Run PostgreSQL without installing it: `docker run -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres` |

**Good books to read alongside:** *Learning SQL* (Alan Beaulieu) to build
foundations, and *SQL Performance Explained* (Markus Winand, also free online
as "Use The Index, Luke") for indexes and speed.
