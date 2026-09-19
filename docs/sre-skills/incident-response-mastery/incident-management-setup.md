---
title: "Incident Management Setup"
description: "Org-level incident management scaffolding — severity classification, IC/Comms/Scribe roles, on-call and escalation policy, PagerDuty/Opsgenie alert routing, communication templates, blameless postmortems, and runbook design."
sidebar_position: 2
tags: [sre, incident-response, incident-management, on-call, pagerduty, opsgenie, postmortem, runbooks]
---

[Incident Response Mindset](./incident-response-mindset) is what an individual engineer thinks while debugging. This document is the scaffolding around them: how an org classifies incidents, who does what during one, how paging routes an alert to a human, and how the organization turns the incident into a written record. Get the setup wrong and even a sharp debugger drowns in noise, unclear authority, and comms chaos. Get it right and a mediocre debugger still ships a controlled, well-communicated resolution.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [What Is It / Core Concepts](#what-is-it--core-concepts)
3. [Detailed Examples](#detailed-examples)
4. [Key Takeaways](#key-takeaways)
5. [Common Mistakes](#common-mistakes)
6. [Advanced Usage](#advanced-usage)
7. [Related Topics](#related-topics)

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-imsetup-title mm-imsetup-desc">
<title id="mm-imsetup-title">The five-stage incident lifecycle, looping back into itself</title>
<desc id="mm-imsetup-desc">Detect leads to Triage or Declare, then Mitigate, then Resolve, then Postmortem, whose lessons feed back into how the next incident is detected and triaged.</desc>
<defs>
  <marker id="mm-imsetup-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="20" y="140" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="90" y="170" text-anchor="middle">Detect</text>
<text class="mm-node-sub" x="90" y="187" text-anchor="middle">alert fires</text>

<path class="mm-arrow" d="M160,175 L195,175" marker-end="url(#mm-imsetup-arrow)"/>

<rect class="mm-n2" x="195" y="140" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="265" y="170" text-anchor="middle">Triage / Declare</text>
<text class="mm-node-sub" x="265" y="187" text-anchor="middle">severity, IC assigned</text>

<path class="mm-arrow" d="M335,175 L370,175" marker-end="url(#mm-imsetup-arrow)"/>

<rect class="mm-n3" x="370" y="140" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="440" y="170" text-anchor="middle">Mitigate</text>
<text class="mm-node-sub" x="440" y="187" text-anchor="middle">stop the bleeding</text>

<path class="mm-arrow" d="M510,175 L545,175" marker-end="url(#mm-imsetup-arrow)"/>

<rect class="mm-n4" x="545" y="140" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="615" y="170" text-anchor="middle">Resolve</text>
<text class="mm-node-sub" x="615" y="187" text-anchor="middle">confirm normal</text>

<path class="mm-arrow" d="M685,175 L720,175" marker-end="url(#mm-imsetup-arrow)"/>

<rect class="mm-n5" x="620" y="20" width="140" height="70" rx="10"/>
<text class="mm-node-title" x="690" y="50" text-anchor="middle">Postmortem</text>
<text class="mm-node-sub" x="690" y="67" text-anchor="middle">blameless, owned actions</text>

<path class="mm-arrow" d="M720,140 L690,90" marker-end="url(#mm-imsetup-arrow)"/>

<path class="mm-arrow" stroke-dasharray="3,3" d="M620,45 C300,-25 60,45 90,140" marker-end="url(#mm-imsetup-arrow)"/>
<text class="mm-flow-label" x="330" y="30" text-anchor="middle">action items feed the next incident's detection &amp; triage</text>
</svg>

<p class="mental-model__caption">Every incident runs through the same five stages — Detect, Triage/Declare, Mitigate, Resolve, Postmortem — and the postmortem is not the end of the loop but the start of the next one, since its owned action items are what make the next incident easier to detect and triage.</p>
</div>

## Quick Reference

| Concept | One-liner |
|---|---|
| Severity | SEV1 = full outage/revenue/data-loss, SEV2 = major degradation, SEV3 = minor/limited-scope, SEV4 = cosmetic/no user impact |
| Roles | IC owns decisions, Comms Lead owns messaging, Scribe owns the timeline, SMEs fix — never overlap these under pressure |
| Lifecycle | Detect → Triage/Declare → Mitigate → Resolve → Postmortem |
| On-call | Primary gets paged first, Secondary is the safety net, escalation policy defines the timeout chain |
| Paging | Escalation policy = who/when, alert routing = which service, dedup = collapse noise into one incident |
| Comms cadence | SEV1: updates every 15–30 min; SEV2: every 30–60 min; SEV3: at milestones only |
| Postmortem | Blameless, timestamped timeline, 5-whys root cause, contributing factors, owned action items, no names attached to blame |
| Runbook | Optimized for a stressed reader at 3am: numbered steps, exact commands, decision points, not prose |

---

## What Is It / Core Concepts

### Severity / Priority Classification

Every incident needs a number attached within minutes of declaration — the number drives who gets paged, how loud the alarm is, and how the org communicates externally. Most shops converge on a 4-level scheme (SEV1–SEV4 or P1–P4; same idea, different label).

**SEV1 (Critical)**
- Full outage of a customer-facing service, or
- Data loss / data corruption in progress or already occurred, or
- Security breach with active exploitation, or
- Revenue-blocking (checkout down, payments failing at scale)
- Response: page immediately, IC required, exec/stakeholder notification, external status page updated within minutes.

**SEV2 (Major)**
- Significant feature degraded for a large subset of users (elevated error rate, major latency spike), or
- A dependency is down but a workaround/fallback exists, or
- SLO burn rate that will exhaust the monthly error budget within hours
- Response: page primary on-call, IC usually assigned, internal comms mandatory, external status page optional depending on visibility.

**SEV3 (Minor)**
- Limited-scope issue affecting a small user segment, single non-critical feature, or internal tooling
- Response: ticket + on-call awareness, no dedicated IC required, fixed during business hours unless it's trending worse.

**SEV4 (Low / Cosmetic)**
- Visual bugs, non-blocking errors, one-off anomalies with no user-facing impact
- Response: backlog item, no paging, no incident channel.

The classification must be criteria-based, not vibes-based — write the criteria down (as above) so any on-call engineer can self-declare a SEV1 without waiting for permission. Ambiguity here is the single biggest cause of slow incident starts: people spend 20 minutes debating the severity instead of declaring at the worst-plausible level and downgrading later. **Bias toward declaring higher and downgrading** — it's cheap to stand down a SEV1 that turns out to be SEV2; it's expensive to escalate a SEV3 that was actually a SEV1 the whole time.

### Incident Roles

Under pressure, a single person cannot simultaneously debug, decide, and communicate — cognitive load collapses quality on all three. Role separation exists specifically to prevent that collapse, not as bureaucratic overhead.

- **Incident Commander (IC)** — owns the incident, not the fix. Makes the call on severity, mitigation strategy, escalation, and when to declare resolved. Does not necessarily touch a keyboard to debug. The IC's job is coordination and decision-making under uncertainty; a good IC actively resists the urge to dive into logs themselves.
- **Communications Lead** — owns all outbound messaging: internal Slack/status channel updates, external status page, executive updates. Filters technical noise into stakeholder-readable language. Frees the IC and SMEs from context-switching to answer "any update?" pings.
- **Scribe** — owns the live timeline. Timestamps every action, hypothesis, and decision in real time, in the incident channel or a dedicated doc. This becomes the postmortem's raw material — without a scribe, timelines get reconstructed from memory afterward and are reliably wrong.
- **Subject Matter Experts (SMEs)** — the engineers actually debugging and mitigating. Report findings and proposed actions to the IC rather than acting unilaterally on high-risk changes (an SME wanting to fail over a database should say so to the IC, not just do it silently).

Why separation matters: it converts an incident from "everyone shouting in one channel" into a chain of custody. The IC always knows the current state because Comms and Scribe are explicitly capturing it; the IC isn't personally down in the weeds, so they retain the bandwidth to make judgment calls (rollback vs. forward-fix, when to escalate, when to loop in legal/security). On small teams these roles compress — one person may be IC+Comms for a SEV3 — but SEV1 should always have distinct people in each seat if headcount allows it.

### Incident Lifecycle

```
Detect → Triage/Declare → Mitigate → Resolve → Postmortem
```

1. **Detect** — automated alert (monitoring threshold breach, synthetic check failure) or human report (support ticket, customer tweet, internal Slack message). Detection quality is covered in depth in a monitoring-focused doc; the incident process starts the moment detection happens.
2. **Triage/Declare** — someone (often the paged on-call) confirms this is real (not a flapping alert), assigns a severity, and *declares* the incident — typically a slash command (`/incident declare`) or a button in the paging tool that spins up a channel, a video bridge, and assigns an IC. Declaring early and downgrading later beats waiting for certainty.
3. **Mitigate** — the priority is restoring service, not finding root cause. Rollback, feature-flag kill switch, traffic shift, horizontal scale, failover — whatever gets users unblocked fastest. This mirrors the "mitigate before root cause" principle in [Incident Response Mindset](./incident-response-mindset#8-mitigation-before-root-cause-if-impact-is-high).
4. **Resolve** — user-facing impact has stopped; the IC formally declares resolution, comms lead sends the final update/status-page close, incident channel is archived (but not deleted — it's postmortem input).
5. **Postmortem** — blameless write-up produced within 1–5 business days while memory is fresh, reviewed in a meeting, action items tracked to completion. An incident isn't actually closed until its action items are closed — a postmortem with no follow-through is theater.

### On-Call Rotation Setup

- **Primary** — first person paged. Expected to acknowledge within a defined SLA (commonly 5 minutes) and begin triage.
- **Secondary** (a.k.a. backup) — paged automatically if primary doesn't acknowledge in time, or paged proactively for SEV1s so the primary isn't solo. Also the fallback for PTO/sick days.
- **Escalation policy** — the ordered chain of who gets paged and after how long: Primary (0 min) → Secondary (5 min no-ack) → Team Lead (15 min no-ack) → Engineering Manager (30 min, for SEV1 only). Every rung has a timeout; the policy exists precisely so a single unresponsive human never stalls an incident indefinitely.
- **Follow-the-sun** — for globally distributed teams, rotations are scheduled so the "primary" on-call is always in their local daytime (e.g., APAC team owns 00:00–08:00 UTC, EMEA owns 08:00–16:00 UTC, Americas owns 16:00–00:00 UTC). Avoids waking one region every night and shortens time-to-acknowledge since someone is always fresh and awake. Requires clean handoff notes between regions (open incidents, flaky alerts, deploys in flight) or context gets lost at the boundary.
- **Rotation hygiene**: shifts of 1 week are common (long enough to build context, short enough to avoid burnout); compensate on-call time; track page volume per person — chronically high pages for one rotation slot means the alerting is broken, not that the engineer is unlucky.

### Paging / Alerting Tool Concepts (PagerDuty, Opsgenie, etc.)

- **Escalation policy** — as above: an ordered, timed chain of targets (user → schedule → team) that a paging tool walks through automatically until someone acknowledges.
- **Alert routing** — rules that map an incoming alert (from Prometheus/Datadog/CloudWatch/etc., typically via webhook or integration key) to the correct *service* in the paging tool, which in turn maps to the correct escalation policy and on-call schedule. Misrouted alerts (page the wrong team, or nobody) are one of the most common on-call failures — validate routing whenever a new alert source is added.
- **Deduplication (dedup)** — collapses repeated firings of the same underlying problem into a single incident instead of paging the human 40 times for 40 flapping alerts. Usually keyed on an alert fingerprint (service + check + labels). Without dedup, alert storms train on-call engineers to silence their phones, which defeats the entire system.
- **Alert grouping / noise reduction** — related but distinct from dedup: grouping *different* alerts that share a root cause (e.g., every downstream service alarming because a shared DB is down) into one incident so the human sees one page, not twenty.
- **Maintenance windows** — silence expected noise during planned deploys/migrations so real signal doesn't get lost or, worse, real signal gets accidentally suppressed because the window was left too broad or too long.

---

## Detailed Examples

### Incident Communication Templates

**Internal — initial notification (Slack / incident channel), post immediately on declare:**

```
🔴 SEV1 DECLARED — [short symptom description]

Impact: [who/what is affected — e.g., "Checkout failing for ~100% of EU users"]
Started: 14:32 UTC (detected via PagerDuty alert: checkout-5xx-rate)
IC: @jane.doe
Comms: @sam.lee
Scribe: @auto-bot (timeline in thread)
Status: Investigating

Updates every 15 min in this thread. War room: [video link]
```

**Internal — status update cadence (SEV1: every 15–30 min; SEV2: every 30–60 min):**

```
🔄 UPDATE 14:47 UTC

What we know: Error spike correlates with the 14:28 UTC deploy of payments-api v2.3.1
What we're doing: Rolling back to v2.3.0, ETA 5 min
Impact: Unchanged — still ~100% checkout failures in EU
Next update: 15:05 UTC or sooner if status changes
```

**Internal — resolution message:**

```
✅ RESOLVED 15:10 UTC

Rollback to payments-api v2.3.0 completed at 15:02 UTC. Error rate back to baseline
as of 15:06 UTC, confirmed via dashboard + no new customer reports for 10 min.

Duration: 38 min (14:32–15:10 UTC)
Postmortem doc: [link] — draft by EOD Thursday, review Friday 10am
Thank you: @jane.doe (IC), @sam.lee (Comms), @raj.patel (rollback)
```

**External — status page, initial:**

```
Investigating — We are investigating reports of checkout failures for customers in
the EU region. We will provide an update within 30 minutes.
Posted 14:35 UTC
```

**External — status page, update:**

```
Identified — We have identified the cause as a recent deployment and are rolling
back. We expect resolution within 15 minutes.
Posted 14:50 UTC
```

**External — status page, resolved:**

```
Resolved — The issue affecting EU checkout has been resolved as of 15:06 UTC.
All systems are operating normally. We apologize for the disruption.
Posted 15:12 UTC
```

Rules for external comms: never speculate about root cause publicly before it's confirmed internally, never name specific customers or reveal security-sensitive detail, and always close the loop even if the fix was quiet — silence after an outage erodes more trust than the outage itself.

### Blameless Postmortem Structure

```markdown
# Postmortem: Checkout Failures — 2026-08-16

**Severity**: SEV1
**Duration**: 38 minutes (14:32–15:10 UTC)
**Author(s)**: Jane Doe (IC)
**Status**: Draft / In Review / Final

## Summary
One paragraph: what broke, who was affected, how it was fixed. Written so
someone outside the team understands it without reading further.

## Impact
- ~100% of EU checkout requests failed for 38 minutes
- Estimated N failed transactions / $X revenue impact
- 0 data loss

## Timeline (UTC)
- 14:28 — payments-api v2.3.1 deployed via CD pipeline
- 14:32 — checkout-5xx-rate alert fires, pages primary on-call
- 14:34 — on-call acknowledges, confirms real (not flapping), declares SEV1
- 14:36 — IC assigned, incident channel + war room created
- 14:47 — root cause hypothesis: new deploy correlates with spike
- 14:52 — rollback to v2.3.0 initiated
- 15:02 — rollback complete
- 15:06 — error rate confirmed back to baseline
- 15:10 — incident formally resolved

## Root Cause (5 Whys)
1. Why did checkout fail? → payments-api returned 500s for all requests.
2. Why did it return 500s? → A null-pointer exception in the new discount-code path.
3. Why was that path broken? → v2.3.1 shipped a refactor that didn't handle the
   case where discount_code is null (the common case — most carts have none).
4. Why wasn't this caught before prod? → The test suite only covers carts *with*
   a discount code; no test for the null path.
5. Why did the null-path gap exist? → Test coverage requirements for payment-path
   changes aren't enforced in CI; coverage is advisory, not a merge gate.

**Root cause**: Missing test coverage for the null-discount-code path allowed a
NPE-triggering refactor to reach production undetected.

## Contributing Factors
- Coverage gate for payment-critical paths is advisory, not blocking, in CI
- Canary/staged rollout was skipped for this deploy (deployed to 100% directly)
- No automated rollback trigger — rollback was manual, adding ~10 min to MTTR

## What Went Well
- Alert fired within 4 minutes of the bad deploy
- IC/Comms/Scribe roles were staffed within 4 minutes of declare
- Rollback path was well-rehearsed and executed cleanly

## Action Items
| Action | Owner | Due | Priority |
|---|---|---|---|
| Add null-discount-code test case, make payment-path coverage a CI merge gate | @raj.patel | 2026-08-20 | P1 |
| Enable staged/canary rollout for payments-api deploys | @sam.lee | 2026-08-25 | P1 |
| Add automated rollback trigger on 5xx-rate SLO breach | @jane.doe | 2026-09-01 | P2 |

## Notes
This document is blameless. It describes system and process gaps, not individual
performance. No names are attached to "caused" or "failed to catch" language —
only to owned action items going forward.
```

The blameless framing isn't a courtesy — it's a functional requirement: postmortems that assign blame train engineers to hide information in the next incident (delay declaring, omit the risky change they pushed, avoid raising their hand as an SME). The moment a postmortem reads like a performance review, the org loses its best incident-data source going forward. Language check: "the deploy pipeline allowed X" not "Raj pushed X"; "the on-call missed the alert" becomes "the alert lacked sufficient context to be actionable in the first 5 minutes."

### Runbook Design Principles

A runbook that reads well in a design review and a runbook that's usable at 3am under adrenaline are different documents. What makes the difference:

**Usable at 3am:**
```markdown
## Runbook: payments-api high error rate

### 1. Confirm the alert is real
Run: `curl -s https://payments.internal/health | jq .status`
Expect: "ok". If not "ok", continue. If "ok", check for flapping — see step 1a.

### 2. Check recent deploys
Run: `kubectl -n payments rollout history deploy/payments-api`
If a deploy happened in the last 30 min → suspect it. Go to step 3.
If no recent deploy → go to step 5 (dependency check).

### 3. Roll back
Run: `kubectl -n payments rollout undo deploy/payments-api`
Wait 2 min. Re-run health check from step 1.
If resolved → go to step 6 (declare mitigated).
If not resolved → escalate to secondary on-call, this runbook doesn't cover it.

### 4. [continues...]

### Escalation
If not resolved in 15 min: page @payments-team-lead via PagerDuty service
"payments-escalation". Do not wait longer than 15 min to escalate.
```

**Useless at 3am** (the anti-pattern): a wiki page describing system architecture, a paragraph explaining *why* the service might fail, a diagram of the payment flow, and a vague "investigate logs and take appropriate action" — with no exact commands, no decision tree, no explicit escalation trigger. This forces the on-call engineer to *think* — the one resource in shortest supply during a stressful 3am page.

Design principles:
- **Numbered, sequential steps** — not prose paragraphs. A stressed reader follows a checklist; they don't parse essays.
- **Exact copy-pasteable commands**, not descriptions of commands ("check the pod status" is worse than the literal `kubectl get pods -n payments`).
- **Explicit decision points**: "if X, go to step N; if Y, go to step M" — not implied judgment calls.
- **Explicit escalation triggers with a time bound** ("if unresolved in 15 minutes, page X") — removes the ambiguity of "should I escalate yet?"
- **Assume the reader has zero memory of this system** — because at 3am, effectively, they don't. Spell out full commands, full paths, full service names.
- **Keep it current** — a runbook that references a decommissioned service or an old command flag is worse than no runbook; it actively wastes time and erodes trust in every other runbook. Review runbooks after every incident that used (or should have used) one.
- **Link, don't inline, background context** — architecture diagrams and rationale belong one click away, not interleaved with the action steps.

---

## Key Takeaways

- 💡 Severity criteria must be written down and criteria-based — ambiguity about "is this a SEV1?" burns more time than most actual mitigations.
- 🔥 Role separation (IC / Comms / Scribe / SMEs) exists to protect cognitive bandwidth under pressure, not to add ceremony — never let one person hold two of these seats in a SEV1 if headcount allows avoiding it.
- ⚠️ A postmortem with no owned, dated action items is not a postmortem — it's a story. The incident isn't closed until the action items are.
- ✅ Bias toward declaring a higher severity and downgrading later — it's always cheaper than escalating late.
- ⚡ A runbook is judged by whether a half-awake engineer can execute it verbatim, not by how well it explains the system.

## Common Mistakes

- **Debating severity instead of declaring.** Waiting for certainty before declaring an incident delays paging, delays comms, and delays mitigation. Declare at the worst plausible level immediately; downgrade once you know more.
- **IC also debugging.** The moment the IC starts tailing logs themselves, decision-making and coordination degrade — nobody is watching the whole board.
- **No scribe, timeline reconstructed after the fact from memory.** Reconstructed timelines are reliably wrong and undermine the root-cause analysis built on top of them.
- **Treating the postmortem as blame-finding.** Kills the incentive to declare early and be transparent about mistakes in the *next* incident — the org's future incident data quality depends on this document staying blameless.
- **Root-causing before mitigating when user impact is ongoing.** Chasing the "why" while users are actively down inverts the priority; stop the bleeding first.
- **Runbooks written as architecture docs.** Explaining the system is not the same as telling someone exactly what command to run next.
- **No escalation timeout, or a timeout nobody enforces.** An escalation policy that says "escalate if unresolved" without a clock attached just means nobody escalates.
- **Alert routing untested after onboarding a new service.** The first real test of routing shouldn't be a live SEV1 where the page goes to an empty on-call schedule.
- **Dedup misconfigured, causing alert storms.** Engineers who get paged 40 times for one root cause start ignoring pages — this is a self-inflicted wound on the entire alerting system's credibility.
- **Follow-the-sun handoffs done informally.** Without a structured handoff (open incidents, known flaky alerts, deploys in flight), context evaporates at the timezone boundary and the next region re-discovers things the previous one already knew.

## Advanced Usage

- **SLO-driven paging**: instead of static thresholds ("page if error rate > 5%"), page on error-budget burn rate (e.g., "page if we'll exhaust the monthly budget within 2 hours at current burn"). Reduces false-positive pages for blips that don't actually threaten the SLO, and catches slow-burn problems static thresholds miss entirely.
- **Automated incident tooling**: Slack/Teams bots that auto-create the incident channel, invite the right people based on the paged service, pull in a starter runbook link, and post a scaffold for the scribe — removing manual setup latency from the first five minutes.
- **Chaos-tested runbooks**: the only way to know a runbook actually works at 3am is to have someone unfamiliar with the system execute it during a game day, using nothing but the doc. See [Incident Simulation Labs](./incident-simulation-labs) for structured practice.
- **Incident cost tracking**: tag postmortems with estimated revenue/reputation cost so leadership can prioritize the reliability action items against feature work with real numbers, not gut feel.
- **Cross-incident pattern analysis**: aggregate action items and root causes across postmortems quarterly — recurring contributing factors (e.g., "no canary rollout" showing up in five unrelated postmortems) indicate a systemic gap worth a dedicated initiative, not five one-off fixes.
- **Escalation policy tiering by severity**: some orgs run a *faster* escalation chain for SEV1 (page secondary immediately, don't wait for primary timeout) versus the standard chain for SEV2/3 — trading a bit of noise for lower MTTA when it matters most.

## Related Topics

- [Incident Response Mindset](./incident-response-mindset) — the individual engineer's debugging thought process once they're an SME inside an incident this document scaffolds.
- [Incident Simulation Labs](./incident-simulation-labs) — practice incidents to rehearse roles, comms templates, and runbooks under simulated pressure.
