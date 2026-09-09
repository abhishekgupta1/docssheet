---
title: "AWS: The Complete Guide"
description: "End-to-end reference for AWS — compute, storage, networking, IAM, databases, high availability, and interview-ready Q&A."
sidebar_position: 1
tags: [aws, sre, cloud, solutions-architect, aws-cli]
---

# AWS — The Complete Guide

A single-read, end-to-end reference for AWS at Solutions Architect
Associate-level depth: enough to design a production architecture, operate
it as an SRE, or walk into an AWS-focused interview. Organized as a lookup
you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/aws">📋 Quick reference: AWS →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 240" role="img" aria-labelledby="mm-aws-title mm-aws-desc">
<title id="mm-aws-title">The AWS shared responsibility split</title>
<desc id="mm-aws-desc">AWS owns security of the cloud, covering data centers and hardware, while the customer owns security in the cloud, covering configuration, IAM, and data.</desc>
<defs>
  <marker id="mm-aws-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<path class="mm-arrow" d="M390,20 L390,220"/>

<rect class="mm-n3" x="30" y="30" width="330" height="60" rx="10"/>
<text class="mm-node-title" x="195" y="56" text-anchor="middle">AWS</text>
<text class="mm-node-sub" x="195" y="73" text-anchor="middle">security OF the cloud</text>

<path class="mm-arrow" d="M195,90 L195,118" marker-end="url(#mm-aws-arrow)"/>

<rect class="mm-n1" x="30" y="120" width="330" height="70" rx="10"/>
<text class="mm-node-title" x="195" y="150" text-anchor="middle">Data centers &amp; hardware</text>
<text class="mm-node-sub" x="195" y="167" text-anchor="middle">regions, AZs, network infra</text>

<rect class="mm-n5" x="420" y="30" width="330" height="60" rx="10"/>
<text class="mm-node-title" x="585" y="56" text-anchor="middle">Customer</text>
<text class="mm-node-sub" x="585" y="73" text-anchor="middle">security IN the cloud</text>

<path class="mm-arrow" d="M585,90 L585,118" marker-end="url(#mm-aws-arrow)"/>

<rect class="mm-n4" x="420" y="120" width="330" height="70" rx="10"/>
<text class="mm-node-title" x="585" y="150" text-anchor="middle">Your configuration</text>
<text class="mm-node-sub" x="585" y="167" text-anchor="middle">IAM, encryption, security groups</text>
</svg>

<p class="mental-model__caption">Every architecture decision sits on one side of this line: AWS is always accountable for the physical infrastructure underneath, while the customer is always accountable for how identity, data, and configuration are set up on top of it — and that line itself shifts higher as you move from EC2 toward fully managed services like Lambda.</p>
</div>

## 1. The Shared Responsibility Model

AWS splits accountability for security and operations between itself and the
customer — the single most-tested exam concept and the mental model behind
every architecture decision.

| AWS is responsible for | Customer is responsible for |
|---|---|
| Security **of** the cloud: physical data centers, hardware, network infrastructure, hypervisor | Security **in** the cloud: guest OS patching, IAM configuration, security group rules, data encryption, application-level security |
| Global infrastructure (Regions, Availability Zones, Edge locations) | How workloads are architected across that infrastructure (multi-AZ, backups, DR) |

For managed services (RDS, DynamoDB, Lambda) AWS takes on more — OS
patching, engine updates — while the customer retains responsibility for
access control, data, and configuration. This shifts further right as you
move up the stack from EC2 (customer patches OS) to Lambda (AWS manages
everything except your code and IAM).

### Regions, Availability Zones, and Edge Locations

- **Region** — a fully independent geographic area (e.g., `us-east-1`)
  containing multiple isolated data centers. Choose a region for latency to
  users, data residency/compliance, and service availability (not every
  service ships to every region on day one).
- **Availability Zone (AZ)** — one or more discrete data centers within a
  Region, with independent power/cooling/networking but low-latency links to
  other AZs in the same Region. **The unit of high availability** — always
  spread production workloads across at least two AZs.
- **Edge Location** — CloudFront/Route 53 points of presence, far more
  numerous than Regions, used to cache content and resolve DNS close to end
  users.

---

## 2. Core Compute

### EC2 (Elastic Compute Cloud)

Virtual machines ("instances") you provision from an AMI (Amazon Machine
Image) and pay for by the second.

| Purchase model | Best for | Trade-off |
|---|---|---|
| **On-Demand** | Unpredictable, short-term, spiky workloads | Highest per-hour price, zero commitment |
| **Reserved / Savings Plans** | Steady-state, predictable baseline load (1–3yr commit) | Up to ~72% discount vs. On-Demand, less flexible |
| **Spot** | Fault-tolerant, interruptible batch/CI workloads | Up to ~90% discount, but AWS can reclaim capacity with a 2-minute warning |
| **Dedicated Host / Instance** | Compliance requiring physical isolation or BYOL licensing tied to hardware | Most expensive, no multi-tenant sharing |

Instance families follow a naming pattern (`m5.large`, `c6g.xlarge`,
`r6i.2xlarge`): letter = family (general purpose `M`, compute-optimized `C`,
memory-optimized `R`, storage-optimized `I`/`D`), number = generation,
optional letter = processor/feature (`g` = Graviton/ARM, `i` = Intel,
`n` = network-optimized), size = `large`/`xlarge`/etc. `T`-series
(`t3`, `t4g`) is the burstable general-purpose family — cheap baseline
performance funded by CPU credits that throttle hard under sustained load,
a common "why did my t3.micro suddenly slow down" support ticket. `P`/`G`
families add GPUs for ML training/inference and rendering.

Every instance launches from an AMI (root volume snapshot + launch
permissions + block device mapping) and authenticates SSH via a **key
pair** (public key injected at boot via cloud-init) — losing the private
key means no direct SSH recovery without volume surgery. Prefer **IAM
instance profiles** over embedding access keys on the instance, and
**IMDSv2** (session-token-required instance metadata) over IMDSv1 — IMDSv1
is the classic SSRF-to-credential-theft path, where a vulnerable app
proxies a request to `169.254.169.254` and leaks the instance role's
temporary credentials.

### Lambda

Serverless, event-driven compute — you supply a function, AWS handles
provisioning, scaling, and patching. Billed per invocation + duration
(ms-level granularity), scales to zero when idle.

```bash
aws lambda create-function \
  --function-name process-order \
  --runtime python3.12 \
  --role arn:aws:iam::123456789012:role/lambda-exec-role \
  --handler app.handler \
  --zip-file fileb://function.zip \
  --timeout 15 \
  --memory-size 256
```

Key constraints: max 15-minute execution timeout, ephemeral `/tmp` storage
(up to 10 GB configurable), **cold starts** (extra latency on first
invocation or after scale-out — mitigated with Provisioned Concurrency).
Common triggers: API Gateway, S3 events, SQS/SNS, EventBridge, DynamoDB
Streams.

**Concurrency** comes in three flavors: unreserved (shared account-wide
pool, the default), **reserved** (caps and guarantees capacity for one
function, isolating it from noisy-neighbor throttling), and
**provisioned** (pre-warmed environments that eliminate cold starts
entirely — billed even while idle). Memory allocation also scales the
CPU/network share a function gets, so under-provisioning memory can
*increase* total cost by lengthening duration rather than saving money.
Attaching a function to a VPC (e.g., to reach an RDS instance) requires
ENI provisioning — historically a major cold-start penalty, now largely
mitigated by Hyperplane ENIs, but the function still needs a NAT Gateway
or VPC endpoints for any internet/AWS-API egress once inside the VPC.

### ECS vs. EKS (Containers)

| | ECS | EKS |
|---|---|---|
| Orchestrator | AWS-proprietary | Managed Kubernetes (upstream-compatible) |
| Control plane | Fully AWS-managed, free | AWS-managed, ~$0.10/hr per cluster |
| Compute options | EC2 launch type or **Fargate** (serverless, no node management) | EC2 (self-managed/managed node groups) or Fargate |
| Best for | Teams standardizing on AWS-only tooling, simpler mental model | Teams needing K8s portability, existing K8s tooling/manifests, multi-cloud parity |

**Fargate** removes node management entirely for both ECS and EKS — you
define CPU/memory per task/pod and AWS runs it on infrastructure you never
see or patch. Trades some cost efficiency and low-level control for zero
ops overhead.

Both pull images from **ECR (Elastic Container Registry)** — a private,
IAM-integrated Docker registry that's almost always the image source for
ECS and EKS alike; pull/push permissions follow the same IAM policy model
as everything else. Ecosystem is the other real differentiator: ECS has a
smaller, AWS-native tool set (Cloud Map for service discovery, App Mesh),
while EKS inherits the full Kubernetes ecosystem — Helm charts, operators,
Prometheus, service meshes — at the cost of a steeper learning curve
(CRDs, operators, RBAC) and the ~$0.10/hr per-cluster control-plane fee.
For EKS clusters running Spot/mixed capacity, **Karpenter** provisions
right-sized nodes directly from EC2 — matching pending pod requirements,
including specific instance types — faster and more efficiently than the
older Cluster Autoscaler's fixed node-group scaling.

---

## 3. Storage

### S3 (Simple Storage Service) Storage Classes

| Class | Use case | Retrieval | Min storage duration |
|---|---|---|---|
| **S3 Standard** | Frequently accessed, general purpose | Immediate | None |
| **S3 Intelligent-Tiering** | Unknown/changing access patterns | Immediate | None (auto-moves between tiers) |
| **S3 Standard-IA** | Infrequent access, needs millisecond retrieval | Immediate | 30 days |
| **S3 One Zone-IA** | Infrequent, re-creatable data, single AZ acceptable | Immediate | 30 days |
| **S3 Glacier Instant Retrieval** | Archive accessed ~quarterly, needs ms access | Immediate | 90 days |
| **S3 Glacier Flexible Retrieval** | Archive, retrieval OK in minutes–hours | Minutes to hours | 90 days |
| **S3 Glacier Deep Archive** | Long-term compliance archive, rarely restored | Up to 12 hours | 180 days |

**Lifecycle policies** automate transitions (e.g., Standard → IA after 30
days → Glacier after 90 days → expire after 7 years) — a near-universal
exam scenario and real cost-optimization lever.

S3 is an **object store** (key-value, flat namespace presented as
"folders"), region-scoped with 11 nines of durability via automatic
cross-AZ replication within the region. It is not a filesystem — no
in-place edits, only whole-object PUT/replace. Since December 2020, S3
gives **strong read-after-write consistency** for all operations
(including overwrite PUTs and DELETEs) — the older "eventual consistency"
caveat no longer applies.

Access is governed by up to three overlapping layers: **IAM policies**
(identity-side), **bucket policies** (resource-side JSON, the only way to
grant cross-account access without a role), and legacy **ACLs** (avoid —
disabled by default on new buckets since 2023). **S3 Block Public Access**
is a separate account/bucket-level switch that suppresses public access
*even if* a policy or ACL would otherwise grant it — leave it on
everywhere, and serve the rare genuinely-public asset through CloudFront
with an Origin Access Control (OAC) to a private bucket, or a short-lived
presigned URL, rather than flipping the account-wide switch off.
**Versioning** preserves every write as a new object version instead of
overwriting it — required for cross-region replication and the real
protection against accidental delete/overwrite (pair with MFA Delete for
compliance-grade buckets); in a versioned bucket, a lifecycle rule's
`NoncurrentVersionExpiration` matters as much as the primary transition
rule, or every overwrite/delete leaves a permanent, silently-billed prior
version behind.

### EBS vs. EFS vs. Instance Store

| | EBS | EFS | Instance Store |
|---|---|---|---|
| Type | Block storage | Managed NFS (file storage) | Block storage, physically attached |
| Attachment | One EC2 instance at a time (per volume)* | Many instances/AZs concurrently | One instance, for its lifetime only |
| Persistence | Survives instance stop/terminate | Survives, independent lifecycle | **Lost on stop/terminate** — ephemeral |
| Scaling | Manually resize volume | Elastic, auto-scales with usage | Fixed, tied to instance type |
| Use case | Boot volumes, databases | Shared config/content across a fleet, CMS uploads | Scratch space, cache, temp buffers |

*`io2 Block Express` Multi-Attach allows shared attach across a small
cluster of instances for specific clustered applications — the exception,
not the norm. EBS **snapshots** are incremental, point-in-time backups
stored durably in S3 under the hood — the standard way to move a volume's
data across AZs or regions, since a volume itself is pinned to one AZ.

---

## 4. Networking

### VPC (Virtual Private Cloud)

An isolated, logically-defined network within a Region, sliced into
**subnets** — each subnet lives in exactly one AZ.

```
VPC (10.0.0.0/16)
├─ Public Subnet A  (10.0.1.0/24, us-east-1a) → Internet Gateway
├─ Public Subnet B  (10.0.2.0/24, us-east-1b) → Internet Gateway
├─ Private Subnet A (10.0.11.0/24, us-east-1a) → NAT Gateway → IGW
└─ Private Subnet B (10.0.12.0/24, us-east-1b) → NAT Gateway → IGW
```

- **Public subnet** — its route table sends `0.0.0.0/0` traffic to an
  **Internet Gateway (IGW)**; resources with a public IP are directly
  reachable from the internet.
- **Private subnet** — no route to an IGW. Outbound-only internet access (for
  patching, pulling images) goes through a **NAT Gateway** sitting in a
  public subnet — inbound connections from the internet are never possible.
- **Route table** — per-subnet (or VPC-default) rules mapping CIDR
  destinations to a target (`local`, IGW, NAT GW, VPC peering, Transit
  Gateway). Every subnet must be associated with exactly one route table.

### Security Groups vs. Network ACLs — the classic gotcha

| | Security Group | Network ACL (NACL) |
|---|---|---|
| Level | Instance/ENI (attached to resources) | Subnet (applies to everything in it) |
| State | **Stateful** — return traffic auto-allowed regardless of outbound rules | **Stateless** — return traffic must be explicitly allowed by a rule |
| Rules | Allow only | Allow **and** explicit deny |
| Evaluation | All rules evaluated, most-permissive wins | Rules evaluated **in numeric order**, first match wins |
| Default | Deny all inbound, allow all outbound | Allow all in/out (default NACL) |

The stateful/stateless distinction is the single most commonly tested
networking gotcha: if you allow inbound port 443 on a NACL but forget an
**outbound ephemeral port range** (1024–65535) rule, responses get silently
dropped — the security group would never have this problem because it
auto-permits the return leg.

### VPC Peering, Transit Gateway, and PrivateLink

- **VPC Peering** — direct 1:1 network connection between two VPCs; **not
  transitive** (if A peers B and B peers C, A cannot reach C through B).
- **Transit Gateway** — a regional hub connecting many VPCs and on-prem
  networks in a hub-and-spoke model, avoiding the peering-mesh explosion at
  scale (N VPCs need N(N-1)/2 peering connections but only N Transit Gateway
  attachments).
- **VPC Endpoints / PrivateLink** — private connectivity to AWS services
  (S3, DynamoDB via Gateway Endpoints; most others via Interface Endpoints)
  without traversing the public internet or needing a NAT Gateway/IGW.
  Gateway Endpoints are free and route-table-based — always use them for
  private-subnet access to S3/DynamoDB instead of paying NAT Gateway
  per-GB egress. Either endpoint type can carry its own **endpoint
  policy** restricting which principals/actions may use it — e.g., an S3
  Gateway Endpoint policy that only allows access to one specific bucket,
  closing off exfiltration to arbitrary S3 buckets even if IAM alone would
  permit it.

Standard three-tier subnet/route-table layout (replicate per AZ):

```
Public subnet   10.0.0.0/24    RT: 0.0.0.0/0 -> igw-xxxx      (ALB, NAT GW live here)
App subnet      10.0.10.0/24   RT: 0.0.0.0/0 -> nat-xxxx      (EC2/ECS tasks, egress-only)
Data subnet     10.0.20.0/24   RT: no 0.0.0.0/0 route at all  (RDS, ElastiCache — unreachable from internet)
```

The data subnet's route table simply has no default route — unreachability
from the internet is structural, not a security-group rule someone could
accidentally misconfigure away.

### Route 53 (DNS)

AWS's authoritative DNS service, plus domain registration and
health-checked failover routing.

- **Hosted zones** — public (internet-resolvable) or private (resolves
  only inside specified VPCs).
- **Record types** — standard A/AAAA/CNAME/MX/TXT/NS, plus AWS's own
  **ALIAS** record: free, and the *only* way to point a zone apex
  (`example.com`, not `www.example.com`) at an AWS resource like an ALB or
  CloudFront distribution, since a bare CNAME at the apex violates the DNS
  spec.
- **Routing policies**:

| Policy | Behavior |
|---|---|
| Simple | One record set, no logic |
| Weighted | Percentage-based traffic split — canary releases, A/B tests |
| Latency-based | Routes to the region with lowest measured latency for the resolver |
| Failover | Active-passive, driven by health checks |
| Geolocation / Geoproximity | Routes by requester location |
| Multivalue | Returns multiple healthy IPs, client picks — lightweight client-side LB |

- **Health checks** poll an endpoint (HTTP/HTTPS/TCP) and can drive
  Failover routing or independently trigger a CloudWatch alarm.

```
example.com  ALIAS -> alb-stable.us-east-1.elb.amazonaws.com   Weight: 90
example.com  ALIAS -> alb-canary.us-east-1.elb.amazonaws.com   Weight: 10
```

A weighted canary release: 10% of resolvers hit the canary ALB; ramp the
weight up as it proves out, with a CloudWatch alarm on the canary target
group's error rate wired to auto-rollback. DNS TTL becomes the effective
floor on failover speed — keep it low (60 seconds or less) on any record
participating in automated failover.

### CloudFront (CDN)

A content delivery network that sits in front of an origin — an S3
bucket, an ALB, or a custom server — and caches responses at edge
locations worldwide, cutting latency and origin load.

- Pairs naturally with S3 for static site hosting (the pattern behind
  Section 10's static-site architecture) and with ACM for free TLS
  certificates.
- Supports **cache behaviors per path** — e.g., cache `/static/*`
  aggressively, bypass cache entirely for `/api/*`.
- **Cache invalidations are not instant** — plan deployments accordingly,
  or version asset URLs (cache-busting) instead of relying on
  invalidation for critical path changes.
- For a private S3 origin, use an **Origin Access Control (OAC)** so the
  bucket itself stays non-public and only CloudFront can read from it —
  the correct alternative to disabling S3 Block Public Access.

---

## 5. IAM (Identity and Access Management)

IAM is **global** (not region-scoped) and controls *who* (authentication)
can do *what* (authorization) on *which* resources.

| Concept | What it is |
|---|---|
| **User** | A persistent identity for a person or application (long-lived credentials — avoid for workloads) |
| **Group** | A collection of users sharing the same permissions |
| **Role** | A temporary identity assumed by users, services, or federated identities — no long-lived credentials, short-lived STS tokens instead |
| **Policy** | A JSON document defining permissions (Allow/Deny on actions + resources) |

### Least privilege in practice

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::order-uploads-bucket/*",
      "Condition": {
        "StringEquals": { "aws:PrincipalTag/team": "checkout" }
      }
    }
  ]
}
```

- Grant only the actions/resources actually needed — never `"Action": "*"`
  in production policies.
- **Roles over long-lived access keys**, always. EC2 instances, Lambda
  functions, and ECS tasks should assume an **instance profile / execution
  role**, not embed access keys.
- An explicit `Deny` always wins over an `Allow`, anywhere in the policy
  evaluation (identity policy, resource policy, SCP, permissions boundary).
- **Policy evaluation order**: explicit Deny → SCPs (org-level guardrails) →
  resource policy → identity policy → permissions boundary. If nothing
  explicitly allows it, the implicit default is Deny.

### Trust policies vs. permission policies

A role carries two distinct documents that are easy to conflate when
debugging "access denied": the **trust policy** (attached to the role,
defines *who* — which principal — may call `sts:AssumeRole` on it) and the
**permission policy** (defines *what* the role can do once assumed).
Getting the trust relationship right but the permission policy wrong looks
identical from the caller's side — both surface as an authorization
failure — so check both explicitly rather than assuming the trust
relationship is the problem.

```json
// Trust policy (on the role in the TARGET account — who may assume it)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::111111111111:role/ci-deploy-role" },
    "Action": "sts:AssumeRole",
    "Condition": { "StringEquals": { "sts:ExternalId": "shared-secret-value" } }
  }]
}
```

The CI role in account `111...` calls `sts:AssumeRole` on the target
role's ARN; STS returns short-lived credentials scoped to the permission
policy — no long-lived keys ever cross the account boundary. This is the
standard pattern for cross-account CI/CD deploys and cross-account
read-only access.

**Policy types**, layered and unioned at evaluation time: **identity-based**
(attached to a user/group/role), **resource-based** (attached to the
resource itself — an S3 bucket policy, for instance — and the only way to
grant cross-account access without a role), **permission boundaries** (a
ceiling on the *maximum* privilege an identity can ever have regardless of
what its identity policies grant — lets you safely delegate IAM-role
creation to application teams), **Service Control Policies / SCPs**
(org-wide guardrails in AWS Organizations, apply to every principal in the
account including the root user), and **session policies** (passed inline
when assuming a role, further restrict — never expand — that session's
effective permissions). `aws iam simulate-principal-policy` tests whether
a principal can perform an action with no side effects — the fastest way
to debug a 403 without trial-and-error API calls.

---

## 6. Databases

### RDS (Relational Database Service)

Managed relational databases (MySQL, PostgreSQL, MariaDB, SQL Server,
Oracle, and AWS's own **Aurora**). AWS handles patching, backups, and
failover orchestration.

| Feature | What it does |
|---|---|
| **Multi-AZ** | Synchronous standby replica in a second AZ; automatic failover on primary failure (minutes, DNS-based) — for **availability**, not read scaling |
| **Read Replicas** | Asynchronous copies, can be cross-region; offload read traffic — for **scalability**, not automatic failover (manual promotion) |
| **Automated backups** | Daily snapshot + transaction logs, point-in-time restore within the retention window |
| **Aurora** | AWS-built MySQL/PostgreSQL-compatible engine, storage auto-scales in 10 GB increments across 3 AZs, up to 15 read replicas with sub-10ms replica lag |

Point-in-time recovery relies on automated backups plus transaction logs
(restore to any second within the retention window); **snapshots** are
separate manual/scheduled full backups with their own independent
retention — don't conflate the two when planning a recovery SLA. Two
patterns worth knowing at the edge of RDS: **Aurora Global Database**
replicates storage across regions with typically sub-second lag for
cross-region DR reads, and **RDS Proxy** pools/multiplexes connections in
front of RDS or Aurora — critical for Lambda-to-RDS access patterns, where
each concurrent invocation would otherwise open its own DB connection and
exhaust the database's connection limit.

### DynamoDB

Fully managed, serverless **NoSQL key-value/document store** — single-digit
millisecond latency at any scale, no server management.

- **Partition key** (+ optional **sort key**) determines physical storage
  distribution — poor key design (low cardinality, "hot" keys) causes
  throttling regardless of provisioned capacity.
- **Capacity modes**: On-Demand (pay per request, scales instantly) vs.
  Provisioned (set RCU/WCU, cheaper at steady predictable load, use
  Auto Scaling to adjust).
- **Global Secondary Index (GSI)** — different partition/sort key,
  eventually consistent, own capacity. **Local Secondary Index (LSI)** —
  same partition key, different sort key, must be created at table creation.
- **DynamoDB Streams** — ordered change log, commonly triggers Lambda for
  event-driven processing (CDC pattern).

### RDS vs. DynamoDB — when to choose which

| | RDS | DynamoDB |
|---|---|---|
| Data model | Relational, joins, complex queries, transactions | Key-value/document, single-table design, no joins |
| Scaling | Vertical (bigger instance) + read replicas | Horizontal, effectively unlimited |
| Latency | Single-digit to low double-digit ms | Consistently single-digit ms |
| Use when | Strong relational integrity, complex reporting/ad-hoc SQL | Massive scale, predictable access patterns, low-latency lookups |

---

## 7. High Availability, Scaling, and Load Balancing

### Elastic Load Balancing (ELB) family

| Type | Layer | Use case |
|---|---|---|
| **ALB (Application Load Balancer)** | L7 (HTTP/HTTPS) | Path/host-based routing, microservices, WebSocket support, content-based routing rules |
| **NLB (Network Load Balancer)** | L4 (TCP/UDP) | Extreme throughput/low latency, static IP per AZ, preserving source IP |
| **GWLB (Gateway Load Balancer)** | L3 | Transparent inline traffic inspection (firewalls, IDS/IPS appliances) |
| **CLB (Classic Load Balancer)** | L4/L7 | Legacy — avoid for new designs |

### Auto Scaling Groups (ASG)

Maintains a target fleet size across multiple AZs, replacing unhealthy
instances automatically and scaling in/out based on policy.

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name checkout-asg \
  --launch-template LaunchTemplateName=checkout-lt,Version='$Latest' \
  --min-size 2 --max-size 10 --desired-capacity 3 \
  --vpc-zone-identifier "subnet-aaa,subnet-bbb,subnet-ccc" \
  --target-group-arns arn:aws:elasticloadbalancing:...:targetgroup/checkout-tg \
  --health-check-type ELB --health-check-grace-period 60
```

Scaling policy types:
- **Target tracking** — hold a metric (e.g., avg CPU 50%) steady;
  simplest, recommended default.
- **Step scaling** — add/remove capacity in steps based on alarm breach
  size.
- **Scheduled scaling** — pre-scale for known traffic patterns (Black
  Friday, business hours).

For fault-tolerant workloads, an ASG with a **mixed-instances policy**
spanning several instance types/sizes and both On-Demand and Spot
dramatically reduces the blast radius of any single Spot capacity pool
being reclaimed — a much cheaper HA lever than pure On-Demand, without the
all-eggs-in-one-pool risk of a single-instance-type Spot fleet.

### Multi-AZ vs. Multi-Region

- **Multi-AZ**: the baseline HA bar for production — protects against a
  single data-center failure, low-latency synchronous replication, usually
  the same architecture components just spread across AZs.
- **Multi-Region**: protects against a full regional outage (rare but real —
  entire regions have gone down). Needed for strict RTO/RPO/DR requirements
  or global latency reduction. Costs significantly more in complexity (data
  replication consistency, DNS failover via Route 53, duplicated
  infrastructure) — don't reach for it before Multi-AZ is solid.

---

## 8. Monitoring & Observability

### CloudWatch

The default observability plane for AWS resources — three pillars.

| Pillar | What it holds |
|---|---|
| **Metrics** | Time-series numeric data, organized by namespace/dimension (e.g., `AWS/EC2`, `InstanceId=i-0123`). Standard resolution is 1-minute; custom high-resolution metrics can go to 1-second. |
| **Logs** | Log groups (retention policy lives here) containing log streams. **CloudWatch Logs Insights** provides a query language for ad-hoc analysis without shipping logs elsewhere. |
| **Alarms** | Watch a metric over N evaluation periods against a threshold, transition OK/ALARM/INSUFFICIENT_DATA, and trigger an action (SNS notification, Auto Scaling policy, EC2 action). |

**Composite alarms** combine multiple alarms with AND/OR logic to cut page
noise — e.g., only page on-call if both an elevated 5xx rate *and*
elevated p99 latency are firing simultaneously, suppressing a transient
blip in either signal alone:

```json
{
  "AlarmName": "web-svc-real-outage",
  "AlarmRule": "ALARM(\"web-svc-high-5xx-rate\") AND ALARM(\"web-svc-high-p99-latency\")",
  "ActionsEnabled": true,
  "AlarmActions": ["arn:aws:sns:us-east-1:222222222222:pagerduty-critical"]
}
```

**CloudWatch vs. EventBridge** — a common conflation. CloudWatch handles
metrics/logs/alarms (is something wrong *right now*, by the numbers).
**EventBridge** (formerly CloudWatch Events) is the event bus for reacting
to state *changes* — an instance stopping, a scheduled cron, a custom
application event — routing them to targets like Lambda or Step
Functions. Related, but they answer different questions.

Configure log retention explicitly on every log group — an unset
retention policy silently accumulates cost and can leave you with less
coverage than you assumed once old streams roll off.

---

## 9. Cost Optimization

Cost is an architecture property, not a budget alert bolted on after the
fact — decisions made at design time (instance family, storage class,
Spot eligibility, cross-AZ chattiness) dominate the bill far more than
anything caught in a monthly review.

| Lever (cheapest/highest-ROI first) | What it does |
|---|---|
| **Rightsizing** | AWS Compute Optimizer + CloudWatch utilization metrics (CPU, memory via the CloudWatch Agent, network) surface over-provisioned instances — consistently the highest-ROI, lowest-risk cost action available |
| **Savings Plans / Reserved Instances** | Commit to steady-state usage for 1–3yr for up to ~72% off; Savings Plans commit to a $/hr spend and flex across instance family/size/region, generally preferred over RIs now for that flexibility |
| **Spot** | Up to ~90% off for fault-tolerant, interruptible, or checkpointed workloads (batch, CI runners, stateless web tiers behind a mixed-instance ASG) — never for the only copy of stateful data |
| **Storage tiering** | S3 lifecycle rules, EBS volume rightsizing — see Section 3 |
| **Architecture change** | Re-architecting (e.g., reducing cross-AZ chattiness, or moving a polling loop to event-driven) — highest effort, but sometimes the only real lever left once the above are exhausted |

- **Tagging**: enforce mandatory cost-allocation tags (`Environment`,
  `Owner`, `CostCenter`, `Service`) at creation time via an SCP or an IAM
  policy `Condition` requiring tags on `RunInstances`/`CreateBucket`, etc.
  Untagged resources are invisible in Cost Explorer breakdowns and become
  permanent, unattributable "mystery spend."
- **Data transfer is the most underestimated cost line**: cross-AZ
  traffic, NAT Gateway per-GB processing charges, and inter-region
  transfer all bill separately from compute and storage. A chatty
  multi-AZ microservice architecture can rack up NAT Gateway and cross-AZ
  charges that dwarf the compute bill it was supposedly optimizing —
  check this before spending more time rightsizing instances.
- VPC **Gateway Endpoints** for S3/DynamoDB (Section 4) are free and
  route-table-based — routing traffic through them instead of a NAT
  Gateway is a pure cost win with zero downside for those two services.

---

## 10. Common Architecture Patterns

### Three-tier web application

```
Route 53 → CloudFront (static/CDN)
                │
                ▼
        ALB (public subnets, 2+ AZs)
                │
                ▼
   ASG of app servers (private subnets, 2+ AZs)
                │
                ▼
   RDS Multi-AZ (private subnets) ── Read Replicas for reporting
```

### Serverless event-driven API

```
API Gateway → Lambda → DynamoDB
                 │
                 └──▶ EventBridge → SQS → Lambda (async workers)
```

Decouples the synchronous API path from async processing; SQS provides
durable buffering and natural retry/backoff, absorbing traffic spikes
without overwhelming downstream services.

### Static site + CDN

```
Route 53 → CloudFront → S3 (origin, static assets)
                        + ACM (TLS cert) + WAF (edge protection)
```

Zero servers to manage; CloudFront caches at edge locations, S3 is the
durable origin — the standard pattern for portfolio/marketing sites, and
what backs a Docusaurus-style static build.

---

## 11. Common Exam & Interview Gotchas

- **Security Group is stateful, NACL is stateless** — the single most-tested
  distinction (see Section 4).
- **NAT Gateway is for outbound-only** internet access from private subnets
  — it never allows unsolicited inbound connections, unlike a bastion host.
- **S3 is not a POSIX filesystem** — no partial-file edits, no file locking;
  "folders" are a UI convenience over key prefixes.
- **Read Replicas ≠ high availability** — they scale reads and require
  manual promotion on failure; **Multi-AZ** is the HA feature (automatic
  failover), and the Multi-AZ standby itself is not queryable.
- **Instance Store is ephemeral** — data is lost on stop or termination
  (not just termination); only EBS survives a stop.
- **IAM is global**, but most other resources (VPC, EC2, RDS) are
  region-scoped — a role/policy works everywhere, a security group does not
  cross regions.
- **VPC Peering is not transitive** — a common "why can't these two VPCs
  talk" trap when a customer assumes peering chains automatically.
- **Elastic IP charges apply when NOT attached to a running instance** — a
  cost-optimization gotcha, not a security one.
- **S3 Block Public Access overrides everything else** — a bucket policy or
  ACL that grants public access is still blocked if Block Public Access is
  on; the fix for "we need one public asset" is CloudFront + OAC or a
  presigned URL, never disabling it account-wide.
- **Route 53 needs ALIAS, not CNAME, at a zone apex** — a bare CNAME at
  `example.com` (no subdomain) violates the DNS spec; ALIAS is AWS's free,
  apex-compatible workaround, and the only way to point a root domain at an
  ALB/CloudFront/S3 without extra cost.
- **CloudWatch ≠ EventBridge** — metrics/logs/alarms vs. an event bus for
  state changes; conflating the two is a common design-doc mistake.
- **A Lambda attached to a VPC with no NAT Gateway or VPC endpoints can't
  reach anything outside the VPC** — including S3 and DynamoDB — a frequent
  "why is my function timing out" trap once someone attaches it just to
  reach an RDS instance.

---

## 12. AWS CLI Essentials

The `aws` CLI wraps every AWS service API into a uniform
`aws <service> <operation> [options]` shape — the same REST APIs boto3 and
every AWS SDK call use, so nothing here is CLI-exclusive beyond
convenience commands like `s3 sync`/`s3 cp`.

### Configuration: two files, two purposes

```ini
# ~/.aws/config — settings, region, output format, profiles
[default]
region = us-east-1
output = json

[profile prod]
region = us-west-2
sso_start_url = https://my-org.awsapps.com/start
sso_region = us-east-1
sso_account_id = 123456789012
sso_role_name = PowerUserAccess

[profile staging]
region = eu-west-1
role_arn = arn:aws:iam::987654321098:role/StagingDeployRole
source_profile = default
```

```ini
# ~/.aws/credentials — secrets only; SSO profiles never appear here
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...
```

Note the header asymmetry: `credentials` uses `[prod]`, `config` uses
`[profile prod]` (except `[default]`, unprefixed in both).

**Credential resolution order** (first match wins): CLI flags (`--profile`)
→ environment variables (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/
`AWS_SESSION_TOKEN`) → `AWS_PROFILE` env var → `~/.aws/credentials` default
profile → container credentials (ECS task role) → instance metadata (EC2
instance profile, IMDSv2). This is the same chain boto3 uses under the
hood (`botocore`), so the CLI and Python automation authenticate
identically.

### SSO and assuming roles

SSO (IAM Identity Center) is the modern default for human access — no
long-lived keys ever land on disk:

```bash
aws configure sso                 # interactive wizard, writes a [profile ...] block
aws sso login --profile prod      # opens browser, caches a short-lived token
export AWS_PROFILE=prod           # select the profile for the shell session
aws sts get-caller-identity       # "who am I, really" — run this first, always
```

`aws configure list` shows what's *configured*; `aws sts get-caller-identity`
shows what's *actually authenticating* — they can disagree, and debugging
a permission issue starts by running both.

Assuming a role directly (cross-account access, or scripts that can't rely
on `source_profile` chaining):

```bash
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/CrossAccountReadOnly \
  --role-session-name "$(whoami)-debug-$(date +%s)" \
  --duration-seconds 3600 --output json > /tmp/creds.json

export AWS_ACCESS_KEY_ID=$(jq -r .Credentials.AccessKeyId /tmp/creds.json)
export AWS_SECRET_ACCESS_KEY=$(jq -r .Credentials.SecretAccessKey /tmp/creds.json)
export AWS_SESSION_TOKEN=$(jq -r .Credentials.SessionToken /tmp/creds.json)
```

CI systems (GitHub Actions OIDC, Kubernetes IRSA) use
`aws sts assume-role-with-web-identity` instead — exchanging a short-lived
web identity token for credentials with no stored secret at all, the
modern replacement for long-lived CI access keys.

### `--query` (JMESPath) and output formats

The server returns full JSON; `--query` filters it client-side, before it
ever hits your terminal or a pipe — the CLI-native alternative to `| jq`,
and it composes with `--output text` for clean scripting:

```bash
# Object projection with renamed fields
aws ec2 describe-instances \
  --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name}"

# Predicate filter
--query "Reservations[].Instances[?State.Name=='running'].InstanceId"

# Pull a single scalar straight into a shell variable
INSTANCE_ID=$(aws ec2 run-instances ... --query "Instances[0].InstanceId" --output text)

# Sort and take the first N
--query "sort_by(Reservations[].Instances[], &LaunchTime)[:5].InstanceId"
```

`--output`: `json` (default, pipes to `jq`), `table` (human eyeballing),
`text` (tab-separated, direct into shell variables, no quoting to strip),
`yaml`/`yaml-stream` (v2 only).

### Real command patterns

```bash
# S3: high-level `s3` (cp/sync/ls) vs. low-level `s3api` (bucket policy,
# versioning, lifecycle — anything `s3` doesn't expose)
aws s3 sync ./dist s3://my-bucket/site --delete --cache-control "max-age=31536000,public"
aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json

# EC2: filter, project, and format in one call
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" "Name=tag:Env,Values=prod" \
  --query "Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,IP:PrivateIpAddress}" \
  --output table

# IAM: test permissions with no side effects — the fastest way to debug a 403
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/MyAppRole \
  --action-names s3:PutObject --resource-arns arn:aws:s3:::my-bucket/*

# Waiters replace hand-rolled poll loops
aws ec2 wait instance-status-ok --instance-ids i-0123456789abcdef0
aws rds wait db-instance-available --db-instance-identifier prod-db

# --dryrun validates permissions/parameters without executing
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0 --dryrun
# DryRunOperation error = you *would* have succeeded, nothing happened.
```

### Idempotent scripting

Scripts that must be safe to re-run (cron, CI, bootstrap) check-then-act,
and treat `AlreadyExists`-class errors as success rather than pre-checking
and racing:

```bash
set -euo pipefail
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Bucket exists — skipping."
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
fi
```

**Common mistakes**: hardcoding access keys in scripts/CI/Dockerfiles
instead of using roles or SSO; forgetting `--profile`/`AWS_PROFILE` and
silently operating against `default` (always confirm with
`get-caller-identity` before anything destructive); hand-parsing
`--output json` with `grep`/`sed` instead of `--query`/`jq`; assuming SSO
tokens (often 8–12h lifetime) persist forever in unattended scripts — those
need role assumption, not a human re-clicking a browser prompt.

---

## 13. Interview-Ready Q&A

**Q: Explain the shared responsibility model in your own words.**
A: AWS secures the underlying cloud — physical infrastructure, hypervisor,
network fabric, and the managed portions of any service you use. The
customer secures what they put *in* the cloud — IAM configuration, data
encryption, security group rules, and (for unmanaged services like EC2)
guest OS patching. The dividing line moves depending on how managed the
service is: with Lambda AWS manages almost everything except your code and
its permissions; with EC2 you own OS-level security entirely.

**Q: When would you choose Multi-AZ RDS versus a read replica?**
A: Multi-AZ is for availability — a synchronous standby in a second AZ that
AWS automatically fails over to if the primary fails, with no data loss and
no manual intervention. A read replica is for scaling read throughput —
it's asynchronous, can lag behind the primary, and doesn't fail over
automatically; promoting one to primary is a manual, disruptive action. They
solve different problems and are commonly used together.

**Q: What's the difference between a Security Group and a Network ACL, and
why does it matter operationally?**
A: Security groups are stateful and attached to instances/ENIs — allow rules
only, and return traffic is automatically permitted regardless of outbound
rules. NACLs are stateless and applied at the subnet level — they support
explicit deny rules and are evaluated in numeric order, but you must
explicitly allow the return traffic (e.g., ephemeral ports) or responses get
silently dropped. This is a classic "it works with security groups but
breaks with NACLs" debugging trap.

**Q: How would you design a highly available three-tier web application on
AWS?**
A: Public subnets in at least two AZs hosting an ALB; an Auto Scaling Group
of app servers in private subnets across those same AZs, registered to the
ALB's target group with health checks; an RDS instance in Multi-AZ mode in
private subnets for automatic database failover; CloudFront in front of the
ALB (and/or S3 for static assets) to reduce origin load and latency. Every
tier spans multiple AZs so no single AZ failure takes down the app.

**Q: What's the difference between ECS and EKS, and when would you pick
one over the other?**
A: Both run containers on AWS; ECS is AWS's own orchestrator with a simpler
mental model and no separate control-plane cost, while EKS is managed
Kubernetes, API-compatible with upstream K8s. Choose EKS when you need
Kubernetes-specific tooling, multi-cloud portability, or existing K8s
expertise/manifests; choose ECS when you want the simplest AWS-native path
with less operational surface area. Fargate removes node management for
either.

**Q: Why use a NAT Gateway instead of just putting instances in a public
subnet?**
A: Defense in depth — instances handling sensitive workloads (app servers,
databases) shouldn't be directly reachable from the internet even if
firewall rules are theoretically correct; a misconfigured security group on
a publicly-addressed instance is a much bigger blast radius than one in a
private subnet. A NAT Gateway lets those private instances still reach the
internet outbound (patches, package installs, third-party APIs) without
ever accepting inbound connections.

**Q: How does DynamoDB achieve consistent low-latency performance at any
scale, and what's the most common way to break that?**
A: It partitions data by hash of the partition key across many physical
storage nodes, so requests spread evenly if the key has high cardinality.
The most common way to break it is poor key design — a partition key with
low cardinality (e.g., a status flag with 3 possible values) or a "hot" key
that receives disproportionate traffic (e.g., a single popular product ID)
concentrates requests on one partition and causes throttling even when
overall provisioned/on-demand capacity looks sufficient.

**Q: What's the actual cost/availability trade-off of going multi-region
versus multi-AZ?**
A: Multi-AZ already protects against the far more common failure mode — a
single data center or AZ going down — with relatively low complexity since
AZs are low-latency-linked within a region. Multi-region protects against a
whole-region outage, which is rare but not theoretical, and is required for
strict disaster-recovery SLAs or global user latency; it costs much more in
engineering complexity — cross-region data replication and consistency, DNS
failover, doubled infrastructure — so it's a deliberate choice driven by
actual RTO/RPO requirements, not a default.

**Q: How should the AWS CLI authenticate in a way that avoids long-lived
credentials?**
A: For human access, SSO via IAM Identity Center (`aws configure sso` /
`aws sso login`) — it caches a short-lived token instead of writing access
keys to disk. For cross-account or service access, `sts:AssumeRole` (or,
for CI systems, `assume-role-with-web-identity` via GitHub Actions OIDC or
Kubernetes IRSA) exchanges a trust relationship for temporary credentials.
Long-lived access keys embedded in scripts or CI YAML are the highest-
leverage credential leak vector in AWS, so both paths exist specifically to
avoid ever needing them.

**Q: What's the difference between a permission boundary and a Service
Control Policy?**
A: Both are ceilings rather than grants — neither can give a principal
permissions on its own. A permission boundary is attached to a single IAM
user or role and caps the maximum privilege *that identity* can ever have,
which is what lets you safely delegate IAM-role creation to an application
team without losing control. An SCP is set at the AWS Organizations level
and caps every principal in an account or OU, including the root user — it
enforces org-wide guardrails like "never leave these approved regions,"
regardless of what any individual identity policy grants.

**Q: Why doesn't a plain CNAME work at a domain's zone apex, and how does
Route 53 solve it?**
A: DNS spec forbids a CNAME from coexisting with other record types at the
same name, and the zone apex (`example.com`, not `www.example.com`) always
needs NS/SOA records — so a CNAME there is invalid. Route 53's proprietary
**ALIAS** record type solves this: it looks like an A record to resolvers
but internally maps to an AWS resource's changing IP set (an ALB,
CloudFront distribution, or S3 website endpoint) at zero extra cost, which
is why it's the standard way to point a bare domain at AWS infrastructure.

**Q: How do you keep an AWS bill under control at the architecture level,
not just with a monthly budget alert?**
A: Treat cost as a design input, not an afterthought: rightsize continuously
using Compute Optimizer and CloudWatch utilization data (the highest-ROI,
lowest-risk lever), commit predictable baseline load to Savings Plans, push
fault-tolerant workloads to Spot, and tier S3/EBS storage with lifecycle
rules. Then check data transfer — cross-AZ traffic, NAT Gateway per-GB
charges, and inter-region transfer are the most commonly underestimated
line items, and a chatty multi-AZ microservice architecture can blow past
its compute budget through NAT Gateway charges alone. Enforcing
cost-allocation tags at creation time (via SCP or IAM policy condition) is
what makes any of this attributable in the first place.

**Q: What's the practical difference between CloudWatch and EventBridge?**
A: CloudWatch answers "is something wrong right now" — it collects metrics
and logs and fires alarms off thresholds. EventBridge (formerly CloudWatch
Events) answers "something just changed" — it's an event bus that routes
state-change events (an instance stopping, a scheduled cron tick, a custom
application event) to targets like Lambda or Step Functions. They're
complementary, not competing: a CloudWatch alarm can trigger an SNS
notification, while an EventBridge rule triggers workflow logic in
response to a discrete event.

---

## 14. One-Line Summary

**AWS architecture is a series of trade-offs between managed convenience and
control — spread everything across at least two AZs by default, grant IAM
the least privilege it needs, treat cost and observability as first-class
design inputs rather than afterthoughts, and reserve multi-region and
fully custom infrastructure for requirements that actually justify their
complexity.**
