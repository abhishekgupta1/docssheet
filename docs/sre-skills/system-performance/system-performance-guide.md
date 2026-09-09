---
title: "System Performance: The Complete Guide"
description: "End-to-end reference for diagnosing Linux system performance with the USE and RED methods — CPU, memory, disk I/O, network, the standard toolkit, and interview-ready Q&A."
sidebar_position: 1
tags: [system-performance, sre, linux, troubleshooting, use-method]
---

# System Performance — The Complete Guide

A single-read, end-to-end reference for diagnosing *why a system is slow*.
[Linux Administration](/docs/sre-skills/linux-administration/linux-administration-guide)
covers the OS primitives — filesystem, processes, systemd, logs. This guide
covers the layer above that: a repeatable method for finding which resource
is actually the bottleneck, the toolkit that answers each question in that
method, and a worked example that ties it together. Organized as a lookup
you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/system-performance">📋 Quick reference: System Performance →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 290" role="img" aria-labelledby="mm-usered-title mm-usered-desc">
<title id="mm-usered-title">USE for resources, RED for services</title>
<desc id="mm-usered-desc">The USE method checks utilization, saturation, and errors for hardware resources, while the RED method checks rate, errors, and duration for request-driven services.</desc>
<defs>
  <marker id="mm-usered-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="40" y="20" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="200" y="41" text-anchor="middle">USE Method</text>
<text class="mm-node-sub" x="200" y="57" text-anchor="middle">for hardware resources</text>

<path class="mm-arrow" d="M200,70 L200,88" marker-end="url(#mm-usered-arrow)"/>
<rect class="mm-n1" x="40" y="90" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="200" y="120" text-anchor="middle">Utilization</text>

<path class="mm-arrow" d="M200,140 L200,148" marker-end="url(#mm-usered-arrow)"/>
<rect class="mm-n1" x="40" y="150" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="200" y="180" text-anchor="middle">Saturation</text>

<path class="mm-arrow" d="M200,200 L200,208" marker-end="url(#mm-usered-arrow)"/>
<rect class="mm-n1" x="40" y="210" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="200" y="240" text-anchor="middle">Errors</text>

<rect class="mm-n5" x="420" y="20" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="580" y="41" text-anchor="middle">RED Method</text>
<text class="mm-node-sub" x="580" y="57" text-anchor="middle">for request-driven services</text>

<path class="mm-arrow" d="M580,70 L580,88" marker-end="url(#mm-usered-arrow)"/>
<rect class="mm-n2" x="420" y="90" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="580" y="120" text-anchor="middle">Rate</text>

<path class="mm-arrow" d="M580,140 L580,148" marker-end="url(#mm-usered-arrow)"/>
<rect class="mm-n2" x="420" y="150" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="580" y="180" text-anchor="middle">Errors</text>

<path class="mm-arrow" d="M580,200 L580,208" marker-end="url(#mm-usered-arrow)"/>
<rect class="mm-n2" x="420" y="210" width="320" height="50" rx="10"/>
<text class="mm-node-title" x="580" y="240" text-anchor="middle">Duration</text>
</svg>

<p class="mental-model__caption">USE and RED are the same checklist idea applied to two different things: walk every physical resource through utilization, saturation, and errors, and walk every service through rate, errors, and duration — between the two you can find almost any bottleneck without guessing.</p>
</div>

## 1. The USE Method

**System performance analysis** is the discipline of figuring out *which
resource* is limiting a system's throughput or latency, using a repeatable
method instead of ad hoc tool-running. Without one, engineers gravitate to
whatever tool they know best (usually `top`), see a scary-looking number,
and chase it — often a red herring. The **USE Method**, coined by Brendan
Gregg, fixes that by giving you an exhaustive checklist to work through
resource by resource. Work it top to bottom and you either find the
bottleneck or you've proven it isn't a resource problem at all — and should
be looking at the application/code instead.

For **every** physical resource — CPU, memory, each disk, each network
interface, even bus/interconnects — ask three questions:

- **Utilization**: the percentage of time the resource was busy servicing
  work. `iostat`'s `%util`, `mpstat`'s `%usr`+`%sys`, `free`'s used memory.
- **Saturation**: the degree to which the resource has extra work it can't
  service *right now* — queued, waiting. Run queue length (`vmstat`'s `r`),
  disk queue depth (`iostat`'s `avgqu-sz`), swap activity.
- **Errors**: the count of error events — NIC CRC errors, disk retries, ECC-
  corrected memory errors, TCP retransmits. Errors degrade performance in
  ways utilization/saturation alone won't show, and are often ignored.

The insight that makes USE powerful: **high utilization without saturation
is fine** — a CPU at 95% with an empty run queue is doing useful work
efficiently. **Saturation is the actual bottleneck signal**: it means work
is arriving faster than the resource can drain it, and latency for every
consumer of that resource is climbing as a result.

### The RED Method

**RED**, coined by Tom Wilkie, is the request-driven complement to USE — for
services rather than hardware resources. For every service (an API, a queue
consumer, a database):

- **Rate**: requests per second the service is handling.
- **Errors**: the rate of failing requests (5xx, exceptions, timeouts).
- **Duration**: the distribution of time each request takes — always look at
  percentiles (p50, p95, p99), never just the mean, since averages hide the
  tail latency that actually generates pages.

USE finds *what hardware resource* is the bottleneck. RED finds *what the
user experiences*. They're complementary: RED tells you customers are
seeing p99 latency spike; USE tells you it's because disk `await` climbed to
400ms on the node backing their database. Run both — USE without RED tells
you a resource is saturated but not whether anyone cares; RED without USE
tells you users are hurting but not why.

---

## 2. The Standard Toolkit, In Order of Use

Brendan Gregg's "60-second checklist" ordering matters — it goes from
cheapest/broadest to most expensive/narrowest, so you never spend five
minutes on `perf` before you've spent five seconds on `uptime`.

| Order | Tool | Answers |
|---|---|---|
| 1 | `uptime` | Load average trend over 1/5/15 min — is it rising? |
| 2 | `dmesg -T` | Kernel-logged events: OOM kills, disk errors, thermal throttling |
| 3 | `vmstat 1` | Run queue (`r`), swap (`si`/`so`), CPU split (`us/sy/id/wa/st`) — the single best "where do I look next" tool |
| 4 | `mpstat -P ALL 1` | Per-CPU breakdown — catches single-core pinning an aggregate average hides |
| 5 | `top` / `htop` | Which process, interactively — go here once you know *what kind* of resource, not before |
| 6 | `iostat -xz 1` | Per-block-device utilization, queue depth, latency (`await`) |
| 7 | `sar` | Historical view of everything above — the only tool that answers "what was it doing at 3am" |
| 8 | `free -m` | Memory: used/free/available/cached, buffer/cache split |
| 9 | `ss -tulpn` / `ss -s` | Socket states, listening ports, connection-count summary |
| 10 | `dstat` | `vmstat`+`iostat`+`sar` combined in one live scrolling view — good for a first pass |
| 11 | `perf` | CPU profiling — flame graphs, which function is burning cycles |
| 12 | `strace` | Syscall-level tracing — what a specific process is actually doing (and blocking on) |
| 13 | `bpftrace` / BCC tools (`biolatency`, `execsnoop`, `tcplife`) | Kernel-level tracing with near-zero overhead — the only way to see disk I/O latency *histograms*, not just averages |

The ordering encodes a principle: cheap, wide tools first to narrow down
*which* resource, then expensive, narrow tools to find *why*. Running `perf
record` on a box that's actually swapping to death wastes time and adds
load to an already-struggling system.

The 60-second checklist condensed to a single pass:

```
uptime                          # load average trend, 1/5/15 min
dmesg -T | tail -50             # OOM kills, hardware errors, throttling
vmstat 1 5                      # r (run queue), free, si/so (swap), us/sy/id/wa/st
mpstat -P ALL 1                 # per-CPU utilization, spot single-core pinning
pidstat 1                       # per-process CPU/mem, faster than reading top
iostat -xz 1                    # per-disk %util, await, avgqu-sz
free -m                         # used/available/cached, real memory pressure
sar -n DEV 1                    # network throughput per interface
ss -s                           # socket summary, TIME_WAIT / established counts
top / htop                      # last, once you know WHERE to look
```

### Reading `vmstat` — the single most useful first command

```bash
$ vmstat 1 5
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 4  2  102400  51200  8900 512000    0    0   450  1200 3200 8500 22  8 12 55  3
 6  3  102400  48900  8900 511800    0    0   520  1350 3100 8900 20  9  9 59  3
 5  2  102400  49500  8900 512100    0    0   480  1180 3300 8600 21  8 10 58  3
```

`r` = 4-6 on (say) a 4-core box means the run queue is at or above core
count — some CPU saturation — but `wa` (iowait) at 55-59% dominates the CPU
time breakdown. That's the real signal: the CPUs are mostly idle-waiting-on-
disk, not computing. `b` (processes in uninterruptible sleep, usually disk
wait) at 2-3 confirms it. This single command already tells you: don't
profile CPU with `perf` yet — go check `iostat` first.

### Catching single-core pinning an aggregate hides

```bash
$ mpstat -P ALL 1 3
Average:     CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %idle
Average:     all    18.20    0.00    6.10   12.40    0.00    0.80    0.00   62.50
Average:       0    95.30    0.00    2.10    0.00    0.00    0.10    0.00    2.50
Average:       1     3.10    0.00    4.80   28.90    0.00    1.20    0.00   62.00
Average:       2     2.90    0.00    5.60   30.10    0.00    0.90    0.00   60.50
Average:       3     3.10    0.00    5.20   30.50    0.00    1.30    0.00   59.90
```

The `all` row looks unremarkable — 62.5% idle overall. But CPU 0 is pegged
at 95.3% user time while CPUs 1-3 sit mostly idle. This is single-core
pinning: a single-threaded process (or a lock-serialized hot path) is
maxing one core while the box *looks* fine in aggregate. `top`'s per-core
view (press `1`) or `pidstat -p <pid> 1` on the offending PID confirms which
process owns CPU 0.

### `ss -s` and connection-state triage

```bash
$ ss -s
Total: 812 (kernel 0)
TCP:   45210 (estab 320, closed 44680, orphaned 12, timewait 44650)

Transport Total     IP        IPv6
RAW       0         0         0
UDP       15        12        3
TCP       530       480       50
```

44,650 sockets in `TIME_WAIT` against only 320 `ESTABLISHED` is the
signature of extremely short-lived connections — each request opening a
fresh TCP connection instead of reusing one (missing HTTP keep-alive, or a
client library recreating connections per call). This isn't network
*saturation* in the USE sense — bandwidth and latency are probably fine —
it's ephemeral port exhaustion risk: with a default range of ~28,000 ports
(`net.ipv4.ip_local_port_range`), 44K churning `TIME_WAIT` sockets can
exceed available ports and start causing `EADDRNOTAVAIL` connection
failures that look exactly like "the network is down."

### `bpftrace`/BCC `biolatency` — a latency histogram, not just an average

```bash
$ sudo biolatency 5 1
Tracing block device I/O... Hit Ctrl-C to end.

     usecs               : count     distribution
         0 -> 1          : 0        |                                        |
       512 -> 1023       : 4        |                                        |
      1024 -> 2047       : 8210     |****************************************|
      2048 -> 4095       : 1340     |******                                  |
      4096 -> 8191       : 90       |                                        |
      8192 -> 16383      : 3        |                                        |
     16384 -> 32767      : 240     |*                                       |
```

`iostat`'s `await` would report a single averaged number (say, 2.1ms) that
looks perfectly healthy. The histogram shows the real picture: the bulk of
I/O completes in 1-2ms (fine), but there's a distinct secondary cluster at
16-32ms — a bimodal distribution `iostat` cannot show. That tail is very
likely what's producing intermittent p99 latency spikes in the application
even though the *average* disk latency looks great. Averages and even
`avgqu-sz` hide multi-modal distributions that histograms expose directly,
with negligible tracing overhead compared to `strace -T`, which serializes
and slows the traced process significantly.

---

## 3. CPU Performance

- **Load average**: the number of processes in the `R` (running) or `D`
  (uninterruptible sleep, usually I/O wait) state, exponentially averaged
  over 1/5/15 minutes. Critically, **load average is not "CPU busy" — it
  includes processes blocked on disk I/O** — which is why a load average of
  40 on an 8-core box with idle CPUs almost always means disk saturation,
  not CPU saturation. Compare load average to core count, not to 1.0.
- **Run queue** (`vmstat`'s `r` column): processes currently runnable and
  waiting for a CPU. This is the direct saturation signal for CPU — `r`
  consistently greater than core count means processes are queuing for CPU
  time.
- **Context switches** (`vmstat`'s `cs`, or `pidstat -w`): high context-
  switch rates cost real cycles in cache invalidation and scheduler
  overhead. A sudden jump usually means either a thundering-herd of woken
  processes, excessive locking/contention, or a misconfigured thread pool
  spinning far more workers than cores.
- **Steal time** (`%st` in `vmstat`/`top`, or `mpstat`): only meaningful on
  VMs. It's the percentage of time your VM's vCPU wanted to run but the
  hypervisor gave the physical core to a different tenant instead. Nonzero,
  sustained steal means you're CPU-starved by the platform, not your
  workload — no amount of in-VM tuning fixes it; you need a bigger instance
  type, a dedicated/reserved host, or to escalate the noisy-neighbor issue.

Quick read: load average sustained above core count → CPU or run-queue
saturated. `%st` > 0 on a VM → the hypervisor is starving you, not your
app. `%wa` (iowait) high → CPU idle waiting on disk, not a CPU problem at
all — don't reach for `perf` here.

---

## 4. Memory Performance

- **Used vs. available vs. cached**: `free -m`'s `used` column is nearly
  meaningless in isolation — Linux aggressively uses spare RAM for page
  cache, which shows as "used" but is instantly reclaimable. The number
  that matters is `available` (the kernel's own estimate of memory that can
  be given to a new allocation without swapping), not `free`.
- **Page faults**: minor faults (page not mapped but present in RAM, e.g.
  copy-on-write) are cheap and normal at high volume. Major faults (page
  must be read from disk/swap) are expensive and, at volume, indicate the
  working set doesn't fit in RAM. `sar -B` or `/proc/vmstat`'s
  `pgmajfault` track this.
- **Swapping**: `si`/`so` (swap in/out) in `vmstat`, nonzero and sustained,
  means the kernel is actively paging anonymous memory to disk because RAM
  is full — every touch of a swapped page now costs a disk I/O. This is one
  of the most severe performance cliffs in Linux: latency can jump
  100-1000x for the affected process.
- **OOM killer**: when memory (including swap) is exhausted, the kernel's
  OOM killer selects and `SIGKILL`s a process based on an `oom_score`
  (roughly: highest memory usage, adjusted by `oom_score_adj`). Always
  check `dmesg | grep -i "killed process"` after an unexplained process
  death — the process's own logs will show nothing, because it was killed
  externally with no chance to log. In containers, an OOM kill inside a
  cgroup memory limit can happen while the *host* still has plenty of free
  RAM — check `docker inspect` / cgroup `memory.max` in addition to
  host-level `free`.

Quick read: `free`'s "available" (not "free") is the real number to watch.
`si`/`so` nonzero and sustained → real memory pressure. `MemAvailable` near
zero plus an OOM entry in `dmesg` → the OOM killer has already fired.

**Common misread**:

```bash
# "Only 51MB free, we're almost out of memory!" — wrong read
$ free -m
              total        used        free      shared  buff/cache   available
Mem:          16034       11200          51         210        4783       9600
```

`available` (9600MB) accounts for reclaimable cache — the system can
comfortably serve a 9GB allocation without swapping. `free` is near-zero by
design: Linux uses spare RAM for page cache rather than leaving it idle.

---

## 5. Disk I/O Performance

- **IOPS vs. throughput vs. latency**: three different numbers that can
  each be the bottleneck independently. IOPS (operations/sec) matters for
  small random I/O (databases). Throughput (MB/s) matters for large
  sequential I/O (backups, streaming reads). Latency (time per operation)
  is what the *application* actually feels — high IOPS with high latency is
  still a slow disk from the app's point of view.
- **Queue depth** (`iostat`'s `avgqu-sz`, or `aqu-sz` on newer `sysstat`):
  number of I/O requests queued at the device, waiting to be serviced.
  Sustained queue depth > 1 with high `%util` is the saturation signal —
  the device can't drain requests as fast as they arrive.
- **`await`**: average time (ms) an I/O request spends in the device queue
  *plus* actual service time. Compare `await` to `svctm` (pure service
  time, deprecated in newer `iostat` but conceptually still useful): if
  `await >> svctm`, requests are spending most of their time waiting in
  queue, not being serviced — that's saturation, not raw device slowness.
- **`%util`** is deceptively named: it's percent of time the device had at
  least one I/O outstanding, not percent of *capacity* used. An NVMe SSD
  easily handling thousands of parallel IOPS can show 100% `%util` while
  nowhere near saturated, because it's rarely fully idle. Never trust
  `%util` alone — always cross-check with `avgqu-sz` and `await`.

Quick read: `await >> svctm` and `avgqu-sz > 1` sustained → disk saturated,
not just busy. `%util` near 100% with low IOPS → sequential large I/O or a
single-queue bottleneck, not necessarily saturation.

### Diagnosing disk saturation vs. raw slowness

```bash
$ iostat -xz 1 3
Device            r/s     w/s   rkB/s   wkB/s  avgqu-sz   await  svctm  %util
nvme0n1          12.00  850.00   96.00 42500.00     18.40   21.60   0.85  98.00
```

`%util` at 98% alone would suggest "disk is the bottleneck, done." But
confirm with saturation, not just utilization: `avgqu-sz` of 18.4 means, on
average, 18 I/O requests are queued waiting — real saturation, this isn't a
false-positive `%util` reading. `await` (21.6ms) vs. `svctm` (0.85ms) shows
requests spend ~25x longer waiting in queue than being serviced — the
device itself is fast, the *arrival rate* of writes (`w/s` 850, `wkB/s`
42.5MB/s) exceeds what it can drain. The fix is to reduce write volume
(batching, write-back tuning) or add IOPS capacity, not to "make the disk
faster" in the abstract.

**Common misread**: `%util` at 100% is not automatically "disk is maxed
out." Cross-check first:

```bash
$ iostat -xz 1
Device    avgqu-sz   await   svctm   %util
nvme0n1   0.90       0.40    0.35    100.00
```

`avgqu-sz` ~1, `await` ≈ `svctm` → the device is simply never idle
(constant low-level traffic), not actually saturated. A fast NVMe can show
100% `%util` at low load.

---

## 6. Network Performance

- **Bandwidth vs. latency**: bandwidth (Mbps/Gbps, `sar -n DEV`) is
  throughput capacity; latency (RTT, `ping`, or app-level timing) is delay
  per packet. A saturated link shows both dropped throughput and, often,
  secondary latency increases from queuing (bufferbloat) — but a link can
  have plenty of spare bandwidth and still have bad latency (routing,
  distance, congestion elsewhere).
- **Retransmits**: `netstat -s | grep -i retrans` or `ss -i` (per-socket).
  TCP retransmits mean packet loss somewhere in the path — the *symptom* of
  network saturation or a flaky link, not the cause. Climbing retransmit
  counts under load is one of the clearest USE "Errors" signals for the
  network resource.
- **Connection states** (`ss -tan state <state>` or `ss -s` for a
  summary): `ESTABLISHED` count tells you live connections; a `TIME_WAIT`
  explosion usually means very short-lived connections churning (often a
  missing connection pool or keep-alive misconfiguration) rather than a
  resource-saturation problem — it can exhaust ephemeral ports, though,
  which then *looks* like a network outage (see the `ss -s` example in
  Section 2).

Quick read: retransmits climbing (`netstat -s` / `ss -i`) → packet loss,
not bandwidth exhaustion. A `TIME_WAIT` explosion → churny short-lived
connections, not saturation.

---

## 7. Worked Example: Diagnosing "The Server Is Slow"

A ticket comes in: "checkout-api-07 is slow, customers are timing out." No
other detail. Walk USE, resource by resource, in the standard toolkit
order from Section 2.

### Step 1 — `uptime`: is load rising, and relative to what?

```bash
$ uptime
 14:32:01 up 41 days,  3:12,  2 users,  load average: 38.42, 31.10, 22.85
$ nproc
8
```

Load average of 38 on an 8-core box, and climbing over the 15-minute window
(22.85 → 38.42). Load is not just high, it's actively getting worse.
Reasoning: load this far above core count almost never means "CPU is just
busy" — that would cap out near core count for pure CPU-bound load. This
smells like processes stuck in `D` state (disk wait).

### Step 2 — `dmesg -T`: any kernel-level red flags first?

```bash
$ dmesg -T | tail -20
[Fri Aug 14 14:10:03 2026] nvme0n1: I/O timeout, aborting
[Fri Aug 14 14:10:03 2026] nvme0n1: I/O timeout, aborting
[Fri Aug 14 14:11:47 2026] EXT4-fs warning: ext4_dirty_inode:...
```

I/O timeouts on the NVMe device, twice, in the last 22 minutes. This is now
a strong, confirmed lead — not a hypothesis. Continue down the checklist to
*quantify* the disk problem rather than stopping here.

### Step 3 — `vmstat 1 5`: confirm the D-state / iowait hypothesis

```bash
$ vmstat 1 5
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2 28  204800  38900  7100 480200    0    0   340  8900 2100 4200  4  3  8 84  1
 1 31  204800  37200  7100 479800    0    0   310  9100 2050 4100  3  3  6 87  1
```

`b` (uninterruptible sleep — disk wait) at 28-31 processes, `wa` at
84-87%. This confirms it decisively: the vast majority of CPU time is spent
idle-waiting-on-I/O, and dozens of processes are blocked, not running. `r`
(runnable) is only 1-2 — CPU itself is not the bottleneck; disk is.
`si`/`so` are 0, so this isn't swapping either — ruling out memory pressure
as the *proximate* cause.

### Step 4 — `iostat -xz 1`: quantify disk saturation and find the offending device

```bash
$ iostat -xz 1 3
Device            r/s     w/s   rkB/s   wkB/s  avgqu-sz   await  svctm  %util
nvme0n1          420.0   180.0  6800.0  4200.0    64.20  312.40   1.60  100.00
```

`%util` 100%, `avgqu-sz` 64 (very high — dozens of I/Os backed up), `await`
312ms against `svctm` 1.6ms — requests spend essentially all their time
queued, almost none being serviced. This is unambiguous disk saturation.
Combined with the `dmesg` I/O timeouts from Step 2, the disk itself may be
degrading (a failing NVMe, or a backing EBS volume that's been
burst-credit-throttled).

### Step 5 — `pidstat -d 1`: which process is driving the I/O

```bash
$ pidstat -d 1 3
14:33:10   UID       PID   kB_rd/s   kB_wr/s  kB_ccwr/s  Command
14:33:10  1000      4821   6720.00      0.00       0.00  postgres
14:33:10  1000      4822     40.00     20.00       0.00  postgres
```

One `postgres` worker (PID 4821) is responsible for nearly all the read I/O
(6.7MB/s vs. ~40KB/s for the next process). Cross-referencing with the
query log / `pg_stat_activity`, the likely candidate is a missing index
forcing a sequential scan, or a batch job that shouldn't be running against
production during business hours.

### Conclusion — why the method mattered

Total elapsed diagnostic time: five commands. USE eliminated CPU (Step 3:
`r` low, `us`/`sy` low) and memory (Step 3: `si`/`so` zero) as candidates
within the first two data-gathering steps, and pointed straight at disk,
which Step 4 confirmed and quantified, and Step 5 attributed to a specific
process. Nobody ran `perf record`, nobody eyeballed `top` hoping to spot
the culprit — the checklist order did the narrowing.

---

## 8. Common Mistakes

- **Judging service health from average latency instead of percentiles.**
  `p50: 12ms  p95: 38ms  p99: 2400ms  avg: 45ms` looks fine at a glance —
  the average is dragged low by the bulk of fast requests, but the p99 of
  2.4 seconds is what's actually timing out customers and generating the
  ticket. Always alert on a percentile (commonly p99 or p95), never the
  mean.
- **Chasing a high load average in `top`, sorted by CPU%, when the load is
  driven by disk-wait (`D` state) processes.** `top -o %CPU` shows every
  process under 5% CPU because they're blocked on I/O, not running — the
  wrong instinct is to conclude "load average must be lying" or restart
  random services. The correct move is `ps -eo pid,stat,comm | awk '$2 ~
  /D/'` to see which processes are actually in `D` state, then go straight
  to `iostat`.
- **Restarting the process/host to "fix" the slowness without ever
  identifying the saturated resource.** This clears symptoms temporarily
  (queues drain, caches reset) without touching the cause, guaranteeing
  recurrence — and destroys the evidence (queue depth, process state,
  in-flight connections) needed to actually diagnose it. Always capture the
  USE data (`vmstat`, `iostat`, `dmesg`, `ss -s`) *before* restarting
  anything, even under incident pressure.

---

## 9. Advanced Usage

**Per-NUMA-node resource analysis.** On multi-socket hosts, aggregate
CPU/memory numbers can hide a NUMA imbalance — a process pinned to node 0
competing for memory bandwidth while node 1 sits idle. `numastat`,
`numactl --hardware`, and `perf stat -e node-load-misses` expose this; the
fix is often CPU/memory pinning (`numactl --cpunodebind`/`--membind`)
rather than adding more total RAM or cores.

**Flame graphs from `perf` for CPU-bound bottlenecks.** Once USE points at
CPU (not disk/memory/network), `perf record -F 99 -a -g -- sleep 30`
followed by Brendan Gregg's `stackcollapse-perf.pl` + `flamegraph.pl` (or
`perf script report flamegraph`) turns a raw call-stack sample into a
visual, width-proportional-to-time-spent graph — the fastest way to spot
which function is actually burning cycles versus which one just *looks*
suspicious in isolated profiling.

**`bpftrace` one-liners for questions no standard tool answers directly.**
e.g. latency of a specific syscall, or which process is opening the most
files:

```bash
# Histogram of read() syscall latency in nanoseconds, system-wide
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; }
tracepoint:syscalls:sys_exit_read /@start[tid]/ {
  @us[comm] = hist(nsecs - @start[tid]); delete(@start[tid]); }'
```

This is the class of tool that answers "which specific process/syscall pair
is slow" when `iostat`/`vmstat`'s system-wide aggregates aren't granular
enough — with far lower overhead than `strace -T`, which serializes and
slows the traced process significantly.

**Correlating USE saturation events with RED latency spikes on a shared
timeline.** In practice this means feeding `sar` (or node_exporter +
Prometheus) metrics and application latency histograms into the same
dashboard/timestamp axis — the goal is to answer "did disk `await` spike
*before* p99 latency spiked" (causal) versus "did they spike together"
(correlated, investigate a shared cause) versus "latency spiked with no
resource saturation at all" (application-level problem: lock contention,
GC pause, slow downstream dependency — USE won't find this, since nothing
is short on hardware).

**Setting saturation-based alerting thresholds instead of static
utilization thresholds.** Alerting on "CPU > 80%" alone produces both false
positives (steady 85% CPU with an empty run queue is fine) and false
negatives (bursty saturation that a 1-minute average smooths over).
Alerting on run-queue length relative to core count, or on `avgqu-sz`
sustained over N seconds, tracks the actual USE saturation signal and pages
far closer to when users are actually affected.

---

## 10. Interview-Ready Q&A

**Q: What's the difference between the USE Method and the RED Method, and
when would you use each?**
A: USE (Utilization, Saturation, Errors) checks physical resources — CPU,
memory, disk, network — for whether each one is a bottleneck. RED (Rate,
Errors, Duration) checks services/request paths for whether users are
actually being impacted. They answer different questions: RED tells you
customers are seeing high p99 latency; USE tells you *why* — e.g. disk
`await` climbed to 300ms on the backing database node. In practice you run
both — RED as the alerting/detection layer, USE as the diagnostic layer
once RED says something's wrong.

**Q: Why is saturation, not utilization, the real bottleneck signal?**
A: A resource can sit at 100% utilization and be perfectly healthy — fully
but efficiently busy, like a fast NVMe disk that's rarely idle even at low
load. Saturation — queued or waiting work, shown by `avgqu-sz`, the run
queue `r`, or a `TIME_WAIT` backlog — is what tells you requests are piling
up faster than the resource can drain them, which is what actually
translates into rising latency for every consumer of that resource.

**Q: A load average of 40 on an 8-core box, but CPUs are mostly idle in
`top`. What's going on?**
A: Load average counts processes in the `R` (runnable) *and* `D`
(uninterruptible sleep, usually disk wait) states — it is not a pure CPU
metric. A load average far above core count with low `us`/`sy` in `vmstat`
means processes are blocked on I/O, not competing for CPU. Confirm with
`vmstat`'s `b` column or `ps -eo pid,stat,comm | awk '$2 ~ /D/'`, then move
straight to `iostat` rather than a CPU profiler.

**Q: `iostat` shows a disk at 100% `%util`. Is it saturated?**
A: Not necessarily — `%util` measures percent of time the device had at
least one I/O outstanding, not percent of capacity used. A fast NVMe
handling thousands of parallel IOPS can show 100% `%util` while nowhere
near saturated because it's rarely fully idle. Confirm actual saturation by
cross-checking `avgqu-sz` (queue depth > 1 sustained) and comparing `await`
to `svctm` — if `await` is many times `svctm`, requests are waiting in
queue, not just being serviced, and that's the real saturation signal.

**Q: Why should you always look at latency percentiles instead of the
average?**
A: Averages are dragged down by the bulk of fast requests and hide the tail
that's actually causing pain — a service can show `avg: 45ms` while `p99:
2400ms`, meaning 1% of requests are timing users out even though the
average looks perfectly healthy. Alerting/paging should be based on a
percentile (commonly p99 or p95), because that's what correlates with
actual user-visible failures.

**Q: What does nonzero "steal time" (`%st`) mean, and how do you fix it?**
A: Steal time is only meaningful on VMs — it's the percentage of time your
vCPU wanted to run but the hypervisor scheduled a different tenant's vCPU
onto the physical core instead. Sustained nonzero steal means you're
CPU-starved by the platform itself, not your workload, so no amount of
in-guest tuning (thread pool sizing, code optimization) fixes it — you need
a bigger/dedicated instance type or to address the noisy-neighbor problem
at the infrastructure level.

**Q: Why does `free`'s "free" column often look alarmingly low even on a
healthy system?**
A: Linux aggressively uses otherwise-idle RAM for page cache, which shows
up as "used" memory but is instantly reclaimable the moment an application
needs it. The number that actually matters is `available` — the kernel's
own estimate of memory it can hand to a new allocation without swapping.
Watching "free" instead of "available" is a common cause of false memory-
pressure alarms.

**Q: Walk through how you'd diagnose "the server is slow" with no other
information, purely using USE.**
A: Start cheap and broad, narrow down: `uptime` to see if load is high and
rising relative to core count; `dmesg -T` for kernel-level red flags (OOM
kills, I/O timeouts); `vmstat 1` to split CPU time into user/system/iowait
and check the run queue (`r`) versus blocked processes (`b`); if `wa` is
high and `b` is nonzero, go straight to `iostat -xz` to quantify disk
saturation (`avgqu-sz`, `await` vs. `svctm`); then `pidstat -d` to find the
specific process driving the I/O. Only reach for `perf`/`strace`/`bpftrace`
once USE has pointed at a specific resource — running a profiler before
narrowing down the resource wastes time and adds load to an already
struggling system.

**Q: Why is running `perf record` immediately, before checking `vmstat` or
`iostat`, usually the wrong first move?**
A: `perf` is a CPU profiler — it only helps once you've established that
CPU, specifically, is the bottleneck. If the real problem is disk
saturation or swapping, `perf` burns diagnostic time profiling the wrong
resource and adds extra load (sampling overhead) to a system that's already
struggling. The standard toolkit order exists precisely so cheap, wide
tools (`uptime`, `vmstat`, `mpstat`) rule resources in or out before
reaching for expensive, narrow tools like `perf`, `strace`, or `bpftrace`.

---

## 11. One-Line Summary

**System performance diagnosis is USE (Utilization, Saturation, Errors) run
resource-by-resource in cheap-to-expensive tool order — uptime, vmstat,
mpstat, iostat before perf, strace, bpftrace — paired with RED (Rate,
Errors, Duration) to confirm the resource you found actually explains the
user-visible pain.**
