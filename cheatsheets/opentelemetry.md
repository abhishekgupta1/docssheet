---
title: "OpenTelemetry Cheat Sheet"
description: "Quick reference for OpenTelemetry — traces/spans, context propagation, the Collector, and sampling."
level: intermediate
tags: [opentelemetry, observability, sre, cheat-sheet]
hide_table_of_contents: true
image: /img/social/opentelemetry.png
---

# OpenTelemetry cheatsheet

A one-page reference for OpenTelemetry. For instrumentation deep-dives and
Collector pipeline config, see the [complete guide](/docs/sre-skills/opentelemetry/opentelemetry-guide).

<a class="topic-crosslink" href="/docs/sre-skills/opentelemetry/opentelemetry-guide">📖 Full guide: OpenTelemetry →</a>

<LevelBadge level="intermediate" />

<TenMinute minutes={5}>

1. Begin with the **Spans & traces** card
2. Then the **Context propagation** and **Three signals** cards
3. Treat the other 4 cards as lookups — scan by card title when you need one
4. Open the [full guide](/docs/sre-skills/opentelemetry/opentelemetry-guide) when a card isn't enough

</TenMinute>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Spans & traces

```
Trace (trace_id=abc123)
└─ span: HTTP GET /checkout        120ms
    ├─ span: validate-cart          15ms
    ├─ span: charge-card            80ms
    └─ span: send-confirmation      10ms
```

A span has a name, start/end time, attributes, events, and status
(OK/Error). A trace is a tree of spans sharing one trace ID.

</div>

<div class="cheat-card">

#### Context propagation

The active `SpanContext` (`trace_id`, `span_id`, `trace_flags`) is injected
into outgoing request headers and extracted downstream so the next
service's span becomes a child of the caller's — this is what stitches a
distributed trace together across services.

</div>

<div class="cheat-card">

#### Three signals

| Signal | Answers |
|---|---|
| Traces | where did the request go, and where was it slow |
| Metrics | how much / how often, aggregated over time |
| Logs | what exactly happened at a point in time |

</div>

<div class="cheat-card">

#### Architecture: API, SDK, Collector

- **API** — vendor-neutral instrumentation surface your code calls.
- **SDK** — the implementation (sampling, batching, exporting).
- **Collector** — a separate process that receives, processes, and exports
  telemetry — decouples your app from any specific backend.

</div>

<div class="cheat-card">

#### Instrumentation: auto vs manual

Auto-instrumentation (agent/library hooks) gets you 80% for free with zero
code changes. Manual spans/attributes fill the gap for business-specific
context auto-instrumentation can't know about.

</div>

<div class="cheat-card">

#### Sampling

Head-based sampling decides at trace start (cheap, may miss rare errors).
Tail-based sampling decides after seeing the full trace (catches errors/
slow traces reliably, but needs the Collector to buffer).

</div>

<div class="cheat-card">

#### Common pitfalls

- No context propagation across an async boundary (queue, background job) → broken traces.
- Over-instrumenting → noisy, expensive traces nobody reads.
- Sampling too aggressively → missing the rare error that mattered.

<span class="cheat-see">See: Common Pitfalls & Debugging</span>

</div>

</div>
