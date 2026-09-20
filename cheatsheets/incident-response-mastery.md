---
title: "Incident Response Cheat Sheet"
description: "Quick reference for incident response — severity/roles, on-call, linux debugging commands, and the postmortem process."
tags: [incident-response, sre, cheat-sheet]
hide_table_of_contents: true
image: /img/social/incident-response-mastery.png
---

# Incident response cheatsheet

A one-page reference for incident response and Linux SRE debugging. For the
full mindset, roadmap, and interview scenarios, see the [complete guide](/docs/sre-skills/incident-response-mastery/overview).

<a class="topic-crosslink" href="/docs/sre-skills/incident-response-mastery/overview">📖 Full guide: Incident Response →</a>

<TenMinute minutes={5}>

1. Begin with the **Severity & roles** card
2. Then the **Incident lifecycle** and **On-call & paging** cards
3. Treat the other 7 cards as lookups — scan by card title when you need one
4. Open the [full guide](/docs/sre-skills/incident-response-mastery/overview) when a card isn't enough

</TenMinute>

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

---

<Exercises>
<Exercises.Task title="Run the first five minutes of an incident on paper" level="beginner">

After a deploy, the checkout page returns errors for about a third of users. Write down: the severity you would declare and why, who takes each of the four roles, the first four things you say or do in the stabilize-first minutes, and how often you would post updates.

**Done when:** the severity is justified by user impact using the cheat sheet's definitions, no one person holds two roles, your four steps cover acknowledging the page, confirming real impact, declaring severity, and saying what you will check next, and the update cadence matches the table for your severity.

</Exercises.Task>
<Exercises.Task title="Find a deleted-but-held file through /proc" level="intermediate">

This needs Docker but no Linux host, because it runs in a throwaway container. It reproduces the "deleted but still using disk space" case from the filesystem card, using `/proc` instead of `lsof`:

```bash
docker run --rm alpine sh -c '
  echo data > /tmp/held.log
  tail -f /tmp/held.log > /dev/null &
  PID=$!
  sleep 1
  rm /tmp/held.log
  ls -l /proc/$PID/fd | grep deleted
  kill $PID'
```

**Done when:** the output shows a file descriptor pointing at `/tmp/held.log (deleted)`, and you can say what `lsof | grep deleted` would show for the same situation and why `df` and `du` would disagree about that file.

</Exercises.Task>
</Exercises>

<CaseStudy title="Thirty minutes of silent investigation">
<CaseStudy.Context>

*Illustrative scenario.* An engineer gets paged for a failing service and begins digging into logs. They know the problem is serious, but they do not declare an incident or tell anyone what they are checking.

</CaseStudy.Context>
<CaseStudy.WhatHappened>

For half an hour no one else knew there was an incident. Support could not tell customers anything, a second engineer noticed the errors and started investigating the same thing independently, and no one was keeping a timeline. When the fix landed, the postmortem had almost nothing to work from.

</CaseStudy.WhatHappened>
<CaseStudy.Lesson>

Stabilize first. Acknowledge the page, confirm real user impact, declare a severity so roles and comms can start, and say out loud what you are checking next. Investigating silently trades a few minutes of speed for a lot of duplicated effort and lost context.

</CaseStudy.Lesson>
</CaseStudy>

<AISpark>

- Give an assistant an alert's text and ask it to draft the first status update in your incident template, then edit it so it states what is known, what is not, and when the next update comes.
- Have it draft a blameless timeline from a chat export, and verify every timestamp and causal claim against the source before you publish it.
- Ask it to turn a runbook into a checklist, then test the checklist by following it in a drill instead of trusting it.

</AISpark>
