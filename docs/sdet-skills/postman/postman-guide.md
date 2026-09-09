---
title: "Postman: The Complete Guide"
description: "End-to-end reference for Postman — collections, environments, pre-request/test scripts, Newman CI execution, mock servers, and interview-ready Q&A."
sidebar_position: 1
tags: [postman, sdet, api-testing]
---

# Postman — The Complete Guide

A single-read, end-to-end reference for Postman: enough to organize a new
API workspace, script request chaining and assertions, run a collection
headlessly in CI, or walk into an SDET interview. Organized as a lookup you
can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/postman">📋 Quick reference: Postman →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 260" role="img" aria-labelledby="mm-postman-title mm-postman-desc">
<title id="mm-postman-title">How a Postman request becomes a CI-checked result</title>
<desc id="mm-postman-desc">A request is organized into a collection, which can be run manually through the Collection Runner or headlessly through Newman in CI, with both paths producing the same pass or fail test report.</desc>
<defs>
  <marker id="mm-postman-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="20" y="95" width="150" height="70" rx="10"/>
<text class="mm-node-title" x="95" y="125" text-anchor="middle">Request</text>
<text class="mm-node-sub" x="95" y="142" text-anchor="middle">method, url, headers</text>
<path class="mm-arrow" d="M170,130 L206,130" marker-end="url(#mm-postman-arrow)"/>

<rect class="mm-n5" x="210" y="95" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="295" y="125" text-anchor="middle">Collection</text>
<text class="mm-node-sub" x="295" y="142" text-anchor="middle">ordered requests</text>

<path class="mm-arrow" d="M380,115 L440,60" marker-end="url(#mm-postman-arrow)"/>
<path class="mm-arrow" d="M380,145 L440,200" marker-end="url(#mm-postman-arrow)"/>

<rect class="mm-n2" x="440" y="20" width="190" height="60" rx="10"/>
<text class="mm-node-title" x="535" y="47" text-anchor="middle">Collection Runner</text>
<text class="mm-node-sub" x="535" y="63" text-anchor="middle">GUI, sequential run</text>

<rect class="mm-n4" x="440" y="180" width="190" height="60" rx="10"/>
<text class="mm-node-title" x="535" y="207" text-anchor="middle">Newman (CLI)</text>
<text class="mm-node-sub" x="535" y="223" text-anchor="middle">CI pipeline</text>

<path class="mm-arrow" d="M630,55 L700,95" marker-end="url(#mm-postman-arrow)"/>
<path class="mm-arrow" d="M630,205 L700,165" marker-end="url(#mm-postman-arrow)"/>

<rect class="mm-n6" x="650" y="95" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="705" y="125" text-anchor="middle">Test report</text>
<text class="mm-node-sub" x="705" y="142" text-anchor="middle">pass/fail</text>
</svg>

<p class="mental-model__caption">A single request only proves itself once; putting it in a collection makes it repeatable — run it manually through the Collection Runner while you're building it, or headlessly through Newman in a CI pipeline once it's stable, with both paths producing the same pass/fail test report.</p>
</div>

## 1. What Postman Is, in Practical Terms

Postman is a **GUI-first API client and testing platform** — the tool most
engineers reach for first to manually explore a new endpoint, and (via
scripting + Newman) a viable lightweight automation tool too. It sits at
the "exploratory and collaborative" end of API testing, complementary to
code-first frameworks like Rest Assured (see
[section 10](#10-postman-vs-rest-assured)).

Core building blocks:

| Concept | What it is |
|---|---|
| **Request** | A single HTTP call (method, URL, headers, body, auth) |
| **Collection** | An ordered folder of requests — the unit of organization and CI execution |
| **Environment** | A named set of key-value variables (dev/staging/prod) swappable without editing requests |
| **Workspace** | Where collections/environments live, shared with a team |
| **Collection Runner** | GUI tool to execute a whole collection sequentially with data-driven iterations |
| **Newman** | CLI runner that executes a collection outside the GUI — the CI integration point |

---

## 2. Collections, Requests, and Environments

A **collection** is a folder tree of requests, exportable/importable as
JSON, and typically version-controlled alongside the API repo or synced via
a team workspace.

```
Orders API (collection)
├── Auth
│   └── POST /oauth/token
├── Orders
│   ├── GET /orders/{{orderId}}
│   ├── POST /orders
│   └── DELETE /orders/{{orderId}}
└── Negative Cases
    ├── GET /orders/invalid-id → expect 404
    └── POST /orders (missing field) → expect 400
```

Requests reference **variables** with `{{doubleCurlyBrace}}` syntax instead
of hardcoded values:

```
GET {{baseUrl}}/orders/{{orderId}}
Authorization: Bearer {{accessToken}}
```

### Variable scopes (resolution order, narrowest wins)

| Scope | Lifetime | Typical use |
|---|---|---|
| **Local** | Single request script only | One-off computed value |
| **Data** | One Collection Runner iteration (from a CSV/JSON file) | Data-driven test rows |
| **Environment** | Active environment (dev/staging/prod) | `baseUrl`, `apiKey` — swap per environment |
| **Collection** | Entire collection, any environment | Values shared across all environments |
| **Global** | Entire Postman app, all workspaces | Rarely used — avoid, causes cross-collection leakage |

Postman resolves the **narrowest matching scope first** — a local variable
shadows a collection variable of the same name, which shadows a global one.
This is a common source of "why is it using the wrong value" bugs — check
scopes top-down when debugging.

```javascript
// Setting variables from scripts
pm.environment.set("accessToken", token);
pm.collectionVariables.set("lastOrderId", orderId);
pm.globals.set("runId", Date.now());

// Reading
pm.environment.get("baseUrl");
```

Mark secrets (API keys, tokens) as **type "secret"** in environment
variables — Postman masks them in the UI and excludes them from exported
JSON by default, reducing accidental leakage in shared workspaces.

---

## 3. Pre-request Scripts and Tests (`pm.*` API)

Postman requests run JavaScript at two hook points, both exposing the
`pm` (Postman) API:

| Hook | Runs | Typical use |
|---|---|---|
| **Pre-request Script** | Before the request is sent | Compute a timestamp/signature, refresh an auth token, set dynamic headers |
| **Tests** (post-response) | After the response arrives | Assertions, extracting values into variables for the next request |

### Pre-request script example

```javascript
// Generate an HMAC signature header before sending
const timestamp = Date.now().toString();
const signature = CryptoJS.HmacSHA256(timestamp + pm.request.url, pm.environment.get("apiSecret"))
    .toString(CryptoJS.enc.Hex);

pm.request.headers.add({ key: "X-Timestamp", value: timestamp });
pm.request.headers.add({ key: "X-Signature", value: signature });
```

### Test script example

```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response has expected schema", () => {
    const body = pm.response.json();
    pm.expect(body).to.have.property("id");
    pm.expect(body.email).to.match(/@/);
});

pm.test("Response time is under 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Extract a value and store it for the next request in the collection
const order = pm.response.json();
pm.collectionVariables.set("orderId", order.id);
```

Assertions use **Chai's `expect`/`should` BDD syntax** (`pm.expect(...)`),
plus Postman-specific sugar like `pm.response.to.have.status(200)` and
`pm.response.to.be.json`.

### Collection-level and folder-level scripts

Pre-request/test scripts can also be attached to a **folder** or the whole
**collection**, running before/after *every* request inside it — the
standard place to put shared auth-token refresh logic instead of pasting it
into every request.

---

## 4. Chaining Requests

Because scripts can read/write variables, requests naturally chain:
authenticate once, extract the token, use it downstream; create a resource,
capture its ID, use it in the next request; and so on.

```javascript
// In "POST /oauth/token" → Tests tab
const res = pm.response.json();
pm.environment.set("accessToken", res.access_token);
```

```
// In "GET /orders" → uses {{accessToken}} in the Authorization header automatically
Authorization: Bearer {{accessToken}}
```

```javascript
// In "POST /orders" → Tests tab, feeding the next request
const created = pm.response.json();
pm.collectionVariables.set("orderId", created.id);

// In "GET /orders/{{orderId}}" → picks it up automatically
```

For more complex control flow (conditional branching, looping over a list
returned by one request to call another N times), use
`postman.setNextRequest("Request Name")` in a test script to control
execution order explicitly within the Collection Runner, or
`postman.setNextRequest(null)` to stop the run early on a failed
precondition.

---

## 5. Collection Runner (Data-Driven Runs)

The **Collection Runner** executes every request in a collection in order,
optionally iterating once per row of a CSV or JSON data file — Postman's
equivalent of parametrized tests.

```csv
username,password,expectedStatus
validuser,correctpass,200
validuser,wrongpass,401
,correctpass,400
```

```javascript
pm.test("Status matches expected", () => {
    pm.response.to.have.status(Number(pm.iterationData.get("expectedStatus")));
});
```

Configure iteration count, delay between requests, and data file in the
Runner UI; results show pass/fail per request per iteration, exportable as
a report.

---

## 6. Newman — Running Collections in CI

**Newman** is Postman's official CLI collection runner — it executes an
exported collection JSON (and environment JSON) exactly as the app would,
without the GUI, making it the CI integration point.

```bash
npm install -g newman

newman run OrdersAPI.postman_collection.json \
  -e Staging.postman_environment.json \
  -d test-data.csv \
  --reporters cli,junit \
  --reporter-junit-export results/newman-report.xml \
  --bail
```

| Flag | Purpose |
|---|---|
| `-e` | Environment file |
| `-d` | Data file for iterations |
| `-n` | Number of iterations |
| `--reporters` | Output formats (`cli`, `json`, `junit`, `html` via `newman-reporter-htmlextra`) |
| `--bail` | Stop on first failure |
| `--folder` | Run only a specific folder/subset |
| `--insecure` | Skip TLS verification (test envs) |

### GitHub Actions example

```yaml
- name: Run Postman collection via Newman
  run: |
    npm install -g newman newman-reporter-htmlextra
    newman run collections/orders-api.json \
      -e environments/staging.json \
      --reporters cli,htmlextra \
      --reporter-htmlextra-export reports/newman-report.html
```

Newman's JUnit reporter output plugs directly into most CI dashboards
(Jenkins, GitHub Actions, GitLab) the same way a JUnit/TestNG XML report
would from a code-first framework — this is what makes Postman collections
viable as an actual CI gate, not just a manual tool.

---

## 7. Mock Servers

Postman can spin up a **mock server** from a collection — a hosted endpoint
that returns example responses saved on each request, without a real
backend existing yet.

```
POST /orders  →  saved example response: 201 { "id": 1, "status": "created" }
```

Use cases:
- **Frontend/consumer teams** build and test against the mock while the
  real backend is still in development (contract-first workflow).
- **SDETs** validate that a client integration handles specific response
  shapes/error codes without needing to force those states from a real
  backend (e.g., simulate a 503 or a malformed payload).

Each saved **example** on a request becomes a possible mock response;
Postman matches incoming mock requests to the closest example by method +
path (+ optional headers/query for more specific matching).

---

## 8. Postman Monitors & Scheduled Runs

Beyond CI-triggered runs, Postman **Monitors** run a collection on a
schedule (e.g., every 15 minutes) from Postman's cloud infrastructure or
select regions — used for synthetic uptime/health checks and lightweight
production API monitoring, alerting on failures via email/Slack/webhook.
This overlaps with, but is distinct from, CI-triggered Newman runs — Monitors
watch production continuously; CI runs gate deploys.

---

## 9. Organizing Larger Workspaces

- **Folders** group related requests (by resource, by user flow) and can
  carry their own pre-request/test scripts inherited by everything inside.
- **Variables should default to environment-scoped**, promoted to
  collection-scoped only when truly environment-independent — avoids
  drift where dev/staging/prod behave subtly differently because a value
  was hardcoded at the wrong scope.
- **Version control**: export collections/environments as JSON and commit
  them, or use Postman's native Git integration (workspaces backed by a Git
  repo) so history and PR review work the same as for code.
- **Fork & merge workflow**: in team workspaces, fork a collection, make
  changes, and open a pull request back to the source collection — mirrors
  a git branching workflow inside the Postman UI itself.

---

## 10. Postman vs Rest Assured

| | Postman | Rest Assured |
|---|---|---|
| Nature | GUI tool + JS scripting | Code-first Java library |
| Best for | Exploratory testing, manual API poking, cross-functional collaboration (PMs, manual QA), API documentation | CI-integrated regression/contract suites versioned with app code |
| Scripting language | JavaScript (`pm.*` / Chai assertions) | Java (Hamcrest matchers) |
| CI execution | Requires Newman (separate CLI step) | Native — it *is* a JUnit/TestNG test |
| Diffing in git | JSON collection exports — noisy diffs, merge conflicts common | Plain Java source — diffs cleanly |
| Onboarding | Low barrier — no coding required to write a test | Requires Java/build-tool familiarity |
| Mock servers | Built-in | Not built-in (would use WireMock or similar) |

**Practical rule of thumb:** reach for Postman first when exploring a new
or changing API, documenting behavior for other teams, or when non-engineers
need to run/inspect requests themselves. Reach for Rest Assured when the
tests need to be a durable, code-reviewed, CI-gated part of the regression
suite. Many teams run both side by side rather than picking one exclusively.

---

## 11. Interview-Ready Q&A

**Q: What's the difference between a pre-request script and a test script
in Postman?**
A: A pre-request script runs before the request is sent — used to compute
dynamic values like timestamps, signatures, or to refresh an auth token so
it's fresh for the call about to happen. A test script (the "Tests" tab)
runs after the response arrives — used for assertions via `pm.test()` and
`pm.expect()`, and to extract values from the response into variables that
downstream requests in the same collection can use.

**Q: How do you chain requests in Postman — for example, using a token from
a login call in every subsequent request?**
A: In the login request's test script, extract the token from the response
JSON and store it with `pm.environment.set("accessToken", token)`.
Subsequent requests reference `{{accessToken}}` in their Authorization
header, and Postman resolves the variable at send time. The same pattern
extracts any ID or value a later request in the chain needs.

**Q: What's the difference between environment variables, collection
variables, and global variables, and how does Postman resolve a naming
collision?**
A: Environment variables are scoped to whichever environment (dev/staging/
prod) is active and are the main way to swap config without touching
requests. Collection variables apply across all environments for that
collection — for values that don't change per environment. Global
variables apply across the entire Postman app and should be used sparingly
since they can leak across unrelated collections. When names collide,
Postman resolves the narrowest scope first — local, then data, then
environment, then collection, then global.

**Q: How do you run a Postman collection in a CI pipeline, since Postman
itself is a GUI app?**
A: Export the collection and environment as JSON, then run them with
**Newman**, Postman's official CLI runner — `newman run collection.json -e
env.json --reporters cli,junit`. Newman executes requests and test scripts
identically to the GUI, and its JUnit reporter output plugs into standard
CI dashboards the same way a JUnit XML report from a code-first framework
would.

**Q: What are Postman mock servers useful for, and how do they work?**
A: A mock server is generated from a collection and returns saved example
responses for matching requests, without needing a real backend running.
It's useful for frontend/consumer teams to build against an API contract
before the backend exists, and for testers to force specific response
scenarios (error codes, edge-case payloads) that would be hard to trigger
from a real backend on demand. Postman matches incoming requests to the
closest saved example by method, path, and optionally headers/query.

**Q: When would you use Postman instead of a code-first tool like Rest
Assured, and when would you avoid it?**
A: Postman is the right tool for exploratory testing of a new or evolving
API, quick manual verification, and collaborating with non-engineers who
want a UI rather than code — it has a much lower barrier to entry. Avoid it
as the primary CI regression suite when you want tests reviewed as
first-class code with clean git diffs, strong typing, and no extra Newman
step — that's where a library like Rest Assured fits better. In practice
many teams use Postman for exploration/documentation and Rest Assured (or
similar) for the durable automated suite.

**Q: A test that reads a variable set in an earlier request is getting an
undefined/stale value. What's your debugging approach?**
A: First check variable scope — confirm the earlier request actually set it
at the scope you expect (`pm.environment.set` vs `pm.collectionVariables.set`
vs a `pm.globals.set` from an old leftover script) and that the reading
request is checking the same scope, since Postman resolves narrowest-scope-
first and a stale global or collection variable can silently shadow the one
you expect. Second, confirm execution order — in the Collection Runner,
requests run top-to-bottom by default unless `postman.setNextRequest()`
reordered them, so the "earlier" request may not have actually run yet.

**Q: How would you data-drive a Postman test — for example, running the
same request with 20 different input payloads?**
A: Use the Collection Runner (or Newman with `-d`) with a CSV or JSON data
file — one row per iteration. Each column becomes a variable accessible via
`pm.iterationData.get("columnName")` in scripts, and the runner executes
the collection once per row, so assertions can reference expected values
per row (e.g., expected status code) directly from the data file instead of
hardcoding them in the script.

---

## 12. One-Line Summary

**Postman turns API exploration into a shareable, scriptable workflow —
collections plus `pm.*` pre-request/test scripts for chaining and
assertions — and becomes CI-capable the moment you hand that same
collection to Newman.**
