---
title: "System Performance Cheat Sheet"
description: "Quick reference for system performance — the USE method, RED method, and the standard Linux toolkit."
tags: [system-performance, linux, sre, cheat-sheet]
hide_table_of_contents: true
---

# System performance cheatsheet

A one-page reference for system performance analysis. For the full worked
"server is slow" diagnosis, see the [complete guide](/docs/sre-skills/system-performance/system-performance-guide).

<a class="topic-crosslink" href="/docs/sre-skills/system-performance/system-performance-guide">📖 Full guide: System Performance →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### The USE method

For every resource (CPU, memory, disk, network), ask:

- **Utilization** — % time busy
- **Saturation** — extra work queued, waiting
- **Errors** — error events (retries, CRC errors, retransmits)

High utilization without saturation is fine. **Saturation is the real
bottleneck signal.**

</div>

<div class="cheat-card">

#### The RED method

For every service: **R**ate, **E**rrors, **D**uration (p50/p95/p99, never
just the mean). RED tells you what users feel; USE tells you why.

</div>

<div class="cheat-card">

#### CPU

```bash
mpstat 1        # per-CPU utilization
vmstat 1        # run queue (r), CPU, memory summary
top / htop
```

</div>

<div class="cheat-card">

#### Memory

```bash
free -h
vmstat 1        # si/so = swap in/out — nonzero is a red flag
```

</div>

<div class="cheat-card">

#### Disk I/O

```bash
iostat -x 1     # %util, avgqu-sz (queue depth), await (latency)
```

High `await` with low `%util` = the disk itself is slow, not overloaded.

</div>

<div class="cheat-card">

#### Network

```bash
ss -s           # socket summary
sar -n DEV 1    # interface throughput
```

</div>

<div class="cheat-card">

#### Diagnostic order

1. `uptime` — load average, quick gut check.
2. `vmstat 1` — CPU/memory/run-queue in one view.
3. `mpstat -P ALL 1` — per-CPU, catches single-core saturation.
4. `iostat -x 1` — disk.
5. Drill into the specific resource USE flagged.

<span class="cheat-see">See: Worked Example — Diagnosing "The Server Is Slow"</span>

</div>

</div>
