---
title: "Performance Testing Learning Path: Start Here"
description: "How to learn performance testing in six milestones on a local practice app with deliberate bottlenecks — metrics, load, stress, spike, soak, CI gates and reporting — with answer keys and a final project."
sidebar_position: 1
level: beginner
tags: [performance-testing, k6, learning-path]
---

# Performance Testing Learning Path: Start Here

**In short:** you learn performance testing in **6 milestones** on a small
practice app that runs on your own machine and has **three deliberate
problems** — a CPU-heavy endpoint, a tiny connection pool and a memory leak.
Each milestone finds, proves or fixes one of them, with an answer key.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → test → check → commit**. Come back here whenever you're
unsure what to do next.

:::

## Before you start {#before}

- Node.js 20+ and [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) installed.
- The [practice lab](/cheatsheets/performance-testing#practice-lab) saved as `app/server.js` and running:
  `node --expose-gc app/server.js`.
- Basic JavaScript (functions, objects) — k6 scripts are JavaScript.
- Helpful: the [API testing cheat sheet](/cheatsheets/api-testing), sections 1–8.

## The pages in this learning path {#pages}

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan and self-checks | At the start of each milestone |
| [Performance testing cheat sheet](/cheatsheets/performance-testing) | Learn each idea, with real results from the lab | The "learn" step |
| [Milestones & Mini-Projects](/docs/learning-path/performance-testing/milestones-and-mini-projects) | Tasks, expected results, answer keys | The "test" and "check" steps |
| [Quick Reference](/docs/fundamentals/performance-testing/performance-testing-quick-reference) | Formulas, k6 options, executors, bottleneck signs | Any time |
| [Best Practices](/docs/fundamentals/performance-testing/best-practices) | Habits that make results believable | After Milestone 3, then before every report |
| Performance testing guide | The whole service | For the deeper "why" |

## The milestones {#milestones}

| Milestone | You learn | You work on | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Metrics, percentiles, checks, thresholds | Smoke test + reading results | 1 week |
| [2](#milestone-2) | Workload models, executors, tags, test data | Load test at expected peak | 1 week |
| [3](#milestone-3) | Little's Law, stress testing, bottlenecks | Find the orders capacity — and raise it | 1–2 weeks |
| [4](#milestone-4) | Spike testing, recovery | A sale-start burst | 1 week |
| [5](#milestone-5) | Soak testing, resource metrics | Find and fix the memory leak | 1 week |
| [6](#milestone-6) | CI gates, baselines, reporting | A deploy gate and a full report | 1–2 weeks |

Times assume about 5 hours a week.

**For each milestone:**

1. **Learn** — read the cheat-sheet sections below and run their examples.
2. **Test** — do the tasks in [Milestones & Mini-Projects](/docs/learning-path/performance-testing/milestones-and-mini-projects).
3. **Check** — compare with the expected results, then open the answer key.
4. **Commit** — scripts, results (`summary.json`) and notes:

```text
perf-portfolio/
├── app/server.js
├── tests/smoke.js  load.js  stress.js  spike.js  soak.js  ci-gate.js
├── data/search-terms.json
├── results/<date>-<test>.json
└── reports/performance-report.md
```

### Milestone 1: Metrics & first test {#milestone-1}

**Learn:** [What performance testing is](/cheatsheets/performance-testing#what-is-it) ·
[Test types](/cheatsheets/performance-testing#test-types) ·
[Key metrics](/cheatsheets/performance-testing#metrics) ·
[Percentiles](/cheatsheets/performance-testing#percentiles) ·
[Your first k6 test](/cheatsheets/performance-testing#first-test) ·
[Reading the summary](/cheatsheets/performance-testing#summary) ·
[Checks vs thresholds](/cheatsheets/performance-testing#checks-thresholds) ·
[Virtual users & think time](/cheatsheets/performance-testing#vus)

**Work on:** [Smoke test](/docs/learning-path/performance-testing/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] Why report p95 instead of the average?
- [ ] What's the difference between a check and a threshold?
- [ ] What does k6's exit code 99 mean?

### Milestone 2: Load test {#milestone-2}

**Learn:** [Workload model](/cheatsheets/performance-testing#workload) ·
[Scenarios & executors](/cheatsheets/performance-testing#executors) ·
[Load test](/cheatsheets/performance-testing#load-test) ·
[Test data](/cheatsheets/performance-testing#test-data) ·
[Tags & per-endpoint limits](/cheatsheets/performance-testing#tags)

**Work on:** [Load test at peak](/docs/learning-path/performance-testing/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] Why use an arrival-rate executor for web traffic?
- [ ] Why vary test data?
- [ ] What does `dropped_iterations` tell you?

### Milestone 3: Stress & capacity {#milestone-3}

**Learn:** [Little's Law](/cheatsheets/performance-testing#littles-law) ·
[Stress test](/cheatsheets/performance-testing#stress-test) ·
[Finding the bottleneck](/cheatsheets/performance-testing#bottleneck) ·
[Custom metrics](/cheatsheets/performance-testing#custom-metrics) ·
Quick Reference: [Formulas](/docs/fundamentals/performance-testing/performance-testing-quick-reference#formulas),
[Bottleneck signs](/docs/fundamentals/performance-testing/performance-testing-quick-reference#bottleneck-signs)

**Work on:** [Find the orders capacity](/docs/learning-path/performance-testing/milestones-and-mini-projects#milestone-3)

**Then read:** [Best Practices](/docs/fundamentals/performance-testing/best-practices), sections 1–6.

**Check yourself:**
- [ ] Predict the maximum throughput of a pool of 8 connections held 40 ms each.
- [ ] Which lab metric proved the pool was the bottleneck?
- [ ] Why use `abortOnFail` in stress tests?

### Milestone 4: Spike & recovery {#milestone-4}

**Learn:** [Spike test](/cheatsheets/performance-testing#spike-test) ·
Quick Reference: [Thresholds](/docs/fundamentals/performance-testing/performance-testing-quick-reference#thresholds)

**Work on:** [A sale-start burst](/docs/learning-path/performance-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] Why split a spike test into before / during / after scenarios?
- [ ] "No errors" — does that mean the spike went well?

### Milestone 5: Soak & leaks {#milestone-5}

**Learn:** [Soak test](/cheatsheets/performance-testing#soak-test) ·
[Realistic environments](/cheatsheets/performance-testing#environment) ·
Quick Reference: [Data and lifecycle](/docs/fundamentals/performance-testing/performance-testing-quick-reference#data-lifecycle)

**Work on:** [Find and fix the memory leak](/docs/learning-path/performance-testing/milestones-and-mini-projects#milestone-5)

**Check yourself:**
- [ ] Why can a soak test pass every response-time threshold and still fail?
- [ ] Why does the lab force garbage collection before reporting memory?

### Milestone 6: CI gate & report {#milestone-6}

**Learn:** [CI gates](/cheatsheets/performance-testing#ci-gates) ·
[Reporting](/cheatsheets/performance-testing#reporting) ·
[Front-end performance](/cheatsheets/performance-testing#frontend) ·
Quick Reference: [Report outline](/docs/fundamentals/performance-testing/performance-testing-quick-reference#report-outline)

**Work on:** [A deploy gate and a report](/docs/learning-path/performance-testing/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/performance-testing/best-practices), sections 7–11.

**Check yourself:**
- [ ] Why can a loose threshold miss a 3× slowdown — and what catches it instead?
- [ ] What goes in the first line of a performance report?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| `connection refused` | The lab isn't running — start it; check nothing else uses port 3333 |
| Results change a lot between runs | Close other heavy apps; run twice; compare medians too |
| `dropped_iterations` on arrival-rate tests | Raise `maxVUs` — or the system is so slow that all VUs are busy (that's a finding) |
| Memory numbers jump around | Start the lab with `--expose-gc` so `/metrics` collects garbage first |
| Your laptop's fan screams | Your generator and the lab share a machine; keep rates modest — the *shapes* still teach |

## What's next {#next}

- Observe systems properly: [Observability guide](/docs/sre-skills/observability-grafana-prometheus/observability-grafana-prometheus-guide).
- Go deeper on system resources: [System performance guide](/docs/sre-skills/system-performance/system-performance-guide).
- Enterprise tool: [JMeter guide](/docs/sdet-skills/jmeter/jmeter-guide).

**Good books to read alongside:** *Systems Performance* (Brendan Gregg) for the
USE method and resource analysis, and the free
[k6 documentation](https://grafana.com/docs/k6/latest/) for every option.
