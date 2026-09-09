---
title: "Chaos Engineering Cheat Sheet"
description: "Quick reference for chaos engineering — the lifecycle, failure injection types, tools, and blast-radius control."
tags: [chaos-engineering, sre, cheat-sheet]
hide_table_of_contents: true
---

# Chaos engineering cheatsheet

A one-page reference for chaos engineering. For worked LitmusChaos/AWS FIS
examples and game-day facilitation, see the [complete guide](/docs/sre-skills/chaos-engineering/chaos-engineering-guide).

<a class="topic-crosslink" href="/docs/sre-skills/chaos-engineering/chaos-engineering-guide">📖 Full guide: Chaos Engineering →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Steady-state hypothesis

Define a measurable "normal" (e.g. p99 latency, error rate) *before*
injecting failure. The experiment succeeds if the system holds steady
state, or fails safely and you learned something real.

</div>

<div class="cheat-card">

#### Lifecycle

```
Define steady state → Hypothesize → Inject failure →
Observe → Compare to hypothesis → Fix or scale up blast radius
```

</div>

<div class="cheat-card">

#### Failure injection types

- Instance/pod termination
- Network latency / packet loss / partition
- Resource exhaustion (CPU, memory, disk)
- Dependency failure (DB down, API 5xx)
- Clock skew / time travel

</div>

<div class="cheat-card">

#### Tools

| Tool | Best for |
|---|---|
| Chaos Monkey | random instance termination, AWS/cloud |
| Gremlin | commercial, host/container/k8s, large attack library |
| LitmusChaos | CNCF, Kubernetes-native, CRD-based experiments |
| Chaos Mesh | CNCF, Kubernetes-native, strong network/IO chaos |
| AWS FIS | AWS-native, IAM-scoped, CloudWatch stop conditions |

</div>

<div class="cheat-card">

#### Blast-radius control

- Start in staging, then a single low-traffic prod instance.
- Always define a stop condition tied to a real metric/alarm.
- Have a kill switch — every experiment must be instantly abortable.

</div>

<div class="cheat-card">

#### Game days

Scheduled, team-wide chaos exercises. Purpose: validate runbooks and
on-call muscle memory under a controlled failure, not just test the system.

</div>

<div class="cheat-card">

#### Common mistakes

- No steady-state baseline → can't tell if the experiment "failed."
- Running in prod before staging is solid.
- No stop condition / no one able to abort quickly.
- Treating chaos engineering as a one-time event instead of an ongoing practice.

<span class="cheat-see">See: Common Mistakes</span>

</div>

</div>
