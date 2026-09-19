---
title: "Cloud Infrastructure: The Complete Guide"
description: "Provider-agnostic architecture patterns — HA design, network topology, compute choice, load balancing, autoscaling, and DR — complementing the AWS-specific and Terraform-specific guides elsewhere in this site."
sidebar_position: 1
tags: [cloud-infrastructure, sre, architecture, high-availability]
---

# Cloud Infrastructure — The Complete Guide

A single-read reference for designing highly available, cost-efficient cloud
infrastructure — deliberately **provider-agnostic**. AWS, Azure, and GCP all
implement the same primitives under different names (Availability Zone vs.
Zone, VPC vs. VNet, ALB vs. Application Gateway vs. Cloud Load Balancing).
Learn the pattern once here, then map it onto whichever provider's console
you're staring at. For AWS-specific services and commands, see the
[AWS guide](../aws/aws-guide.md); for the infrastructure-as-code tooling that
turns these patterns into reproducible deployments, see the Terraform guide.

Senior engineers think in **failure domains**, **blast radius**, **RTO/RPO**,
**stateless vs. stateful**, and **cost per unit of reliability** — this guide
is organized around those five ideas.

<a class="topic-crosslink" href="/cheatsheets/cloud-infrastructure">📋 Quick reference: Cloud Infrastructure →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 220" role="img" aria-labelledby="mm-cloudinfra-title mm-cloudinfra-desc">
<title id="mm-cloudinfra-title">The five ideas cloud infrastructure design is organized around</title>
<desc id="mm-cloudinfra-desc">Cloud infrastructure design fans out into five recurring concerns: failure domains, blast radius, RTO and RPO, stateless versus stateful, and cost per unit of reliability.</desc>
<defs>
  <marker id="mm-cloudinfra-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n5" x="270" y="16" width="240" height="56" rx="10"/>
<text class="mm-node-title" x="390" y="40" text-anchor="middle">Infrastructure Design</text>
<text class="mm-node-sub" x="390" y="56" text-anchor="middle">provider-agnostic patterns</text>

<path class="mm-arrow" d="M320,72 L110,134" marker-end="url(#mm-cloudinfra-arrow)"/>
<path class="mm-arrow" d="M355,72 L255,134" marker-end="url(#mm-cloudinfra-arrow)"/>
<path class="mm-arrow" d="M390,72 L390,134" marker-end="url(#mm-cloudinfra-arrow)"/>
<path class="mm-arrow" d="M425,72 L535,134" marker-end="url(#mm-cloudinfra-arrow)"/>
<path class="mm-arrow" d="M460,72 L680,134" marker-end="url(#mm-cloudinfra-arrow)"/>

<rect class="mm-n1" x="20" y="138" width="150" height="66" rx="10"/>
<text class="mm-node-title" x="95" y="166" text-anchor="middle">Failure Domains</text>
<text class="mm-node-sub" x="95" y="182" text-anchor="middle">what fails together</text>

<rect class="mm-n2" x="180" y="138" width="150" height="66" rx="10"/>
<text class="mm-node-title" x="255" y="166" text-anchor="middle">Blast Radius</text>
<text class="mm-node-sub" x="255" y="182" text-anchor="middle">how much breaks</text>

<rect class="mm-n3" x="340" y="138" width="100" height="66" rx="10"/>
<text class="mm-node-title" x="390" y="166" text-anchor="middle">RTO / RPO</text>
<text class="mm-node-sub" x="390" y="182" text-anchor="middle">recovery targets</text>

<rect class="mm-n4" x="460" y="138" width="150" height="66" rx="10"/>
<text class="mm-node-title" x="535" y="166" text-anchor="middle">Stateless vs.</text>
<text class="mm-node-sub" x="535" y="182" text-anchor="middle">Stateful</text>

<rect class="mm-n6" x="620" y="138" width="150" height="66" rx="10"/>
<text class="mm-node-title" x="695" y="166" text-anchor="middle">Cost per</text>
<text class="mm-node-sub" x="695" y="182" text-anchor="middle">reliability unit</text>
</svg>

<p class="mental-model__caption">Senior infrastructure design decisions all trace back to one of these five questions, regardless of which cloud provider's console you're looking at — the primitives are the same, only the names change.</p>
</div>

## 1. High Availability Design

**Availability Zones (AZs)** are isolated physical locations within a
region — separate power, cooling, and network. **Regions** are
geographically separate and fully isolated from each other, often with
separate control planes and compliance boundaries.

- **Multi-AZ (single region)** — the default for almost everything. Spread
  instances/nodes across two or three AZs behind a load balancer; a managed
  database (RDS Multi-AZ, Cloud SQL HA) replicates synchronously to a
  standby AZ. Protects against AZ-level failure (power, network, a bad
  rack). Cross-AZ latency is low enough (sub-2ms typically) that synchronous
  replication is viable.
- **Multi-region** — protects against regional-scale failure: a control
  plane outage, a natural disaster, or a regulatory data-residency split.
  Cross-region latency (tens to hundreds of ms) usually forces
  **asynchronous** replication, which means eventual consistency and a
  non-zero RPO on failover.
- **Active-active** — every region/AZ serves live traffic simultaneously.
  Best possible RTO (near-zero — just reroute traffic), but the hardest to
  build correctly: it needs conflict resolution for concurrent writes, a
  real replication strategy, and traffic steering (DNS-based or a global
  load balancer / anycast).
- **Active-passive** — one region/AZ serves traffic, the other stands by
  (warm or cold). Simpler to reason about and consistency is easier, but
  failover has a nonzero RTO — DNS propagation, promoting a replica to
  primary, warming caches.

**Rule of thumb**: default to multi-AZ within a region. Only go
multi-region when a specific RTO/RPO requirement, a regulatory driver (data
residency), or a blast-radius analysis shows a regional outage is a real and
unacceptable risk. Multi-region roughly doubles operational complexity and
cost — don't pay for it speculatively.

---

## 2. Network Topology

### VPC / VNet design

- One VPC per environment (dev/staging/prod) or per workload boundary,
  sized with enough CIDR headroom for growth (a `/16` at the VPC level is
  common, carved into `/20`–`/24` subnets).
- **Public subnets** hold only internet-facing resources — load balancers,
  NAT gateways, bastion hosts. Nothing with sensitive data or that doesn't
  need a public IP.
- **Private subnets** hold application servers, containers, and databases.
  No direct route to the internet; outbound traffic egresses through a NAT
  gateway sitting in a public subnet.
- Spread both public and private subnets across every AZ you use for HA — a
  subnet is AZ-scoped, so "multi-AZ" means at least one subnet pair
  (public + private) per AZ.

### NAT gateways

NAT gateways give private-subnet resources outbound internet access
(package installs, calls to SaaS APIs, third-party integrations) without any
inbound exposure. Deploy **one NAT gateway per AZ**, not one shared across
AZs — a shared NAT gateway makes it a single point of failure for egress in
every AZ but its own, and cross-AZ data transfer charges typically exceed
the cost of the second NAT gateway anyway.

### Peering vs. Transit Gateway (hub-and-spoke)

| | VPC Peering | Transit Gateway / hub VNet / Shared VPC |
|---|---|---|
| Topology | Direct 1:1 connection between two VPCs | Central hub that every VPC attaches to |
| Transitivity | **Not transitive** — peering A↔B and B↔C does not give A↔C | Transitive — A↔hub↔C works |
| Scales to | A handful of VPCs (~5–6) before becoming unmanageable | Hundreds of VPCs/accounts |
| Best for | Two teams, a quick point-to-point link | Landing-zone architectures, multi-account orgs |

```
Peering (mesh, non-transitive):        Hub-and-spoke (transitive):

  VPC-A --- VPC-B                          VPC-A     VPC-B
    \        /                                 \      /
     \      /                                   \    /
      VPC-C                                    [Transit GW]
                                                   /    \
  (A-C needs its own link)                     VPC-C   VPC-D
```

Past a handful of VPCs, peering becomes an O(n²) mesh — n VPCs need
n(n-1)/2 peering connections, each with its own route-table entries. A
Transit Gateway (or the Azure/GCP equivalent) turns that into O(n)
attachments and centralizes routing policy, which is why it's the standard
pattern once an organization has more than a handful of VPCs or accounts.

---

## 3. Compute Choice: VMs vs. Containers vs. Serverless

Work through this decision in order:

1. **Is the workload event-driven, spiky, or low-frequency?** → Serverless
   (Lambda, Cloud Functions, Azure Functions). Pay per invocation, zero idle
   cost — but cold starts, execution-time limits, and some vendor lock-in
   on the runtime.
2. **Do you need portability, a consistent runtime across environments, and
   fast scaling of a long-running service?** → Containers on a managed
   orchestrator (EKS/ECS, GKE, AKS). The best balance for most stateless
   web/API services; bin-packing improves density and cost versus one VM
   per service.
3. **Do you need OS-level control, licensing tied to dedicated hardware,
   GPU passthrough, or you're running something that genuinely can't be
   containerized (a legacy monolith, specific kernel modules)?** → VMs.
   Also the pragmatic fallback when the team lacks container/Kubernetes
   expertise and the timeline doesn't allow for the ramp-up.

| | VMs | Containers | Serverless |
|---|---|---|---|
| Startup time | Minutes | Seconds | Milliseconds–seconds (cold start) |
| Idle cost | Full price | Full price (unless scaled to zero) | Zero |
| Density | Low | High | N/A (fully abstracted) |
| Ops burden | High (patching, OS) | Medium (orchestrator, images) | Low (provider-managed) |
| Max runtime | Unbounded | Unbounded | Bounded (e.g., 15 min on Lambda) |
| Best for | Legacy, licensing, GPU | Stateless services, APIs | Event handlers, glue, cron, spiky work |

In practice, most shops run all three at once: serverless for glue/event
handling, containers for the core service fleet, and VMs for the handful of
things that don't fit either pattern (a legacy Windows app, a GPU training
box, a database that isn't offered as a managed service).

---

## 4. Load Balancing

| | L4 (Network Load Balancer) | L7 (Application Load Balancer) |
|---|---|---|
| Routes on | IP + TCP/UDP port only | HTTP method, path, host header, cookies |
| Throughput/latency | Extremely high throughput, very low latency | Slightly higher overhead, still fast |
| Capabilities | Static IP, preserves client IP easily | Path/host-based routing, TLS termination, WebSocket support |
| Use for | Non-HTTP protocols, extreme performance needs, fixed-IP allowlisting | Essentially all HTTP/HTTPS web and API traffic — the default |

### Health checks

Health checks are the mechanism that keeps a broken instance out of
rotation.

- Define a lightweight endpoint (`/healthz`) that verifies the app can
  actually serve traffic — not just "process is up." A good check verifies
  the downstream dependencies it truly needs (a live DB connection from the
  pool) without becoming a cascading-failure amplifier — don't fail health
  checks because a non-critical downstream is slow.
- Tune interval, timeout, and healthy/unhealthy thresholds to match your
  failure tolerance: fast intervals detect failure quickly but raise the
  false-positive rate from transient blips; two to three consecutive
  failures before marking unhealthy is a common balance.
- Distinguish **liveness** (is the process alive — restart if not) from
  **readiness** (can it serve traffic right now — pull from rotation if
  not, but don't necessarily restart). Kubernetes makes this distinction
  explicit; most cloud load-balancer health checks are really readiness
  checks.

---

## 5. Autoscaling

**Horizontal (scale out/in)** — add or remove instances. Preferred for
stateless workloads: no single-instance ceiling, and it improves fault
tolerance (more, smaller failure domains) as a side effect.

**Vertical (scale up/down)** — resize an instance's CPU/RAM. Necessary for
stateful singletons that can't easily be sharded (a single primary
database, in some architectures). Usually requires a restart, so it's
disruptive — use it for capacity planning, not real-time response to load.

Scaling policy types:

- **Target tracking** — hold a metric (e.g., CPU at 60%) at a setpoint; the
  autoscaler computes the needed capacity. Simplest, works well for
  CPU-bound services.
- **Step scaling** — add N instances when a metric crosses threshold T1,
  more at T2. More control, more configuration.
- **Scheduled scaling** — pre-scale for known traffic patterns (business
  hours, Black Friday), compensating for scaling lag when a spike is
  predictable.
- **Custom-metric scaling** — scale on queue depth, requests-per-target, or
  a business metric. Often better than CPU for I/O-bound or async
  workloads, since CPU can stay low while a queue backs up.

Set **cooldown periods** to avoid flapping (scale up, traffic dips
slightly, scale down, traffic returns, scale up again). Combine autoscaling
with load-balancer health checks so new instances only take traffic once
they pass readiness — otherwise you scale into a stampede of instances that
aren't actually ready to serve.

---

## 6. Infrastructure as Code as the Delivery Mechanism

None of the patterns above are reproducible or auditable unless they're
defined as code. IaC (Terraform, CloudFormation, Bicep, Pulumi) is how you:

- Version-control infrastructure changes and review them like application
  code.
- Guarantee environment parity — staging matches production topology.
- Enable disaster recovery: rebuilding a region from `terraform apply` is
  the difference between an RTO measured in hours and one measured in
  days.
- Make cost and security reviewable before deployment (`terraform plan` as
  a gate).

Treat Terraform as the default IaC tool unless the provider or organization
mandates otherwise — the module/state/workspace deep dive lives in this
site's Terraform guide.

---

## 7. Disaster Recovery: RTO, RPO, and DR Patterns

- **RTO (Recovery Time Objective)** — how long the business can tolerate
  being down. Drives *how fast* your failover mechanism must be.
- **RPO (Recovery Point Objective)** — how much data loss is acceptable,
  measured in time. Drives *how often* you must replicate or back up.

These two numbers — not "we want high availability" — should drive every
DR architecture decision, and they cost real money, so get them stated by
the business rather than inventing them.

**Backup strategy**: automated snapshots (database, disk) on a schedule
matching your RPO; cross-region replication of backups so a regional
outage doesn't also destroy your backups; periodic *restore testing* — an
untested backup is a hypothesis, not a backup.

**DR patterns**, in increasing cost and decreasing RTO/RPO:

| Pattern | Description | RTO | RPO | Relative cost |
|---|---|---|---|---|
| Backup & restore | Backups stored (ideally cross-region); rebuild infra + restore data on disaster | Hours–days | Hours | $ |
| Pilot light | Core (usually the data tier) always-on and replicating in the DR region; compute defined in IaC but not running | Tens of minutes–hours | Minutes | $$ |
| Warm standby | Scaled-down but fully functional copy running in the DR region at all times; scale up on failover | Minutes | Seconds–minutes | $$$ |
| Multi-site active-active | Full capacity running in two or more regions simultaneously, serving live traffic | Near-zero (just reroute) | Near-zero | $$$$ |

Pick the cheapest pattern that meets the RTO/RPO the business actually
needs — most workloads don't require active-active, and building it when
pilot light would suffice is wasted spend and needless complexity.

**Worked example**: a payments API needs to survive a regional outage. The
business states RTO 15 minutes, RPO 30 seconds. Backup & restore is out
(hours to rebuild). Pilot light is borderline — RTO could exceed 15 minutes
once compute is provisioned from IaC if it isn't pre-warmed. **Warm
standby** is the right fit: the DR region already runs at reduced capacity,
the database replicates continuously with sub-30-second lag, and DNS/traffic
manager failover triggers on health-check failure while the standby scales
up to full capacity within the RTO window. If the business instead required
RTO ≈ 0 (a trading platform, say), that pushes to multi-site active-active,
accepting the added cost and the harder problem of write-conflict
resolution.

---

## 8. Cost Optimization Patterns

- **Rightsizing** — match instance/container size to actual utilization,
  not the size someone guessed at launch. Use utilization metrics (CPU,
  memory, network) over a representative window (2–4 weeks including peak)
  before resizing; a single busy day shouldn't set your baseline.
- **Spot / preemptible instances** — 60–90% cheaper than on-demand, but can
  be reclaimed with short notice (seconds to a couple minutes, depending on
  the provider). Use for stateless, fault-tolerant, interruptible workloads
  — batch jobs, CI runners, a stateless web tier behind a load balancer
  with a mixed instance policy (an on-demand baseline plus spot for burst).
  Never use for stateful singletons or anything without graceful
  interruption handling.
- **Reserved capacity / Savings Plans / Committed Use Discounts** — commit
  to one to three years of steady-state baseline usage for a discount
  (30–70% off on-demand). Rightsize *first*, then commit — committing to an
  oversized baseline locks in the waste for the entire contract term.
- **General levers** — autoscale to zero (or near-zero) for non-prod
  environments outside business hours; apply storage lifecycle policies to
  move cold data to cheaper tiers; delete orphaned resources (unattached
  volumes, idle load balancers, unused static IPs) — these accumulate
  silently and are pure waste.

---

## 9. Reference Architecture: 3-Tier HA Web App Across Two AZs

```
                                   Internet
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   L7 Load Balancer       │
                         │   (public subnets,       │
                         │    spans both AZs)       │
                         └────────────┬─────────────┘
                    ┌──────────────────┴──────────────────┐
                    ▼                                      ▼
        AZ-A                                    AZ-B
   ┌─────────────────────────┐          ┌─────────────────────────┐
   │ Public subnet            │          │ Public subnet            │
   │  ┌─────────────┐         │          │  ┌─────────────┐         │
   │  │ NAT Gateway  │         │          │  │ NAT Gateway  │         │
   │  └──────┬───────┘         │          │  └──────┬───────┘         │
   ├─────────┼───────────────┤          ├─────────┼───────────────┤
   │ Private subnet (app tier)│          │ Private subnet (app tier)│
   │  ┌─────────────┐         │          │  ┌─────────────┐         │
   │  │ App instance │◄────┐  │          │  │ App instance │◄────┐  │
   │  │ (in ASG)     │     │  │          │  │ (in ASG)     │     │  │
   │  └─────────────┘     │  │          │  └─────────────┘     │  │
   │        Autoscaling Group spans AZ-A + AZ-B, min/max/desired  │
   ├─────────────────────────┤          ├─────────────────────────┤
   │ Private subnet (data tier)│         │ Private subnet (data tier)│
   │  ┌─────────────┐         │          │  ┌─────────────┐         │
   │  │ DB primary   │───sync replication──►│ DB standby   │         │
   │  │ (managed)    │         │          │  (managed, failover) │  │
   │  └─────────────┘         │          │  └─────────────┘         │
   └─────────────────────────┘          └─────────────────────────┘

Traffic flow:  Internet → LB (health-checks app instances, routes only to
healthy targets) → App instances in ASG (scale horizontally on CPU/RPS) →
DB primary (app tier never talks to DB standby directly; managed DB service
handles failover and updates the connection endpoint).

Outbound-only flow: App instance → NAT Gateway (same AZ) → Internet
(for package updates, third-party API calls — no inbound path exists).
```

Notes on the diagram:

- The ASG spans both AZs, so an AZ failure just means the ASG's health
  checks fail for that AZ's instances and it launches replacements in the
  surviving AZ (assuming capacity headroom).
- The managed database (RDS Multi-AZ, Cloud SQL HA, Azure SQL
  zone-redundant) handles synchronous replication and automatic failover —
  the app tier only ever talks to one write endpoint, which the managed
  service repoints on failover.
- NAT Gateway is per-AZ, not shared, so an AZ outage doesn't take out the
  other AZ's egress path.
- This is a single-region design. Adding a second region means a second
  copy of this whole diagram, plus asynchronous cross-region database
  replication and a global traffic manager (Route 53, Traffic Manager,
  Cloud DNS) for multi-region DR.

---

## 10. Interview-Ready Q&A

**Q: When should you go multi-region instead of multi-AZ?**
A: Multi-AZ already covers the far more common failure mode — a single data
center or AZ going down — with relatively low complexity, since AZs are
low-latency-linked within a region. Multi-region protects against a
whole-region outage, which is rare but not theoretical, and is warranted
only when a stated RTO/RPO or a regulatory driver actually requires it. It
roughly doubles operational complexity — cross-region replication
consistency, DNS failover, duplicated infrastructure — so it should be a
deliberate decision, not a default.

**Q: Walk through the compute decision framework — how do you choose
between VMs, containers, and serverless?**
A: Start with the workload shape. Event-driven, spiky, or low-frequency
work goes serverless — zero idle cost, but cold starts and execution-time
limits. Long-running stateless services that need portability and fast
scaling go on containers via a managed orchestrator — the best balance for
most web/API services. VMs are reserved for cases needing OS-level control,
hardware-tied licensing, GPU passthrough, or workloads that genuinely can't
be containerized. Most real systems use all three simultaneously.

**Q: What's the difference between L4 and L7 load balancing, and when do
you pick each?**
A: L4 routes purely on IP and TCP/UDP port, with no visibility into HTTP —
it's used for non-HTTP protocols, extreme throughput needs, or when you
need a static IP for allowlisting. L7 routes on HTTP method, path, host
header, and cookies, enabling path- and host-based routing, TLS
termination, and WebSocket support. L7 is the default for essentially all
HTTP/HTTPS traffic; L4 is the exception you reach for when raw performance
or a non-HTTP protocol demands it.

**Q: Why is a shallow health check dangerous, and what's the fix?**
A: A health check that only confirms the process is running (a bare
`200 OK`) will keep routing traffic to an instance that's actually broken —
for example, one that's lost its database connection. The fix is to check
whether the app can actually do its job, such as acquiring a connection
from its DB pool, without going so deep that a single slow, non-critical
downstream dependency fails the check for every instance and turns into a
fleet-wide outage.

**Q: How do you decide which DR pattern — backup & restore, pilot light,
warm standby, or multi-site active-active — fits a given workload?**
A: Get concrete RTO and RPO numbers from the business first, then pick the
cheapest pattern that satisfies them. Backup & restore suits RTOs measured
in hours to days; pilot light gets you to tens of minutes with the data
tier already replicating; warm standby gets to minutes because a
scaled-down copy is already running; multi-site active-active is for
near-zero RTO/RPO and costs the most, both in infrastructure and in the
engineering complexity of write-conflict resolution. Most workloads don't
need active-active — building it without a stated requirement is wasted
spend.

**Q: Why does VPC peering fall apart at scale, and what replaces it?**
A: Peering connections are non-transitive and strictly 1:1 — if A peers
with B and B peers with C, A still cannot reach C without its own explicit
peering link. Past roughly five or six VPCs this becomes an O(n²) mesh of
connections and route-table entries that's unmanageable. A hub-and-spoke
model — Transit Gateway, a hub VNet, or Shared VPC depending on the
provider — replaces it with a central hub every VPC attaches to, giving
transitive routing in O(n) attachments and centralizing routing policy,
which is the standard once an org has more than a handful of VPCs or
accounts.

**Q: What's wrong with autoscaling purely on CPU utilization?**
A: CPU is a poor proxy for load in I/O-bound or queue-consuming services —
a worker can sit at 20% CPU while a queue backs up for minutes because the
bottleneck is downstream (a slow API call, a database, a queue), not
compute. The fix is to scale on the metric that actually reflects
backpressure — queue depth, requests-per-target, or a latency percentile —
rather than defaulting to CPU because it's the easiest metric to wire up.

**Q: Why is "we have backups" not the same as "we have disaster recovery"?**
A: A backup that has never been restored is a hypothesis, not a working
recovery path — restores routinely fail for reasons that only surface
during the restore itself (corrupted snapshots, missing dependencies,
permission issues), and nobody discovers this until the real outage forces
the first restore attempt. Real DR requires scheduled restore testing, plus
a stated RTO/RPO the backup cadence and DR pattern are actually built to
meet — not just the existence of a backup job.

---

## 11. One-Line Summary

**Cloud infrastructure design is a series of trade-offs between failure
domains and cost — default to multi-AZ, choose compute by workload shape
rather than habit, derive your DR pattern from actual RTO/RPO numbers, and
reserve multi-region complexity for requirements that genuinely justify
it.**
