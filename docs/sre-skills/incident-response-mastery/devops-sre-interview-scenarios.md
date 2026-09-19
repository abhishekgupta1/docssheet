---
title: "DevOps/SRE Interview Scenarios"
description: "Rapid-fire practice material for SRE and DevOps troubleshooting interviews — Linux, AWS+Linux combined incidents, Kubernetes, and a 15-pattern incident catalog."
sidebar_position: 9
tags: [sre, devops, interview, scenarios, aws, kubernetes, incident-response]
---

## Table of Contents

1. [Core DevOps/SRE Scenarios](#-devops--sre-scenario-based-interview-qa)
2. [AWS + Linux Combined Incident Simulations](#aws--linux-combined-incident-simulations)
3. [Linux Troubleshooting Scenario Q&A](#-scenario-based-linux-troubleshooting-qa)
4. [Additional Incident Pattern Catalog](#-additional-incident-pattern-catalog)
5. [What Interviewers Look For](#-what-interviewers-look-for)

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 260" role="img" aria-labelledby="mm-devopsq-title mm-devopsq-desc">
<title id="mm-devopsq-title">Four practice domains, one evaluation signal</title>
<desc id="mm-devopsq-desc">Interview prep spans Linux troubleshooting, combined AWS and Linux incidents, Kubernetes scenarios, and a 15-pattern incident catalog, all ultimately judged by the same signal: structured, calm, evidence-driven troubleshooting.</desc>
<defs>
  <marker id="mm-devopsq-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="20" y="20" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="105" y="52" text-anchor="middle">Linux Scenarios</text>
<text class="mm-node-sub" x="105" y="69" text-anchor="middle">core troubleshooting</text>

<rect class="mm-n2" x="205" y="20" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="290" y="52" text-anchor="middle">AWS + Linux</text>
<text class="mm-node-sub" x="290" y="69" text-anchor="middle">combined incidents</text>

<rect class="mm-n3" x="390" y="20" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="475" y="52" text-anchor="middle">Kubernetes</text>
<text class="mm-node-sub" x="475" y="69" text-anchor="middle">pod / cluster failures</text>

<rect class="mm-n4" x="575" y="20" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="660" y="45" text-anchor="middle">Incident Pattern</text>
<text class="mm-node-sub" x="660" y="61" text-anchor="middle">15-pattern catalog</text>

<path class="mm-arrow" d="M105,90 L330,175" marker-end="url(#mm-devopsq-arrow)"/>
<path class="mm-arrow" d="M290,90 L365,175" marker-end="url(#mm-devopsq-arrow)"/>
<path class="mm-arrow" d="M475,90 L415,175" marker-end="url(#mm-devopsq-arrow)"/>
<path class="mm-arrow" d="M660,90 L450,175" marker-end="url(#mm-devopsq-arrow)"/>

<rect class="mm-n5" x="240" y="175" width="300" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="200" text-anchor="middle">What Interviewers Look For</text>
<text class="mm-node-sub" x="390" y="217" text-anchor="middle">stabilize, evidence, priority, communication</text>
</svg>

<p class="mental-model__caption">The four practice domains here — Linux, AWS+Linux, Kubernetes, and the broader incident-pattern catalog — are just different surfaces for testing the same underlying signal: can you stabilize first, reason from evidence, prioritize correctly, and communicate clearly under pressure.</p>
</div>

## 🚀 DevOps / SRE Scenario-Based Interview Q&A

### 1️⃣ Production API Latency Suddenly Increased
**Scenario**: latency jumped from 50ms to 800ms after a new deployment.

**Answer**:
1. **Stabilize first** — roll back if customer impact is high; reduce blast radius.
2. **Check metrics** — CPU, memory, I/O, DB latency, external API calls, error rate.
3. **Compare before vs after deploy** — new queries? new dependencies? increased payload size?
4. **Check logs and tracing** — slow endpoints? time spent in DB vs app?

👉 Priority = restore service first, then root cause.

### 2️⃣ Kubernetes Pods Keep Restarting
**Scenario**: pods restart every few minutes.

**Answer**:
```bash
kubectl get pods
kubectl describe pod <name>
kubectl logs <pod>
```
Common causes: `OOMKilled`, `CrashLoopBackOff`, liveness probe failing, misconfigured environment variables.

If OOM: increase memory limit, fix memory leak, adjust resource requests/limits.

👉 In Kubernetes, restarts usually indicate resource or health-probe issues.

### 3️⃣ Database CPU at 100%
**Answer**:
1. Identify heavy queries; check slow query logs.
2. Check: missing indexes? full table scans? sudden traffic spike?
3. Look at connection count.
4. If needed: scale vertically, add read replicas, cache results (Redis).

👉 Databases fail due to bad queries more often than hardware.

### 4️⃣ Memory Leak in Production
**Answer**:
1. Confirm the pattern via monitoring.
2. Check heap usage (JVM/Node/Python).
3. Take a memory dump; analyze for unreleased objects / growing cache.
4. Short-term fix: restart with rolling deployment.
5. Long-term: fix the code leak.

👉 SRE focuses on mitigation + permanent fix.

### 5️⃣ Service is Up but Users See Errors
**Scenario**: monitoring shows healthy, but users get 500 errors.

**Answer**: health checks may only test a basic endpoint, not the full dependency chain. Possible causes: downstream service failing, DB connection pool exhausted, timeout misconfiguration.

Steps: check logs, check dependency health, trace a full request path.

👉 Health checks must test real functionality, not just "process running."

### 6️⃣ Deployment Causes Partial Outage
**Scenario**: after deployment, 30% of users get errors.

**Answer**: common reasons — rolling deployment with incompatible versions, DB schema mismatch, cache inconsistency, one AZ unhealthy, feature flag misconfiguration.

Fix: roll back; use backward-compatible migrations; use canary deployments.

👉 SRE principle: deploy safely and gradually.

### 7️⃣ Traffic Suddenly Spikes 10x
**Answer**:
1. Check: is it real traffic or DDoS?
2. If real: is auto-scaling working? scale horizontally.
3. If DDoS: enable rate limiting, activate WAF, use CDN protection.
4. Monitor: CPU, DB connections, queue depth.

👉 Resilience design matters before traffic spikes.

### 8️⃣ High Error Rate But No Infra Issues
**Answer**: likely dependency failure, expired certificate, feature flag issue, or external API change. Check recent deployments, external API status, TLS cert expiry, config changes.

👉 Not all outages are resource-related.

### 9️⃣ Alert Fatigue in Monitoring
**Answer**:
1. Remove low-value alerts.
2. Use SLO-based alerting.
3. Alert on symptoms, not causes.
4. Create severity levels.
5. Use aggregation and deduplication.

👉 Alert only when user impact exists.

### 🔟 Incident: Entire Region Goes Down
**Answer**: architecture should have multi-region deployment, active-active or active-passive failover, global load balancer, replicated database, automated failover. After recovery: run postmortem, identify weak spots, improve disaster recovery plan.

### 1️⃣1️⃣ How Do You Design for Reliability? (Senior-Level)
**Answer**:
1. Define SLOs (Service Level Objectives).
2. Measure SLIs (latency, availability).
3. Implement error budgets.
4. Use auto-scaling, circuit breakers, retries with backoff, observability (metrics, logs, traces).
5. Run chaos testing.
6. Do postmortems.

👉 Reliability is engineered, not hoped for.

---

## AWS + Linux Combined Incident Simulations

Test whether you can connect cloud infra + OS debugging.

### 1️⃣ EC2 reachable but application down
**AWS layer**: instance status = running. **Linux layer**: service crashed.
**Investigate**: SSH → check process, logs, ports; compare deployment/config change.
**Root cause pattern**: app crash, bad startup config, port binding failure.
**Key tools**: EC2 instance console logs, `ps`, `journalctl`, `/proc`

### 2️⃣ High latency only on one EC2 instance
**AWS layer**: load balancer healthy. **Linux layer**: node overloaded.
**Investigate**: compare CPU/memory across nodes; check thread count, FD usage; look for hot shard / uneven load.
**Root cause pattern**: instance-level resource exhaustion.
**Key services**: Elastic Load Balancing, Linux process + limits debugging

### 3️⃣ Application works locally but fails after scaling
**AWS layer**: new instances fail health check. **Linux layer**: missing dependency.
**Investigate**: compare AMI, environment variables; validate startup scripts.
**Root cause pattern**: config drift between instances.
**Key services**: Auto Scaling, startup logs + `/proc`

### 4️⃣ CPU low but response time high
**AWS layer**: infrastructure stable. **Linux layer**: waiting on external dependency.
**Investigate**: process state → I/O wait; check network calls / DB connections.
**Root cause pattern**: downstream service slowness.
**Key services**: Amazon RDS latency, Linux process state `D`

### 5️⃣ Instance crashes during traffic spike
**AWS layer**: auto-restart observed. **Linux layer**: resource exhaustion.
**Investigate**: kernel logs; memory usage trend; limits and FD count.
**Root cause pattern**: OOM killer, insufficient memory sizing.
**Key services**: CloudWatch metrics, `/proc/<pid>/limits`

### 6️⃣ Users intermittently cannot connect
**AWS layer**: load balancer reports 502. **Linux layer**: service unstable.
**Investigate**: health check endpoint; port listening status; restart frequency.
**Root cause pattern**: crash loop or timeout mismatch.
**Key services**: Application Load Balancer, Linux service lifecycle

### 7️⃣ Deployment causes partial outage
**AWS layer**: some instances OK, others failing. **Linux layer**: inconsistent config.
**Investigate**: compare environment variables; check running version; validate startup scripts.
**Root cause pattern**: configuration drift.
**Key services**: AWS Systems Manager, process inspection

### 8️⃣ Disk usage suddenly full on EC2
**AWS layer**: instance healthy. **Linux layer**: disk exhaustion.
**Investigate**: identify largest files; check log rotation; inspect open deleted files.
**Root cause pattern**: log growth or temp file leak.
**Key services**: Amazon EBS, Linux file descriptors

### 9️⃣ Traffic drop but instances healthy
**AWS layer**: requests not reaching service. **Linux layer**: no issue locally.
**Investigate**: DNS resolution; load balancer routing; security rules.
**Root cause pattern**: routing or DNS misconfiguration.
**Key services**: Route 53, network checks on Linux

### 🔟 Sudden increase in error rate after scaling
**AWS layer**: new instances failing under load. **Linux layer**: resource limits too low.
**Investigate**: open file limit; thread limit; connection pool.
**Root cause pattern**: default limits insufficient for scale.
**Key services**: VPC connectivity + limits, `/proc/<pid>/limits`

### 🎯 Interview Answer Framework (AWS + Linux)

**Step 1 — Infra health**: instance state, load balancer, scaling events, metrics
**Step 2 — Node health**: process running? CPU/memory/FD, logs + limits
**Step 3 — Dependencies**: DB, network, config drift
**Step 4 — Mitigate then root cause**: restart, scale, reroute traffic → fix underlying issue

---

## 🔥 Scenario-Based Linux Troubleshooting Q&A

### 1️⃣ Server is Slow – High CPU Usage
```bash
top
htop
uptime
```
Identify which process is consuming CPU, and whether it's user vs system CPU. If system CPU is high → possibly kernel, I/O wait, or interrupts. If one process misbehaves → restart service, investigate logs. If many processes → possible scaling issue. If iowait is high → investigate disk bottlenecks.

### 2️⃣ High Load Average but Low CPU Usage
Indicates processes are waiting — most likely for I/O.
```bash
top   # check %wa
iostat -x 1
```
If disk utilization is high → disk bottleneck, possibly database workload or slow storage.

👉 High load ≠ high CPU. It includes processes waiting for I/O.

### 3️⃣ System Out of Memory (OOM Killer Triggered)
```bash
dmesg | grep -i oom
free -m
top
```
Possible causes: memory leak, too many processes, no swap configured.
Fix: add swap, increase RAM, fix memory leak, adjust `vm.overcommit_memory`.

### 4️⃣ Disk is Full but `du` Doesn't Show Large Files
Likely a deleted file still open by a running process.
```bash
lsof | grep deleted
```
If found, restart the service holding the file — space will be released.

👉 Linux doesn't free space until file descriptors are closed.

### 5️⃣ Service Cannot Bind to Port 80
```bash
ss -tulnp | grep :80
netstat -tulnp
```
Kill the conflicting process or change the port.

👉 Only one process can bind to a port at a time (unless using special socket options).

### 6️⃣ SSH is Slow to Connect
Common causes: DNS reverse lookup delay, GSSAPI authentication enabled, network latency.
Fix in `/etc/ssh/sshd_config`:
```
UseDNS no
GSSAPIAuthentication no
```
Restart SSH service.

### 7️⃣ High Memory Usage but Free Memory is Low
Not a problem — Linux uses free memory for buffer/cache.
```bash
free -m   # look at "available", not just "free"
```
Linux frees cache automatically if needed.

👉 "Free memory is wasted memory" in Linux.

### 8️⃣ One Process Consuming All Memory
```bash
top
ps aux --sort=-%mem
```
Check: is it expected workload? memory leak? Check JVM heap settings. Restart service if necessary; monitor over time.

### 9️⃣ Server Randomly Reboots
```bash
journalctl -xb -1
dmesg
```
Look for kernel panic, OOM, hardware errors, power failure.
Possible causes: hardware issue, faulty RAM, kernel bug, power supply problem.

### 🔟 Too Many Open Files Error
```bash
ulimit -n
cat /proc/sys/fs/file-max
```
Fix: increase limits in `/etc/security/limits.conf`; restart service.

### 1️⃣1️⃣ High Interrupt Usage (Advanced)
**Scenario**: system CPU is high, but no process is using it. `top` shows high `%si` (software interrupt).
```bash
cat /proc/interrupts
```
Likely causes: network flood, faulty driver, hardware issue. May need NIC tuning, driver update, IRQ balancing.

### 🎯 Interview Tip for Scenario Questions
When answering: 1) identify the symptom, 2) mention diagnostic commands, 3) explain likely root causes, 4) suggest a fix, 5) mention prevention if possible. This shows structured troubleshooting thinking.

---

## 🚨 Additional Incident Pattern Catalog

Fifteen additional real production-style incident patterns for rapid-fire practice — symptom, check, and root-cause pattern only (no commands), useful for verbal mock-interview drills.

| # | Scenario | Symptoms | Check | Root Cause Pattern |
|---|---|---|---|---|
| 1 | API latency spike after deployment | Response time ↑, error rate stable | CPU, threads, DB connections, config diff | Inefficient code path, connection pool exhaustion |
| 2 | Service healthy but users cannot connect | Process running, no response | Listening ports, firewall, socket state | Port conflict, network ACL change |
| 3 | CPU suddenly at 100% on one node | Load imbalance | Top processes, thread usage, recent traffic | Hot shard, infinite loop, retry storm |
| 4 | Memory keeps increasing slowly | Works fine initially → crashes later | Memory usage trend, OOM logs | Memory leak |
| 5 | "Too many open files" error | Service stops accepting requests | Open FDs, limits, connection handling | File/socket leak |
| 6 | Service not stopping during restart | `kill` ignored | Process state | Stuck in I/O wait or kernel lock |
| 7 | Sudden spike in load average | System slow, CPU moderate | Load vs CPU cores, blocked processes | Disk bottleneck or lock contention |
| 8 | Intermittent 502 / gateway errors | Random failures | Upstream health, timeout settings | Dependency slowness |
| 9 | Node crashes under traffic spike | Service restarts automatically | Resource limits, OOM killer | Insufficient memory or FD limit |
| 10 | Logs stop updating but process alive | No new activity | Thread state, blocked syscalls | Deadlock or external dependency hang |
| 11 | High response time but CPU low | Users complain, system idle | I/O wait, network, DB latency | External service bottleneck |
| 12 | Many zombie processes accumulate | Process table fills slowly | Parent process behavior | Child exit not handled |
| 13 | Deployment works on some nodes only | Partial outage | Config drift, environment variables | Inconsistent infrastructure state |
| 14 | Traffic drop but service healthy | No errors but usage down | DNS, load balancer, routing | Traffic not reaching service |
| 15 | Monitoring alerts but system seems fine | False positives | Alert thresholds, metrics lag | Misconfigured monitoring |

### 🧠 How SRE3 Answers in Interview
For ANY scenario, structure the response like this:

1️⃣ Identify process / service health
2️⃣ Check CPU, memory, I/O, limits
3️⃣ Inspect dependencies
4️⃣ Verify configuration changes
5️⃣ Mitigate → then find root cause

That structured, calm thinking is the signal interviewers look for.

---

## 🎯 What Interviewers Look For

- Structured thinking
- Calm incident response
- Understanding of distributed systems
- Tradeoff decisions
- Prevention mindset (not just fixing)

## Summary

- 💡 Every answer should follow the same shape: identify → check resources/dependencies → verify recent changes → mitigate → root-cause → prevent.
- 🔥 "Health check passing" and "service actually working" are different claims — probes must exercise the real dependency chain, not just a liveness ping.
- ⚠️ At scale, default resource limits (open files, threads, connection pools) become the bottleneck even when code and infra are unchanged.
- ✅ For any region/AZ-level failure, the answer is always architectural: multi-region, automated failover, replicated data — not a runbook step.

## See Also

- [Incident Response Mindset](./incident-response-mindset) — the structured-response framework these answers are built on
- [Incident Simulation Labs](./incident-simulation-labs) — hands-on version of many of these scenarios
- [Process Management & /proc](./process-management-proc) — command reference for CPU/memory/FD scenarios
- [Filesystem & Storage Playbook](./filesystem-storage-playbook) — disk-full and deleted-file-still-open deep dive
