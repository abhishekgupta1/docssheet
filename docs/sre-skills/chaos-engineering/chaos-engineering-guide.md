---
title: "Chaos Engineering: The Complete Guide"
description: "End-to-end reference for chaos engineering — the steady-state hypothesis, the experiment lifecycle, failure injection types, tools, Game Days, blast-radius safety, and interview-ready Q&A."
sidebar_position: 1
tags: [chaos-engineering, sre, reliability, resilience]
---

# Chaos Engineering — The Complete Guide

A single-read, end-to-end reference for chaos engineering: enough to design
a safe experiment, run a Game Day, or walk into an SRE interview. Organized
as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/chaos-engineering">📋 Quick reference: Chaos Engineering →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 340" role="img" aria-labelledby="mm-chaos-title mm-chaos-desc">
<title id="mm-chaos-title">The chaos engineering experiment loop</title>
<desc id="mm-chaos-desc">A repeating five-step loop: define steady state, form a hypothesis, run an experiment, measure the result, and fix the gap, then repeat.</desc>
<defs>
  <marker id="mm-chaos-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="310" y="23" width="160" height="64" rx="10"/>
<text class="mm-node-title" x="390" y="50" text-anchor="middle">Steady State</text>
<text class="mm-node-sub" x="390" y="67" text-anchor="middle">healthy, measurable signal</text>

<rect class="mm-n2" x="419" y="103" width="160" height="64" rx="10"/>
<text class="mm-node-title" x="499" y="130" text-anchor="middle">Hypothesis</text>
<text class="mm-node-sub" x="499" y="147" text-anchor="middle">falsifiable, tied to a mechanism</text>

<rect class="mm-n3" x="378" y="231" width="160" height="64" rx="10"/>
<text class="mm-node-title" x="458" y="258" text-anchor="middle">Experiment</text>
<text class="mm-node-sub" x="458" y="275" text-anchor="middle">smallest safe blast radius</text>

<rect class="mm-n4" x="242" y="231" width="160" height="64" rx="10"/>
<text class="mm-node-title" x="322" y="258" text-anchor="middle">Measure</text>
<text class="mm-node-sub" x="322" y="275" text-anchor="middle">did steady state hold?</text>

<rect class="mm-n5" x="201" y="103" width="160" height="64" rx="10"/>
<text class="mm-node-title" x="281" y="130" text-anchor="middle">Fix the Gap</text>
<text class="mm-node-sub" x="281" y="147" text-anchor="middle">close the resilience gap</text>

<path class="mm-arrow" d="M422,79 L467,111" marker-end="url(#mm-chaos-arrow)"/>
<path class="mm-arrow" d="M487,173 L470,225" marker-end="url(#mm-chaos-arrow)"/>
<path class="mm-arrow" d="M418,263 L362,263" marker-end="url(#mm-chaos-arrow)"/>
<path class="mm-arrow" d="M310,225 L293,173" marker-end="url(#mm-chaos-arrow)"/>
<path class="mm-arrow" d="M313,111 L358,79" marker-end="url(#mm-chaos-arrow)"/>

<text class="mm-flow-label" x="390" y="180" text-anchor="middle">repeat continuously</text>
</svg>

<p class="mental-model__caption">Chaos engineering is one loop run over and over: define what healthy looks like, guess what should happen when something breaks, break it on purpose at a contained scale, check whether the guess held, fix whatever gap the experiment exposed, and start the loop again.</p>
</div>

## 1. What Chaos Engineering Is and Why It Exists

Chaos engineering is the discipline of deliberately injecting failure into a
system — instance deaths, network partitions, resource exhaustion,
dependency outages — to build confidence that it survives real-world
turbulence *before* those failures happen uninvited in production. It is
not "randomly breaking things"; it is a scientific method applied to
distributed systems: form a falsifiable hypothesis, run a controlled
experiment, measure, and fix what you find.

This is the inversion that separates chaos engineering from ordinary
testing: unit and integration tests verify the system behaves correctly
when everything works. Chaos engineering verifies the system behaves
correctly — or degrades acceptably — when something *doesn't*.

The core loop, everywhere in chaos engineering: define **steady state** (a
measurable, business-level signal of healthy behavior), form a
**hypothesis** tied to a specific resilience mechanism, design the smallest
experiment that tests it, run it with a blast radius you can contain,
measure what actually happened, and fix the gap. This hypothesis-first
mental model is the single most important thing to internalize — everything
else in the discipline exists to make that loop safe to run.

---

## 2. The Steady-State Hypothesis

**Steady state** is a measurable output that represents normal, healthy
system behavior — a business or SLO-level metric, not an infrastructure
metric. "CPU is low" is not steady state; "checkout completes in under 2
seconds for 99% of requests" is.

Once steady state is defined and instrumented, you form a **hypothesis**:
an explicit, falsifiable statement about what will happen and why, tied to
a specific resilience mechanism — a retry policy, a failover path, a
circuit breaker, autoscaling, a replica count.

```text
Hypothesis: "Terminating 1 of 6 payment-service pods will not drop
checkout_success_rate below 99.9% over a 5-minute window,
because the Service has 6 healthy replicas and readiness probes
remove unready pods from rotation within 10s."
```

The experiment's only job is to prove or disprove that hypothesis under
real conditions — real network calls, real load, real infrastructure — not
a staging mock. A disproved hypothesis is not a failed experiment; it's the
whole point. It surfaces a gap (a missing timeout, an under-provisioned
replica count, a circuit breaker that never trips) before a real outage
does.

---

## 3. The Chaos Engineering Lifecycle

| Step | What happens |
|---|---|
| **1. Define steady state** | Pick a business or SLO-level metric that represents "healthy," and instrument it so you can observe it during the experiment |
| **2. Hypothesize** | State explicitly what you believe will happen and why, tied to a named resilience mechanism |
| **3. Design the experiment** | Choose the smallest fault that tests the hypothesis — one pod, one AZ, one dependency call, not "kill everything" |
| **4. Minimize blast radius** | Scope the experiment so a wrong hypothesis costs a page, not an outage — canary first, then a small percentage of production traffic, then broader |
| **5. Run the experiment** | Inject the fault, ideally during business hours with people watching, not at 3am when nobody can react |
| **6. Measure** | Compare observed behavior against steady state and against the hypothesis — did alerts fire, did the SLO hold, how long did recovery take |
| **7. Learn and fix** | File every disproved hypothesis as a finding, fix the underlying weakness, and re-run to confirm the fix |

The monitoring check and the abort condition for a given experiment must
exist **before** you run it — if you can't observe the blast radius, you
can't safely inject the fault.

---

## 4. Failure Injection Types

| Category | What it simulates | Typical injection | Resilience mechanism under test |
|---|---|---|---|
| **Instance/pod termination** | Host death, spot reclamation, OOM kill | `kubectl delete pod`, terminate an EC2 instance, Chaos Monkey | Failover, health checks |
| **Network latency/partition** | Slow or unreachable dependency, split-brain | `tc netem` delay/loss, iptables `DROP`, LitmusChaos `pod-network-latency` | Timeouts, retries |
| **CPU/memory pressure** | Noisy neighbor, resource starvation | `stress-ng`, LitmusChaos `pod-cpu-hog` / `pod-memory-hog` | Autoscaling, resource limits/requests |
| **Disk fill** | Log/data volume exhaustion | `dd` to fill a volume, Gremlin disk attack | Alerting, log rotation |
| **DNS failure** | Resolver outage, stale/poisoned records | Block port 53, return NXDOMAIN via a custom resolver | Caching, fallback resolvers |
| **Dependency failure / circuit breaker test** | Downstream service down or erroring | Inject HTTP 5xx/timeout at the proxy layer, kill a dependency's endpoint | Circuit breakers, graceful degradation |
| **Clock skew** | NTP drift, cert expiry edge cases, distributed consensus bugs | `date -s`, LitmusChaos `pod-clock-skew` | Time-sensitive logic (JWT expiry, leader election, TLS validation) |

Each injection type is deliberately mapped to the specific mechanism it
exercises — running the wrong fault against a hypothesis just produces
noise. If the hypothesis is about circuit breaker behavior, inject
dependency failure, not disk fill.

---

## 5. Tools

| Tool | What it's for |
|---|---|
| **Chaos Monkey / Simian Army** (Netflix) | The originator. Chaos Monkey randomly terminates instances within an autoscaling group during business hours. Simian Army extended it: Latency Monkey (network delay), Conformity Monkey (config drift), Janitor Monkey (unused resource cleanup). Philosophy: make failure routine so engineers build for it by default |
| **Gremlin** | Commercial SaaS chaos platform. Agent-based, supports host/container/Kubernetes targets, offers a large attack library (CPU, memory, disk, network, state — process kill, time travel) plus built-in blast-radius controls, halt buttons, and scheduled Game Day tooling |
| **LitmusChaos** | CNCF Kubernetes-native chaos framework. Experiments are Kubernetes Custom Resources (`ChaosEngine`, `ChaosExperiment`, `ChaosResult`), run as jobs inside the cluster, integrate with Prometheus for automated hypothesis validation via "probes" |
| **Chaos Mesh** | Comparable Kubernetes-native alternative (CNCF, PingCAP-originated), CRD-based, strong for network and I/O chaos with a web dashboard |
| **AWS Fault Injection Simulator (FIS)** | AWS-native, IAM-scoped chaos as a managed service. Experiment templates target real AWS resources (EC2, ECS, EKS, RDS) via SSM-driven actions, with built-in **stop conditions** tied to CloudWatch alarms — the experiment auto-aborts if a guardrail metric breaches |

Pick by where the workload lives: Kubernetes-native workloads reach for
LitmusChaos or Chaos Mesh; AWS-native infrastructure reaches for FIS,
which gets IAM scoping and CloudWatch-driven stop conditions for free;
cross-platform or SaaS-managed programs reach for Gremlin.

---

## 6. Game Days

A Game Day is a **planned, scheduled chaos exercise** run with stakeholders
in the room — not an automated background job. Typical format: pick a
hypothesis (e.g., "we can lose an AZ and stay within SLO"), notify on-call
and dependent teams, run the fault injection live, have the incident
commander and engineers respond as if it were real, and hold a retro
immediately after.

Game Days validate not just the system but the *humans and runbooks* —
whether alerts page the right people, whether the runbook is accurate,
whether the dashboard shows the right signal. They're the deliberate,
high-visibility counterpart to continuous automated chaos, which validates
the system quietly and constantly.

A Game Day run as a demo — where the responding team already knows exactly
what will happen and when — only validates the injected fault, not the
response process. Keep the failure type known to the facilitator but the
exact timing and target loosely held from the responding team, within
safety limits, so on-call actually practices diagnosis.

---

## 7. Blast-Radius Control and Safety Mechanisms

| Mechanism | What it does |
|---|---|
| **Abort conditions / stop conditions** | An automated kill switch tied to a monitoring signal (an AWS FIS stop condition on a CloudWatch alarm, a LitmusChaos probe failure) that halts the experiment the moment steady state is actually violated beyond tolerance |
| **Canary-first** | Run a new experiment type against a canary or staging environment — or a single canary instance in prod — before widening scope |
| **Off-peak-but-attended scheduling** | Run during business hours with engineers watching, not at 3am; the goal is controlled learning, not an unattended outage |
| **Feature-flag kill switches** | Gate the chaos injection itself behind a flag so it can be disabled instantly without a deploy |
| **Scoping by percentage/label/namespace** | Target one pod, one AZ, or 1% of traffic first; use label selectors and explicit namespace/kind scoping, or resource ARNs/tags, to bound exactly what can be touched |
| **Rollback plan** | Every experiment needs a documented, tested way to immediately undo the injected fault, independent of the abort condition firing |

The abort condition and the rollback plan are not optional extras — without
an automated halt tied to a real alarm, a wrong hypothesis becomes an
unplanned outage, which is the exact opposite of the discipline's goal.

---

## 8. Worked Example: LitmusChaos Pod-Delete Experiment

This experiment kills a random pod matching a label selector in the
`payment` namespace, and Litmus's built-in probe validates that the
deployment's steady-state replica count and HTTP health check recover
within the tolerance window.

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: payment-pod-delete
  namespace: payment
spec:
  appinfo:
    appns: payment
    applabel: 'app=payment-service'
    appkind: deployment
  engineState: active
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '30'          # seconds the experiment runs
            - name: CHAOS_INTERVAL
              value: '10'          # kill a pod every 10s
            - name: FORCE
              value: 'false'       # graceful delete, not SIGKILL
            - name: PODS_AFFECTED_PERC
              value: '25'          # blast radius: max 25% of matching pods
        probe:
          - name: 'payment-health-check'
            type: 'httpProbe'
            mode: 'Continuous'
            httpProbe/inputs:
              url: 'http://payment-service.payment.svc.cluster.local/healthz'
              insecureSkipVerify: false
              method:
                get:
                  criteria: '=='
                  responseCode: '200'
            runProperties:
              probeTimeout: 5
              interval: 2
              retry: 3
              stopOnFailure: true   # abort condition: probe failure halts the run
```

```bash
kubectl apply -f payment-pod-delete.yaml
kubectl describe chaosresult payment-pod-delete-pod-delete -n payment
```

The monitoring check is the hypothesis validator, and it has to exist
*before* the experiment runs: a burn-rate alert on
`payment_checkout_success_rate` dropping below SLO during the chaos window
is the real signal the hypothesis failed, while a brief dip in
`kube_deployment_status_replicas_available` is expected and self-healing.
Overlay the `ChaosResult` start/end timestamps on the latency and
error-rate dashboards so the blast window is visually correlated with any
SLO dip. If the probe's `stopOnFailure: true` fires, Litmus marks the
`ChaosResult` as `Fail` and halts further pod deletions — the automated
abort condition in action.

---

## 9. Worked Example: AWS FIS with a Stop Condition

```json
{
  "description": "Terminate one instance in the web-tier ASG to validate ASG self-healing and ALB failover",
  "targets": {
    "web-instances": {
      "resourceType": "aws:ec2:instance",
      "resourceTags": { "Tier": "web" },
      "selectionMode": "COUNT(1)"
    }
  },
  "actions": {
    "terminate-instance": {
      "actionId": "aws:ec2:terminate-instances",
      "targets": { "Instances": "web-instances" }
    }
  },
  "stopConditions": [
    {
      "source": "aws:cloudwatch:alarm",
      "value": "arn:aws:cloudwatch:us-east-1:123456789012:alarm:web-tier-5xx-error-rate-high"
    }
  ],
  "roleArn": "arn:aws:iam::123456789012:role/fis-experiment-role",
  "tags": { "purpose": "chaos-gameday" }
}
```

The `stopConditions` block is the safety mechanism: if the
`web-tier-5xx-error-rate-high` CloudWatch alarm transitions to `ALARM` at
any point during the run, FIS automatically stops the experiment — no
further instances are terminated, regardless of what the experiment
template still has queued. The steady-state hypothesis here is "ALB health
checks deregister the terminated instance and the ASG replaces it before
the 5xx rate crosses the alarm threshold"; the alarm doubles as both the
abort trigger and the pass/fail measurement.

---

## 10. Common Mistakes

**Running experiments without a steady-state baseline.** "Let's kill a pod
and see what happens" has no hypothesis and no measurable pass/fail
criteria, so there's no way to know if the result is normal or a
regression. Establish and instrument the steady-state metric first, then
write the hypothesis as a testable statement.

**Skipping the abort condition because "it's just a test."** Without an
automated halt tied to a real alarm, a wrong hypothesis becomes an
unplanned outage. Every experiment needs a stop condition wired to a
monitoring signal, not just a human watching a dashboard.

**Going straight to production-wide blast radius on the first run of a new
experiment type.** Even a well-understood fault like pod delete behaves
differently the first time against a specific service's actual retry and
timeout configuration. Run new experiment types against canary or a single
instance first, and widen scope only after a clean pass.

**Treating a Game Day as a demo instead of a real drill.** If everyone
already knows exactly what will happen and when, on-call doesn't practice
diagnosis — only the injected fault gets validated, not the response
process.

---

## 11. Advanced Usage

### Automated continuous chaos in CI/CD

Mature chaos programs move from manual Game Days to automated experiments
gated into the deploy pipeline: after a canary deploy, a chaos suite (a
LitmusChaos `ChaosSchedule`, or a pipeline step calling Gremlin's API) runs
a fixed battery of low-blast-radius experiments against the canary before
promoting to full rollout. A failed chaos probe blocks promotion the same
way a failed integration test would.

### Dependency failure injection for circuit breaker validation

Rather than killing infrastructure, inject failure at the network/proxy
layer for a specific downstream call — for example, a service mesh fault
filter in Istio/Envoy returning 503 for 20% of calls to
`inventory-service`. This validates the actual circuit breaker
configuration (trip threshold, half-open retry interval, fallback
response) under conditions unit tests can't reach, because unit tests mock
the dependency instead of exercising the real client library's timeout and
retry code paths.

```yaml
# Istio VirtualService fault injection — simulate inventory-service degradation
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: inventory-service-fault
spec:
  hosts:
    - inventory-service
  http:
    - fault:
        abort:
          percentage:
            value: 20
          httpStatus: 503
      route:
        - destination:
            host: inventory-service
```

### Chaos-as-code and GitOps integration

Store `ChaosEngine`/FIS experiment templates in version control alongside
the service they test, so the hypothesis and the fix travel together in
code review. Tag each experiment with the specific resilience mechanism it
validates — retry policy, replica count, circuit breaker config — so a
change to that mechanism triggers a re-run via CI.

### Chaos maturity model

1. **Ad hoc** — manual, occasional Game Days.
2. **Scheduled** — recurring Game Days on a cadence (monthly/quarterly), documented runbooks.
3. **Automated in staging** — chaos experiments run automatically against non-prod on every deploy.
4. **Automated in production, small blast radius** — continuous low-risk chaos (Chaos Monkey style) always running against prod.
5. **Chaos-gated deploys** — promotion pipelines block on chaos probe results, with both blast radius and experiment catalog expanding over time.

---

## 12. Interview-Ready Q&A

**Q: What separates chaos engineering from ordinary testing?**
A: Unit and integration tests verify the system behaves correctly when
everything works; chaos engineering verifies the system behaves correctly,
or degrades acceptably, when something doesn't. It's hypothesis-driven
experimentation against a measurable steady-state metric, run under real
conditions — real traffic, real infrastructure — not a mock.

**Q: Walk me through the chaos engineering lifecycle.**
A: Define a steady-state metric at the business or SLO level, form a
hypothesis tied to a specific resilience mechanism, design the smallest
experiment that tests it, minimize blast radius, run it attended, measure
observed behavior against the hypothesis, and fix whatever gap the
experiment reveals — then re-run to confirm the fix.

**Q: Why does the abort condition need to exist before the experiment runs,
and what happens if you skip it?**
A: The abort condition is the automated kill switch — an AWS FIS stop
condition on a CloudWatch alarm, or a LitmusChaos probe with
`stopOnFailure: true` — that halts the experiment the instant steady state
is actually violated. Skip it and a wrong hypothesis just becomes an
unplanned outage, which defeats the entire purpose of running a controlled
experiment instead of waiting for a real failure.

**Q: How do you decide which failure injection type to use for a given
hypothesis?**
A: Match the fault to the resilience mechanism under test. Instance or pod
termination tests failover and health checks; network latency tests
timeouts and retries; CPU/memory pressure tests autoscaling and resource
limits; DNS failure tests caching and fallback resolvers; dependency
failure tests circuit breakers; clock skew tests time-sensitive logic like
JWT expiry or leader election. Injecting the wrong fault against a
hypothesis just produces noise.

**Q: What's the difference between a Game Day and continuous automated
chaos, and why do you need both?**
A: A Game Day is a planned, attended, cross-team exercise that validates
not just the system but the humans and runbooks — whether the right people
get paged, whether the runbook is accurate. Continuous automated chaos
(Chaos Monkey-style, or chaos gated into CI/CD) validates the system
quietly and constantly at small blast radius. Game Days catch
process/people gaps that automated chaos can't see; automated chaos catches
regressions Game Days are too infrequent to catch quickly.

**Q: How does AWS FIS's stopCondition mechanism work, and why is a
CloudWatch alarm a good choice for it?**
A: A `stopCondition` in an FIS experiment template references a CloudWatch
alarm ARN; if that alarm transitions to `ALARM` state at any point during
the run, FIS automatically halts the experiment — no further queued actions
execute. It's a good choice because the same alarm typically doubles as
both the abort trigger and the pass/fail measurement for the hypothesis,
so you don't need separate infrastructure for "stop the blast radius" and
"did the hypothesis hold."

**Q: What's wrong with running your first pod-delete experiment against
100% of production traffic?**
A: Even a well-understood fault type behaves differently the first time
against a specific service's actual retry, timeout, and readiness-probe
configuration — you don't yet know if the hypothesis is correct. Blast
radius should start at the smallest possible scope (one pod, a canary
instance, a single AZ, 1% of traffic) and widen only after that smaller
experiment passes cleanly.

**Q: Why is a disproved hypothesis considered a good outcome in chaos
engineering, not a failed experiment?**
A: Because the entire point of the discipline is finding resilience gaps
under controlled conditions, with an abort switch and people watching,
instead of discovering them during a real incident at 3am. A disproved
hypothesis is a finding — file it, fix the underlying weakness (a missing
timeout, an under-provisioned replica count, a circuit breaker that never
trips), and re-run to confirm the fix actually closed the gap.

---

## 13. One-Line Summary

**Chaos engineering is hypothesis-driven experimentation against a
steady-state metric — always with an automated abort condition and a
deliberately small blast radius — that turns "we think the system is
resilient" into "we've proven it, under real conditions, on our own
schedule."**
