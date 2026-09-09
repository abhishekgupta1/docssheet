---
title: "Prometheus & Grafana Cheat Sheet"
description: "Quick reference for Prometheus/Grafana observability — PromQL, golden signals, alerting, and Grafana basics."
tags: [observability, prometheus, grafana, sre, cheat-sheet]
hide_table_of_contents: true
---

# Prometheus & Grafana cheatsheet

A one-page reference for metrics-based observability. For the full stack —
Alertmanager routing, Thanos/Mimir, logs, and APM tradeoffs — see the [complete guide](/docs/sre-skills/observability-grafana-prometheus/observability-grafana-prometheus-guide).

<a class="topic-crosslink" href="/docs/sre-skills/observability-grafana-prometheus/observability-grafana-prometheus-guide">📖 Full guide: Prometheus & Grafana →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Instant vs. range vector

```promql
http_requests_total          # instant vector: one value per series, now
http_requests_total[5m]      # range vector: samples over the last 5m
```

Range vectors feed into functions like `rate()` — you can't graph one directly.

</div>

<div class="cheat-card">

#### rate() vs irate()

```promql
rate(http_requests_total[5m])    # per-second avg — use for alerts/dashboards
irate(http_requests_total[5m])   # last-two-points only — noisy, ad-hoc only
```

Rule of thumb: window ≥ 4x the scrape interval, or you get `NaN`/wild swings.

</div>

<div class="cheat-card">

#### Aggregation

```promql
sum(rate(http_requests_total[5m])) by (route)
sum(rate(http_requests_total{status=~"5.."}[5m]))
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

</div>

<div class="cheat-card">

#### Golden signals / RED / USE

| Framework | Signals |
|---|---|
| Golden Signals | latency, traffic, errors, saturation |
| RED (services) | rate, errors, duration |
| USE (resources) | utilization, saturation, errors |

</div>

<div class="cheat-card">

#### SLIs, SLOs, error budgets

```
SLI: the measured indicator (e.g. % requests < 300ms)
SLO: the target (e.g. 99.9% over 30 days)
Error budget: 100% - SLO — how much unreliability you can spend
```

Burn-rate alerts (fast + slow window) catch budget-draining incidents
without paging on every blip.

</div>

<div class="cheat-card">

#### Alerting

```yaml
- alert: HighErrorRate
  expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
  for: 10m
  labels: { severity: page }
```

Alertmanager handles routing, grouping, dedup, and silences on top of
Prometheus's raw alert rules.

</div>

<div class="cheat-card">

#### Grafana basics

- Dashboards = panels, each backed by a PromQL (or other datasource) query.
- Variables (`$env`, `$instance`) make one dashboard reusable across scopes.
- Alerting can live in Grafana itself or be delegated to Alertmanager.

</div>

<div class="cheat-card">

#### Long-term storage & logs

Thanos/Mimir/Cortex extend Prometheus retention beyond local disk with
object-storage backends. Logs (ELK/EFK) and metrics are complementary —
metrics tell you *something* is wrong, logs tell you *what*.

<span class="cheat-see">See: Common Pitfalls</span>

</div>

</div>
