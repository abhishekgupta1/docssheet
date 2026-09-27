---
title: "Implementation Roadmap"
description: "How the Python learning path fits together — which document to read when, the milestone flow, the portfolio you build, and troubleshooting."
sidebar_position: 1
level: beginner
tags: [python, learning-path]
image: /img/mental-model-share.png
---

# Python Learning Path: Start Here

**In short:** you learn core Python in **7 milestones**, building one small
project in each. Then you pick a role — SDET, SDE, or SRE — and go deeper on
the skills that role uses.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → build → test → commit**. Come back here whenever you're
unsure what to do next.

:::

## The pages in this learning path {#pages}

**In short:** each page has one job. You'll use two of them side by side for
every milestone.

| Page | What it's for | When to open it |
|---|---|---|
| [Comprehensive Syllabus](/docs/learning-path/python/comprehensive-syllabus) | What to learn in each milestone, with examples and a self-check | At the start of each milestone |
| [Milestones & Mini-Projects](/docs/learning-path/python/milestones-and-mini-projects) | A full working project for each milestone, with tests | After reading the syllabus section |
| [Python Comprehensive Guide](/docs/learning-path/python/python-comprehensive-guide) | Syllabus and projects combined in one long page | If you prefer everything in one place |
| [Role Guides](/docs/role-guides/role-guides-overview) | Why each skill matters for SDET, SDE, and SRE | When choosing your track, or when motivation dips |

Quick lookups while you work: the [Python cheat sheet](/cheatsheets/python)
and the [Quick Reference](/docs/fundamentals/python/python-quick-reference).

## Part 1 — Core Python: Milestones 1–7 {#core}

**In short:** everyone does these seven, in order. Each one ends with a
working project in your portfolio.

| Milestone | You learn | You build |
|---|---|---|
| 1 | Setup, values, types, type hints | Config manager |
| 2 | Lists, tuples, sets, dicts, comprehensions | JSON API response parser |
| 3 | `if`, loops, handling errors | Email validator & classifier |
| 4 | Functions, closures, decorators | Rate limiter & retry handler |
| 5 | Classes, inheritance, dataclasses | User management system |
| 6 | Modules, generators, context managers | Log parser |
| 7 | Files, regex, measuring speed | Data processing pipeline |

**For each milestone:**

1. **Learn** — read that milestone in the [Syllabus](/docs/learning-path/python/comprehensive-syllabus).
2. **Build** — follow its project in [Milestones & Mini-Projects](/docs/learning-path/python/milestones-and-mini-projects). Type the code; don't paste it.
3. **Test** — run the tests with `python -m pytest -v` until they pass. Then add one test of your own.
4. **Commit** — save your progress with git:

```bash
git add .
git commit -m "Milestone 1: config manager, 5 tests passing"
git push
```

## Part 2 — Your role track: Milestone 8 onwards {#tracks}

**In short:** after Milestone 7, pick the role you're aiming for. Not sure?
The [Role Guides overview](/docs/role-guides/role-guides-overview) compares them.

| Track | Focus | Read | Final project |
|---|---|---|---|
| **SDET** (test engineer) | Testing and test frameworks | [Syllabus, Milestones 8–13](/docs/learning-path/python/comprehensive-syllabus#sdet-track) and [Advanced Python for SDET](/docs/role-guides/sdet/advanced-python-for-sdet) | A full test automation suite with CI |
| **SDE** (software developer) | Building and shipping services | [Python for SDE](/docs/role-guides/sde/python-for-sde) and [Advanced Python for SDE](/docs/role-guides/sde/advanced-python-for-sde) | A deployable web service |
| **SRE** (reliability engineer) | Automation and running systems | [Python for SRE](/docs/role-guides/sre/python-for-sre) and [Advanced Python for SRE](/docs/role-guides/sre/advanced-python-for-sre) | A reliability toolkit: health checks, metrics, alerts |

## Your portfolio {#portfolio}

**In short:** by Milestone 7 you'll have seven small, tested projects in one
GitHub repository — proof you can write real Python.

```text
python-mastery/
├── milestone1-config-manager/
├── milestone2-json-parser/
├── milestone3-email-validator/
├── milestone4-rate-limiter/
├── milestone5-user-management/
├── milestone6-log-parser/
├── milestone7-data-pipeline/
└── README.md            # one line per project: what it does, how to run it
```

Your role track then adds one larger final project.

## How you know you're ready to move on {#checkpoints}

**After Milestone 7:**

- [ ] Seven projects built, each with passing tests.
- [ ] You can explain when to use a `list`, `set`, or `dict`.
- [ ] You can read a file, handle errors, and log what happened.
- [ ] Your git history shows steady progress.

**After your role track:**

- [ ] You finished the final project for your track.
- [ ] You can explain the design choices in it to someone else.

## If you get stuck {#troubleshooting}

| Problem | What to do |
|---|---|
| A milestone feels too hard | Re-read that milestone's syllabus section, slow down, and run each example on its own. Compare with the finished project code. |
| "I already know Python" | Still do Milestones 1–7, but extend each project with an extra feature and more tests. |
| Losing motivation | Look back at your portfolio, and read your role's guide to see where each skill is used on the job. |
| Not enough time | Do less, but regularly. One milestone done well beats four rushed. Milestones 2 and 3 combine easily. |

## Start now {#start}

Create a folder and a virtual environment (a private space for this project's
libraries), then open [Milestone 1 in the Syllabus](/docs/learning-path/python/comprehensive-syllabus#milestone-1).

```bash
mkdir -p ~/projects/python-mastery/milestone1-config-manager
cd ~/projects/python-mastery
git init
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install pytest
```

**Helpful tools** (install when you reach the milestone that uses them):

| Tool | What it does |
|---|---|
| `pytest`, `pytest-cov` | Run tests; show which lines your tests cover |
| `ruff` | Finds likely bugs and formats your code |
| `mypy` | Checks your type hints |

**Good books to read alongside:** *Fluent Python* (Luciano Ramalho) for
idiomatic Python, and *The Pragmatic Programmer* (Hunt & Thomas) for
professional habits.
