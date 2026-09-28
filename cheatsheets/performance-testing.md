---
title: "Performance Testing Cheat Sheet"
description: "A beginner-to-advanced reference for performance testing with k6 — test types, metrics and percentiles, virtual users and arrival rates, workload models, load, stress, spike and soak tests, bottlenecks, CI gates and reporting."
level: beginner
tags: [performance-testing, load-testing, k6, sre, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Performance testing cheatsheet

Learn to measure how fast and how stable a system is under load, and to find
what breaks first. Examples use [k6](https://grafana.com/docs/k6/latest/)
(tests written in JavaScript) against a **local practice app with deliberate
bottlenecks**, so you can push it as hard as you like. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — a script or command, with real output from a run.
- **Try it** — a small exercise on the practice lab.

Every script on this page was run against the lab; the numbers shown are from
those runs (yours will differ a little). Want the longer story? The
performance testing guide
covers the service end to end.

<a class="topic-crosslink" href="/docs/sdet-skills/qa-services-delivery/performance-testing">📖 Full guide: Performance testing →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Performance testing learning sections">
  <a class="button button--primary" href="/docs/learning-path/performance-testing/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/performance-testing/performance-testing-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/performance-testing/best-practices">Best Practices</a>
</nav>

:::tip How to use this page

Start the [practice lab](#practice-lab) first. Then go through **Part 1** in
order — it gets you running and reading tests. **Part 2** covers the four main
test types and realistic workloads. **Part 3** is about finding the
bottleneck and making performance a gate in CI. Only load-test systems you own
or have written permission to test.

:::

## Contents {#contents}

**[Practice lab](#practice-lab)**

**[Part 1 — Beginner](#part-1)**:
[What performance testing is](#what-is-it) ·
[Test types](#test-types) ·
[Key metrics](#metrics) ·
[Percentiles](#percentiles) ·
[Your first k6 test](#first-test) ·
[Reading the summary](#summary) ·
[Checks vs thresholds](#checks-thresholds) ·
[Virtual users & think time](#vus)

**[Part 2 — Core](#part-2)**:
[Workload model](#workload) ·
[Little's Law](#littles-law) ·
[Scenarios & executors](#executors) ·
[Load test](#load-test) ·
[Test data](#test-data) ·
[Tags & per-endpoint limits](#tags) ·
[Stress test](#stress-test) ·
[Spike test](#spike-test) ·
[Soak test](#soak-test) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Finding the bottleneck](#bottleneck) ·
[Custom metrics](#custom-metrics) ·
[CI gates](#ci-gates) ·
[Front-end performance](#frontend) ·
[Realistic environments](#environment) ·
[Reporting](#reporting) ·
[Other tools](#other-tools) ·
[Words you'll meet](#glossary)

## Practice lab {#practice-lab}

**In short:** a small Node.js "shop" API on your machine, with three
deliberate problems for you to find: a slow CPU-heavy endpoint, a small
database connection pool, and a memory leak.

| Endpoint | Behaviour |
|---|---|
| `GET /api/products` | Fast (in memory) |
| `GET /api/search?q=…` | Burns CPU on every call |
| `POST /api/orders` | Needs a "database connection" for 50 ms; there are only 5 |
| `GET /api/report` | Keeps ~200 KB in memory per call, forever |
| `GET /metrics` | Live numbers: connections in use/waiting, memory, request count |

```bash
node --expose-gc app/server.js     # Node.js 20+, no install needed
# shop-perf-lab on http://localhost:3333
brew install k6                    # or see grafana.com/docs/k6/latest/set-up/install-k6
```

<details>
<summary>The lab's code (<code>app/server.js</code>)</summary>

```js title="app/server.js"
// app/server.js — a tiny shop API with deliberate bottlenecks, for safe load-testing practice
// Run: node --expose-gc app/server.js   (no dependencies; listens on http://localhost:3333)
const http = require('node:http');

const products = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}`, price: 5 + (i % 50) }));
const POOL_SIZE = 5;                 // like a database connection pool with 5 connections
let poolInUse = 0;
const poolQueue = [];
const cache = [];                    // grows forever: a deliberate memory leak
const stats = { requests: 0, errors: 0 };

function withConnection(work) {      // wait for a free "DB connection", then run the query
  return new Promise((resolve) => {
    const run = async () => {
      poolInUse++;
      try { resolve(await work()); } finally {
        poolInUse--;
        const next = poolQueue.shift();
        if (next) next();
      }
    };
    poolInUse < POOL_SIZE ? run() : poolQueue.push(run);
  });
}
const dbQuery = (ms) => withConnection(() => new Promise((r) => setTimeout(r, ms)));

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  stats.requests++;
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/products') {
      return send(res, 200, products.slice(0, 20));                  // fast: in memory
    }
    if (req.method === 'GET' && url.pathname === '/api/search') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      let hits = [];
      for (let round = 0; round < 8000; round++) {                   // slow on purpose: burns CPU
        hits = products.filter((p) => p.name.toLowerCase().includes(q));
      }
      return send(res, 200, hits.slice(0, 10));
    }
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      await dbQuery(50);                                             // each order holds a connection for 50 ms
      return send(res, 201, { orderId: stats.requests });
    }
    if (req.method === 'GET' && url.pathname === '/api/report') {
      cache.push(new Array(25_000).fill(Math.random()));             // leaks ~200 KB per call, never freed
      return send(res, 200, { cachedItems: cache.length });
    }
    if (url.pathname === '/metrics') {
      global.gc?.();                                                 // collect garbage first, so heapMB shows what is really kept
      return send(res, 200, {
        poolInUse, poolWaiting: poolQueue.length,
        heapMB: Math.round(process.memoryUsage().heapUsed / 1e6),
        rssMB: Math.round(process.memoryUsage().rss / 1e6), ...stats,
      });
    }
    send(res, 404, { error: 'not found' });
  } catch (e) {
    stats.errors++;
    send(res, 500, { error: 'internal' });
  }
});

server.listen(3333, () => console.log('shop-perf-lab on http://localhost:3333'));
```

</details>

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. What performance testing is {#what-is-it}

**In short:** performance testing measures speed, capacity and stability
under load — before real users find the limits for you.

| Question | Test that answers it |
|---|---|
| Is it fast enough at normal peak traffic? | Load test |
| How much can it take, and how does it fail? | Stress test |
| Does it survive a sudden rush, and recover? | Spike test |
| Does it stay healthy for hours? | Soak test |
| Does adding servers add capacity? | Scalability test |

A performance test is only useful with a **target** — for example "95% of
searches under 300 ms at 50 requests per second". Without one, you just
collect numbers.

**Try it:** start the lab and time one request:
`curl -s -o /dev/null -w "%{time_total}s\n" "localhost:3333/api/search?q=product"`.
Is that fast? Fast compared to what?

</div>

<div class="cheat-card">

#### 2. Test types {#test-types}

**In short:** each test type applies a different **shape** of load over time.

| Type | Shape | Typical length | Watch for |
|---|---|---|---|
| **Smoke** | 1–2 users | 1 minute | Script works, system responds |
| **Load** | Ramp to expected peak, hold | 15–60 minutes | Targets met at peak |
| **Stress** | Keep increasing past peak | Until it breaks | Where and *how* it fails |
| **Spike** | Sudden jump, then drop | Minutes | Survives, and recovers |
| **Soak** | Normal load | Hours | Memory leaks, slow creep, full disks |
| **Breakpoint** | Slow ramp until failure | Until it fails | Maximum capacity |

The lab scripts use shortened lengths (seconds, not hours) so you can practise
quickly; real tests run longer.

</div>

<div class="cheat-card">

#### 3. Key metrics {#metrics}

**In short:** report **response time**, **throughput** and **error rate**
together — one without the others is misleading.

| Metric | Meaning | k6 name |
|---|---|---|
| Response time | How long one request took | `http_req_duration` |
| Throughput | Requests per second the system handled | `http_reqs` (the `/s` value) |
| Error rate | Share of failed requests | `http_req_failed` |
| Concurrency | Users/requests active at once | `vus` |
| Resource use | CPU, memory, connections on the server | from the server (here: `/metrics`) |

A system that gets *faster* under load while errors rise is usually failing
fast, not performing well.

</div>

<div class="cheat-card">

#### 4. Percentiles {#percentiles}

**In short:** **p95** is the time that 95% of requests were faster than —
it shows what slow users feel, which an average hides.

```text
10 requests (ms): 20 21 22 22 23 24 25 26 30 900
average = 111.3 ms     ← looks OK-ish
median  (p50) = 23.5 ms
p90     = 30 ms (9 of 10 were at or below 30)
max     = 900 ms       ← one user waited almost a second
```

With 10 values the exact p95/p99 depend on how the tool interpolates; with
thousands of requests they're stable. Targets are usually written as **p95**
or **p99**, e.g. `p(95)<300`.

**Try it:** for 99 requests at 100 ms and one at 10,000 ms, work out the
average and the p50. Which one would you put in a report?

</div>

<div class="cheat-card">

#### 5. Your first k6 test {#first-test}

**In short:** a k6 script exports `options` (how much load, for how long, what
passes) and a default function (what one virtual user does, in a loop).

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

```bash
k6 run tests/smoke.js
```

**Try it:** add a check that the products response contains 20 items:
`(r) => r.json().length === 20`.

</div>

<div class="cheat-card">

#### 6. Reading the summary {#summary}

**In short:** at the end k6 prints thresholds (pass ✓ / fail ✗), checks, and
every metric's avg, min, median, max, p90 and p95.

Real output of the smoke test:

```text
    ✓ 'rate==1.0' rate=100.00%
    ✓ 'rate==0' rate=0.00%
    ✓ products 200
    ✓ search 200
    ✓ order 201
    http_req_duration..............: avg=24.01ms min=495µs med=19.68ms max=51.88ms p(90)=51.74ms p(95)=51.79ms
    http_reqs......................: 30     2.794269/s
    iteration_duration.............: avg=1.07s   min=1.06s med=1.07s   max=1.08s   p(90)=1.08s   p(95)=1.08s
```

`http_req_duration` mixes all three endpoints — the ~50 ms orders pull p95 up.
Section 14 splits them by endpoint.

</div>

<div class="cheat-card">

#### 7. Checks vs thresholds {#checks-thresholds}

**In short:** a **check** records whether one response was right; a
**threshold** is a pass/fail rule over the whole run — only thresholds fail the test.

| | Check | Threshold |
|---|---|---|
| Looks at | One response | A metric across the run |
| Example | `'order 201': (r) => r.status === 201` | `http_req_duration: ['p(95)<200']` |
| When it fails | Counted in `checks`; the run continues | k6 exits with code **99** |

To make failed checks fail the run, add a threshold on them:
`checks: ['rate>0.99']`.

</div>

<div class="cheat-card">

#### 8. Virtual users & think time {#vus}

**In short:** a **virtual user** (VU) runs your function in a loop; `sleep()`
adds **think time**, the pause a real person takes between actions.

```text
1 VU, no sleep, 50 ms per request   → ~20 requests/s from ONE user (a robot, not a person)
1 VU, sleep(1),  50 ms per request  → ~1 request/s (closer to a real user)
```

Without think time, 100 VUs can behave like thousands of real users — your
test is then far harsher than reality, and the conclusions are wrong.

**Try it:** run the smoke test with `sleep(1)` removed. Compare `http_reqs/s`.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 9. Workload model {#workload}

**In short:** a **workload model** says which actions happen, how often, at
peak — built from production data (analytics, logs), not guesses.

| Journey | Share | Rate at peak | Lab endpoint |
|---|---|---|---|
| Browse | 60% | 30 req/s | `GET /api/products` |
| Search | 24% | 12 req/s | `GET /api/search` |
| Order | 16% | 8 req/s | `POST /api/orders` |
| **Total** | 100% | **50 req/s** | |

Questions to ask the client: when is the peak? How big? What's the expected
growth (test at ×1.5 or ×2)? What mix of journeys?

</div>

<div class="cheat-card">

#### 10. Little's Law {#littles-law}

**In short:** **concurrency = arrival rate × time in system** — it connects
users, requests per second and response time.

```text
Lab orders: 5 connections, each busy 50 ms per order
Max throughput = connections ÷ time per order = 5 ÷ 0.05 s = 100 orders/s

Web shop: 20 new sessions per second, each lasting 90 s
Concurrent users ≈ 20 × 90 = 1,800
```

Use it to sanity-check plans ("can 5 connections ever serve 150 orders/s?")
and results ("throughput stopped at ~100/s — exactly the pool limit").

**Try it:** predict how many orders per second the lab can handle if the pool
had 10 connections. You'll test the prediction in section 15.

</div>

<div class="cheat-card">

#### 11. Scenarios & executors {#executors}

**In short:** an **executor** decides how load is generated — a fixed number
of users (**closed model**) or a fixed arrival rate of requests (**open model**).

| Executor | Model | Use for |
|---|---|---|
| `constant-vus` / `ramping-vus` | Closed: N users loop | Simple tests; users waiting on the system slow the load down |
| `constant-arrival-rate` / `ramping-arrival-rate` | Open: N iterations per second, regardless of response time | Realistic web traffic — new users keep arriving even when it's slow |
| `per-vu-iterations` / `shared-iterations` | Fixed amount of work | Data loading, one-off jobs |

The difference matters under stress: with a closed model a slow system
**receives less load** (users are stuck waiting), which hides the problem.
Real internet traffic behaves like the open model.

</div>

<div class="cheat-card">

#### 12. Load test {#load-test}

**In short:** a load test runs the workload model at expected peak and checks
every target at once.

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

Real result (30 s at 50 req/s):

```text
    ✓ 'p(95)<200' p(95)=68.66ms          ← order
    ✓ 'p(95)<100' p(95)=11.33ms          ← products
    ✓ 'p(95)<300' p(95)=21.48ms          ← search
    ✓ 'rate<0.01' rate=0.00%
```

**Try it:** double every rate. Which threshold fails first? (Predict with
section 10 before you run it.)

</div>

<div class="cheat-card">

#### 13. Test data {#test-data}

**In short:** vary the data like real users do, and load it once with
`SharedArray` so every VU shares one copy in memory.

```json
["product 1", "product 2", "product 42", "product 199", "nothing-matches"]
```

```js
import { SharedArray } from 'k6/data';
const terms = new SharedArray('terms', () => JSON.parse(open('../data/search-terms.json')));
const q = terms[Math.floor(Math.random() * terms.length)];
```

Same query every time = everything served from caches = results that look
better than production. Include "no results" searches, big accounts, long
carts — the expensive cases.

</div>

<div class="cheat-card">

#### 14. Tags & per-endpoint limits {#tags}

**In short:** tag requests (`tags: { name: 'search' }`) so k6 reports and
judges each endpoint separately.

```js
http.get(url, { tags: { name: 'search' } });
// options.thresholds:
'http_req_duration{name:search}': ['p(95)<300'],
```

```text
      { name:order }...............: avg=55.95ms  med=53.99ms  p(95)=68.66ms
      { name:products }............: avg=1.59ms   med=423µs    p(95)=11.33ms
      { name:search }..............: avg=12.59ms  med=12.23ms  p(95)=21.48ms
```

The `name` tag also groups URLs with ids or query strings (`/booking/1`,
`/booking/2`…) into one line instead of hundreds.

</div>

<div class="cheat-card">

#### 15. Stress test {#stress-test}

**In short:** a stress test keeps raising the load past the expected peak to
find the **breaking point** and see *how* the system fails.

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

Real result — stopped by `abortOnFail` when orders slowed down:

```text
    ✗ 'p(95)<500' p(95)=595.07ms
    order_time.....................: avg=143.27ms min=49.49ms med=51.47ms max=729.41ms p(95)=595.07ms
    http_reqs......................: 1787   68.736644/s
    dropped_iterations.............: 35     1.346269/s
level=error msg="thresholds on metrics 'order_time' were crossed; … stopping test prematurely"
```

At the same moment the lab's `/metrics` showed
`{"poolInUse":5,"poolWaiting":45,…}` — all 5 connections busy and 45 orders
queuing. That's the bottleneck, and it matches Little's Law: ~100 orders/s maximum.

**Try it:** change `POOL_SIZE` to 10 in `server.js`, restart, and re-run.
Does the breaking point move to ~200/s?

</div>

<div class="cheat-card">

#### 16. Spike test {#spike-test}

**In short:** a spike test adds a sudden burst, then checks the system
**recovers** when it passes — separate scenarios make each phase measurable.

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

Real result:

```text
    ✓ 'p(95)<50' p(95)=37.31ms       ← before
    ✗ 'p(95)<1000' p(95)=12.5s       ← during the spike: search is CPU-bound and queues up
    ✓ 'p(95)<50' p(95)=32.64ms       ← after: recovered
    ✓ 'rate<0.01' rate=0.00%
```

It survived (no errors) and recovered, but during the spike users waited up
to 12 seconds — a finding worth reporting with the recommendation (cache
search results, or scale out search).

</div>

<div class="cheat-card">

#### 17. Soak test {#soak-test}

**In short:** a soak test holds normal load for a long time to catch problems
that grow slowly — memory leaks, connection leaks, full disks.

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

Real result after only 30 seconds:

```text
level=info msg="heap before: 4 MB, after: 153 MB"
```

Memory grew ~150 MB in 30 s at a modest load, and never came down — at that
rate the process runs out of memory within hours. Response times looked
fine the whole time; **only the resource metric showed the problem**.

</div>

<div class="cheat-card">

#### 18. Common mistakes {#gotchas}

**In short:** most misleading performance results come from the same few errors.

| Mistake | Result | Fix |
|---|---|---|
| No think time | Load far harsher than reality | `sleep()` based on real user behaviour |
| Same data every request | Everything cached; results too good | Varied data (section 13) |
| Load generator overloaded | Fake slowness from *your* machine | Watch generator CPU; distribute load |
| Averages only | Slow users hidden | Percentiles |
| Tiny test database | Queries fast in test, slow in production | Production-like data volume |
| No targets | "It did 500 req/s" — is that good? | Agree SLOs first |
| Testing through the internet from a laptop | Network noise in every number | Run generators close to the system |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 19. Finding the bottleneck {#bottleneck}

**In short:** when response time rises, look at each service (**RED**:
Rate, Errors, Duration) and then at each resource underneath (**USE**:
Utilisation, Saturation, Errors) until you find the one that saturates first.

| Symptom in the lab | Resource | Evidence |
|---|---|---|
| Orders slow above ~100/s | Connection pool | `poolInUse: 5, poolWaiting: 45` |
| Search slow under burst | CPU (one Node.js thread) | Response time rises with rate; CPU at 100% for the process |
| Memory keeps rising | Heap | `heapMB` grows and never falls |

In real systems the "metrics endpoint" is your observability stack: APM
tools, Prometheus + Grafana, database slow-query logs, traces. See the
[observability guide](/docs/sre-skills/observability-grafana-prometheus/observability-grafana-prometheus-guide).

**Try it:** during the stress test, run `watch -n1 curl -s localhost:3333/metrics`
in another terminal and watch `poolWaiting` climb.

</div>

<div class="cheat-card">

#### 20. Custom metrics {#custom-metrics}

**In short:** create your own metrics — `Trend` (timings), `Counter`
(totals), `Rate` (percentages), `Gauge` (latest value) — for business-level numbers.

```js
import { Trend, Counter, Rate } from 'k6/metrics';
const orderTime = new Trend('order_time', true);    // true = values are times
const ordersPlaced = new Counter('orders_placed');
const outOfStock = new Rate('out_of_stock');

orderTime.add(res.timings.duration);
ordersPlaced.add(1);
outOfStock.add(res.status === 409);
```

Thresholds work on custom metrics too: `order_time: ['p(95)<500']`.

</div>

<div class="cheat-card">

#### 21. CI gates {#ci-gates}

**In short:** a short performance test after every deploy catches
regressions; a failed threshold makes k6 exit non-zero, which fails the pipeline.

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

```text
products p95=0.6ms, order p95=52.0ms, errors=0.00%
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

Compare with a **baseline**: "order p95 went from 52 ms to 180 ms after this
release" is far more useful than "order p95 is 180 ms".

</div>

<div class="cheat-card">

#### 22. Front-end performance {#frontend}

**In short:** server speed is only part of what users feel; page weight,
scripts and rendering matter too — measure them with browser tools.

| Tool | Measures |
|---|---|
| **Lighthouse** (Chrome DevTools) | Performance score and Core Web Vitals in a lab run |
| **Core Web Vitals** | LCP (loading), INP (responsiveness), CLS (layout shifts) |
| **WebPageTest** | Detailed waterfall, filmstrip, different locations and devices |
| **k6 browser module** | Real browser sessions inside a k6 test, alongside API load |
| Real-user monitoring (RUM) | What real visitors experience in production |

Run a few browser tests while the API is under load — that's how users
experience a busy day.

</div>

<div class="cheat-card">

#### 23. Realistic environments {#environment}

**In short:** results only transfer to production if the environment, data
and traffic look like production.

- Same instance sizes and config, or a known ratio you state in the report.
- Production-like **data volume** (masked).
- Load generators near the system, with spare CPU.
- Third parties mocked — payment and email sandboxes forbid load tests.
- Nobody else using the environment during the test.
- Caches warmed the way production would be — or tested cold on purpose.

</div>

<div class="cheat-card">

#### 24. Reporting {#reporting}

**In short:** lead with the verdict against the targets, then the evidence,
the bottleneck and the fix.

```text
Verdict:     Meets targets at expected peak (50 req/s). Capacity for orders ≈ 100/s.
Bottleneck:  DB connection pool (5). At 100+ orders/s all connections busy, 45 waiting.
Risks:       Search is CPU-bound — p95 12.5 s during a 150-user burst.
             Memory leak in /api/report — +150 MB in 30 s at 25 req/s.
Recommend:   1) Pool to 20 and re-test  2) Cache search results  3) Fix the report cache
Next test:   Re-run stress and soak after fixes; compare with this baseline.
```

The full report outline is in the
performance testing guide.

</div>

<div class="cheat-card">

#### 25. Other tools {#other-tools}

**In short:** the concepts are the same in every tool; choose by team language and protocols.

| Tool | Scripts in | Good for |
|---|---|---|
| **k6** | JavaScript | Developer-friendly, thresholds, CI, Grafana |
| **JMeter** | GUI / XML (+ Groovy) | Many protocols, big community — see the [JMeter guide](/docs/sdet-skills/jmeter/jmeter-guide) |
| **Gatling** | Java, Kotlin, Scala, JS | High load from one machine, good reports |
| **Locust** | Python | Python teams, custom user behaviour |
| **Artillery** | YAML + JS | Quick HTTP, WebSocket, Socket.IO tests |

</div>

<div class="cheat-card">

#### 26. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **VU** | Virtual user — one simulated user running the script in a loop |
| **Iteration** | One run of the default function by one VU |
| **Throughput** | Requests (or transactions) handled per second |
| **Latency** | Time until the response starts / completes (tools differ — check which) |
| **p95 / p99** | Time 95% / 99% of requests were faster than |
| **SLO** | Service Level Objective — a target like "p95 < 300 ms" |
| **Open / closed model** | Load by arrival rate / by a fixed number of users |
| **Saturation** | A resource has more work than it can handle; work queues |
| **Bottleneck** | The resource that saturates first and limits the whole system |
| **Baseline** | A previous result you compare against |
| **Think time** | A pause between actions, like a real user |
| **Ramp-up** | Increasing load gradually at the start |

For the service end to end, see the
performance testing guide.

</div>

</div>
