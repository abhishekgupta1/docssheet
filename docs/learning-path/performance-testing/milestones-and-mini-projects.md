---
title: "Performance Testing Milestones & Mini-Projects"
description: "Tasks with expected results for each of the six performance testing milestones on a local practice app — smoke, load at peak, stress and capacity, spike and recovery, soak and a memory leak, and a CI gate with a full report."
sidebar_position: 2
level: beginner
tags: [performance-testing, k6, learning-path, projects]
---

# Performance Testing Milestones & Mini-Projects

**In short:** six projects on the [practice lab](/cheatsheets/performance-testing#practice-lab),
each with tasks, **expected results** and a folded answer key. Every number
below comes from a real run on a laptop; yours will differ a little, but the
*patterns* — where it breaks, what grows — will match.

:::tip How to use this page

Start the lab (`node --expose-gc app/server.js`) before each milestone, and
restart it between tests so every run starts clean. First read the milestone
in the [Roadmap](/docs/learning-path/performance-testing/implementation-roadmap).
Write your prediction *before* each run — comparing prediction with result is
how you learn to reason about performance.

:::

## Contents

- [Milestone 1: Smoke test](#milestone-1)
- [Milestone 2: Load test at peak](#milestone-2)
- [Milestone 3: Find the orders capacity](#milestone-3)
- [Milestone 4: A sale-start burst](#milestone-4)
- [Milestone 5: Find and fix the memory leak](#milestone-5)
- [Milestone 6: A deploy gate and a report](#milestone-6)
- [Final project](#final-project)

---

## Milestone 1: Smoke test {#milestone-1}

**Practises:** k6 basics, checks, thresholds, reading the summary, percentiles by hand.

| # | Task | Expected result |
|---|---|---|
| 1 | Write `tests/smoke.js`: 1 VU, 10 s, products + search + order each iteration, `sleep(1)` | Runs, all checks ✓ |
| 2 | Thresholds: every check passes, no failed requests | Both ✓, exit code 0 |
| 3 | Find the slowest endpoint from the summary | Orders (~50 ms) |
| 4 | Add a check that products returns 20 items | ✓ |
| 5 | By hand: average, p50 and p90 of `20 21 22 22 23 24 25 26 30 900` ms | 111.3 / 23.5 / 30 |
| 6 | Stop the lab and run again | Checks ✗, threshold ✗, exit code 99 |

<details>
<summary>Answer key</summary>

```js title="tests/smoke.js"
// tests/smoke.js — 1 user, every endpoint once a second: "does it work at all?"
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    checks: ['rate==1.0'],               // every check must pass
    http_req_failed: ['rate==0'],
  },
};

export default function () {
  check(http.get(`${BASE_URL}/api/products`), { 'products 200': (r) => r.status === 200 });
  check(http.get(`${BASE_URL}/api/search?q=product`), { 'search 200': (r) => r.status === 200 });
  check(http.post(`${BASE_URL}/api/orders`), { 'order 201': (r) => r.status === 201 });
  sleep(1);
}
```

```text
    ✓ products 200
    ✓ search 200
    ✓ order 201
    http_req_duration..............: avg=24.01ms min=495µs med=19.68ms max=51.88ms p(90)=51.74ms p(95)=51.79ms
    http_reqs......................: 30     2.794269/s
```

Task 3: `http_req_duration` mixes all three endpoints; max ≈ 52 ms comes from
orders (each holds a "DB connection" for 50 ms). Tag requests (Milestone 2) to
see each endpoint separately.

Task 4: `'20 products': (r) => r.json().length === 20`.

</details>

**Watch out for:** reading `iteration_duration` (~1.07 s) as response time —
it includes the `sleep(1)`.

**Try it:** remove `sleep(1)`. How many requests per second does **one** VU
now make? Why is that unrealistic?

---

## Milestone 2: Load test at peak {#milestone-2}

**Practises:** workload models, arrival-rate executors, tags, per-endpoint thresholds, test data.

**Workload model (given):** peak 50 req/s — browse 30/s, search 12/s, order 8/s.
Targets: products p95 < 100 ms, search p95 < 300 ms, order p95 < 200 ms, errors < 1%.

| # | Task | Expected result |
|---|---|---|
| 1 | One scenario per journey with `constant-arrival-rate` for 30 s | 3 scenarios run in parallel |
| 2 | Search terms from `data/search-terms.json` via `SharedArray` | Varied queries |
| 3 | Tag each request with `name`; one threshold per endpoint | 3 duration thresholds + 1 error threshold |
| 4 | Run it | All 4 thresholds ✓ |
| 5 | Double every rate and re-run; note which endpoint degrades first | See answer key |

<details>
<summary>Answer key</summary>

```js title="tests/load.js"
// tests/load.js — the expected peak: a realistic mix of journeys at a fixed arrival rate
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';
const terms = new SharedArray('terms', () => JSON.parse(open('../data/search-terms.json')));

export const options = {
  scenarios: {
    browse: { executor: 'constant-arrival-rate', exec: 'browse', rate: 30, timeUnit: '1s', duration: '30s', preAllocatedVUs: 20 },
    search: { executor: 'constant-arrival-rate', exec: 'search', rate: 12, timeUnit: '1s', duration: '30s', preAllocatedVUs: 20 },
    order:  { executor: 'constant-arrival-rate', exec: 'order',  rate: 8,  timeUnit: '1s', duration: '30s', preAllocatedVUs: 20 },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:products}': ['p(95)<100'],
    'http_req_duration{name:search}': ['p(95)<300'],
    'http_req_duration{name:order}': ['p(95)<200'],
  },
};

export function browse() {
  const r = http.get(`${BASE_URL}/api/products`, { tags: { name: 'products' } });
  check(r, { 'products 200': (res) => res.status === 200 });
}

export function search() {
  const q = terms[Math.floor(Math.random() * terms.length)];          // test data from a file
  const r = http.get(`${BASE_URL}/api/search?q=${encodeURIComponent(q)}`, { tags: { name: 'search' } });
  check(r, { 'search 200': (res) => res.status === 200 });
}

export function order() {
  const r = http.post(`${BASE_URL}/api/orders`, null, { tags: { name: 'order' } });
  check(r, { 'order 201': (res) => res.status === 201 });
  sleep(0.5);                                                          // think time after buying
}
```

Result of task 4:

```text
    ✓ 'p(95)<200' p(95)=68.66ms          ← order
    ✓ 'p(95)<100' p(95)=11.33ms          ← products
    ✓ 'p(95)<300' p(95)=21.48ms          ← search
    ✓ 'rate<0.01' rate=0.00%
```

Task 5: at 16 orders/s the pool (100/s capacity) is still fine; search at
24/s adds CPU load but stays well under 300 ms on most laptops. The load test
at ×2 still passes — which tells you there's headroom, but not how much.
That's Milestone 3's job.

</details>

**Watch out for:** putting all three journeys in one default function with
`if (Math.random() < 0.6)` and a VU-based executor — it works, but the arrival
rate then depends on response times (closed model).

**Try it:** change the order scenario to `ramping-arrival-rate` from 8 to 40/s.
Does anything change?

---

## Milestone 3: Find the orders capacity {#milestone-3}

**Practises:** Little's Law, stress testing, custom metrics, `abortOnFail`,
bottleneck evidence, re-testing a fix.

| # | Task | Expected result |
|---|---|---|
| 1 | **Predict** the max orders/s from the code: 5 connections, 50 ms each | ~100/s |
| 2 | Stress test: orders from 20 → 60 → 100 → 160/s, `order_time` Trend, abort when p95 > 500 ms | Aborts partway |
| 3 | During the run, watch `/metrics` | `poolInUse` 5, `poolWaiting` climbing |
| 4 | Write the finding: bottleneck, evidence, capacity | 3 sentences |
| 5 | **Predict**, then set `POOL_SIZE = 10`, restart, re-run | Passes all stages |

<details>
<summary>Answer key</summary>

```js title="tests/stress.js"
// tests/stress.js — keep raising the order rate until the system breaks, and see HOW it breaks
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';
const orderTime = new Trend('order_time', true);                      // custom metric, in ms

export const options = {
  scenarios: {
    rising_orders: {
      executor: 'ramping-arrival-rate',
      startRate: 20, timeUnit: '1s',
      preAllocatedVUs: 50, maxVUs: 400,
      stages: [
        { target: 60, duration: '10s' },     // below capacity
        { target: 100, duration: '10s' },    // around capacity
        { target: 160, duration: '10s' },    // past capacity
      ],
    },
  },
  thresholds: {
    order_time: [{ threshold: 'p(95)<500', abortOnFail: true, delayAbortEval: '5s' }],   // stop once it's clearly broken
  },
};

export default function () {
  const r = http.post(`${BASE_URL}/api/orders`);
  orderTime.add(r.timings.duration);
  check(r, { 'order 201': (res) => res.status === 201 });
}
```

Task 2 result (original lab):

```text
    ✗ 'p(95)<500' p(95)=614.59ms
    http_reqs......................: 1784   68.608476/s
level=error msg="thresholds on metrics 'order_time' were crossed; … stopping test prematurely"
```

Task 3 — `/metrics` at the end: `{"poolInUse":5,"poolWaiting":48,…}`.

Task 4 — a good finding: *"Orders are limited to about 100 per second by the
database connection pool (5 connections × 50 ms). Above that, requests queue:
48 were waiting and p95 reached 615 ms, so the test stopped. Expected peak is
8 orders/s, so there is about 12× headroom today."*

Task 5 result with 10 connections — no abort, all stages pass:

```text
    ✓ 'p(95)<500' p(95)=52.78ms
    http_reqs......................: 2499   83.170404/s
```

New predicted capacity: 10 ÷ 0.05 = 200/s, above this test's 160/s top stage.

</details>

**Watch out for:** `http_reqs` of ~69/s in the aborted run is **not** the
capacity — it's an average over the whole run, including the slow start. The
capacity is where latency started climbing (~100/s).

**Try it:** extend the stages to 250/s with 10 connections. Does it break
close to 200/s, as predicted?

---

## Milestone 4: A sale-start burst {#milestone-4}

**Practises:** spike tests, scenarios with `startTime`, per-scenario thresholds, recovery.

| # | Task | Expected result |
|---|---|---|
| 1 | Three scenarios on search: 5 VUs (10 s) → 150 VUs (10 s) → 5 VUs (10 s), `sleep(0.2)` | Runs 30 s |
| 2 | Thresholds: before and after p95 < 50 ms; during p95 < 1 s; errors < 1% | See answer key |
| 3 | Explain why search suffers so much | CPU-bound on one thread |
| 4 | Recommend two fixes | See answer key |

<details>
<summary>Answer key</summary>

```js title="tests/spike.js"
// tests/spike.js — a sudden burst (a sale starts), then back to normal: does it recover?
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  scenarios: {
    before: { executor: 'constant-vus', vus: 5, duration: '10s' },
    spike:  { executor: 'constant-vus', vus: 150, duration: '10s', startTime: '10s' },
    after:  { executor: 'constant-vus', vus: 5, duration: '10s', startTime: '20s' },
  },
  thresholds: {
    'http_req_duration{scenario:before}': ['p(95)<50'],
    'http_req_duration{scenario:spike}': ['p(95)<1000'],    // slower during the spike is acceptable…
    'http_req_duration{scenario:after}': ['p(95)<50'],      // …but it must recover afterwards
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  check(http.get(`${BASE_URL}/api/search?q=product`), { 'search 200': (r) => r.status === 200 });
  sleep(0.2);
}
```

```text
    ✓ 'p(95)<50' p(95)=37.31ms       ← before
    ✗ 'p(95)<1000' p(95)=12.5s       ← during
    ✓ 'p(95)<50' p(95)=32.64ms       ← after — recovered
    ✓ 'rate<0.01' rate=0.00%
```

Task 3: every search burns CPU for ~25–30 ms, and Node.js runs this code on
one thread. 150 users × 5 searches/s each would need far more CPU time per
second than one thread has, so requests queue — for up to 12 s.

Task 4: cache results for common queries; move search to a proper search
index; run several processes (cluster) or instances behind a load balancer;
rate-limit per user during a sale.

</details>

**Watch out for:** "0% errors" reads as success, but users waited 12 seconds —
most would have left. Always report latency *and* errors.

**Try it:** add a fourth scenario that runs `GET /api/products` during the
spike. Is browsing also slow? (Hint: one thread serves everything.)

---

## Milestone 5: Find and fix the memory leak {#milestone-5}

**Practises:** soak tests, `setup`/`teardown`, resource metrics, proving a fix.

| # | Task | Expected result |
|---|---|---|
| 1 | Soak test on `/api/report`: 5 VUs, 30 s; log heap before and after via `/metrics` | Heap grows by ~150 MB |
| 2 | Run it against the other endpoints instead — which one leaks? | Only `/api/report` |
| 3 | Find the leak in `server.js` | The `cache` array |
| 4 | Fix it (keep only the newest 50 entries), restart, re-run | Heap stays small |

<details>
<summary>Answer key</summary>

```js title="tests/soak.js"
// tests/soak.js — steady, modest load for a long time; watch memory, not just speed
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  vus: 5,
  duration: __ENV.DURATION || '30s',     // real soak tests run for hours: DURATION=4h
};

export function setup() {
  return { heapBefore: http.get(`${BASE_URL}/metrics`).json('heapMB') };
}

export default function () {
  check(http.get(`${BASE_URL}/api/report`), { 'report 200': (r) => r.status === 200 });
  sleep(0.2);
}

export function teardown(data) {
  const heapAfter = http.get(`${BASE_URL}/metrics`).json('heapMB');
  console.log(`heap before: ${data.heapBefore} MB, after: ${heapAfter} MB`);
}
```

```text
leaky:  level=info msg="heap before: 4 MB, after: 153 MB"
fixed:  level=info msg="heap before: 4 MB, after: 14 MB"
```

The fix in `server.js`:

```js
      cache.push(new Array(25_000).fill(Math.random()));
      if (cache.length > 50) cache.shift();                          // fixed: keep only the newest 50
```

A real fix would use a proper cache with a size limit and expiry (an LRU cache).

</details>

**Watch out for:** without `--expose-gc`, heap numbers include garbage that
hasn't been collected yet — a fixed leak can still *look* like it grows. That's
why the lab collects garbage before reporting.

**Try it:** run the leaky version with `DURATION=2m`. Extrapolate: how long
until it reaches 2 GB?

---

## Milestone 6: A deploy gate and a report {#milestone-6}

**Practises:** CI gates, `handleSummary`, baselines, regression detection, reporting.

| # | Task | Expected result |
|---|---|---|
| 1 | `tests/ci-gate.js`: 5 VUs, 20 s; thresholds per endpoint; `handleSummary` writes `results/summary.json` and prints one line | One-line result, JSON saved |
| 2 | A GitHub Actions workflow that runs the gate | Passes `actionlint` |
| 3 | Simulate a regression: change `dbQuery(50)` to `dbQuery(150)`; run the gate | **Still passes** — see answer key |
| 4 | Change it to `dbQuery(250)`; run the gate | Fails, exit code 99 |
| 5 | Write the full performance report for the lab (all milestones) | Verdict first; outline in the [quick reference](/docs/fundamentals/performance-testing/performance-testing-quick-reference#report-outline) |

<details>
<summary>Answer key</summary>

```js title="tests/ci-gate.js"
// tests/ci-gate.js — a short performance gate for every deploy; writes a JSON summary for the pipeline
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:products}': ['p(95)<100'],
    'http_req_duration{name:order}': ['p(95)<200'],
  },
};

export default function () {
  check(http.get(`${BASE_URL}/api/products`, { tags: { name: 'products' } }), { 'products 200': (r) => r.status === 200 });
  check(http.post(`${BASE_URL}/api/orders`, null, { tags: { name: 'order' } }), { 'order 201': (r) => r.status === 201 });
}

export function handleSummary(data) {
  const p95 = (name) => data.metrics[`http_req_duration{name:${name}}`].values['p(95)'].toFixed(1);
  const line = `products p95=${p95('products')}ms, order p95=${p95('order')}ms, errors=${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`;
  return {
    stdout: `\n${line}\n`,                                   // short line in the CI log
    'results/summary.json': JSON.stringify(data, null, 2),   // full data kept as an artifact
  };
}
```

```yaml title=".github/workflows/perf.yml"
# .github/workflows/perf.yml — run the performance gate after each deploy to staging
name: performance-gate

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  k6:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v5
      - uses: grafana/setup-k6-action@v1
      - name: Run the gate (fails the job if a threshold fails)
        run: k6 run tests/ci-gate.js
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: k6-summary
          path: results/summary.json
```

```text
baseline:      products p95=0.6ms, order p95=52.0ms, errors=0.00%      exit 0
dbQuery(150):  products p95=1.5ms, order p95=153.9ms, errors=0.00%    exit 0   ← 3× slower, still "passes"
dbQuery(250):  products p95=2.7ms, order p95=254.6ms, errors=0.00%    exit 99
```

Task 3 is the lesson: a threshold of 200 ms lets a **3× slowdown** through.
Keep the JSON from each run and compare with the previous baseline (for
example, fail or warn if p95 grows by more than 25%) — thresholds catch
disasters; baselines catch regressions.

The report's first lines, for example:

```text
Verdict:    Meets targets at expected peak (50 req/s); orders capacity ≈ 100/s (≈12× headroom).
Risks:      Search is CPU-bound (p95 12.5 s during a 150-user burst).
            Memory leak in /api/report (+150 MB in 30 s) — fixed and verified.
```

</details>

**Watch out for:** `handleSummary` replaces k6's normal end-of-test summary on
screen — the ✓/✗ lines disappear, but the exit code still reports threshold
failures.

**Try it:** add a step that compares `results/summary.json` with a stored
`baseline.json` and fails if order p95 rose by more than 25%.

---

## Final project {#final-project}

Performance-test an application you run yourself — your own API, or an open
source app started locally in Docker (for example OWASP Juice Shop on
`localhost:3000`). Never load-test someone else's system without written permission.

**Done when:**

- [ ] Workload model written down (journeys, mix, peak, think time) with its source
- [ ] SLOs agreed with yourself in writing *before* testing, as thresholds
- [ ] Smoke, load, stress, spike and soak scripts, each run at least twice
- [ ] Server-side evidence for every finding (resource metrics, logs)
- [ ] One bottleneck fixed (or configured) and the improvement proven with a re-run
- [ ] CI gate workflow and a stored baseline
- [ ] Report with the verdict first — proof you can deliver the
      performance testing service
