---
title: "Role Guides Overview"
description: "Which Python skills matter most for SDET, SDE, and SRE roles, and how to use the role guides after learning the core language."
sidebar_position: 1
level: intermediate
tags: [python, sre, sdet, sde]
image: /img/mental-model-share.png
---

# Role Guides: Python for SDET, SDE, and SRE

**In short:** everyone learns the same core Python first. After that, each role
uses Python for different jobs, so each role gets its own guide.

:::tip How to use this page

1. Find your role in the table below.
2. Finish the core language first (the [cheat sheet](/cheatsheets/python) or
   [Python Fundamentals](/docs/fundamentals/python/fundamentals-basic-to-advanced)).
3. Then read your role's two guides in order: the main guide first, the
   advanced guide second.

:::

## The three roles {#roles}

**In short:** the job title tells you what you mostly use Python *for*.

| Role | Full name | What you mostly use Python for |
|---|---|---|
| **SDET** | Software Development Engineer in Test | Writing automated tests and test frameworks |
| **SDE** | Software Development Engineer | Building applications, services, and APIs |
| **SRE** | Site Reliability Engineer | Automating operations and keeping systems running |

## Which guide to read {#guides}

| Role | Start with | Then |
|---|---|---|
| SDET | [Python for SDET](/docs/role-guides/sdet/python-for-sdet) | [Advanced Python for SDET](/docs/role-guides/sdet/advanced-python-for-sdet) |
| SDE | [Python for SDE](/docs/role-guides/sde/python-for-sde) | [Advanced Python for SDE](/docs/role-guides/sde/advanced-python-for-sde) |
| SRE | [Python for SRE](/docs/role-guides/sre/python-for-sre) | [Advanced Python for SRE](/docs/role-guides/sre/advanced-python-for-sre) |

The main guide shows how everyday Python (functions, classes, files, errors)
applies to your role. The advanced guide covers the bigger topics you'll meet
on the job.

**Learning Java instead?** SDETs start with [Java for SDET](/docs/role-guides/sdet/java-for-sdet)
after the [Java learning path](/docs/learning-path/java/implementation-roadmap).

**Working with databases?** After the [SQL learning path](/docs/learning-path/sql/implementation-roadmap),
SDETs read [SQL for SDET](/docs/role-guides/sdet/sql-for-sdet).

## What everyone learns first {#core}

**In short:** these topics are the same for every role. Learn them once, in
this order, before moving to a role guide.

1. **Setup** — install Python, create a virtual environment, run a script.
2. **Values & types** — numbers, text, `True`/`False`, `None`.
3. **Collections** — `list`, `tuple`, `set`, `dict`, and when to use each.
4. **Decisions & loops** — `if`, `for`, `while`, comprehensions.
5. **Functions** — arguments, return values, small lambdas.
6. **Classes** — objects, dataclasses, inheritance.
7. **Handling errors** — `try` / `except`, raising your own errors.
8. **Files & modules** — reading and writing files, importing code.
9. **Testing & logging** — `pytest`, the `logging` module.
10. **Type hints** — describing what types your code expects.
11. **Doing several things at once** — threads, processes, and `async`.
12. **Talking to web services** — sending HTTP requests, building a small API.

The [Learning Path](/docs/learning-path/python/implementation-roadmap) turns
this list into a week-by-week plan with a mini-project for each step.

## What each role adds {#role-topics}

**In short:** after the core, each role goes deeper on a different set of
topics.

**SDET — testing and automation**

- Advanced `pytest`: fixtures (shared setup), parametrising (one test, many inputs)
- Mocking: replacing slow or external parts, like a real web service, with fakes
- Browser and API automation frameworks
- Running tests automatically on every code change (CI/CD — continuous
  integration / continuous delivery)
- Testing `async` code

**SDE — building and shipping software**

- Packaging your code so others can install it with `pip`
- Deployment: getting code safely onto servers
- Background jobs and message queues (e.g. Celery), for work that shouldn't
  make a user wait
- Database design
- Security basics: secrets, input checking, safe dependencies

**SRE — running systems reliably**

- Automating infrastructure and cloud tasks
- Kubernetes: the system that runs and restarts containers
- Monitoring: metrics, logs, and alerts
- Automating incident response (runbooks as scripts)
- Chaos testing: breaking things on purpose to prove the system recovers

## How important each topic is, by role {#priority}

**In short:** the same topic can be daily work for one role and occasional for
another. Use this to decide what to learn first.

| Topic | SDET | SDE | SRE |
|---|---|---|---|
| Advanced testing | Essential | Important | Useful |
| Mocking | Essential | Essential | Important |
| CI/CD | Essential | Important | Essential |
| Packaging | Useful | Essential | Useful |
| Deployment | Sometimes | Essential | Essential |
| Message queues | Important | Essential | Important |
| Security | Important | Essential | Essential |
| Infrastructure automation | Sometimes | Sometimes | Essential |
| Monitoring | Important | Important | Essential |

## Topics shared by all roles {#shared}

A few advanced topics show up in every role once you work on real systems:

- **Testing in production** — checking a live system safely.
- **Safe releases** — rolling out to a few users first (a *canary* release) or
  switching between two identical environments (*blue-green*).
- **Rolling back** — undoing a bad release quickly.
- **Performance testing** — measuring speed under load before users notice.

**Try it:** pick your role, open its main guide, and skim the section headings.
Tick off the ones you could already explain to a colleague — the rest is your
study list.
