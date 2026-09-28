---
title: "Performance Testing Quick Reference"
description: "Copy-paste performance testing reference — test types and shapes, metric formulas, k6 CLI, options, executors, thresholds, checks, custom metrics, tags, test-data loading, bottleneck signs, SLO examples and report outline."
sidebar_position: 1
level: beginner
tags: [performance-testing, k6, fundamentals, cheat-sheet]
---

# Performance Testing Quick Reference

A lookup page for planning, scripting and reading performance tests, with k6
syntax and the maths you need.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
performance testing? Start with the [performance testing cheat sheet](/cheatsheets/performance-testing),
which explains each idea with an exercise on a practice lab. For the ordered
plan, see the [performance testing learning path](/docs/learning-path/performance-testing/implementation-roadmap).

:::

## Quick Navigation

**Planning:** [Test types](#test-types) · [Formulas](#formulas) · [SLO examples](#slo-examples) · [Workload template](#workload-template)

**k6:** [CLI](#cli) · [Options](#options) · [Executors](#executors) · [Thresholds](#thresholds) · [Checks and HTTP](#checks-http) · [Custom metrics](#custom-metrics) · [Data and lifecycle](#data-lifecycle) · [Built-in metrics](#built-in-metrics)

**Analysis:** [Bottleneck signs](#bottleneck-signs) · [Report outline](#report-outline) · [Tool equivalents](#tool-equivalents)

---

## Test types {#test-types}

| Type | k6 shape | Example |
|---|---|---|
| Smoke | `vus: 1, duration: '1m'` | Script works |
| Load | `ramping-vus` or `ramping-arrival-rate` up to peak, hold | `stages: [{ target: 50, duration: '5m' }, { target: 50, duration: '30m' }, { target: 0, duration: '2m' }]` |
| Stress | `ramping-arrival-rate` past peak | Targets 1× → 1.5× → 2× → 3× peak |
| Spike | Separate scenarios with `startTime` | 5 → 150 → 5 users |
| Soak | Constant load for hours | `vus: 50, duration: '4h'` |
| Breakpoint | Slow, long ramp with `abortOnFail` | `ramping-arrival-rate` to a very high target |

## Formulas {#formulas}

| What | Formula | Example |
|---|---|---|
| Little's Law | concurrency = arrival rate × time in system | 20 sessions/s × 90 s = 1,800 users |
| Max throughput of a pool | pool size ÷ time held | 5 ÷ 0.05 s = 100/s |
| Requests per second from VUs (closed model) | VUs ÷ (response time + think time) | 100 ÷ (0.2 + 1.8 s) = 50 req/s |
| Peak from daily volume (rough) | daily requests ÷ 86,400 × peak factor | 4.32 M ÷ 86,400 × 3 = 150 req/s |
| Error rate | failed ÷ total | 12 ÷ 6,000 = 0.2% |
| Headroom | (capacity − peak) ÷ peak | (100 − 60) ÷ 60 ≈ 67% |

Peak factor (peak hour vs average) is an assumption — get it from real traffic data.

## SLO examples {#slo-examples}

```text
Checkout API:  at 200 req/s, p95 < 400 ms, p99 < 1 s, errors < 0.1%
Search:        at 500 req/s, p95 < 300 ms
Login:         p95 < 800 ms; 0 errors at 3× normal peak for 10 minutes
Soak:          4 h at normal peak; memory and p95 flat (± 10%) from hour 1 to hour 4
```

## Workload template {#workload-template}

```text
Peak time:        <day/hour>        Source: <analytics/logs, date range>
Peak rate:        <n> req/s (or sessions/h)   Growth factor to test: ×<n>
Journey mix:      browse <n>% | search <n>% | checkout <n>% | account <n>%
Think time:       <n>–<n> s between steps
Data:             <n> users, <n> products, <n> orders (volume in test DB)
Out of scope:     <third parties mocked, batch jobs>
```

---

## CLI {#cli}

| Command | Does |
|---|---|
| `k6 run script.js` | Run a test |
| `k6 run --vus 10 --duration 30s script.js` | Override load from the command line |
| `k6 run -e BASE_URL=https://staging.example.com script.js` | Pass a variable (`__ENV.BASE_URL`) |
| `k6 run --quiet script.js` | No progress bar |
| `k6 run --out json=results.json script.js` | Every data point to a file |
| `k6 run --summary-export=summary.json script.js` | Summary to a file (or use `handleSummary`) |
| `k6 inspect script.js` | Show the resolved options |
| `k6 version` | Version |

Exit code **99** = a threshold failed; that's what fails CI.

## Options {#options}

```js
export const options = {
  vus: 10, duration: '30s',                       // simple fixed load
  stages: [{ target: 20, duration: '1m' }],        // or ramping VUs
  scenarios: { /* see executors */ },              // or full control
  thresholds: { http_req_duration: ['p(95)<300'] },
  noConnectionReuse: false,                        // true = new connection per request
  insecureSkipTLSVerify: false,                    // true only for test certificates
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};
```

## Executors {#executors}

| Executor | Key options | Model |
|---|---|---|
| `shared-iterations` | `vus`, `iterations` | Fixed work, shared |
| `per-vu-iterations` | `vus`, `iterations` | Fixed work per VU |
| `constant-vus` | `vus`, `duration` | Closed |
| `ramping-vus` | `startVUs`, `stages` | Closed |
| `constant-arrival-rate` | `rate`, `timeUnit`, `duration`, `preAllocatedVUs`, `maxVUs` | Open |
| `ramping-arrival-rate` | `startRate`, `timeUnit`, `stages`, `preAllocatedVUs`, `maxVUs` | Open |
| `externally-controlled` | `vus`, `maxVUs` | Controlled at runtime |

Scenario extras: `exec: 'functionName'`, `startTime: '30s'`, `tags: {…}`, `env: {…}`.

`dropped_iterations` > 0 on an arrival-rate executor = not enough VUs to keep
the rate (raise `maxVUs`) — or the system is so slow that VUs are all busy.

## Thresholds {#thresholds}

```js
thresholds: {
  http_req_duration: ['p(95)<300', 'p(99)<1000'],       // several rules
  'http_req_duration{name:search}': ['p(95)<300'],       // one tagged endpoint
  'http_req_duration{scenario:after}': ['p(95)<50'],     // one scenario
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.99'],
  order_time: [{ threshold: 'p(95)<500', abortOnFail: true, delayAbortEval: '10s' }],
}
```

Aggregations: Trend `avg`, `min`, `max`, `med`, `p(N)`; Rate `rate`; Counter `count`, `rate`; Gauge `value`.

## Checks and HTTP {#checks-http}

```js
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const res = http.post(url, JSON.stringify(body), {
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  tags: { name: 'create-order' },
  timeout: '10s',
});
check(res, {
  'status 201': (r) => r.status === 201,
  'has id': (r) => r.json('orderId') !== undefined,
  'under 500 ms': (r) => r.timings.duration < 500,
});
group('checkout', () => { /* several requests reported as one group */ });
sleep(Math.random() * 2 + 1);                   // 1–3 s think time
http.batch([['GET', url1], ['GET', url2]]);     // parallel requests, like a browser
```

`r.timings`: `blocked`, `connecting`, `tls_handshaking`, `sending`, `waiting` (time to first byte), `receiving`, `duration`.

## Custom metrics {#custom-metrics}

```js
import { Trend, Counter, Rate, Gauge } from 'k6/metrics';
const t = new Trend('order_time', true);  t.add(res.timings.duration);
const c = new Counter('orders');          c.add(1);
const r = new Rate('sold_out');           r.add(res.status === 409);
const g = new Gauge('queue_depth');       g.add(res.json('poolWaiting'));
```

## Data and lifecycle {#data-lifecycle}

```js
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
const users = new SharedArray('users', () => papaparse.parse(open('./users.csv'), { header: true }).data);

export function setup() { return { token: login() }; }         // once, before load
export default function (data) { /* uses data.token */ }        // every iteration
export function teardown(data) { /* once, after load */ }
export function handleSummary(data) { return { 'summary.json': JSON.stringify(data) }; }
```

`__VU` (1-based VU number) and `__ITER` (0-based iteration) help pick unique
data: `users[(__VU - 1) % users.length]`.

## Built-in metrics {#built-in-metrics}

| Metric | Type | Meaning |
|---|---|---|
| `http_reqs` | Counter | Requests sent |
| `http_req_duration` | Trend | Sending + waiting + receiving |
| `http_req_waiting` | Trend | Time to first byte |
| `http_req_failed` | Rate | Failed requests (by default status ≥ 400 or network error) |
| `iterations` / `iteration_duration` | Counter / Trend | Loops completed / time per loop |
| `vus` / `vus_max` | Gauge | Active / allocated VUs |
| `checks` | Rate | Checks passed |
| `data_sent` / `data_received` | Counter | Bytes |
| `dropped_iterations` | Counter | Iterations an arrival-rate executor couldn't start |

---

## Bottleneck signs {#bottleneck-signs}

| Pattern | Likely cause | Where to look |
|---|---|---|
| Throughput flat, latency rising, CPU ~100% | CPU-bound code | Profiler, CPU per process |
| Latency jumps at one exact concurrency | Pool limit (DB, threads, HTTP client) | Pool metrics: in-use, waiting |
| One endpoint slow, others fine | Slow query / missing index / N+1 queries | Slow-query log, traces |
| Periodic latency spikes | Garbage collection, cron jobs, autoscaling | GC logs, job schedules |
| Memory climbs and never falls | Leak (cache without limit, listeners) | Heap metrics over a soak |
| Errors rise, latency falls | Failing fast (rate limit, circuit breaker, 5xx) | Error codes, logs |
| Everything slow including static files | Network, load balancer, generator overloaded | Generator CPU, network graphs |

## Report outline {#report-outline}

```text
1. Verdict vs SLOs; capacity estimate
2. Set-up: environment, data volume, workload model, tool, duration
3. Results: p50/p95/p99, throughput, errors per journey; graphs over time
4. Bottleneck with evidence
5. Recommendations, ranked
6. Next test and baseline for comparison
```

## Tool equivalents {#tool-equivalents}

| Idea | k6 | JMeter | Gatling | Locust |
|---|---|---|---|---|
| User flow | default function | Thread Group + samplers | Scenario | `HttpUser` task |
| Users | VUs | Threads | Users | Users |
| Arrival rate | `*-arrival-rate` executors | Throughput timers / plugins | `injectOpen(constantUsersPerSec)` | `constant_pacing` |
| Think time | `sleep()` | Timers | `pause()` | `wait_time` |
| Assertion | `check()` | Assertions | `check()` | Manual `response.failure()` |
| Pass/fail | `thresholds` | (plugins / CI parsing) | `assertions` | Custom exit code |

**Need more detail?** [Cheat sheet](/cheatsheets/performance-testing) ·
[Best practices](/docs/fundamentals/performance-testing/best-practices) ·
[Learning path](/docs/learning-path/performance-testing/implementation-roadmap) ·
Full guide
