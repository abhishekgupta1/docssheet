---
title: "Linux Administration: The Complete Guide"
description: "End-to-end reference for Linux Administration — filesystem, permissions, process/service management, networking, and interview-ready Q&A."
sidebar_position: 1
tags: [linux, sre, sysadmin]
---

# Linux Administration — The Complete Guide

A single-read, end-to-end reference for Linux administration: enough to
operate, debug, and harden a production Linux host, or walk into an SRE
interview. Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/linux-administration">📋 Quick reference: Linux Administration →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 210" role="img" aria-labelledby="mm-linuxfs-title mm-linuxfs-desc">
<title id="mm-linuxfs-title">The Linux filesystem as one rooted tree</title>
<desc id="mm-linuxfs-desc">Everything on a Linux host hangs off a single root directory, with config, logs, live kernel state, temporary files, and user data each in their own conventional branch.</desc>
<defs>
  <marker id="mm-linuxfs-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n5" x="320" y="14" width="140" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="44" text-anchor="middle">/ (root)</text>

<path class="mm-arrow" d="M340,64 L95,116" marker-end="url(#mm-linuxfs-arrow)"/>
<path class="mm-arrow" d="M365,64 L240,116" marker-end="url(#mm-linuxfs-arrow)"/>
<path class="mm-arrow" d="M390,64 L390,116" marker-end="url(#mm-linuxfs-arrow)"/>
<path class="mm-arrow" d="M415,64 L540,116" marker-end="url(#mm-linuxfs-arrow)"/>
<path class="mm-arrow" d="M440,64 L685,116" marker-end="url(#mm-linuxfs-arrow)"/>

<rect class="mm-n1" x="20" y="120" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="90" y="150" text-anchor="middle">/etc</text>
<text class="mm-node-sub" x="90" y="167" text-anchor="middle">config files</text>

<rect class="mm-n2" x="170" y="120" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="240" y="150" text-anchor="middle">/var</text>
<text class="mm-node-sub" x="240" y="167" text-anchor="middle">logs, spool</text>

<rect class="mm-n3" x="320" y="120" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="390" y="150" text-anchor="middle">/proc</text>
<text class="mm-node-sub" x="390" y="167" text-anchor="middle">live kernel state</text>

<rect class="mm-n4" x="470" y="120" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="540" y="150" text-anchor="middle">/tmp</text>
<text class="mm-node-sub" x="540" y="167" text-anchor="middle">ephemeral</text>

<rect class="mm-n6" x="620" y="120" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="690" y="150" text-anchor="middle">/home</text>
<text class="mm-node-sub" x="690" y="167" text-anchor="middle">user directories</text>
</svg>

<p class="mental-model__caption">There is no drive-letter concept — everything lives under one root, and knowing which conventional branch a thing lives in is most of what it takes to navigate an unfamiliar box fast: config in /etc, logs in /var, live kernel/process data in /proc, throwaway files in /tmp.</p>
</div>

## 1. The Filesystem Hierarchy

Linux presents a single unified tree rooted at `/` — no drive letters;
everything (disks, devices, network shares) is mounted somewhere under it.

| Path | Contains |
|---|---|
| `/bin`, `/sbin` | Essential user/system binaries (often symlinked into `/usr` on modern distros) |
| `/etc` | System-wide configuration files (`/etc/passwd`, `/etc/ssh/sshd_config`) |
| `/home` | User home directories |
| `/root` | The root user's home directory (separate from `/home` for boot-time availability) |
| `/var` | Variable data — logs (`/var/log`), spool files, caches |
| `/tmp` | World-writable temp storage, typically cleared on reboot |
| `/opt` | Optional/third-party software packages |
| `/usr` | User-space programs, libraries, docs — the bulk of installed software |
| `/lib`, `/usr/lib` | Shared libraries needed by binaries in `/bin`/`/usr/bin` (also merged into `/usr` on modern distros) |
| `/srv` | Data served by this host — web content, FTP trees — kept separate from `/var`'s transient spool/log data |
| `/proc` | Virtual filesystem exposing kernel/process state in real time (not real files on disk) |
| `/sys` | Virtual filesystem exposing kernel/device/driver state (newer, more structured than `/proc`) |
| `/dev` | Device files (`/dev/sda`, `/dev/null`, `/dev/tty`) |
| `/mnt`, `/media` | Conventional mount points for manual/removable mounts |
| `/run` | Runtime state since last boot (PID files, sockets) — tmpfs, cleared on every reboot, replaces older uses of `/var/run` |

Rule of thumb for navigating an unfamiliar box fast: config lives in `/etc`,
logs in `/var/log`, ephemeral runtime state in `/tmp` or `/run`, and
kernel-exposed live data in `/proc`/`/sys`.

`/proc` is one of the first places to check when debugging: `/proc/<pid>/`
holds everything about a running process (open file descriptors, memory
maps, environment), and `/proc/cpuinfo`, `/proc/meminfo` expose live
hardware/kernel stats without needing a separate tool.

---

## 2. Permissions

Every file/directory has an **owner** (user), a **group**, and permission
bits for **owner / group / other**, each with **read (r) / write (w) /
execute (x)**.

```bash
$ ls -l app.sh
-rwxr-xr--  1 deploy  engineering  1240 Aug 10 09:00 app.sh
 ^^^^^^^^^^
 owner: rwx (7)   group: r-x (5)   other: r-- (4)   → octal 754
```

### Symbolic vs. octal

```bash
chmod u+x app.sh          # symbolic: add execute for owner
chmod g-w,o-r app.sh      # symbolic: remove group write, other read
chmod 754 app.sh          # octal: owner=rwx(7), group=r-x(5), other=r--(4)
chmod -R 755 /var/www     # recursive
```

Octal digit = sum of r(4) + w(2) + x(1). `755` = `rwxr-xr-x`, `644` =
`rw-r--r--` (the common "readable, owner-writable" default for files), `700`
= owner-only (private keys, sensitive scripts).

**Recursive chmod footgun:** `chmod -R 755 dir/` makes *every file*
executable, including data files that shouldn't be. The fix is the capital
`X` in symbolic mode — it only sets execute on directories and on files that
already have execute set somewhere, never on plain data files:

```bash
chmod -R u=rwX,g=rX,o=rX dir/     # dirs traversable, files keep their own x-bit state
# equivalent split approach:
find dir -type d -exec chmod 755 {} \;
find dir -type f -exec chmod 644 {} \;
```

### Ownership

```bash
chown deploy:engineering app.sh     # change owner and group
chown -R deploy:engineering /srv/app
chgrp engineering app.sh            # change group only
```

### `umask`

The **umask** subtracts permissions from the default when a file/directory
is created (default new-file permission is `666`, new-dir is `777`, before
umask is applied).

```bash
umask           # e.g., 0022
umask 0027       # tighter: group loses write, other loses everything
```

With `umask 022`: new files → `666 & ~022 = 644`; new directories → `777 &
~022 = 755`.

### Special bits

| Bit | Symbolic | Octal prefix | Effect |
|---|---|---|---|
| **setuid** | `u+s` | `4xxx` | Executable runs as the file's *owner*, not the invoking user (classic example: `passwd`) |
| **setgid** | `g+s` | `2xxx` | On a directory, new files inherit the directory's group instead of the creator's primary group |
| **sticky** | `+t` | `1xxx` | On a directory (e.g., `/tmp`), only the file's owner (or root) can delete/rename it, even if others have write on the dir |

### ACLs — beyond owner/group/other

The classic owner/group/other model only grants one user and one group any
rights. **Access Control Lists (ACLs)** extend this to arbitrary additional
users/groups without changing group membership:

```bash
getfacl file.txt                       # show current ACL entries
setfacl -m u:bob:rw file.txt            # grant user bob read+write, independent of file's group
setfacl -m g:auditors:r file.txt        # grant a whole extra group read
setfacl -x u:bob file.txt               # remove bob's specific entry
setfacl -b file.txt                     # strip all ACL entries back to plain owner/group/other
```

Useful when one file/directory needs a one-off grant to a specific person or
extra team without restructuring group ownership — a filesystem must be
mounted with `acl` support (default on most modern distros/ext4/xfs).

---

## 3. Process Management

```bash
ps aux                     # snapshot of all processes, BSD-style flags
ps -ef                     # snapshot, System V style
top                        # live view, sorted by CPU by default
htop                       # improved interactive top (if installed) — scrollable, tree view, mouse support
```

Key `ps aux` columns: `PID`, `%CPU`, `%MEM`, `STAT` (process state — `R`
running, `S` sleeping, `D` uninterruptible sleep, `Z` zombie, `T` stopped),
`START`, `TIME`, `COMMAND`.

### Signals

```bash
kill -15 1234       # SIGTERM — polite request to terminate (default signal)
kill -9 1234         # SIGKILL — immediate, un-catchable, un-ignorable termination
kill -1 1234         # SIGHUP — historically "hangup"; many daemons reload config on this
kill -STOP 1234       # SIGSTOP — pause the process
kill -CONT 1234       # SIGCONT — resume a stopped process
pkill -f "python app.py"    # kill by matching command line
killall nginx                # kill all processes by name
```

Matching by name instead of PID:

```bash
pgrep -f "worker.py"              # list PIDs matching the full command line
kill -TERM $(pgrep -f worker.py)  # graceful stop of every match
ps aux | grep '[n]ginx'           # bracket trick: the pattern no longer matches its own grep process
```
The bracketed-character trick (`[n]ginx` instead of `nginx`) works because
the shell still matches `nginx` in process output, but the literal string
`grep` is now searching for `[n]ginx`, which doesn't match the `grep
[n]ginx` command line itself — a common cleanup for the "grep matches
itself" annoyance with `ps aux | grep`.

**SIGTERM vs. SIGKILL** is a common interview trap: always try `SIGTERM`
first — it lets the process clean up (close file handles, flush buffers,
finish in-flight requests). `SIGKILL` is a last resort when a process is
unresponsive, because the kernel terminates it immediately with zero chance
to clean up (can leave locks held, temp files orphaned, connections
half-closed).

### Foreground/background & job control

```bash
long_task.sh &         # run in background
jobs                    # list background jobs in this shell
fg %1                   # bring job 1 to foreground
bg %1                   # resume job 1 in background
nohup long_task.sh &     # survives shell/terminal exit (ignores SIGHUP)
disown -h %1             # detach job from shell without killing it
```

### Scheduling priority: `nice` / `renice`

Every process has a niceness from **-20 (highest priority) to 19 (lowest)**,
defaulting to 0. Only root can lower niceness (raise priority above default).

```bash
nice -n 10 ./batch_job.sh     # start a new process at low priority (nice to others)
renice -n 5 -p 1234            # adjust the priority of an already-running PID
renice -n -5 -p 1234           # requires root — raises priority above default
```
Useful for background/batch work (backups, compression, report generation)
that shouldn't compete with latency-sensitive services for CPU time.

### systemd / systemctl

Most modern distros (RHEL 7+, Ubuntu 16.04+, Debian 8+) use **systemd** as
PID 1 — the init system and service manager.

```bash
systemctl status nginx          # is it running, recent log lines, PID
systemctl start|stop|restart nginx
systemctl enable nginx           # start automatically at boot (does NOT start it now)
systemctl disable nginx
systemctl enable --now nginx     # enable at boot AND start immediately, in one step
systemctl reload nginx           # re-read config without dropping connections (if the unit supports it)
systemctl daemon-reload          # re-read unit files after editing one
systemctl list-units --type=service --state=running
systemctl is-active nginx
systemctl is-enabled nginx
```

A minimal unit file (`/etc/systemd/system/myapp.service`):

```ini
[Unit]
Description=My App
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/myapp/app.py
Restart=on-failure
User=deploy
WorkingDirectory=/opt/myapp
Environment=ENV=production

[Install]
WantedBy=multi-user.target
```

`Restart=on-failure` plus systemd's automatic restart is why most
production services are wrapped as units rather than run from a raw shell —
crash recovery comes for free.

`enable`/`disable` only wire a unit into (or out of) boot targets — they
don't touch whether it's running right now. `start`/`stop` only affect the
current run state — they don't survive a reboot on their own. Mixing these
up ("I enabled it, why isn't it up?") is common enough that `--now` exists
specifically to do both atomically.

### Unit types

| Suffix | Purpose |
|---|---|
| `.service` | A long-running daemon or one-shot process — the most common unit type |
| `.timer` | Cron-like scheduling; pairs with a same-named `.service` (e.g., `backup.timer` triggers `backup.service`) |
| `.socket` | Socket activation — systemd listens on a socket and starts the paired service only on first connection |
| `.target` | A grouping/synchronization point with no process of its own (e.g., `multi-user.target`, `network.target`) — other units hook `After=`/`WantedBy=` onto it |

### Drop-in overrides

Editing a vendor-shipped unit file directly gets clobbered on the next
package upgrade. `systemctl edit` creates an override snippet instead,
without touching the original:

```bash
systemctl edit myapp        # opens $EDITOR on /etc/systemd/system/myapp.service.d/override.conf
systemctl edit --full myapp  # edit a full local copy instead of a drop-in
```

This is the safe way to tweak `Restart=`, add `Environment=` entries, or set
resource limits (`MemoryMax=`, `CPUQuota=`) on a unit systemd or a package
manager owns.

---

## 4. Package Management

| Distro family | Tool | Common commands |
|---|---|---|
| Debian/Ubuntu | `apt` (front-end for `dpkg`) | `apt update`, `apt install nginx`, `apt remove nginx`, `apt list --installed` |
| RHEL/CentOS/Fedora (modern) | `dnf` (successor to `yum`) | `dnf install nginx`, `dnf update`, `dnf remove nginx` |
| RHEL/CentOS (legacy) | `yum` | `yum install nginx` |
| Alpine | `apk` | `apk add nginx` |
| Cross-distro, sandboxed | `snap`, `flatpak` | `snap install`, packages bring their own dependencies |

```bash
apt update && apt upgrade -y     # refresh package index, then upgrade all
apt search nginx                  # search for a package
apt purge nginx                    # remove package AND its config files (apt remove keeps config)
dpkg -L nginx                      # list files a package installed
dpkg -S /usr/sbin/nginx            # which package owns a given file
dpkg -l                             # list all installed packages (Debian/Ubuntu)
dpkg -i ./custom-app_1.0.deb        # low-level install of a local .deb (no dependency resolution)
```

```bash
dnf info nginx                      # package details (RHEL/Fedora)
rpm -qa                              # list all installed packages (RHEL/Fedora)
rpm -qf /usr/sbin/nginx              # which package owns a given file
rpm -ivh ./custom-app-1.0.rpm         # low-level install of a local .rpm (no dependency resolution)
```

`update` refreshes the package index (metadata about available versions);
`upgrade`/`update` (in dnf/yum) actually installs newer versions — mixing
these up between distros is a common source of confusion. This is where
`apt` and `dnf` diverge in a genuinely confusing way: `apt update` only
refreshes the index (never installs anything), but a bare `dnf update` is
an *alias for `dnf upgrade`* — it installs newer versions immediately. The
dnf equivalent of "just refresh the index, install nothing" is
`dnf check-update`. Assuming `dnf update` behaves like `apt update` is a
good way to unexpectedly upgrade packages on a host you only meant to
inspect. `remove` vs. `purge` is a similar trap on Debian/Ubuntu: `apt
remove` uninstalls the package but leaves `/etc` config files behind (in
case you reinstall later); `apt purge` removes those too — reach for
`purge` when you want a truly clean uninstall. `dpkg -i`/`rpm -ivh` install
a local package file directly and do **not** resolve dependencies the way
`apt`/`dnf` do — use them only for one-off local packages, not as a
substitute for the repo-aware tools.

---

## 5. Users, Groups, and `sudo`

```bash
useradd -m -s /bin/bash deploy        # -m creates home dir, -s sets shell
passwd deploy                          # set/change password
usermod -aG docker deploy               # add to supplementary group (ALWAYS use -aG, never -G alone — -G without -a replaces all groups)
groupadd engineering
userdel -r deploy                       # -r also removes home dir
id deploy                                # show uid, gid, group memberships
```

Key files: `/etc/passwd` (user records: name, uid, gid, home, shell — no
password hashes since they moved to `/etc/shadow`), `/etc/shadow`
(password hashes, root-readable only), `/etc/group` (group membership).

### `sudo`

```bash
visudo                    # safely edit /etc/sudoers (validates syntax before saving)
sudo -u deploy whoami      # run a command as another user
sudo -l                     # list what the current user is allowed to run
```

**`sudo` vs. `su`:** `sudo <cmd>` runs a single command as another user
(root by default) per rules in `/etc/sudoers`, with each invocation logged
for an audit trail — the standard for day-to-day admin work. `su -` starts
a full login shell *as* that user (requires knowing that user's password,
not your own) and leaves you in their environment until you `exit` — coarser
and less auditable, generally avoided in favor of scoped `sudo` rules on
production hosts.

```
# /etc/sudoers — grant deploy passwordless restart rights on nginx only
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx
```

Principle of least privilege: grant the narrowest sudo rule that does the
job (a specific command, not blanket `ALL=(ALL) ALL`), especially for
service accounts.

---

## 6. Disk and Storage

```bash
df -h                       # disk usage per mounted filesystem, human-readable
du -sh /var/log              # total size of a directory
du -sh /var/log/* | sort -rh | head   # find the biggest subdirectories
lsblk                        # block devices and their partitions/mounts, as a tree
fdisk -l /dev/sda             # partition table detail (needs root)
mount /dev/sdb1 /mnt/data     # mount a device to a path
umount /mnt/data              # unmount
```

`/etc/fstab` defines mounts that should persist across reboots:

```
# <device>          <mount point>  <fs type>  <options>       <dump> <pass>
UUID=xxxx-xxxx       /data           ext4       defaults,noatime  0     2
```

`df` reports **filesystem-level** usage (what mount points report as
full); `du` reports **actual file** usage by walking a directory tree — the
two can disagree if a file is deleted but still held open by a running
process (`du` won't see it, `df` still shows it as used space until the
process closes the file handle — classic "disk full but `du` says it's
empty" incident, diagnosed with `lsof +L1` or `lsof | grep deleted`).

---

## 7. Logs

```bash
journalctl -u nginx              # logs for a specific systemd unit
journalctl -f                     # follow, like tail -f
journalctl --since "1 hour ago"
journalctl -p err                 # filter by priority (emerg..debug)
journalctl -b                     # logs since last boot
journalctl --disk-usage            # how much space the journal is using
```

Traditional flat-file logs still matter alongside the systemd journal:

| Path | Contents |
|---|---|
| `/var/log/syslog` or `/var/log/messages` | General system log (distro-dependent name) |
| `/var/log/auth.log` or `/var/log/secure` | Authentication/sudo events |
| `/var/log/dmesg` / `dmesg` command | Kernel ring buffer — boot messages, hardware/driver events |
| `/var/log/<app>/` | Application-specific logs |

```bash
tail -f /var/log/nginx/error.log
grep "500" /var/log/nginx/access.log | wc -l
logrotate -d /etc/logrotate.conf     # dry-run, see what would rotate
```

`logrotate` prevents logs from growing unbounded — compresses/archives/
deletes old log files on a schedule, configured per-application under
`/etc/logrotate.d/`.

### journalctl as structured data

Beyond human-readable output, `journalctl` can emit structured JSON — useful
when scripting log analysis instead of eyeballing it:

```bash
journalctl -u myapp -o json --since today | jq '.MESSAGE'   # just the message field, one JSON object per line
journalctl -u myapp -o json-pretty -n 20                       # pretty-printed, last 20 entries, all fields
```

Each line is a self-contained JSON object with fields like `MESSAGE`,
`_PID`, `PRIORITY`, and `__REALTIME_TIMESTAMP` — pipe into `jq` to filter,
reshape, or feed into another tool without parsing free-text log lines.

---

## 8. Networking Basics from the OS Side

```bash
ip addr show               # (modern) interfaces and IP addresses — replaces ifconfig
ip route                    # routing table
ss -tulpn                   # (modern) listening sockets, TCP+UDP, with process — replaces netstat
netstat -tulpn               # legacy equivalent, still common in scripts/muscle memory
ping -c 4 example.com
traceroute example.com
mtr example.com                # continuous traceroute + ping per hop, better for intermittent loss
curl -I https://example.com   # HEAD request, quick reachability + header check
curl -v https://example.com 2>&1 | head -30   # verbose: see the TLS handshake and request/response headers
dig example.com                # DNS lookup
dig +short example.com          # just the answer, no fluff
dig example.com @1.1.1.1        # query a specific resolver — bypasses local cache when debugging DNS
hostname -I                     # this host's IP addresses
nc -zv 10.0.1.5 443              # quick TCP port reachability check, no data sent (-z scan, -v verbose)
```

`ss` and `ip` are the modern `iproute2` replacements for `netstat` and
`ifconfig` respectively (deprecated on most current distros but still
present and widely used in the wild) — know both for reading legacy runbooks
and writing new ones. On a host with many connections, `ss` supports
kernel-side filtering that's far faster than piping to `grep`:

```bash
ss -tan state established '( dport = :443 )'    # only established connections to port 443
ss -tulpn | grep :8080                            # is my service actually listening?
```

A standard OS-side networking triage sequence, cheapest checks first: `ip a`
(do I have an address?) → `ip route` (do I have a default route?) → `ss
-tulpn` (is the service actually listening locally?) → `curl` against
localhost (does the app answer?) → `dig` (does DNS resolve?) → `curl -v`
against the public name (does TLS/the full path work?).

---

## 9. Shell Scripting Essentials

```bash
#!/usr/bin/env bash
set -euo pipefail   # e: exit on error, u: error on unset var, pipefail: catch failures mid-pipe

LOG_DIR="/var/log/myapp"
THRESHOLD_MB=500

usage() {
    echo -e "\nRotate logs if directory exceeds threshold.\n"
    exit 1
}

[[ -d "$LOG_DIR" ]] || { echo "missing $LOG_DIR"; exit 1; }

size_mb=$(du -sm "$LOG_DIR" | cut -f1)

if (( size_mb > THRESHOLD_MB )); then
    echo "Rotating: ${size_mb}MB exceeds ${THRESHOLD_MB}MB"
    logrotate -f /etc/logrotate.d/myapp
fi

for f in "$LOG_DIR"/*.log; do
    [[ -f "$f" ]] || continue
    gzip "$f"
done
```

`set -euo pipefail` at the top of every production script is close to
non-negotiable: without it, a failing command mid-script is silently
ignored and the script continues in an inconsistent state. Always quote
variable expansions (`"$var"`, not `$var`) to avoid word-splitting/globbing
surprises on values with spaces.

### Pipes and redirection

```bash
cmd1 | cmd2        # pipe: stdout of cmd1 -> stdin of cmd2
cmd > file         # stdout -> file (overwrite/truncate)
cmd >> file        # stdout -> file (append)
cmd 2> file        # stderr -> file
cmd > file 2>&1    # both stdout and stderr -> file (order matters — see below)
cmd &> file        # bash shorthand for the line above
cmd < file         # file -> stdin
cmd1 2>&1 | cmd2   # merge stderr into stdout, then pipe both downstream
```

**Order matters with `2>&1`.** `cmd > file 2>&1` works because `>file` first
points stdout at the file, then `2>&1` duplicates *that* target for stderr.
Reversing it — `cmd 2>&1 > file` — redirects stderr to wherever stdout was
pointing *at that moment* (usually the terminal), then moves stdout to the
file, so stderr keeps going to the terminal instead of the file. A classic
silent-logging-bug source.

Process substitution is a related trick worth knowing: `diff <(sort file1) <(sort file2)`
feeds each command's output to `diff` as if it were a file, with no temp files created.

### The unquoted-variable `rm -rf` footgun

```bash
rm -rf "$dir"/*      # safe-ish: if $dir is empty, this expands to "rm -rf /*" — still dangerous
[[ -n "$dir" ]] || { echo "dir is unset, aborting"; exit 1; }
rm -rf "${dir:?dir must be set}"/*     # ${var:?message} aborts with an error if $var is unset or empty
```

A destructive command built from an unquoted, unvalidated variable is one
of the most common causes of real production incidents: if `$dir` is empty
or unset, `rm -rf $dir/*` (unquoted) or even `rm -rf "$dir"/*` (quoted but
unchecked) can silently target `/*`. `set -u` (part of `set -euo pipefail`)
catches a fully unset variable, but not one that's set-and-empty — the
`${var:?}` guard or an explicit `[[ -n "$var" ]]` check is the only thing
that catches both, and either belongs on every line that follows with `rm
-rf`, `chmod -R`, or `chown -R`.

---

## 10. Cron

```bash
crontab -e            # edit current user's crontab
crontab -l             # list it
crontab -u deploy -l    # another user's crontab (needs privilege)
```

```
# m h dom mon dow  command
0 2 * * *   /opt/scripts/nightly-backup.sh >> /var/log/backup.log 2>&1
*/15 * * * * /opt/scripts/healthcheck.sh
0 0 1 * *    /opt/scripts/monthly-report.sh
```

Fields: minute, hour, day-of-month, month, day-of-week (0 and 7 both = Sunday).
Always redirect output (`>> file 2>&1`) — a cron job's output otherwise goes
to the crontab owner's mail spool, which is easy to forget exists and easy
to miss a failure in. System-wide jobs also live in `/etc/cron.d/`,
`/etc/cron.daily/`, etc. For anything beyond simple scheduling (retries,
overlap prevention, dependency chains), systemd timers or a real scheduler
are usually a better fit than cron.

---

## 11. SSH Basics

```bash
ssh deploy@10.0.1.5                          # connect
ssh -i ~/.ssh/id_ed25519 deploy@10.0.1.5       # specify a key explicitly
ssh -p 2222 deploy@10.0.1.5                     # non-default port
scp file.txt deploy@10.0.1.5:/opt/app/           # copy a file over SSH
rsync -avz ./dist/ deploy@10.0.1.5:/opt/app/     # efficient sync, only transfers diffs
ssh-keygen -t ed25519 -C "you@example.com"        # generate a modern keypair
ssh-copy-id deploy@10.0.1.5                        # install your public key on the remote host
```

`~/.ssh/config` avoids repeating flags:

```
Host prod-web
    HostName 10.0.1.5
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

Server-side hardening in `/etc/ssh/sshd_config` (then `systemctl restart
sshd`): `PasswordAuthentication no` (keys only), `PermitRootLogin no`,
`AllowUsers deploy admin` — every one of these is a standard first pass on
any production host.

---

## 12. Environment Variables and Shell Configuration

```bash
env                    # list all exported environment variables
printenv PATH           # print a single variable
export VAR=value        # set and export for this shell and any child processes
VAR=value cmd            # set for exactly one command's invocation, doesn't persist or leak to the shell
unset VAR                 # remove a variable
```

### `PATH` and executable resolution

`PATH` is a colon-separated list of directories the shell searches, in
order, when you type a bare command name.

```bash
echo "$PATH"
which python3      # first match on PATH
type python3         # like which, but also reports shell builtins/aliases/functions
```
A common footgun: two versions of a tool installed in different directories
— `which` (or `type`) tells you which one actually runs, which matters when
`python3` behaves differently than expected because a `pyenv`/`venv`
directory got prepended to `PATH` earlier in the session.

### Shell startup file load order

Which files a shell reads depends on whether it's a **login** shell (e.g.
SSH connecting in) vs. an **interactive non-login** shell (e.g. opening a
new terminal tab), and which shell you're running:

| Shell | Login | Interactive non-login |
|---|---|---|
| bash | `/etc/profile`, then first of `~/.bash_profile`, `~/.bash_login`, `~/.profile` | `~/.bashrc` |
| zsh | `~/.zshenv` (always), then `~/.zprofile` | `~/.zshenv` (always), then `~/.zshrc` |

Most distros make `~/.bash_profile` source `~/.bashrc`, so in practice you
only maintain one file for bash. This matters operationally: a `PATH` or
alias defined only in `~/.bashrc` won't exist in a login shell (or in a
non-interactive script run via `bash script.sh`), which is why cron jobs and
systemd units often behave differently than the same command run
interactively — they don't inherit your interactive shell's environment at
all unless you source it or set `Environment=` explicitly.

### Useful special variables

```bash
echo $?     # exit status of the last command (0 = success, non-zero = failure)
echo $$     # PID of the current shell
echo $0     # name of the script/shell itself
echo $1     # first positional argument to a script/function
echo $#     # number of positional arguments
echo $@     # all positional arguments as separate words
```
`$?` in particular is the backbone of shell error handling — check it (or
better, use `set -e`) immediately after any command whose failure the
script needs to react to, since it gets overwritten by the very next
command.

---

## 13. Text Processing: grep, sed, awk, find, xargs

The daily toolkit for filtering, transforming, and acting on text and
files at the command line — dense but worth memorizing since it replaces
entire scripts with one line.

### grep

```bash
grep -rn "TODO" src/                     # recursive, with line numbers
grep -riE "error|fail|panic" app.log     # case-insensitive, multiple patterns (extended regex)
grep -v "^#" config.conf                 # invert match — strip comment lines
grep -c "ERROR" app.log                  # count matching lines
grep -A3 -B1 "Exception" app.log         # 3 lines of context after, 1 before, the match
grep -l "deprecated" *.py                # filenames only — which files match, not the lines
grep -oP '(?<=user=)\w+' access.log      # PCRE lookbehind — extract text after "user="
```

### sed

```bash
sed 's/foo/bar/' file                    # replace first "foo" per line
sed 's/foo/bar/g' file                   # replace all occurrences per line
sed -i.bak 's/foo/bar/g' file            # in-place, keeping a .bak backup
sed -n '10,20p' file                     # print only lines 10-20
sed '/^$/d' file                         # delete blank lines
sed -n '/START/,/END/p' file             # print the block between two markers
sed 's/[[:space:]]\+$//' file            # strip trailing whitespace
sed 's#/old/path#/new/path#g' file       # alternate delimiter (#) — avoids escaping every "/" in a path
```

### awk

`awk` splits each line into fields (`$1`, `$2`, ... by whitespace, or a
custom delimiter via `-F`) — think "SQL over columns" for anything
grep/cut/sed would otherwise need three chained processes to do.

```bash
awk '{print $1, $3}' file                # print columns 1 and 3
awk -F: '{print $1}' /etc/passwd         # custom delimiter (:)
awk '{sum += $5} END {print sum}' file   # sum column 5
awk '$3 > 100 {print}' file              # filter rows by a numeric column
ps aux | awk '{print $2, $11}'           # pid + command, straight from ps output
awk '{print length, $0}' file | sort -n  # sort lines by length
awk 'NR==1 {print; next} {print | "sort"}' file  # keep header on top, sort everything after it

# BEGIN/END blocks and associative arrays — a small program in one line
awk 'BEGIN{FS=","; OFS="\t"} {count[$2]++} END{for (k in count) print k, count[k]}' data.csv
```

### find, xargs, and combining them

```bash
find /path -name "*.log"                          # find files by name
find . -mtime +7 -exec rm {} \;                    # act on each match (spawns a process per file — slow at scale)
find . -name "*.log" -print0 | xargs -0 gzip       # NUL-delimited, safe with spaces in filenames
find . -type f -name "*.sh" -exec chmod +x {} \;   # make all shell scripts executable
find / -perm -4000 -type f 2>/dev/null             # every SUID binary on the box — standard hardening audit
find / -xdev -size +100M 2>/dev/null | sort        # large files, single filesystem, no permission-error noise
find . -name "*.jpg" | xargs -P4 -I{} convert {} {}.png   # -P4: 4 conversions running in parallel
grep -rl "old_string" . | xargs sed -i 's/old_string/new_string/g'   # find-and-replace across a whole tree
du -sh */ | sort -rh | head -10                    # top 10 largest directories here
```

`find -exec cmd {} \;` runs the command **once per matched file**, which is
slow across thousands of files; `find -print0 | xargs -0 cmd` batches
matches into fewer invocations and is NUL-safe for filenames containing
spaces or newlines — prefer it at any real scale. `xargs -P` adds
parallelism on top of that batching for CPU-bound per-file work (image
conversion, compression, hashing).

---

## 14. Interview-Ready Q&A

**Q: `SIGTERM` vs. `SIGKILL` — when would you use each?**
A: `SIGTERM` (signal 15, `kill`'s default) asks a process to terminate
gracefully — it can catch the signal, flush buffers, close connections, and
exit cleanly. `SIGKILL` (signal 9) is delivered by the kernel directly and
cannot be caught, blocked, or ignored — the process dies immediately with no
cleanup. Always send `SIGTERM` first and only escalate to `SIGKILL` if the
process doesn't exit within a reasonable timeout, since `SIGKILL` can leave
locks held or data half-written.

**Q: A disk shows 100% full via `df`, but `du -sh /` doesn't add up to
anywhere near the disk size. What's going on?**
A: Almost always a deleted-but-still-open file — a process holds a file
descriptor to a file that's been `rm`'d, so the space isn't released until
the process closes the handle or exits, but `du` (which walks the visible
directory tree) can't see it since the file has no name anymore. Diagnose
with `lsof | grep deleted` or `lsof +L1`, then restart or signal the
offending process to release the handle.

**Q: What's the difference between `apt update` and `apt upgrade`?**
A: `apt update` refreshes the local package index — the list of available
package versions from configured repositories — without installing
anything. `apt upgrade` actually installs newer versions of packages already
present on the system, based on that (possibly stale, if you haven't run
`update` first) index. Forgetting `update` before `upgrade` is a classic way
to end up "upgrading" to versions that are already out of date.

**Q: Why is `usermod -aG` important, and what happens if you forget the
`-a`?**
A: `-G` alone *replaces* a user's entire supplementary group list with
whatever you specify; `-aG` *appends* the new group while preserving
existing memberships. Forgetting `-a` silently strips a user out of every
other group they were in (e.g., losing `sudo` or `docker` group membership
unexpectedly) — a well-known production footgun.

**Q: How does systemd know to restart a crashed service automatically, and
why does that matter operationally?**
A: The unit file's `[Service]` section sets `Restart=` (e.g., `on-failure`
or `always`), so systemd — as PID 1, supervising all units — detects the
process exiting and respawns it according to that policy, often with a
configurable backoff (`RestartSec=`). It matters because it turns a crash
into a brief blip instead of a full outage requiring manual intervention,
and it's why production services should be run as systemd units rather than
loose background processes.

**Q: Walk through diagnosing "site is slow" purely from the OS side of a
Linux host.**
A: Start broad: `top`/`htop` for CPU/memory pressure and which process is
consuming it, `ss -tulpn` to check if the service is even listening and
whether connections are piling up, `df -h`/`du` for disk pressure (a full
disk can silently degrade a database or log-heavy app), `journalctl -u <service> -f`
for recent errors/warnings, and `vmstat`/`iostat` if
available for I/O wait vs. CPU-bound distinction. The goal is ruling out
CPU, memory, disk, and network saturation one at a time before assuming the
application code itself is the bottleneck.

**Q: What's the risk of running services directly as `root` instead of a
dedicated service account?**
A: If the service is compromised (RCE, deserialization bug, dependency
vulnerability), an attacker inherits whatever privileges the process was
running as — root means full host compromise, whereas a scoped service
account limits blast radius to whatever that account can actually touch.
This is why unit files set `User=`/`Group=` to a dedicated non-root account
and why `sudo` rules should be scoped to specific commands rather than
`ALL=(ALL) ALL`.

**Q: Explain what a cron job's output redirection (`>> file 2>&1`) actually
does, and why omitting it is a common mistake.**
A: `>>` appends stdout to a file; `2>&1` redirects stderr (file descriptor
2) to wherever stdout (file descriptor 1) is currently going — so both
streams land in the same log file. Cron itself has no terminal to print to;
without explicit redirection, any output a job produces gets mailed to the
crontab owner's local mail spool, which most people never check, so
failures go unnoticed for a long time.

**Q: Why is `rm -rf "$dir"/*` still dangerous even though the variable is
quoted?**
A: Quoting protects against word-splitting on spaces, but it does nothing
if `$dir` itself is empty or unset — `"$dir"/*` then expands to `/*`,
recursively deleting from the filesystem root. `set -u` catches a fully
*unset* variable but not one that's set to an empty string, so the safe
pattern is an explicit guard before any destructive command:
`[[ -n "$dir" ]] || exit 1`, or the shorter `"${dir:?dir must be set}"`,
which aborts with an error if the variable is unset or empty. The same
guard belongs in front of `chmod -R`/`chown -R` on a variable path, not
just `rm -rf`.

**Q: What's the difference between `systemctl enable` and `systemctl
start`, and what does `--now` do?**
A: `enable` only creates the symlinks that wire a unit into a boot target
(e.g. `multi-user.target`) — it does not affect whether the service is
running right now. `start` only affects the current run state — it won't
survive a reboot unless the unit is also enabled. `systemctl enable --now <unit>`
does both atomically in one command, which is the usual choice when
standing up a new production service.

---

## 15. One-Line Summary

**Linux administration is a small set of composable primitives — the
filesystem tree, permission bits, processes/signals, systemd units,
package managers, and log/network tooling — that together let you operate,
debug, and harden any host the same way regardless of what runs on it.**
