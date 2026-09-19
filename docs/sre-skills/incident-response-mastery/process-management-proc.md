---
title: "Process Management & /proc"
description: "Command-level and conceptual mastery of Linux process debugging via CLI and /proc — lifecycle, ps/top/kill, decision trees, deep scenarios, and interview Q&A."
sidebar_position: 7
tags: [linux, sre, process, proc-filesystem, ps, top, kill, zombie, troubleshooting]
---

A clean, SRE-focused mental model for debugging a slow or stuck service using only the CLI.

## Table of Contents

1. [Process Lifecycle Concepts](#-process-lifecycle-concepts)
2. [Core Process Commands](#-core-process-commands)
3. [/proc Filesystem](#-proc-filesystem-real-gold-for-sres)
4. [Real Interview-Style Debug Flow](#-real-interview-style-debug-flow)
5. [Troubleshooting Decision Tree](#-linux-service-troubleshooting-decision-tree-cli-only)
6. [Deep Troubleshooting Scenarios](#-deep-troubleshooting-scenarios-interview-level)
7. [Interview Q&A](#-interview-qa)

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 320" role="img" aria-labelledby="mm-procproc-title mm-procproc-desc">
<title id="mm-procproc-title">Branching triage for a stuck or slow process</title>
<desc id="mm-procproc-desc">A slow or stuck service is triaged down one of three branches — zombie, blocked-but-alive, or resource-starved — all of which get confirmed through /proc before deciding whether to restart, kill, or tune it.</desc>
<defs>
  <marker id="mm-procproc-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="290" y="10" width="200" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="30" text-anchor="middle">Service Acting Slow</text>
<text class="mm-node-sub" x="390" y="45" text-anchor="middle">or unresponsive</text>

<path class="mm-arrow" d="M340,60 L115,96" marker-end="url(#mm-procproc-arrow)"/>
<path class="mm-arrow" d="M390,60 L390,96" marker-end="url(#mm-procproc-arrow)"/>
<path class="mm-arrow" d="M440,60 L665,96" marker-end="url(#mm-procproc-arrow)"/>

<rect class="mm-n2" x="20" y="96" width="190" height="60" rx="10"/>
<text class="mm-node-title" x="115" y="122" text-anchor="middle">Zombie / defunct?</text>
<text class="mm-node-sub" x="115" y="138" text-anchor="middle">ps shows Z state</text>

<rect class="mm-n3" x="295" y="96" width="190" height="60" rx="10"/>
<text class="mm-node-title" x="390" y="122" text-anchor="middle">Alive but stuck?</text>
<text class="mm-node-sub" x="390" y="138" text-anchor="middle">blocked on I/O or lock</text>

<rect class="mm-n4" x="570" y="96" width="190" height="60" rx="10"/>
<text class="mm-node-title" x="665" y="122" text-anchor="middle">Resource starved?</text>
<text class="mm-node-sub" x="665" y="138" text-anchor="middle">CPU / memory / FDs</text>

<path class="mm-arrow" d="M115,156 L340,186" marker-end="url(#mm-procproc-arrow)"/>
<path class="mm-arrow" d="M390,156 L390,186" marker-end="url(#mm-procproc-arrow)"/>
<path class="mm-arrow" d="M665,156 L440,186" marker-end="url(#mm-procproc-arrow)"/>

<rect class="mm-n5" x="280" y="186" width="220" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="206" text-anchor="middle">/proc Inspection</text>
<text class="mm-node-sub" x="390" y="221" text-anchor="middle">status, fd, stack</text>

<path class="mm-arrow" d="M390,236 L390,256" marker-end="url(#mm-procproc-arrow)"/>

<rect class="mm-n6" x="260" y="256" width="260" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="276" text-anchor="middle">Act: Restart, Kill, or Tune</text>
<text class="mm-node-sub" x="390" y="291" text-anchor="middle">based on the confirmed cause</text>
</svg>

<p class="mental-model__caption">A slow or stuck service gets triaged down one of three branches — zombie/defunct, alive but blocked, or resource-starved — and every branch gets confirmed through /proc before you decide whether to restart the parent, kill the process, or tune the resource it's starved of.</p>
</div>

## 🔹 Process Lifecycle Concepts

### PID / PPID
- **PID** → unique process ID
- **PPID** → parent process ID (who started it)

👉 Helps trace process trees and restart chains.

### Zombie Process
- Process finished execution but the parent didn't read its exit status.
- Shows as `Z` in `ps`.
- Not consuming CPU, but leaks process table entries.
- **Fix** → restart the parent or handle `wait()` properly.

### Orphan Process
- Parent dies → child adopted by PID 1 (systemd).
- Usually harmless unless logic depends on the parent.

### Daemon
- Background service (no terminal), e.g. web server, DB.
- Starts at boot, long-running, often managed by systemd.

---

## 🔹 Core Process Commands

### `ps aux`
Snapshot of all processes. Key columns: `USER PID %CPU %MEM STAT COMMAND`

```bash
ps aux --sort=-%cpu | head
```

### `top`
Real-time CPU/memory usage. Useful keys: `P` sort by CPU, `M` sort by memory, `k` kill process.

### `htop`
Improved interactive `top`. Tree view, mouse support, easy kill.

### `atop`
Advanced system monitor. Shows disk, network, memory, per-process history.
👉 Great for post-incident analysis.

### `pstree`
Visual parent-child relationship.
```bash
pstree -p
```

### `nice` / `renice`
Control CPU priority. Range: `-20` (highest priority) → `19` (lowest).
```bash
nice -n 10 myscript.sh
renice 5 -p 1234
```

### `kill` / `killall`
Send signals to processes.
```bash
kill -15 PID   # graceful stop
kill -9 PID    # force kill
killall nginx  # by name
```

### `pgrep`
Find PID by process name.
```bash
pgrep -fl java
```

---

## 🔹 /proc Filesystem (Real Gold for SREs)

Linux exposes live process internals here.

### `/proc/<pid>/status`
Human-readable metadata: state, memory usage, threads, parent, signals.

### `/proc/<pid>/limits`
Resource limits: max open files, max processes, memory limits.
👉 Crucial when a service crashes under load.

### `/proc/<pid>/fd`
All open file descriptors (files, sockets, pipes).
```bash
ls -l /proc/1234/fd
```
👉 Detect file leaks or stuck network connections.

---

## 🔹 Real Interview-Style Debug Flow

If a service is slow:

**1️⃣ Find the process**
```bash
pgrep -fl service_name
```

**2️⃣ Check CPU/memory**
```bash
top -p PID
```

**3️⃣ Inspect parent + threads**
```bash
pstree -p PID
cat /proc/PID/status
```

**4️⃣ Check resource exhaustion**
```bash
cat /proc/PID/limits
ls /proc/PID/fd | wc -l
```

**5️⃣ Lower priority or restart safely**
```bash
renice 10 -p PID
kill -15 PID
```

---

## 🌳 Linux Service Troubleshooting Decision Tree (CLI Only)

### 1️⃣ Service is DOWN

**Step 1 — Is process running?**
```bash
pgrep -fl service_name
ps aux | grep service_name
```
➡ Not running → check logs + restart. ➡ Running → go deeper.

**Step 2 — Check parent + restart loop**
```bash
pstree -p <PID>
```
➡ Rapid respawns → crash loop. ➡ No parent supervision → config issue.

**Step 3 — Check logs**
```bash
tail -f /var/log/service.log
```

### 2️⃣ Service is SLOW

**CPU high?**
```bash
top -p <PID>
```
➡ Yes → CPU bottleneck. ➡ No → check memory / I/O / limits.

**Memory issue?**
```bash
cat /proc/<PID>/status | grep Vm
```

**File descriptor exhaustion?**
```bash
ls /proc/<PID>/fd | wc -l
cat /proc/<PID>/limits
```

**Thread explosion?**
```bash
ps -T -p <PID>
```

### 3️⃣ Service NOT STOPPING

**Check process state**
```bash
ps -o pid,state,cmd -p <PID>
```
- `D` → uninterruptible I/O wait
- `Z` → zombie
- `R` → CPU loop

➡ Try graceful kill → force kill if safe.

### 4️⃣ System Resource Exhaustion

```bash
ps aux | wc -l              # too many processes
ls /proc/<PID>/fd           # open file leak
uptime                      # load spike
```

---

## 🧠 Deep Troubleshooting Scenarios (Interview-Level)

### ✅ Scenario 1: High CPU, Service Not Responding
**Symptoms**: 100% CPU, requests timing out.
**Approach**: identify culprit process → check thread usage → inspect parent and restart behavior.
```bash
top
ps -T -p <PID>
pstree -p <PID>
```
**Answer Logic**: Likely an infinite loop, retry storm, or heavy computation thread. Mitigate by reducing workers, `renice`, or restart.

### ✅ Scenario 2: Service Slow, CPU Low, Memory Normal
**Symptoms**: latency high, CPU idle.
**Approach**: check blocking resources.
```bash
ls /proc/<PID>/fd | wc -l
cat /proc/<PID>/limits
ps -o state,pid,cmd -p <PID>
```
**Answer Logic**: Most likely I/O wait, file descriptor exhaustion, or external dependency slowness.

### ✅ Scenario 3: Service Randomly Crashes Under Load
**Approach**: check resource limits.
```bash
cat /proc/<PID>/limits
dmesg | tail
```
**Answer Logic**: Common causes — too many open files, memory limit exceeded, OOM killer. Mitigation: increase `ulimit`, optimize resource usage.

### ✅ Scenario 4: Many Zombie Processes
```bash
ps aux | grep Z
pstree -p
```
**Answer Logic**: Parent not collecting exit status → bug in process management. Restart the parent service.

### ✅ Scenario 5: System Suddenly Slow
```bash
uptime
top
ps aux --sort=-%mem | head
```
**Answer Logic**: Check load average vs CPU cores → if load >> cores → resource saturation (CPU, disk, or lock contention).

### ✅ Scenario 6: Cannot Kill Process
```bash
ps -o pid,state,cmd -p <PID>
```
**Answer Logic**: If state = `D` → stuck in kernel I/O → only reboot or fix the underlying disk/network issue resolves it.

---

## 🎯 SRE Interview Golden Line

> "When troubleshooting, I first identify whether the issue is CPU, memory, I/O, or limits related. Then I inspect process state via `/proc` and validate parent-child relationships before taking corrective action."

That sentence alone signals SRE maturity.

---

## 🎯 Interview Q&A

### Process Lifecycle

**Q1. What is PID and PPID? Why important?**
PID uniquely identifies a process. PPID shows its parent. Used to trace service spawning, crashes, and supervision trees.

**Q2. What is a zombie process?**
Completed process whose parent hasn't read exit status. State = `Z`. Fix by restarting the parent or correcting `wait()` handling.

**Q3. What is an orphan process?**
Parent dies → child adopted by init/system manager. Usually safe but indicates parent failure.

**Q4. What is a daemon?**
Background long-running service detached from a terminal (e.g. web server). Starts at boot and handles system tasks.

### Commands

**Q5. Difference between `ps`, `top`, `htop`?**
- `ps` → static snapshot
- `top` → real-time monitoring
- `htop` → interactive, tree view, easier control

**Q6. How do you find top CPU-consuming processes?**
```bash
ps aux --sort=-%cpu | head
top
```

**Q7. How do you change process priority?**
Start with `nice`, modify using `renice`.

**Q8. SIGTERM vs SIGKILL?**
- `15` → graceful shutdown
- `9` → force kill, no cleanup

**Q9. How to kill by name instead of PID?**
```bash
killall process_name
pkill process_name
```

**Q10. How to find a process PID quickly?**
```bash
pgrep -fl process_name
```

**Q11. Why use `pstree`?**
To visualize parent-child hierarchy and detect runaway forks.

### /proc Filesystem

**Q12. What is `/proc` in Linux?**
Virtual filesystem exposing real-time kernel and process data.

**Q13. What can you check in `/proc/<pid>/status`?**
Process state, memory, threads, signals, parent PID.

**Q14. Why check `/proc/<pid>/limits`?**
To diagnose crashes due to file descriptor or resource limits.

**Q15. What is `/proc/<pid>/fd` used for?**
Lists open files/sockets → helps detect leaks or connection exhaustion.

### Scenario-Based (Most Important for SRE3)

**Q16. Service is slow but CPU low. What do you check?**
Open files, memory usage, threads, blocked I/O, limits.

**Q17. Service not stopping after kill?**
Check state via `ps`. If uninterruptible sleep → I/O wait. Use `SIGKILL` only if safe.

**Q18. Too many processes created suddenly. Why?**
Fork bomb, retry loop, crash loop, misconfigured worker pool.

**Q19. System running out of file descriptors. How to confirm?**
Check `/proc/<pid>/limits` and count `/proc/<pid>/fd`.

**Q20. First 5 commands when a Linux service hangs?**
`top`, `ps aux`, `pstree`, `lsof` (or `fd`), check `/proc`.

---

## Summary

- 💡 A running process is not a healthy process — always check state (`D`/`Z`/`R`), not just existence.
- 🔥 `/proc/<pid>/limits` + `/proc/<pid>/fd` is the fastest way to confirm FD exhaustion before it becomes an outage.
- ⚠️ State `D` (uninterruptible I/O wait) cannot be killed with `SIGKILL` — you must fix the underlying disk/network issue.
- ✅ Zombies are fixed by fixing the parent process, never the zombie itself.

## See Also

- [Filesystem & Storage Playbook](./filesystem-storage-playbook) — the deleted-file-still-open and disk-full scenarios referenced above
- [Linux Kernel Fundamentals](./linux-kernel-fundamentals) — system calls, context switching, and `fork()`/`exec()` internals
- [Incident Simulation Labs](./incident-simulation-labs) — hands-on labs for zombies, FD leaks, and CPU hogs
- [Linux Debugging Reference](./linux-debugging-reference) — where process management fits in the full toolset
