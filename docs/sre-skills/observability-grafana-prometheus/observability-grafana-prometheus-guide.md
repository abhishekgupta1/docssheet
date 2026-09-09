---
title: "Observability (Grafana & Prometheus): The Complete Guide"
description: "End-to-end reference for Observability (Grafana & Prometheus) — Prometheus architecture and PromQL, SLIs/SLOs and error budgets, alerting and dashboards, long-term storage, ELK/EFK and commercial APM tradeoffs, and interview-ready Q&A."
sidebar_position: 1
tags: [observability, grafana, prometheus, sre, sli, slo, error-budget, elk, datadog]
---

# Observability (Grafana & Prometheus) — The Complete Guide

A single-read, end-to-end reference for the Prometheus + Grafana stack: enough
to design a metrics pipeline, write real PromQL, wire up alerting, or walk
into an SRE interview. Organized as a lookup you can also read top-to-bottom.
For how OpenTelemetry traces/logs/metrics reach this stack via OTLP, see the
[OpenTelemetry guide](/docs/sre-skills/opentelemetry/opentelemetry-guide) —
this doc focuses on Prometheus and Grafana specifically.

<a class="topic-crosslink" href="/cheatsheets/observability-grafana-prometheus">📋 Quick reference: Prometheus & Grafana →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 260" role="img" aria-labelledby="mm-promgraf-title mm-promgraf-desc">
<title id="mm-promgraf-title">How metrics flow from exporters to dashboards and alerts</title>
<desc id="mm-promgraf-desc">Exporters expose metrics that Prometheus scrapes and stores, which then fans out to Alertmanager for alerting and to Grafana for dashboards and queries.</desc>
<defs>
  <marker id="mm-promgraf-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="20" y="90" width="180" height="70" rx="10"/>
<text class="mm-node-title" x="110" y="118" text-anchor="middle">Exporters</text>
<text class="mm-node-sub" x="110" y="135" text-anchor="middle">/metrics endpoints</text>

<rect class="mm-n5" x="300" y="90" width="200" height="70" rx="10"/>
<text class="mm-node-title" x="400" y="118" text-anchor="middle">Prometheus</text>
<text class="mm-node-sub" x="400" y="135" text-anchor="middle">scrape, store, evaluate</text>

<rect class="mm-n4" x="590" y="20" width="180" height="60" rx="10"/>
<text class="mm-node-title" x="680" y="46" text-anchor="middle">Alertmanager</text>
<text class="mm-node-sub" x="680" y="62" text-anchor="middle">dedupe &amp; route alerts</text>

<rect class="mm-n2" x="590" y="160" width="180" height="60" rx="10"/>
<text class="mm-node-title" x="680" y="186" text-anchor="middle">Grafana</text>
<text class="mm-node-sub" x="680" y="202" text-anchor="middle">dashboards &amp; queries</text>

<path class="mm-arrow" d="M200,125 L298,125" marker-end="url(#mm-promgraf-arrow)"/>
<path class="mm-arrow" d="M500,110 L588,60" marker-end="url(#mm-promgraf-arrow)"/>
<path class="mm-arrow" d="M500,140 L588,180" marker-end="url(#mm-promgraf-arrow)"/>
</svg>

<p class="mental-model__caption">Prometheus sits in the middle of a pull-based pipeline: it scrapes every exporter on its own schedule, stores the result as time series, and that one store is what both Alertmanager evaluates for alerting rules and Grafana queries for every dashboard.</p>
</div>

## 1. Where This Fits: Metrics in the Observability Stack

Prometheus is the de facto standard **metrics** database and alerting engine
in cloud-native infrastructure; Grafana is the de facto standard
**visualization/dashboarding** layer on top of it (and on top of logs, traces,
and other data sources too). Together they answer "what's the overall health
of the system right now, and alert me when it isn't."

| Tool | Role | Analogous to |
|---|---|---|
| **Prometheus** | Time-series database + scraper + alert-rule evaluator | The "metrics brain" |
| **Alertmanager** | Dedupe/group/route/silence alerts fired by Prometheus | The "alert traffic cop" |
| **Grafana** | Query, visualize, and build dashboards/alerts across many data sources | The "windshield" |
| **Exporters** | Translate a system's native stats into Prometheus's metrics format | Adapters |

Prometheus does **metrics** only — it is not a log store or trace store.
Correlating a metric spike with the trace/log that explains it is the OTel
pillars story (see the OpenTelemetry guide); this guide is about the metric
half of that loop.

The three pillars split along storage/query shape, which is why the tooling
landscape splits the same way rather than converging on one tool:

| Pillar | Question it answers | Self-hosted | Commercial |
|---|---|---|---|
| **Metrics** | Is the system healthy right now, in aggregate? | Prometheus + Grafana | Datadog, New Relic |
| **Logs** | What exactly happened on one request/host? | ELK / EFK (Section 10) | Datadog/New Relic log management |
| **Traces** | Where did time go across a distributed call chain? | Jaeger, Tempo, Zipkin | Datadog APM, New Relic APM |

Section 10 covers ELK/EFK for logs and Section 11 covers where Datadog/New
Relic fit as a commercial alternative to running all of this yourself.

---

## 2. Prometheus Architecture

```
┌────────────┐   scrape (pull, HTTP GET /metrics)   ┌──────────────┐
│  Exporter   │ <──────────────────────────────────  │  Prometheus   │
│ (app /metrics│                                      │    Server     │
│  endpoint)   │                                      │  - TSDB (local)│
└────────────┘                                       │  - Rule engine │
                                                       │  - HTTP API    │
Service Discovery ───────────────────────────────────>│                │
(k8s, Consul, EC2,                                    └──────┬─────────┘
 file_sd, static)                                            │
                                                     alerts    │  PromQL queries
                                                        │      ▼
                                                 ┌──────────────┐   ┌─────────┐
                                                 │ Alertmanager  │   │ Grafana │
                                                 └──────────────┘   └─────────┘
```

### The pull model

Prometheus **scrapes** — it pulls metrics by issuing an HTTP GET against each
target's `/metrics` endpoint on a fixed interval, rather than applications
pushing metrics to it. This is the single biggest architectural difference
from StatsD/Datadog-style push systems.

| Pull (Prometheus) | Push (StatsD, Mimir push path, CloudWatch) |
|---|---|
| Prometheus controls scrape cadence centrally | Each app decides when to push — harder to reason about load |
| Target must be network-reachable from Prometheus | Works through NAT/firewalls, good for ephemeral/serverless |
| Built-in "is this target even up" signal (`up` metric) — a failed scrape is itself informative | No implicit liveness signal — silence looks like "no traffic," not "down" |
| Doesn't suit short-lived batch jobs well | Naturally fits jobs — use **Pushgateway** as the Prometheus workaround |

**Pushgateway**: an intermediary that batch/cron jobs push a final metric
value to before they exit; Prometheus then scrapes the Pushgateway like any
other target. Use it sparingly — it's a well-known foot-gun for stale metrics
if you don't manage `--web.enable-admin-api` cleanup of old job data.

### Exporters

An **exporter** translates a system's native stats into the Prometheus
exposition format. Prometheus itself only understands `/metrics` endpoints
that speak this format — exporters bridge everything else.

| Exporter | Exposes metrics for |
|---|---|
| `node_exporter` | Host-level: CPU, memory, disk, network (Linux/Unix) |
| `kube-state-metrics` | Kubernetes object state (deployments, pods, replicasets) |
| `cAdvisor` | Per-container resource usage (built into kubelet) |
| `blackbox_exporter` | Probes (HTTP/TCP/ICMP/DNS) — synthetic uptime checks |
| `mysqld_exporter` / `postgres_exporter` | Database internals |
| Application's own `/metrics` | Custom business metrics via a client library (`prometheus_client` in Python, `client_golang`, `micrometer` in Java) |

Many modern apps expose Prometheus-format metrics natively (no separate
exporter needed) — or expose OTLP metrics that a Collector converts, see the
OpenTelemetry guide's Collector section for that path into Prometheus/Mimir.

### Service discovery

Static target lists don't scale in dynamic environments. Prometheus supports
pluggable **service discovery** (`kubernetes_sd_configs`, `ec2_sd_configs`,
`consul_sd_configs`, `file_sd_configs`) so scrape targets are discovered
automatically as pods/instances come and go, then filtered/labeled via
`relabel_configs`.

```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # only scrape pods that opt in via annotation
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: namespace
```

`relabel_configs` run **before** scraping (can drop/rewrite targets and
labels); `metric_relabel_configs` run **after** scraping, on the scraped
samples themselves — the usual place to drop unwanted high-cardinality
metrics/labels before they hit the TSDB.

### Local storage & TSDB

Prometheus stores data in a custom **time-series database (TSDB)** on local
disk, organized into 2-hour blocks, compacted over time. It is **not**
designed for durable long-term storage or high-availability by default — see
Section 9 for the long-term-storage answer to that limitation.

```yaml
global:
  scrape_interval: 15s      # default cadence for all jobs
  evaluation_interval: 15s  # how often alert/recording rules are evaluated

scrape_configs:
  - job_name: 'app'
    scrape_interval: 10s     # override per job
    static_configs:
      - targets: ['app:9090']
```

---

## 3. The Prometheus Data Model

Every time series is uniquely identified by a **metric name** plus a set of
**key-value label pairs**:

```
http_requests_total{method="POST", status="500", route="/checkout"} 8420
```

### Metric types

| Type | Behavior | Example |
|---|---|---|
| **Counter** | Monotonically increasing, resets to 0 on restart | `http_requests_total` |
| **Gauge** | Goes up or down freely | `process_resident_memory_bytes` |
| **Histogram** | Samples observed into configurable buckets + `_sum`/`_count` | `http_request_duration_seconds` |
| **Summary** | Like histogram but calculates quantiles client-side, no bucket aggregation possible across instances | `rpc_duration_seconds` |

**Prefer histograms over summaries** for anything you'll aggregate across
multiple instances (e.g., cluster-wide p99) — summary quantiles are
pre-computed per-instance and **cannot be mathematically averaged/merged**
across instances; histogram buckets can be summed across instances and then
quantile-computed at query time via `histogram_quantile()`.

---

## 4. PromQL Essentials

### Instant vector vs. range vector

```promql
http_requests_total                       # instant vector: one value per series, right now
http_requests_total[5m]                   # range vector: all samples in the last 5m, per series
```

You can't graph a range vector directly — it feeds into range-vector
functions like `rate()`.

### `rate()` vs `irate()`

```promql
rate(http_requests_total[5m])    # per-second average rate over the last 5m window
irate(http_requests_total[5m])   # per-second rate using only the last two data points in the window
```

- **`rate()`** — use for **alerting and dashboards**. Smooths out noise,
  correctly handles counter resets, and is the safe default.
- **`irate()`** — use only for **highly volatile, fast-moving counters** on
  ad-hoc graphs where you want to see instantaneous spikes; it's noisy and
  the wrong choice for alert thresholds because two consecutive scrapes can
  swing wildly.

**Rule of thumb:** the range window for `rate()` should span **at least 4x
the scrape interval** — with a 15s scrape interval, `rate(x[1m])` is the bare
minimum, `rate(x[5m])` is the common safe default. Too short a window and a
single missed/slow scrape produces `NaN` or wild swings.

### Aggregation operators

```promql
sum(rate(http_requests_total[5m])) by (route)          # total request rate per route
sum(rate(http_requests_total{status=~"5.."}[5m]))       # total error rate, all routes
avg(node_memory_usage_bytes) by (instance)
max(up) by (job)
count(up == 0)                                           # how many targets are down
topk(5, rate(http_requests_total[5m]))                   # top 5 busiest series
```

`by (label)` keeps only the listed labels in the result (groups by them);
`without (label)` drops the listed labels and keeps everything else.

### Histograms & `histogram_quantile()`

```promql
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
)
```

- Requires summing **rate of the `_bucket` series** by `le` (the bucket
  upper-bound label) before computing the quantile — never `histogram_quantile`
  directly on raw (non-rate'd) bucket counters.
- `le` = "less than or equal" — bucket boundaries; buckets must be chosen at
  instrumentation time and can't be changed retroactively without losing
  historical quantile accuracy.

### Binary operators & `on`/`ignoring`

```promql
# error ratio — vector match requires identical label sets, or explicit on()
sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)
  /
sum(rate(http_requests_total[5m])) by (route)
```

### Recording rules

Precompute expensive/frequently-used expressions on a schedule so dashboards
and alerts query a cheap pre-aggregated series instead of re-running the raw
expression every time.

```yaml
groups:
  - name: api_recording_rules
    interval: 30s
    rules:
      - record: route:http_errors:rate5m
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)
      - record: route:http_requests:rate5m
        expr: sum(rate(http_requests_total[5m])) by (route)
```

---

## 5. Golden Signals, RED, and USE

Three overlapping mental models for "what should I actually monitor":

| Framework | Signals | Best fit for |
|---|---|---|
| **Four Golden Signals** (Google SRE book) | Latency, Traffic, Errors, Saturation | General service health, broadest applicability |
| **RED** | **R**ate, **E**rrors, **D**uration | Request-driven services (APIs, microservices) |
| **USE** | **U**tilization, **S**aturation, **E**rrors | Resources (CPU, disk, memory, queues, connection pools) |

RED is essentially the golden signals minus saturation, framed for
request-scoped services; USE is the inverse lens, framed for the
resources those services consume. In practice: put RED metrics on your
per-service dashboards, USE metrics on your infrastructure/node dashboards.

```promql
# RED example set for one service
sum(rate(http_requests_total[5m])) by (route)                              # Rate
sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)                # Errors
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))  # Duration
```

---

## 6. SLIs, SLOs, and Error Budgets

Sections 1-5 covered how to collect and query metrics. This section covers
the layer on top: which number actually decides whether the system is
healthy enough, and who gets to make that call.

### SLI — Service Level Indicator

A quantitative measure of one aspect of the service, expressed as a ratio of
good events to total events (`successful requests / total requests`,
`requests faster than 300ms / total requests`). A good SLI is:

- **User-facing** — reflects what users experience, not an internal
  implementation detail. "Checkout success rate" is a good SLI; "CPU
  utilization" is a cause, not a symptom, and belongs on a dashboard, not in
  an SLO.
- **Measured close to the user** — at the load balancer/edge proxy, so it
  captures everything between the user and success (DNS, TLS, upstream
  network), not just the one service's internal view.
- **Binary-aggregatable** — each event is cleanly good or bad, so a ratio
  over a window is well-defined. "Mostly fine" doesn't aggregate.

```promql
# Availability SLI: fraction of requests that were NOT server errors
sum(rate(http_requests_total{status!~"5.."}[30d]))
  /
sum(rate(http_requests_total[30d]))

# Latency SLI: fraction of requests faster than a 300ms threshold
sum(rate(http_request_duration_seconds_bucket{le="0.3"}[30d]))
  /
sum(rate(http_request_duration_seconds_count[30d]))
```

| SLI type | PromQL shape |
|---|---|
| Availability | `sum(rate(...{status!~"5.."}[w])) / sum(rate(...[w]))` |
| Latency (threshold-based) | `sum(rate(..._bucket{le="X"}[w])) / sum(rate(..._count[w]))` — fraction faster than `X` |
| Freshness / correctness | Domain-specific counters (e.g., `stale_reads_total` / `reads_total`) |

### SLO — Service Level Objective

The target for an SLI over a time window: "99.9% of requests succeed,
measured over a rolling 30 days." An **SLA** is an SLO plus a
financial/contractual consequence for missing it — the SLO is the internal
promise, the SLA is what you tell customers.

### Error budget — turning the SLO into a spendable number

`error budget = 1 - SLO`, converted into an allowance of "badness" over the
window:

| SLO | Allowed downtime-equivalent per 30 days |
|---|---|
| 99% | 7.2 hours |
| 99.9% | 43.2 minutes |
| 99.95% | 21.6 minutes |
| 99.99% | 4.32 minutes |
| 99.999% | 25.9 seconds |

This is what ends the perennial "ship fast" vs. "keep it stable" argument —
both sides agree to let the same number decide:

- **Budget remaining** → ship faster, take more risk, run more chaos
  experiments; reliability isn't the bottleneck right now.
- **Budget nearly exhausted** → freeze risky deploys, prioritize reliability
  work over features, until the budget recovers.

An SLO without an agreed **error budget policy** behind it — what actually
happens when the budget runs out — is just a number on a dashboard nobody
acts on. Section 7's burn-rate alerts are how you find out the budget is at
risk *before* it's fully spent, rather than after the fact.

---

## 7. Alerting: Rules, Alertmanager, Routing

### Alert rules (evaluated by Prometheus)

```yaml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)
            /
          sum(rate(http_requests_total[5m])) by (route)
          > 0.05
        for: 10m                       # must stay true for 10m before firing — avoids flapping
        labels:
          severity: page
        annotations:
          summary: "Error rate above 5% on {{ $labels.route }}"
          description: "{{ $value | humanizePercentage }} error rate for the last 10m."

      - alert: TargetDown
        expr: up == 0
        for: 5m
        labels:
          severity: page
        annotations:
          summary: "{{ $labels.instance }} has been down for 5m"
```

`for:` is the most important flap-prevention lever — a condition must hold
continuously for the full duration before the alert transitions from
`pending` to `firing`.

### Burn-rate alerting: alert on budget consumption, not a raw threshold

A static threshold (`error rate > 5%`) fires identically whether the SLO is
99% or 99.99%, and can't tell a brief spike from a slow sustained leak — both
look the same to it. The Google SRE workbook's fix is to alert on **burn
rate**: how many times faster than sustainable you're consuming the error
budget from Section 6, using two windows — a long one to confirm the burn is
sustained, a short one to confirm it's still happening right now (so the
alert clears promptly once resolved).

```yaml
groups:
  - name: api-slo-burn-rate
    rules:
      # Fast burn: unchecked, exhausts the 30-day budget in ~2 days.
      # 14.4 = the fast-burn multiplier for a 99.9% SLO (Google SRE workbook).
      - alert: APIErrorBudgetBurnFast
        expr: |
          (
            sum(rate(http_requests_total{job="api", status=~"5.."}[1h]))
            /
            sum(rate(http_requests_total{job="api"}[1h]))
            > (14.4 * 0.001)
          )
          and
          (
            sum(rate(http_requests_total{job="api", status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total{job="api"}[5m]))
            > (14.4 * 0.001)
          )
        for: 2m
        labels:
          severity: page
          team: platform
        annotations:
          summary: "API error budget burning ~14.4x too fast (99.9% SLO)"
          description: >
            5xx error rate is {{ $value | humanizePercentage }}, sustained
            over both a 1h and 5m window. At this rate the 30-day error
            budget is exhausted in under 2 days.
          runbook_url: "https://runbooks.internal.example.com/api-error-rate"

      # Slow burn: unchecked, exhausts the budget in ~10 days — real, not urgent.
      - alert: APIErrorBudgetBurnSlow
        expr: |
          (
            sum(rate(http_requests_total{job="api", status=~"5.."}[6h]))
            /
            sum(rate(http_requests_total{job="api"}[6h]))
            > (3 * 0.001)
          )
          and
          (
            sum(rate(http_requests_total{job="api", status=~"5.."}[30m]))
            /
            sum(rate(http_requests_total{job="api"}[30m]))
            > (3 * 0.001)
          )
        for: 15m
        labels:
          severity: ticket
          team: platform
        annotations:
          summary: "API error budget burning ~3x too fast (99.9% SLO)"
          description: "Sustained slow leak — file a ticket, not a page."
```

`0.001` is the error budget for a 99.9% SLO (`1 - 0.999`, from Section 6's
table). The long window (`1h`/`6h`) confirms the burn is sustained rather
than one noisy scrape; the short window (`5m`/`30m`) confirms it's still
happening now. Pairing a high-multiplier/short-total-window rule
(`severity: page`) with a low-multiplier/long-total-window rule
(`severity: ticket`) lets the same underlying SLI drive both an urgent page
and a non-urgent ticket, routed by Alertmanager below on the `severity`
label — without two unrelated alerting systems.

### Alertmanager: dedupe, group, route, silence

Alertmanager receives fired alerts from one or more Prometheus servers and
decides **what to actually do** with them — it does not evaluate alert
conditions itself.

```yaml
route:
  receiver: default-slack
  group_by: ['alertname', 'route']
  group_wait: 30s        # wait to batch related alerts before first notification
  group_interval: 5m     # wait before sending updates to an existing group
  repeat_interval: 4h    # re-notify if still firing after this long
  routes:
    - match:
        severity: page
      receiver: pagerduty-oncall
      continue: false
    - match:
        team: payments
      receiver: payments-slack

receivers:
  - name: default-slack
    slack_configs:
      - channel: '#alerts'
  - name: pagerduty-oncall
    pagerduty_configs:
      - service_key: '<key>'
  - name: payments-slack
    slack_configs:
      - channel: '#payments-alerts'

inhibit_rules:
  - source_match:
      severity: page
    target_match:
      severity: warning
    equal: ['route']       # suppress a lower-severity alert on the same route once a page fires
```

- **Grouping** — batches related firing alerts into one notification instead
  of paging once per series (e.g., 50 pods down → 1 notification, not 50).
- **Inhibition** — suppresses a lower-priority alert when a related
  higher-priority one is already firing, to cut noise during an incident.
- **Silences** — a temporary, time-boxed mute for matching alerts (planned
  maintenance, known issue), created via UI or API, always with an expiry —
  never a permanent mute buried in config.

```bash
amtool silence add alertname="HighErrorRate" route="checkout" --duration=2h --comment="deploying fix, known blip"
```

---

## 8. Grafana

### Data sources

Grafana is data-source-agnostic — a single dashboard can mix panels from
Prometheus, Loki (logs), Tempo (traces), CloudWatch, PostgreSQL, and more.
Configured centrally (via UI or provisioning-as-code YAML):

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      timeInterval: 15s
      exemplarTraceIdDestinations:      # click a histogram exemplar -> jump to trace
        - name: trace_id
          datasourceUid: tempo-uid
```

### Dashboards & panels

A **dashboard** is a JSON document containing a grid of **panels**; each
panel binds one or more queries (in the data source's native query language —
PromQL for Prometheus) to a visualization type (time series, stat, gauge,
table, heatmap, logs panel).

- Dashboards-as-code: store dashboard JSON in git, provision via Grafana's
  provisioning config or the Grafana Terraform/API provider — avoids
  configuration drift and "someone edited prod directly" problems.
- Panel-level query inspector shows the raw PromQL and response — the first
  debugging step when a panel looks wrong.

### Variables / templating

Variables make one dashboard reusable across environments/services instead of
duplicating it per target.

```
Variable: $namespace   Query: label_values(kube_pod_info, namespace)
Variable: $pod         Query: label_values(kube_pod_info{namespace="$namespace"}, pod)

Panel query: sum(rate(container_cpu_usage_seconds_total{namespace="$namespace", pod=~"$pod"}[5m]))
```

Common variable types: `Query` (populated from a PromQL `label_values()`
call), `Custom` (static list), `Interval` (for `$__rate_interval`-style
step-size pickers), `Datasource` (switch which backend a panel points at).

`$__rate_interval` is Grafana's dashboard-aware variable for the `rate()`
window — it auto-adjusts to at least 4x the dashboard's step interval,
avoiding the manual "window too short" mistake from Section 4.

### Alerting in Grafana

Grafana ships its own **unified alerting** engine (separate from
Prometheus/Alertmanager's), which can alert off *any* connected data source
(not just Prometheus) — useful when your alert condition spans, say, a
PostgreSQL query and a Prometheus metric. It can route through Grafana's own
notification policies or forward to an external Alertmanager.

```
Grafana Alert Rule:
  Query: A = PromQL expression
  Condition: WHEN last() OF A IS ABOVE 0.05
  Evaluate every: 1m FOR 10m
  Labels/annotations: same concept as Prometheus alert rules
```

**Decision point:** if you're all-in on Prometheus already, keep alerting
in Prometheus + Alertmanager (rules live as code, reviewed in PRs). Reach for
Grafana-native alerting when you need to alert on non-Prometheus data
sources or want alert authoring in the same UI non-Prometheus-fluent users
already live in.

---

## 9. Long-Term Storage: Thanos, Mimir, Cortex

Vanilla Prometheus's local TSDB is **not built for**: multi-year retention,
global query view across many Prometheus servers, or high availability.
Three projects solve this, all following roughly the same shape — remote
long-term object-storage-backed storage plus a global query layer:

| Project | Origin | Notes |
|---|---|---|
| **Thanos** | Improbable/CNCF | Sidecar pattern — runs alongside each Prometheus, uploads TSDB blocks to object storage (S3/GCS), a global **Querier** fans out across sidecars + storage; **Store Gateway**/**Compactor** manage the object-store side |
| **Cortex** | Weaveworks/CNCF | Fully horizontally-scalable multi-tenant system; push-based (`remote_write`); heavily informed Mimir's design |
| **Grafana Mimir** | Grafana Labs (Cortex fork) | Also `remote_write`-based, multi-tenant, drop-in Prometheus-API-compatible; the default long-term-storage pairing in the Grafana "LGTM" stack alongside Loki/Tempo |

All three give you: **unlimited retention** (backed by cheap object storage),
**global query** across every cluster/region's Prometheus instances, and
**HA** (no single Prometheus process is a single point of failure for
historical data). The trade-off is operational complexity — you're now
running a distributed system instead of a single binary.

```yaml
# Prometheus remote_write — the common integration point for Cortex/Mimir
remote_write:
  - url: http://mimir:9009/api/v1/push
    queue_config:
      max_samples_per_send: 5000
```

This is also the same endpoint shape the OpenTelemetry Collector's
`prometheusremotewrite` exporter targets — whether metrics arrive via native
Prometheus scraping or via OTLP through a Collector, they land in the same
long-term store.

---

## 10. Logs: The ELK / EFK Stack

Prometheus + Grafana answer "is the system healthy, in aggregate, right
now"; when a metric spike needs "what exact request/host/error caused it,"
that detail lives in logs. The dominant self-hosted stack for structured log
search is **ELK** (Elasticsearch, Logstash, Kibana), or its lighter **EFK**
variant with Fluentd/Fluent Bit swapped in for Logstash.

| Component | Role | Notes |
|---|---|---|
| **Elasticsearch** | Distributed search/storage engine; logs are indexed JSON documents | Sharding and Index Lifecycle Management (ILM) are the main scaling levers — unbounded index growth is the #1 way ELK clusters fall over |
| **Logstash** | Heavier ingest pipeline: parses/transforms/enriches before indexing (grok patterns, field extraction) | CPU/memory-hungry; rich plugin ecosystem but slower than Fluent Bit |
| **Fluentd / Fluent Bit** | Lighter-weight log shipper/processor | Fluent Bit is the common Kubernetes DaemonSet choice for its small footprint — swapping this in for Logstash is what turns "ELK" into "EFK" |
| **Kibana** | Query/visualization UI over Elasticsearch | Grafana's counterpart, but document-search-oriented rather than time-series-oriented (Grafana can also query Elasticsearch as a data source, per Section 8) |

### Logs need structure to be queryable at scale

Grepping raw text logs stops working past a handful of hosts. Logs need to
be **structured** (JSON, key-value) before they hit Logstash/Fluentd so
Elasticsearch indexes individual fields — `level`, `route`, `trace_id`,
`status` — not just a full-text blob. Retrofitting structure onto years of
unstructured logs later is far more painful than logging structured from
day one.

### Where this fits next to Prometheus/Grafana and Loki

- Correlate a metric spike with the log line that explains it via a shared
  `trace_id` — Section 8's `exemplarTraceIdDestinations` config is exactly
  this jump, from a slow histogram sample to the trace/log for that request.
- **Grafana Loki**, part of the Grafana "LGTM" stack alongside Mimir/Tempo
  (Section 9), is the metrics-adjacent alternative to Elasticsearch for
  logs — it indexes only labels, not full text, which is far cheaper to run
  at Prometheus-scale but weaker at ad-hoc full-text search across log
  bodies. Choose ELK/EFK when full-text search matters; choose Loki when
  cost and operational uniformity with the rest of the Prometheus/Grafana
  stack matter more.

---

## 11. Commercial APM: Datadog, New Relic, and the Self-Hosted Tradeoff

Datadog and New Relic are SaaS platforms that unify metrics, logs, and
traces — all three pillars from Section 1 — under one product, one query
language, and one UI: the commercial alternative to running Prometheus +
Grafana + ELK/EFK yourself.

### What commercial APM adds over self-hosted

- **Unified UX** — one pane of glass with automatic cross-pillar
  correlation: click a slow trace, jump straight to the exact logs and host
  metrics for that request, without hand-wiring exemplars/trace IDs
  yourself.
- **Out-of-box instrumentation** — drop-in agents auto-instrument common
  frameworks/languages (or ingest via OTel exporters — see the
  [OpenTelemetry guide](/docs/sre-skills/opentelemetry/opentelemetry-guide)),
  with pre-built dashboards for common infra (Postgres, Redis, Kafka,
  Kubernetes) that would otherwise take real engineering time to build in
  Grafana.
- **Managed scale** — no cluster to run, no shard rebalancing, no
  Thanos/Cortex/Mimir federation to design; ingestion and retention scale by
  paying more, not by engineering more.

### The tradeoff: cost vs. operational burden

| | Prometheus + Grafana | ELK / EFK | Datadog | New Relic |
|---|---|---|---|---|
| **Primary signal** | Metrics (+ alerting via Alertmanager) | Logs (search/aggregation) | All three, unified | All three, unified |
| **Cost model** | Infra cost only (compute/storage you run) | Infra cost only, but storage-heavy | Per host + per GB ingested + per custom metric | Per host/user + per GB ingested |
| **Initial setup** | Moderate — Helm chart/docker-compose gets you running fast, but SD/relabeling/alerting rules take real config work | Moderate-to-hard — cluster sizing, shard/ILM tuning, grok patterns need tuning | Easy — install agent, dashboards appear | Easy — install agent, dashboards appear |
| **Operational burden** | High — you own scaling (Thanos/Cortex/Mimir), HA, upgrades, retention | High — you own cluster health, reindexing, ILM/hot-warm-cold tiering | None — SaaS | None — SaaS |
| **Scale ceiling** | Very high, but requires deliberate architecture past a single node | Very high, same caveat | High, bounded mainly by budget | High, bounded mainly by budget |
| **Customization / query power** | Very high — PromQL + full control of retention/labels | High — full Elasticsearch DSL, log-shaped not metric-shaped | Moderate — powerful UI, less flexible than raw PromQL/DSL | Moderate — NRQL is capable but proprietary |
| **Best fit** | Teams with SRE/infra headcount, cost-sensitive at scale, need long retention & custom alerting | Teams with heavy log volume/search needs, already running k8s infra | Teams wanting fast time-to-value, small/no dedicated observability team | Similar to Datadog, historically stronger on APM/code-level tracing |

**Decision rule of thumb:** it's rarely "which is better" in the abstract —
it's team size and maturity. Small/mid teams without dedicated observability
engineers reach a good outcome faster on Datadog/New Relic; larger orgs with
headcount to operate infra, or with strict data-residency/cost constraints,
get more long-term leverage from self-hosted stacks — often *also* fed via
OTel so the backend choice stays swappable later without re-instrumenting
application code.

---

## 12. Common Pitfalls

- **Counter resets** — a counter resets to 0 on process restart. `rate()`
  handles this correctly automatically (detects the reset and doesn't report
  a negative rate); raw counter deltas computed manually (`counter[t2] -
  counter[t1]`) do not — always use `rate()`/`increase()`, never manual
  subtraction, on counters.
- **Cardinality explosions** — a label with unbounded values (user ID, raw
  request path, order ID) multiplies the number of stored time series;
  Prometheus/Mimir/Cortex all degrade or fall over under high cardinality.
  Same rule as the OpenTelemetry guide: unbounded values belong in logs/trace
  attributes, not metric labels. Route templates (`/orders/{id}`), not raw
  paths, in HTTP metrics.
- **Scrape interval vs. rate window mismatch** — a `rate()` window shorter
  than ~4x the scrape interval produces noisy or `NaN` results when a single
  scrape is delayed. If you tighten the scrape interval, dashboards/alerts
  using `rate(x[5m])` don't need to change, but if you widen it, existing
  short-window queries can silently break.
- **Summaries that can't be aggregated** — client-side quantiles from a
  `Summary` type cannot be merged across instances; if you'll ever need a
  fleet-wide p99, instrument with a `Histogram`, not a `Summary`.
- **Missing `for:` on alert rules** — an alert with no `for:` (or `for: 0m`)
  fires on a single noisy sample, causing pages for transient blips. Always
  set a `for:` duration proportional to how long a real incident would
  actually persist.
- **Unbounded label growth from bucket boundaries** — every histogram bucket
  is its own time series (`_bucket{le="0.1"}`, `_bucket{le="0.5"}`, ...); too
  many buckets multiplies cardinality just like a bad label would.
- **Dashboards that only show averages** — `avg()` hides tail latency;
  always pair averages with p95/p99 panels, since users experience the tail,
  not the mean.
- **Alert fatigue from miscalibrated pages** — every page that turns out to
  be a non-issue erodes trust in the next one; if the on-call's response to
  an alert is consistently "yeah, ignore that," fix the threshold, fix the
  underlying flakiness, or delete the alert rather than leave it firing. A
  pager that cries wolf gets muted, and then the real page gets missed too.
- **Static thresholds instead of burn-rate alerts for SLO-backed services**
  — a fixed `error rate > 1%` alert fires the same way regardless of the
  SLO and can't distinguish a brief spike from a slow leak; see Section 7's
  burn-rate alerts for the fix.

---

## 13. Interview-Ready Q&A

**Q: Why does Prometheus use a pull model instead of push, and what's the
trade-off?**
A: Pulling lets Prometheus centrally control scrape cadence and gives a
built-in liveness signal — a failed scrape (`up == 0`) is itself meaningful,
whereas in a push system silence is ambiguous between "no traffic" and
"down." The trade-off is it doesn't suit short-lived batch jobs or targets
behind NAT/firewalls well, which is why Pushgateway exists as a workaround
for the batch-job case.

**Q: When would you use `rate()` vs `irate()`?**
A: `rate()` averages over the whole range window and correctly smooths
noise and counter resets — the right default for alerting and dashboards.
`irate()` only looks at the last two samples in the window, so it's more
sensitive to instantaneous spikes but too noisy and unstable for alert
thresholds; reserve it for ad-hoc exploration of fast-moving counters.

**Q: Why can't you average Summary-type quantiles across instances, but you
can with Histograms?**
A: A Summary computes its quantiles client-side, per instance, before
Prometheus ever sees them — those pre-computed numbers are not
mathematically meaningful to average or merge. A Histogram instead exposes
raw bucket counts, which are just counters — you can sum them across every
instance with `sum() by (le)` and then compute the quantile once, centrally,
with `histogram_quantile()`, which is mathematically valid.

**Q: What's the difference between the Golden Signals, RED, and USE?**
A: Golden Signals (latency, traffic, errors, saturation) is the broadest
framework. RED (rate, errors, duration) is the same idea minus saturation,
scoped to request-driven services — good for per-service API dashboards.
USE (utilization, saturation, errors) is scoped to resources like CPU, disk,
and connection pools — good for infrastructure/node dashboards. In practice
you use RED for services and USE for the resources underneath them.

**Q: How does Alertmanager grouping/inhibition reduce alert fatigue during
an incident?**
A: Grouping batches related firing alerts (e.g., many pods down at once)
into a single notification instead of one page per series, using
`group_by`/`group_wait`/`group_interval`. Inhibition suppresses a
lower-severity alert when a related higher-severity one is already firing —
e.g., don't page a "warning: high latency" alert on a route that already has
a "critical: route down" page firing for it.

**Q: Why is high cardinality dangerous, and where should high-cardinality
data go instead?**
A: Every unique label combination creates a new time series that Prometheus
(or Mimir/Cortex) must store and index; unbounded values like user IDs or
raw request paths can create millions of series, blowing up memory and query
latency, sometimes crashing the TSDB outright. High-cardinality data belongs
in log fields or trace/span attributes instead, correlated back to metrics
via exemplars/trace IDs rather than being a metric label itself.

**Q: What problem do Thanos/Mimir/Cortex solve that vanilla Prometheus
doesn't?**
A: Vanilla Prometheus's local TSDB has limited retention, no built-in HA, and
no global query view across multiple Prometheus servers/clusters/regions.
These systems add an object-storage-backed long-term store plus a global
query layer on top, giving effectively unlimited retention and one query
endpoint across your whole fleet — at the cost of running a more complex
distributed system instead of a single binary.

**Q: A dashboard panel using `rate(x[1m])` looks noisy/spiky after we
switched a job's scrape interval from 15s to 45s. Why?**
A: The rate window is now too short relative to the new scrape interval —
the rule of thumb is the window should be at least ~4x the scrape interval,
so 45s scrapes need at least a 3m window, not 1m. With too short a window, a
single delayed or missed scrape swings the computed rate wildly or produces
`NaN`. Fix by widening the range window (or using Grafana's
`$__rate_interval` so it auto-adjusts).

**Q: What's an error budget, and why is it more useful than just stating
the SLO?**
A: The error budget (`1 - SLO`) converts an abstract reliability target into
a concrete, spendable allowance — a 99.9% SLO over 30 days is 43.2 minutes
of allowed downtime-equivalent. Stated as a percentage, "99.9%" doesn't tell
anyone what to *do*; stated as a budget, it does: budget remaining means
ship faster and take more risk, budget exhausted means freeze risky deploys
and prioritize reliability work. It's the mechanism that lets "ship fast"
and "keep it stable" be decided by the same number instead of an opinion.

**Q: Why use a multi-window burn-rate alert instead of a single static
threshold for an SLO-backed error rate?**
A: A static threshold (`error rate > 5%`) fires the same way regardless of
the SLO and can't tell a brief spike from a sustained leak. A burn-rate
alert instead asks "at this rate, how fast would we exhaust the error
budget" — pairing a short window (confirms it's happening right now) with a
long window (confirms it's sustained, not one noisy scrape) so both must
agree before paging. This lets a high-multiplier/short-window pair page
urgently on fast outages while a low-multiplier/long-window pair only opens
a ticket for slow leaks, all from the same underlying SLI.

**Q: What causes alert fatigue, and how do you prevent it?**
A: Alert fatigue comes from pages that don't correspond to real, actionable
user impact — every "yeah, ignore that" page erodes trust in the next one,
until real pages get missed too. Prevent it by alerting on symptoms (SLI
burn) rather than causes (a resource metric crossing an arbitrary line), by
requiring `for:` durations proportional to how long a real incident would
persist, and by routing anything without a clear immediate action to a
ticket instead of a page — Alertmanager's `severity` label and routing tree
are how that split is enforced mechanically.

**Q: When would you reach for ELK/EFK vs. Grafana Loki for logs?**
A: Both index logs, but differently: Elasticsearch indexes full document
content, so ELK/EFK is stronger when you need ad-hoc full-text search across
log bodies. Loki indexes only labels (not the log line content) and stores
the rest as compressed chunks, which is far cheaper to run at
Prometheus-adjacent scale and keeps you on one query surface (LogQL feels
like PromQL) alongside Mimir/Tempo. Choose ELK/EFK when full-text search
matters most; choose Loki when cost and operational uniformity with the
rest of the Prometheus/Grafana stack matter more.

**Q: When does it make sense to pay for Datadog/New Relic instead of
running Prometheus + Grafana + ELK yourself?**
A: It's a team-size-and-maturity question more than a "which is better"
question. Datadog/New Relic trade a recurring, volume-scaled bill for
managed scale, out-of-box instrumentation, and automatic cross-pillar
correlation — a small/mid team without dedicated observability engineers
reaches a good outcome faster there. A larger org with the headcount to
operate infra, or with strict cost/data-residency constraints, gets more
long-term leverage self-hosting — especially if telemetry is emitted via
OTel, keeping the backend choice swappable either way.

---

## 14. One-Line Summary

**Prometheus pulls and stores metrics with a powerful query language built
around counters/gauges/histograms, error budgets turn an SLO into a number
that decides ship-vs-freeze, burn-rate alerts turn that budget into pages
that fire on urgency rather than arbitrary thresholds, Alertmanager turns
fired rules into deduped and routed notifications, Grafana turns any of that
(plus logs from ELK/EFK/Loki and other data sources) into dashboards, and
Datadog/New Relic trade the operational burden of running all of it
yourself for a recurring bill — cardinality discipline plus correct
`rate()` windows are what keep whichever stack you pick fast and
trustworthy at scale.**
