---
title: "Test Automation Tooling Landscape Cheat Sheet"
description: "Quick reference for the modern test automation tooling landscape — pyramid layers, tool-by-tool comparisons, and decision heuristics."
tags: [test-automation, sdet, tooling, cheat-sheet]
hide_table_of_contents: true
image: /img/social/test-automation-tooling-landscape.png
---

# Test automation tooling landscape cheatsheet

A one-page reference to the modern tooling landscape. For the full
tool-by-tool breakdown across every layer, see the
[complete guide](/docs/sdet-skills/test-automation-tooling-landscape/test-automation-tools-technology-landscape).

<a class="topic-crosslink" href="/docs/sdet-skills/test-automation-tooling-landscape/test-automation-tools-technology-landscape">📖 Full guide: Tooling Landscape →</a>

<TenMinute minutes={5}>

1. Begin with the **The modern pyramid** card
2. Then the **Web UI / E2E — pick one** and **Mobile** cards
3. Treat the other 7 cards as lookups — scan by card title when you need one
4. Open the [full guide](/docs/sdet-skills/test-automation-tooling-landscape/test-automation-tools-technology-landscape) when a card isn't enough

</TenMinute>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### The modern pyramid

```
        E2E / UI  (few, slow, high confidence)
      Integration / Contract
   Component            API
Unit  (many, fast, cheap)
```

The expanded pyramid adds contract, API, and observability-driven layers
between unit and full E2E — not just "more UI tests."

</div>

<div class="cheat-card">

#### Web UI / E2E — pick one

| Tool | Best for |
|---|---|
| Playwright | modern, multi-browser, fastest-growing |
| Selenium | broadest ecosystem, legacy support |
| Cypress | JS-only, great DX, single-tab limits |
| WebdriverIO | flexible, plugin-heavy |

</div>

<div class="cheat-card">

#### Mobile

| Tool | Best for |
|---|---|
| Appium | cross-platform, mature |
| Maestro | fast, YAML-based, simpler setup |
| Native (Espresso/XCUITest) | fastest, platform-locked |

</div>

<div class="cheat-card">

#### API & backend

- REST: Rest Assured (Java), Postman/Newman, `requests` (Python).
- Contract testing: Pact — catches breaking changes between services before deploy.
- Testcontainers — spin up real dependencies (DB, queue) in Docker for integration tests instead of mocking everything.

</div>

<div class="cheat-card">

#### Unit testing by language

| Language | Frameworks |
|---|---|
| JS/TS | Jest, Vitest |
| Python | pytest |
| Java | JUnit 5, TestNG |
| .NET | xUnit, NUnit |

</div>

<div class="cheat-card">

#### Performance

| Tool | Best for |
|---|---|
| k6 | code-first, CI-native, modern |
| JMeter | GUI + mature ecosystem, steeper CI setup |
| Gatling | Scala DSL, detailed reports |
| Locust | Python, simple distributed load |

</div>

<div class="cheat-card">

#### Visual & accessibility

- Visual regression: Percy, Chromatic, Playwright's `toHaveScreenshot`.
- Accessibility: axe-core (integrates directly with Playwright/Selenium), Lighthouse for audits.

</div>

<div class="cheat-card">

#### Security testing categories

- SAST — scans source code for known vulnerability patterns.
- DAST — attacks a running app (OWASP ZAP, Burp).
- SCA — scans dependencies for known CVEs (Snyk, Dependabot).
- Map coverage to the OWASP Top 10, not just "run a scanner."

</div>

<div class="cheat-card">

#### Chaos & resilience

Tools: Chaos Monkey, Gremlin, Litmus (Kubernetes-native). Inject failure
(latency, pod kills, network partition) deliberately to verify the system
degrades gracefully instead of cascading.

</div>

<div class="cheat-card">

#### Choosing a stack: heuristics

- Match tooling to team language — Java shop → Java-first tools (Rest Assured, Selenium, TestNG).
- Prefer code-first tools once the team outgrows GUI-driven ones (JMeter → k6, Postman → Rest Assured).
- New service → build the contract/API layer before UI E2E; it's cheaper to maintain and catches more bugs per test.

</div>

</div>

---

<Exercises>
<Exercises.Task title="Pick one tool per layer for a real product" level="intermediate" stretch="Say which single layer you would invest in first and why.">

A shop has a web front end, a mobile app, a Java REST API, and a Postgres database, and it expects sharp traffic spikes. Choose one primary tool for each layer from this sheet (web UI, mobile, API, unit, performance) and one way to handle the database in integration tests. Write one sentence per choice tying it to this product.

**Done when:** every layer has exactly one primary tool with a product-specific reason, the boundary between the services is covered by contract testing, the database is handled with a real containerized instance instead of mocks, and your performance tool is one you could run in CI.

</Exercises.Task>
<Exercises.Task title="Fail a build with a k6 threshold" level="advanced">

This needs Docker and an HTTP endpoint you control (the small server from the Postman guide's exercise works, on port 4010). Save this as `load.js`:

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 5,
  duration: '5s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.post(
    'http://host.docker.internal:4010/login',
    JSON.stringify({ username: 'validuser', password: 'correctpass' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

```bash
docker run --rm -i grafana/k6 run - < load.js
echo "exit code: $?"
```

On Linux, add `--add-host=host.docker.internal:host-gateway` to the `docker run` command. Run it once with the server up and once with the server stopped.

**Done when:** the first run passes both thresholds and exits `0`, the second fails the `http_req_failed` threshold and exits `99`, and you can explain why the latency threshold can still pass when every request fails.

</Exercises.Task>
</Exercises>

<CaseStudy title="Everything mocked, and the real database disagreed">
<CaseStudy.Context>

*Illustrative scenario.* A team's integration tests replace the database layer with mocks so they run fast. The suite is green and trusted.

</CaseStudy.Context>
<CaseStudy.WhatHappened>

A change relied on a database constraint and a query behaviour that the mocks did not reproduce. It passed every test and then failed against the real Postgres in a shared environment. The mocks had only ever verified the team's own assumptions about the database.

</CaseStudy.WhatHappened>
<CaseStudy.Lesson>

For integration tests, start real dependencies such as the database or a queue in containers, and keep mocks for the layers where behaviour genuinely does not matter. The extra seconds buy tests that can actually disagree with your assumptions.

</CaseStudy.Lesson>
</CaseStudy>

<AISpark>

- Describe your stack to an assistant and ask for a tool per layer with trade-offs, then check each recommendation against this sheet and your team's skills before adopting anything.
- Ask it to draft a Pact contract between two services, and verify it by breaking a field on the provider side and watching the contract test fail.
- Have it map your current tests onto the pyramid layers and point out the thinnest layer, then confirm by counting the tests yourself.

</AISpark>
