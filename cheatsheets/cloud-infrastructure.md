---
title: "Cloud Infrastructure Cheat Sheet"
description: "Quick reference for cloud infrastructure — HA design, network topology, load balancing, autoscaling, and DR."
tags: [cloud-infrastructure, sre, cheat-sheet]
hide_table_of_contents: true
---

# Cloud infrastructure cheatsheet

A one-page reference for cloud infrastructure design. For the full 3-tier
HA reference architecture, see the [complete guide](/docs/sre-skills/cloud-infrastructure/cloud-infrastructure-guide).

<a class="topic-crosslink" href="/docs/sre-skills/cloud-infrastructure/cloud-infrastructure-guide">📖 Full guide: Cloud Infrastructure →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### AZs vs regions

- **AZ** — isolated power/cooling/network within a region.
- **Region** — geographically separate, own control plane/compliance boundary.

Default to **multi-AZ** within a region; only go multi-region for a real
RTO/RPO or data-residency requirement — it roughly doubles complexity/cost.

</div>

<div class="cheat-card">

#### Active-active vs active-passive

| | Active-active | Active-passive |
|---|---|---|
| RTO | near-zero | nonzero (DNS/promote/warm cache) |
| Complexity | high (conflict resolution) | lower |
| Consistency | harder | easier |

</div>

<div class="cheat-card">

#### Compute choice

| | VMs | Containers | Serverless |
|---|---|---|---|
| Cold start | slow | fast | varies |
| Ops overhead | high | medium | lowest |
| Best for | legacy/stateful | most services | spiky/event-driven |

</div>

<div class="cheat-card">

#### Load balancing & autoscaling

- L4 LB: fast, IP/port only. L7 LB: content-aware routing, TLS termination.
- Autoscaling triggers on a leading indicator (queue depth, request rate),
  not just CPU — CPU often lags the thing you actually care about.

</div>

<div class="cheat-card">

#### Disaster recovery

```
RTO = how long until you're back up
RPO = how much data you can afford to lose
```

Pick a DR pattern (backup/restore, pilot light, warm standby,
active-active) based on your actual RTO/RPO, not the fanciest option.

</div>

<div class="cheat-card">

#### Cost optimization

- Right-size instances — most workloads are over-provisioned.
- Reserved/committed-use for steady baseline load, spot/preemptible for
  interruptible batch work.
- Autoscale down aggressively off-peak, not just up on-peak.

<span class="cheat-see">See: Reference Architecture — 3-Tier HA Web App</span>

</div>

</div>
