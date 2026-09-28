---
title: "Performance Testing Best Practices"
description: "Habits that make performance test results trustworthy and useful — agree targets first, model real traffic, realistic data and environments, healthy load generators, measure the server, one change at a time, baselines, CI gates, safety, and a pre-report checklist."
sidebar_position: 2
level: intermediate
tags: [performance-testing, k6, fundamentals, best-practices]
---

# Performance Testing Best Practices

This page lists good habits for performance testing. They make your numbers
**believable** — so that a "yes, it will handle the sale" is right — and make
your findings lead to fixes. They apply to SDETs, SREs and developers alike.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example, where it helps, from the [practice lab](/cheatsheets/performance-testing#practice-lab).

:::tip How to use this page

Read it once after you finish Part 2 of the [performance testing cheat sheet](/cheatsheets/performance-testing),
then use [the checklist at the end](#11-short-checklist-before-you-report)
before sending any performance report.

:::

---

## Contents

1. [Agree Targets First](#1-agree-targets-first)
2. [Model Real Traffic](#2-model-real-traffic)
3. [Realistic Data](#3-realistic-data)
4. [Realistic Environments](#4-realistic-environments)
5. [Healthy Load Generators](#5-healthy-load-generators)
6. [Measure the Server, Not Just the Client](#6-measure-the-server-not-just-the-client)
7. [Change One Thing at a Time](#7-change-one-thing-at-a-time)
8. [Baselines and Trends](#8-baselines-and-trends)
9. [Performance in CI](#9-performance-in-ci)
10. [Safety](#10-safety)
11. [Short Checklist Before You Report](#11-short-checklist-before-you-report)

---

## 1. Agree Targets First

**In short:** a result means nothing without a target agreed before the test.

- **Do** write SLOs as numbers: load, percentile, time, error rate.
  **Why:** "p95 < 300 ms at 50 req/s" can pass or fail; "fast enough" can't.
- **Do** agree targets with the business owner, not only engineers.
  **Why:** they decide what "good enough for the sale" means.
- **Do** put the targets in the script as thresholds.
  **Why:** the test itself says pass or fail — no debate after the run.

---

## 2. Model Real Traffic

**In short:** load shaped like production gives results that predict production.

- **Do** build the journey mix and peak rate from analytics or access logs.
  **Why:** 100% "add to cart" tests a system nobody uses.
- **Do** include think time between steps.
  **Why:** without it, 100 virtual users act like thousands of real ones.
- **Do** use an arrival-rate (open) executor for public web traffic.
  **Why:** real users keep arriving when the site is slow; a closed model backs off and hides the problem.
- **Do** test the expected peak **and** the growth factor (×1.5, ×2).
  **Why:** the plan has to survive next year's sale, too.

---

## 3. Realistic Data

**In short:** data size and variety change results more than most people expect.

- **Do** test against production-like data **volume** (masked).
  **Why:** a query over 100 rows is instant; over 20 million it may need an index you forgot.
- **Do** vary inputs: different users, products, search terms, including expensive ones.
  **Why:** repeated identical requests hit caches and look faster than reality.
- **Do** give each virtual user its own account where the app locks per user.
  **Why:** 100 VUs logged in as one user test lock contention, not your workload.

---

## 4. Realistic Environments

**In short:** know how the test environment differs from production, and say so.

- **Do** match instance sizes, counts and config — or state the ratio and scale carefully.
  **Why:** half the servers doesn't always mean half the capacity.
- **Do** mock third parties that forbid load (payments, email, SMS).
  **Why:** their sandboxes throttle or ban you, and the results reflect them, not you.
- **Do** keep the environment to yourself during the test.
  **Why:** someone else's batch job can look exactly like your bottleneck.

---

## 5. Healthy Load Generators

**In short:** if the machine generating load is struggling, your numbers describe it, not the system.

- **Do** watch CPU and memory on the load generator.
  **Why:** over ~80% CPU, the generator itself adds latency.
- **Do** run generators close to the system (same region / network).
  **Why:** home Wi-Fi and the public internet add noise to every number.
- **Do** distribute very large tests across several machines or a cloud service.
  **Why:** one laptop can't simulate a national sale.

---

## 6. Measure the Server, Not Just the Client

**In short:** client numbers say *that* it's slow; server numbers say *why*.

- **Do** collect CPU, memory, connection pools, queue depths, GC and database
  metrics during every run.
  **Why:** in the lab, only `/metrics` showed 45 orders waiting for 5 connections.
- **Do** keep graphs over time, not just end-of-run averages.
  **Why:** a leak or a slow start is a shape over time — the soak test's memory went 4 → 153 MB while response times looked fine.
- **Do** use traces for the slowest requests.
  **Why:** they show which call inside the request took the time.

---

## 7. Change One Thing at a Time

**In short:** tune in small steps and re-test after each, or you won't know what helped.

- **Do** form a hypothesis first: "the pool limits orders to ~100/s".
  **Why:** a prediction you can test beats random tuning.
- **Do** change one setting, re-run the same test, compare.
  **Why:** change pool size *and* caching together and you can't tell which fixed it.
- **Do** repeat runs (at least 2–3) before trusting a difference.
  **Why:** run-to-run noise of 5–10% is normal.

---

## 8. Baselines and Trends

**In short:** compare with the last result, not with an ideal.

- **Do** store every run's summary (JSON) with the build/version.
  **Why:** "p95 went 52 → 180 ms in build 2.9" points straight at a change.
- **Do** re-run the same baseline test after fixes.
  **Why:** proves the fix and becomes the new baseline.

---

## 9. Performance in CI

**In short:** a short, stable performance gate on every deploy; big tests on a schedule.

- **Do** run a few-minute gate test with thresholds after each staging deploy.
  **Why:** most regressions are caught the day they're introduced.
- **Do** keep gate thresholds a little looser than SLOs and stable across runs.
  **Why:** a flaky gate gets switched off.
- **Do** run full load, stress and soak tests before big releases and on a schedule.
  **Why:** they take too long for every change, but capacity drifts over time.

---

## 10. Safety

**In short:** a load test is a controlled attack — have permission, a plan and a stop button.

- **Don't** load-test systems you don't own or have written permission to test.
  **Why:** it can take a service down and may be illegal; to the provider it looks like a denial-of-service attack.
- **Do** tell the on-call team and monitoring owners before big tests.
  **Why:** otherwise they'll treat your test as an incident.
- **Do** use `abortOnFail` thresholds and ramp gradually.
  **Why:** you stop at the breaking point instead of far past it.
- **Don't** test production without an agreed window, limits and a rollback plan.

---

## 11. Short Checklist Before You Report

- [ ] Targets (SLOs) were agreed before the test and are in the script as thresholds
- [ ] Workload model and think time come from real traffic data
- [ ] Data volume and variety are production-like (and masked)
- [ ] Environment differences from production are stated
- [ ] Load generator stayed healthy (CPU, network) — evidence kept
- [ ] Server-side metrics collected for the whole run
- [ ] Results repeated at least twice; noise understood
- [ ] Bottleneck named with evidence; recommendations ranked
- [ ] Compared with the previous baseline
- [ ] Verdict is the first line of the report

**Need more detail?** [Cheat sheet](/cheatsheets/performance-testing) ·
[Quick reference](/docs/fundamentals/performance-testing/performance-testing-quick-reference) ·
Full guide
