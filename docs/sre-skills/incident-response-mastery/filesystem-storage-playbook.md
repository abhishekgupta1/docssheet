---
title: "Filesystem & Storage Playbook"
description: "Deep filesystem, storage, and disk-incident debugging knowledge for production SRE work — FHS, inodes, LVM, RAID, permissions, and a full storage incident debugging playbook."
sidebar_position: 8
tags: [linux, sre, filesystem, storage, inodes, lvm, raid, permissions, disk-full]
---

From an SRE perspective, filesystem & storage knowledge is not theoretical. It directly impacts:

- **Availability** (disk full → outage)
- **Performance** (I/O bottlenecks)
- **Security** (wrong permissions → breach)
- **Scalability** (poor volume planning → incidents)
- **Recovery** (RAID/LVM mismanagement → data loss)

## Table of Contents

1. [Filesystem Hierarchy Standard](#1-filesystem-hierarchy-standard-fhs--why-sres-care)
2. [Filesystem Commands](#2-filesystem-commands-sre-operational-toolkit)
3. [Inodes — Silent Production Killer](#3-inodes--silent-production-killer)
4. [LVM](#4-lvm-logical-volume-manager)
5. [RAID Concepts](#5-raid-concepts-redundancy--reliability)
6. [File Permissions](#6-file-permissions--security--stability)
7. [Special Bits](#7-special-bits-advanced-sre-knowledge)
8. [umask](#8-umask)
9. [ACLs](#9-acls-access-control-lists)
10. [Real SRE Incident Scenarios](#-real-sre-incident-scenarios)
11. [Storage Incident Debugging Playbook](#-sre-storage-incident-debugging-playbook)
12. [Senior SRE Storage Checklist](#-senior-sre-storage-checklist)

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 240" role="img" aria-labelledby="mm-fsplaybook-title mm-fsplaybook-desc">
<title id="mm-fsplaybook-title">Five ways filesystem knowledge shows up as SRE risk</title>
<desc id="mm-fsplaybook-desc">Filesystem and storage knowledge fans out into five production concerns: availability, performance, security, scalability, and recovery.</desc>
<defs>
  <marker id="mm-fsplaybook-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="290" y="16" width="200" height="56" rx="10"/>
<text class="mm-node-title" x="390" y="40" text-anchor="middle">Filesystem &amp; Storage</text>
<text class="mm-node-sub" x="390" y="56" text-anchor="middle">not theoretical — production risk</text>

<path class="mm-arrow" d="M330,72 L90,138" marker-end="url(#mm-fsplaybook-arrow)"/>
<path class="mm-arrow" d="M360,72 L240,138" marker-end="url(#mm-fsplaybook-arrow)"/>
<path class="mm-arrow" d="M390,72 L390,138" marker-end="url(#mm-fsplaybook-arrow)"/>
<path class="mm-arrow" d="M420,72 L540,138" marker-end="url(#mm-fsplaybook-arrow)"/>
<path class="mm-arrow" d="M450,72 L690,138" marker-end="url(#mm-fsplaybook-arrow)"/>

<rect class="mm-n2" x="20" y="138" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="90" y="166" text-anchor="middle">Availability</text>
<text class="mm-node-sub" x="90" y="182" text-anchor="middle">disk full &#8594;</text>
<text class="mm-node-sub" x="90" y="196" text-anchor="middle">outage</text>

<rect class="mm-n3" x="170" y="138" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="240" y="166" text-anchor="middle">Performance</text>
<text class="mm-node-sub" x="240" y="182" text-anchor="middle">I/O</text>
<text class="mm-node-sub" x="240" y="196" text-anchor="middle">bottlenecks</text>

<rect class="mm-n4" x="320" y="138" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="390" y="166" text-anchor="middle">Security</text>
<text class="mm-node-sub" x="390" y="182" text-anchor="middle">wrong perms &#8594;</text>
<text class="mm-node-sub" x="390" y="196" text-anchor="middle">breach</text>

<rect class="mm-n5" x="470" y="138" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="540" y="166" text-anchor="middle">Scalability</text>
<text class="mm-node-sub" x="540" y="182" text-anchor="middle">poor volume</text>
<text class="mm-node-sub" x="540" y="196" text-anchor="middle">planning</text>

<rect class="mm-n6" x="620" y="138" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="690" y="166" text-anchor="middle">Recovery</text>
<text class="mm-node-sub" x="690" y="182" text-anchor="middle">RAID/LVM</text>
<text class="mm-node-sub" x="690" y="196" text-anchor="middle">mismanaged</text>
</svg>

<p class="mental-model__caption">Filesystem and storage decisions are not theoretical for an SRE — the same underlying knowledge, from inodes to LVM to permission bits, is what determines availability, performance, security, scalability, and recovery outcomes in production.</p>
</div>

## 1. Filesystem Hierarchy Standard (FHS) — Why SREs Care

FHS defines where things live in Linux. As an SRE, this helps you debug systems fast.

### 🔹 `/etc` → Configuration
Contains system & application configs: `/etc/passwd`, `/etc/fstab`, `/etc/nginx/nginx.conf`

🔥 **SRE Impact**: misconfigured `/etc/fstab` → system won't boot. Broken service config → production outage. Configuration drift across servers → inconsistency.

🛠 **Monitor**: track config changes (GitOps, Ansible), audit sensitive file changes, backup critical configs.

### 🔹 `/var` → Logs & Changing Data
Contains `/var/log` (system & app logs), `/var/lib` (databases, app state), `/var/spool` (queues).

🔥 **Classic SRE Incident**:
```
Logs grow → /var fills → system crash
Database can't write → corruption
Kubernetes node → NotReady
```

🛠 **Monitor**: disk usage specifically on `/var`, log rotation health, alert at 70–80% usage.

### 🔹 `/proc` → Kernel & Process Info (Virtual FS)
```
/proc/cpuinfo
/proc/meminfo
/proc/<pid>/
```
Used heavily in observability tools. SRE usage: debug memory leaks, check open file descriptors, monitor process limits.

### 🔹 `/sys` → Kernel & Device Interface
Interface to kernel and hardware. Used for tuning performance and inspecting device state. Advanced SRE work (low-level tuning, containers, cgroups).

### 🔹 `/dev` → Devices
Represents disks: `/dev/sda`, `/dev/nvme0n1`

Production relevance: mounting the wrong disk = catastrophic data loss.

### 🔹 `/run` → Runtime State
Stores PID files, sockets, lock files. Temporary — cleared on reboot.

---

## 2. Filesystem Commands (SRE Operational Toolkit)

### `df -h` → Disk Free
Shows disk usage by mounted filesystem.

🚨 **Incident pattern**: filesystem 100% → application crashes.
SRE tip: always check inode usage too (see below).

### `du -sh`
Finds what's consuming space.
```bash
du -sh /var/*
```
Used during disk pressure incidents.

### `mount`, `umount`
Mount filesystems. Critical in: NFS failures, EBS volumes in cloud, Kubernetes persistent volumes.

### `lsblk`
Shows block devices hierarchy. Useful for debugging new volume attachment and verifying LVM layout.

### `blkid`
Shows filesystem type + UUID. Important for `/etc/fstab` troubleshooting and recovery after reboot failure.

### `findmnt`
Better way to see the mount tree.

---

## 3. Inodes — Silent Production Killer

### 🔹 What is an inode?
An inode stores file metadata: permissions, owner, block pointers. It is **NOT** the filename — just metadata.

### 🔥 How Inode Exhaustion Breaks Systems
You can have 0% disk usage but 100% inode usage — e.g. millions of tiny log files.

**Result**: cannot create files, applications crash, Kubernetes pods fail, email servers stop.

Check with:
```bash
df -i
```

**SRE Monitoring**: monitor inode usage %, especially for log directories, temp directories, and container systems.

---

## 4. LVM (Logical Volume Manager)

Used heavily in production. Why SREs love LVM: resize disks without downtime, flexible storage allocation, snapshot capability.

### 🔹 Key Concepts

**PV → Physical Volume** (actual disk)
```bash
pvcreate /dev/sdb
```

**VG → Volume Group** (pool of storage)
```bash
vgcreate myvg /dev/sdb
```

**LV → Logical Volume** (usable partition)
```bash
lvcreate -L 10G -n mylv myvg
```

### 🔹 Extending Volume Online (Real Incident Case)
Disk full → extend without reboot:
```bash
lvextend -L +10G /dev/myvg/mylv
resize2fs /dev/myvg/mylv
```
⚠️ If you forget `resize2fs`, the filesystem won't grow.

**SRE Best Practice**: use LVM for databases, keep root small, keep data volumes separate, monitor VG free space.

---

## 5. RAID Concepts (Redundancy & Reliability)

RAID = data redundancy or performance improvement.

### 🔹 RAID Levels

| Level | Purpose | SRE View |
|---|---|---|
| RAID 0 | Performance | ❌ No redundancy |
| RAID 1 | Mirroring | ✔ High safety |
| RAID 5 | Striping + parity | Balanced |
| RAID 10 | Mirror + stripe | 🔥 Production favorite |

### 🔹 `/proc/mdstat`
Check RAID health:
```bash
cat /proc/mdstat
```
Shows degraded arrays and rebuild progress.

🔥 **Real SRE Failure**: disk fails in RAID5 → not replaced → second disk fails → total data loss.

**Monitor**: RAID state, rebuild events, disk SMART health.

---

## 6. File Permissions — Security & Stability

### 🔹 rwx Model
```
User    Group    Others
rwx     rwx      rwx
```
Example: `-rwxr-xr--`

### `chmod`
```bash
chmod 755 file
```
Meaning: owner full, others read/execute.

### `chown`
Change ownership. Critical for web servers, databases, Kubernetes volumes.

---

## 7. Special Bits (Advanced SRE Knowledge)

### 🔹 SUID (4000)
Executable runs as the file owner. Example: `/usr/bin/passwd`. ⚠️ Security risk if misused.

### 🔹 SGID (2000)
In directories: new files inherit the group. Used in shared dev directories.

### 🔹 Sticky Bit (1000)
Common on `/tmp`. Prevents users from deleting others' files.

---

## 8. umask

Default permission mask.
```bash
umask 022
```
Prevents overly permissive files. SRE concern: bad umask → security vulnerability.

---

## 9. ACLs (Access Control Lists)

When rwx isn't enough.
```bash
getfacl file
setfacl -m u:user:rw file
```
Used in enterprise systems, shared storage, complex permission models.

---

## 🔥 Real SRE Incident Scenarios

1. **Disk Full → Production Down** — Cause: log rotation misconfigured.
2. **Inode Exhaustion** — Cause: millions of temp files.
3. **RAID Degraded → Ignored Alert → Data Loss**
4. **Wrong `chmod` → Application Can't Start**
5. **Mounted Wrong Volume → Overwritten Data**

### 📊 What SRE Should Monitor

| Metric | Why |
|---|---|
| Disk usage % | Prevent outages |
| Inode usage % | Silent killer |
| IOPS | Performance |
| Disk latency | DB health |
| RAID state | Data protection |
| LVM free space | Capacity planning |
| Log growth rate | Forecasting |

### 🧠 Senior-Level SRE Thinking
Always ask: What happens if this disk fills? What happens if this mount disappears? What happens if this node reboots? Can I recover this volume?

---

## 🚨 SRE Storage Incident Debugging Playbook

Structured like a real production incident: **Detection → Triage → Stabilization → Root Cause → Prevention**.

### 🔴 SCENARIO 1: Disk Full (Most Common Production Outage)

**Symptoms**: app returning 500 errors, database crash, "No space left on device", Kubernetes pods restarting, node NotReady.

**Step 1 — Confirm**
```bash
df -h
df -i    # also check inode exhaustion
```

**Step 2 — Identify what's growing**
```bash
du -sh /* 2>/dev/null | sort -h
du -sh /var/* | sort -h
```
Common culprits: `/var/log`, `/var/lib/docker`, `/tmp`, app logs, core dumps.

**Real root causes seen in production**: log rotation broken, debug logging accidentally enabled, infinite loop writing files, container image layer explosion, backup script writing locally instead of S3, audit logs filling `/var`.

**Step 3 — Emergency mitigation**
```bash
> large.log   # safely truncate a large log file
```
⚠️ Never delete active DB files.

**Step 4 — Deep diagnosis**: Why did the alert not trigger earlier? Was growth sudden or gradual? Is this predictable growth? Check historical disk growth rate and log rate.

**Step 5 — Prevention**: alerts at 70%, 80%, 90%; log rotation validation; capacity forecasting; separate log partition; auto-scaling or auto-expansion.

### 🔴 SCENARIO 2: Inode Exhaustion (Silent Killer)

**Symptoms**: disk shows free space, but app says "No space left"; file creation fails.

```bash
df -i    # confirm
for i in /*; do echo $i; find $i | wc -l; done
find /var -xdev -type f | wc -l
```

**Common causes**: millions of tiny cache files, email queues, Kubernetes `emptyDir` abuse, temp file leak, log sharding misconfiguration.

**Fix**: delete unnecessary small files, restart the service creating them, consider reformatting with more inodes (long-term).

### 🔴 SCENARIO 3: High Disk I/O / Latency (Performance Incident)

**Symptoms**: DB slow, API latency spike, CPU iowait high, pods timing out.

```bash
top          # look at %wa
iostat -x 1  # look at await, svctm, %util
```

**Common causes**: heavy backup job, unindexed DB query, log burst, swap thrashing, RAID rebuild.

**Real production example**: backup ran during peak traffic → saturated disk → checkout failures.

**Mitigation**: stop backup, throttle IO, move heavy jobs to off-peak, add faster disk, use a separate volume for DB logs.

### 🔴 SCENARIO 4: RAID Degraded

```bash
cat /proc/mdstat
```
Look for `[UU]` (healthy) vs `[U_]` (degraded).

**If degraded**: identify failed disk → replace disk → rebuild RAID → monitor rebuild.
⚠️ Risk: if a second disk fails in RAID5 → full data loss.

### 🔴 SCENARIO 5: Filesystem Corruption

**Symptoms**: system won't boot, "UNEXPECTED INCONSISTENCY", files missing, read-only filesystem.

```bash
dmesg | grep -i error
fsck /dev/sdX
```
⚠️ Never run `fsck` on a mounted production filesystem unless read-only. Downtime required.

### 🔴 SCENARIO 6: Mount Disappeared (Cloud / NFS)

**Symptoms**: app freeze, high load, threads stuck in D state, NFS timeout.

```bash
mount | grep nfs
findmnt
```

**Real cloud incident pattern**: network glitch, EBS detaches, Kubernetes node stuck, pod cannot write.

**Mitigation**: remount, restart service, possibly reboot node.

### 🔴 SCENARIO 7: Permission Denied After Deployment

**Symptoms**: app fails after release, logs show "Permission denied".

```bash
ls -l   # check owner, group, mode
```

**Common real cause**: CI/CD changed ownership, or a Docker volume was mapped incorrectly.

---

## 📊 Senior SRE Storage Checklist

When paged for a storage issue:

1️⃣ **What is failing?** App? DB? Node?

2️⃣ **Is it**: Capacity? Performance? Corruption? Mount? Permissions?

3️⃣ **What changed?** Deployment? Backup? Traffic spike? New log level?

4️⃣ **Is data at risk?**

### Advanced Production Design Principles
Always design for: separate OS and data disks; separate logs from DB; RAID + backups; snapshot strategy; alerting before impact; load-testing storage.

### Observability Metrics to Always Have

| Metric | Critical |
|---|---|
| Disk usage % | Yes |
| Inode % | Yes |
| IOPS | Yes |
| Latency | Yes |
| Throughput | Yes |
| iowait | Yes |
| Mount availability | Yes |

---

## Summary

- 💡 **"If it fills, you fail."** Treat disk like memory — monitor it before it becomes an outage.
- 🔥 Disk-full with `df -h` showing free space almost always means either a deleted-but-open file (`lsof | grep deleted`) or inode exhaustion (`df -i`), not a `du` measurement error.
- ⚠️ Storage incidents cascade fast and can corrupt data — they are more dangerous than CPU/memory incidents and are often under-monitored in capacity planning.
- ✅ Always run `resize2fs` after `lvextend` — extending the LV without growing the filesystem is a common silent mistake.

## See Also

- [Process Management & /proc](./process-management-proc) — `lsof`/`/proc/<pid>/fd` for deleted-file-still-open debugging
- [Linux Debugging Reference](./linux-debugging-reference) — where storage fits into the full toolset
- [Incident Simulation Labs](./incident-simulation-labs) — Incident 3 (disk 100%) and Incident 4 (high load, low CPU) hands-on labs
- [Incident Response Mindset](./incident-response-mindset) — USE method applied to disk saturation
