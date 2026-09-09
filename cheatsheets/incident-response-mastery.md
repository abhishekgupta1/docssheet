---
title: "Incident Response Cheat Sheet"
description: "Quick reference for incident response — severity/roles, on-call, linux debugging commands, and the postmortem process."
tags: [incident-response, sre, cheat-sheet]
hide_table_of_contents: true
---

# Incident response cheatsheet

A one-page reference for incident response and Linux SRE debugging. For the
full mindset, roadmap, and interview scenarios, see the [complete guide](/docs/sre-skills/incident-response-mastery/overview).

<a class="topic-crosslink" href="/docs/sre-skills/incident-response-mastery/overview">📖 Full guide: Incident Response →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Severity & roles

| Concept | One-liner |
|---|---|
| SEV1/2/3/4 | full outage → major degradation → minor/limited → cosmetic |
| IC | owns decisions |
| Comms Lead | owns messaging |
| Scribe | owns the timeline |
| SMEs | fix — never overlap these roles under pressure |

</div>

<div class="cheat-card">

#### Incident lifecycle

```
Detect → Triage/Declare → Mitigate → Resolve → Postmortem
```

Comms cadence: SEV1 every 15-30min, SEV2 every 30-60min, SEV3 at milestones only.

</div>

<div class="cheat-card">

#### On-call & paging

- Primary paged first, Secondary is the safety net.
- Escalation policy defines the timeout chain (who/when).
- Alert routing = which service; dedup collapses noise into one incident.

</div>

<div class="cheat-card">

#### Stabilize first (0-5 min)

1. Ack the page — stop the noise.
2. Confirm real user impact (not just an alert).
3. Declare severity — don't investigate silently.
4. Say out loud what you're checking next.

</div>

<div class="cheat-card">

#### Process commands

```bash
ps aux --sort=-%cpu | head
top          # P=sort CPU, M=sort mem, k=kill
pstree -p
kill -15 PID   # graceful
kill -9 PID    # force
pgrep -fl java
nice -n 10 myscript.sh
renice 5 -p 1234
```

</div>

<div class="cheat-card">

#### `/proc` — real gold for SREs

```bash
cat /proc/<pid>/status    # mem, state, threads
cat /proc/<pid>/limits    # ulimits in effect
ls -la /proc/<pid>/fd     # open file descriptors
cat /proc/loadavg
cat /proc/meminfo
```

</div>

<div class="cheat-card">

#### Filesystem & disk

```bash
df -h                 # disk usage
du -sh */ | sort -h    # biggest dirs
lsof +D /path          # who has files open here
lsof | grep deleted    # deleted-but-held disk space
```

Inodes exhausted ≠ disk full — check `df -i` separately.

</div>

<div class="cheat-card">

#### Follow the request path

1. Client → LB → is the LB healthy / routing correctly?
2. LB → app → is the process alive and accepting connections?
3. App → DB/cache → is the dependency the actual bottleneck?
4. Check logs at each hop, not just the top of the stack.

</div>

<div class="cheat-card">

#### Postmortem

- Blameless. Timestamped timeline. 5-whys root cause.
- Contributing factors listed separately from root cause.
- Action items have owners and dates — no names attached to blame.

</div>

<div class="cheat-card">

#### Runbooks

Write for a stressed reader at 3am: numbered steps, exact commands, explicit
decision points — not prose. If a step has a judgment call, say what to check
to make it.

<span class="cheat-see">See: 90-Day Linux SRE Roadmap for a full ramp-up plan</span>

</div>

</div>
