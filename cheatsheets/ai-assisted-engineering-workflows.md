---
title: "AI-Assisted Engineering Cheat Sheet"
description: "Quick reference for AI-assisted engineering workflows — guardrails, human-in-the-loop, and overreliance risks."
tags: [ai-assisted-engineering, sre, cheat-sheet]
hide_table_of_contents: true
---

# AI-assisted engineering cheatsheet

A one-page reference for using AI assistants safely in engineering/SRE work.
For rollout strategy and productivity data, see the [complete guide](/docs/sre-skills/ai-assisted-engineering-workflows/ai-assisted-engineering-workflows-guide).

<a class="topic-crosslink" href="/docs/sre-skills/ai-assisted-engineering-workflows/ai-assisted-engineering-workflows-guide">📖 Full guide: AI-Assisted Engineering →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Never blindly apply AI-generated infra changes

- Treat AI-generated Terraform/K8s/IAM changes like a junior engineer's PR —
  read every line, run `terraform plan`/`kubectl diff`.
- Be extra suspicious of AI-generated **IAM/permission** changes — models
  default toward overly permissive policies. Scope them down explicitly.
- Never let an agent apply to production without a human-approved plan-review-apply gate.

</div>

<div class="cheat-card">

#### Human-in-the-loop, by risk

| Task | Oversight needed |
|---|---|
| Read-only (query logs, summarize metrics) | low |
| Anything that **writes** (deploy, config push, migration, `kubectl apply`) | explicit approval gate |

</div>

<div class="cheat-card">

#### Verify, don't trust

LLMs hallucinate plausible-sounding but nonexistent flags/config
keys/API methods, especially for less-common tools or anything past the
model's knowledge cutoff. Check generated commands against real docs or a
dry run before running them against anything that matters.

</div>

<div class="cheat-card">

#### Prompt engineering basics

- Give it a role/context to calibrate tone/expertise.
- Show 1-2 examples for a specific format.
- Ask for step-by-step reasoning on hard problems.
- Specify format explicitly (length, structure).

</div>

<div class="cheat-card">

#### Overreliance risks

- Accepting generated code/config without understanding it — you own it in
  the incident at 3am, not the model.
- Skill atrophy on fundamentals the assistant now does by default.
- False confidence from fluent-sounding but wrong output.

</div>

<div class="cheat-card">

#### Rollout checklist

- Start with low-risk, read-only use cases.
- Require human approval on anything that writes to production.
- Review flagged/high-risk outputs as a team, not solo.

<span class="cheat-see">See: A Practical Workflow Checklist</span>

</div>

</div>
