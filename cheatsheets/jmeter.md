---
title: "JMeter Cheat Sheet"
description: "Quick reference for JMeter — test plan structure, load test types, correlation, and CI execution."
tags: [jmeter, sdet, performance-testing, cheat-sheet]
hide_table_of_contents: true
---

# JMeter cheatsheet

A one-page reference for JMeter. For distributed testing and metrics
deep-dives, see the [complete guide](/docs/sdet-skills/jmeter/jmeter-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/jmeter/jmeter-guide">📖 Full guide: JMeter →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Test plan structure

```
Test Plan
 └─ Thread Group
     ├─ HTTP Request Sampler
     ├─ Assertions (Response, Duration)
     ├─ Listeners (View Results Tree, Summary Report)
     └─ Config Elements (CSV Data Set, HTTP Header Manager)
```

</div>

<div class="cheat-card">

#### Thread group config

| Field | Meaning |
|---|---|
| Threads | concurrent virtual users |
| Ramp-up | seconds to start all threads |
| Loop count | iterations per thread |

</div>

<div class="cheat-card">

#### Types of load testing

| Type | Goal |
|---|---|
| Load | expected traffic, verify SLAs |
| Stress | push past capacity, find breaking point |
| Spike | sudden traffic burst |
| Soak | sustained load over hours — finds leaks |

</div>

<div class="cheat-card">

#### Correlation & parameterization

```
CSV Data Set Config → ${username}, ${password}
Regular Expression Extractor → capture sessionId from response
${sessionId} → reused in next request
```

Correlation replays dynamic values (tokens, IDs) that change per session.

</div>

<div class="cheat-card">

#### Distributed (remote) testing

```bash
# on each worker
jmeter-server

# on the controller
jmeter -n -t plan.jmx -R worker1,worker2 -l results.jtl
```

</div>

<div class="cheat-card">

#### Key metrics

- **Throughput** — requests/sec the system sustains.
- **Latency** vs **response time** — latency excludes time to read the full response.
- **Error %** — failed requests under load.
- **90th/95th/99th percentile** — tail latency, more meaningful than average.

</div>

<div class="cheat-card">

#### Non-GUI mode for CI

```bash
jmeter -n -t plan.jmx -l results.jtl -e -o report/
```

Always run load tests non-GUI — the GUI itself consumes resources and skews results.

</div>

<div class="cheat-card">

#### Common pitfalls

- Running from a resource-starved laptop instead of a dedicated load generator.
- Ignoring think-time — unrealistic hammering vs real user pacing.
- Not correlating dynamic tokens — replays fail silently after session 1.

<span class="cheat-see">See: Common Pitfalls</span>

</div>

</div>
