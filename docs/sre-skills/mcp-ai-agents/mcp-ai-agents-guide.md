---
title: "MCP & AI Agents: The Complete Guide"
description: "End-to-end reference for MCP & AI Agents — the Model Context Protocol's architecture, agent design patterns, dev-automation use cases, and interview-ready Q&A."
sidebar_position: 1
tags: [mcp, ai-agents, llm, automation]
---

# MCP & AI Agents — The Complete Guide

A single-read, end-to-end reference for the Model Context Protocol (MCP) and
AI agents built on top of it: enough to design a tool-connected agent
workflow, reason about the safety trade-offs, or walk into an interview that
touches on this space. Organized as a lookup you can also read top-to-bottom.
For the human-in-the-loop and guardrail discipline this guide's agents rely
on, see the
[AI-Assisted Engineering Workflows guide](/docs/sre-skills/ai-assisted-engineering-workflows/ai-assisted-engineering-workflows-guide).

<a class="topic-crosslink" href="/cheatsheets/mcp-ai-agents">📋 Quick reference: MCP & AI Agents →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 220" role="img" aria-labelledby="mm-mcp-title mm-mcp-desc">
<title id="mm-mcp-title">How MCP connects a host to a tool</title>
<desc id="mm-mcp-desc">A host application talks through a client to a server, which wraps one external tool or data source, turning what used to be a custom integration per pairing into one standard protocol.</desc>
<defs>
  <marker id="mm-mcp-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<text class="mm-flow-label" x="390" y="55" text-anchor="middle">N + M integrations, not N × M</text>

<rect class="mm-n1" x="20" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="102" y="118" text-anchor="middle">Host</text>
<text class="mm-node-sub" x="102" y="135" text-anchor="middle">Claude Code, IDE, app</text>

<rect class="mm-n2" x="215" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="297" y="118" text-anchor="middle">Client</text>
<text class="mm-node-sub" x="297" y="135" text-anchor="middle">1:1 protocol link</text>

<rect class="mm-n3" x="410" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="492" y="118" text-anchor="middle">Server</text>
<text class="mm-node-sub" x="492" y="135" text-anchor="middle">wraps one tool</text>

<rect class="mm-n4" x="605" y="90" width="165" height="70" rx="10"/>
<text class="mm-node-title" x="687" y="118" text-anchor="middle">Tool / Data</text>
<text class="mm-node-sub" x="687" y="135" text-anchor="middle">DB, API, files</text>

<path class="mm-arrow" d="M185,125 L213,125" marker-end="url(#mm-mcp-arrow)"/>
<path class="mm-arrow" d="M380,125 L408,125" marker-end="url(#mm-mcp-arrow)"/>
<path class="mm-arrow" d="M575,125 L603,125" marker-end="url(#mm-mcp-arrow)"/>
</svg>

<p class="mental-model__caption">Every MCP-compatible host can talk to every MCP-compatible server through the same client protocol, so adding a new tool means writing one server, not one custom integration per application that wants to use it.</p>
</div>

## 1. The Problem MCP Solves

Before MCP, every application that wanted an LLM to *do* something beyond
generate text — query a database, read a file, call an internal API, search
a ticket tracker — had to build a bespoke integration between that specific
app and that specific tool. With **N applications** and **M tools**, that's
**N×M** custom integrations, each maintained separately, each reinventing
auth, schema description, and error handling.

**Model Context Protocol (MCP)** is an open, standardized protocol
(originated by Anthropic, now broadly adopted) that defines a common
interface for how an LLM-powered application discovers and calls external
tools/data sources. It turns the N×M integration problem into an **N+M**
problem: any MCP-compatible application can talk to any MCP-compatible
server, without custom glue per pairing.

```
Before MCP:                          With MCP:

App A ──custom──> Tool 1             App A ─┐
App A ──custom──> Tool 2             App B ─┼── MCP ──> Server 1 (wraps Tool 1)
App B ──custom──> Tool 1             App C ─┘           Server 2 (wraps Tool 2)
App B ──custom──> Tool 2                                Server 3 (wraps Tool 3)
App C ──custom──> Tool 1
App C ──custom──> Tool 2
  (N x M bespoke integrations)         (N + M — write once, use everywhere)
```

The common analogy: MCP is to LLM tool access roughly what **USB-C** is to
device connectors, or what **LSP (Language Server Protocol)** is to
editor-language integrations — one interface, many implementations on each
side, instead of a combinatorial mess.

---

## 2. MCP Architecture: Hosts, Clients, Servers

| Component | Role |
|---|---|
| **Host** | The user-facing AI application (Claude Code, Claude Desktop, an IDE, a custom agent app) — owns the conversation and decides when to invoke tools |
| **Client** | Lives inside the host, maintains a 1:1 stateful connection to one MCP server, handles the protocol-level message exchange |
| **Server** | A (usually lightweight, often local) process that exposes a specific set of capabilities — tools, resources, prompts — over the protocol |

```
┌─────────────────────────────────────────┐
│                  Host                     │
│   (Claude Code / Claude Desktop / IDE)    │
│                                           │
│   ┌────────┐   ┌────────┐   ┌────────┐   │
│   │ Client  │   │ Client  │   │ Client  │   │
│   └───┬────┘   └───┬────┘   └───┬────┘   │
└───────┼────────────┼────────────┼─────────┘
        │            │            │
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  MCP      │ │  MCP      │ │  MCP      │
  │ Server:   │ │ Server:   │ │ Server:   │
  │ GitHub    │ │ Postgres  │ │ Filesystem│
  └──────────┘ └──────────┘ └──────────┘
```

One host commonly holds many client connections simultaneously — one per
configured server — giving the LLM a unified view across all of them in a
single conversation.

### What a server exposes

| Primitive | What it is | Example |
|---|---|---|
| **Tools** | Callable functions with a defined input schema — the LLM decides when to invoke them | `create_pull_request(repo, branch, title, body)` |
| **Resources** | Read-only data the host can pull into context, addressed like URIs | `file:///repo/README.md`, `postgres://db/schema` |
| **Prompts** | Reusable, parameterized prompt templates the server offers | "summarize-incident" template taking a timeframe argument |

### Transport

MCP defines the message schema (JSON-RPC 2.0-based) independent of
transport; the two common transports are **stdio** (server runs as a local
subprocess, host talks over stdin/stdout — the common case for local dev
tools like a filesystem or git server) and **HTTP/SSE (streamable HTTP)**
(server runs remotely, host connects over the network — the common case for
hosted/shared servers like a company's internal ticketing system).

```json
// Example MCP server config, host-side (conceptual)
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "..." }
    },
    "postgres": {
      "url": "https://internal-mcp.example.com/postgres",
      "auth": "oauth"
    }
  }
}
```

---

## 3. Agents vs. Single-Shot LLM Calls

A single-shot LLM call takes a prompt, produces a completion, and stops —
there is no loop, no state carried forward, no ability to check its own work
or gather more information mid-task.

An **agent** wraps an LLM in a **loop**: the model can decide to call a tool,
observe the result, and decide what to do next — repeating until it decides
the task is done (or hits a stop condition). This is what turns "generate
text describing how you'd fix this bug" into "actually read the file, make
the edit, run the tests, and report the result."

| | Single-shot | Agent |
|---|---|---|
| **Structure** | One prompt → one completion | Prompt → (tool call → observation)* → completion |
| **State** | None beyond the single exchange | Carries context across every step in the loop |
| **Can verify its own work** | No | Yes — e.g., run tests after editing code |
| **Failure mode** | Wrong answer, once | Can compound errors across steps if unchecked |
| **Needs** | Just a prompt | Tool access (often via MCP), a stopping condition, usually a token/step budget |

### The core loop (ReAct-style)

**ReAct** ("Reason + Act") is the foundational pattern most agent loops
implement, interleaving explicit reasoning with tool calls:

```
1. Reason: "The user wants me to fix the failing test. Let me first
   look at the test file and the code it's testing."
2. Act: call tool `read_file("tests/test_checkout.py")`
3. Observe: [file contents returned]
4. Reason: "The test expects a 400 but the handler returns 500 on
   invalid input. Let me check the handler."
5. Act: call tool `read_file("src/handlers/checkout.py")`
6. Observe: [file contents returned]
7. Reason: "Found it — missing input validation. Let me fix it."
8. Act: call tool `edit_file(...)`
9. Act: call tool `run_tests("tests/test_checkout.py")`
10. Observe: "1 passed"
11. Reason: "Test passes. Task complete."
```

Each reasoning step narrows what the next tool call should be; each
observation feeds back into the model's context for the next reasoning
step. This is exactly the loop an MCP-connected agentic coding tool runs
under the hood, with MCP supplying the standardized tool-calling interface.

---

## 4. Agent Design Patterns

| Pattern | Shape | When to use |
|---|---|---|
| **ReAct (single agent loop)** | One model alternates reasoning and acting until done | Most coding-agent and single-owner tasks — the default shape |
| **Orchestrator-worker** | One "orchestrator" model plans and delegates subtasks to specialized "worker" agents/calls, then synthesizes results | Tasks that decompose into independent parallel subtasks (e.g., "research these 5 libraries" — one worker per library) |
| **Human-in-the-loop checkpoints** | The agent pauses at defined points and requires explicit human approval before continuing | Any step with real-world side effects — before a deploy, before a destructive command, before opening/merging a PR |
| **Reflection / self-critique** | The agent (or a second model call) reviews its own prior output before finalizing | Higher-stakes generation tasks where a second pass catches obvious errors cheaply |
| **Planner-executor** | An explicit upfront plan is generated and (optionally human-)approved before any execution begins | Multi-step tasks where you want visibility into the *approach* before any tool calls happen, not just the final result |

Orchestrator-worker is the pattern behind "one main agent spawns several
subagents to research different things in parallel, then combines their
findings" — it trades some coordination overhead for parallelism and keeps
each worker's context focused and small, rather than one agent juggling
everything in a single long-running context.

### Where human-in-the-loop checkpoints matter most

```
Read-only steps (low risk):           Write/side-effecting steps (checkpoint):
- read a file                         - git commit / push
- run a query                         - open or merge a PR
- run tests                           - apply a Terraform plan
- search the web                      - deploy to any environment
- summarize logs                      - delete/modify data
```

The general rule mirrors the guardrail discipline in the
[AI-Assisted Engineering Workflows guide](/docs/sre-skills/ai-assisted-engineering-workflows/ai-assisted-engineering-workflows-guide):
anything read-only can run with a longer autonomous leash; anything that
writes or is hard to reverse gets an explicit approval gate before it
executes, regardless of how confident the agent's reasoning looked.

---

## 5. Practical Use in Dev Automation

A concrete, realistic shape for an MCP-connected coding agent's tool access:

```json
{
  "mcpServers": {
    "git":       { "command": "mcp-server-git" },
    "filesystem":{ "command": "mcp-server-filesystem", "args": ["--root", "./repo"] },
    "test-runner":{ "command": "mcp-server-shell", "args": ["--allow", "pytest,npm test"] },
    "github":    { "command": "mcp-server-github", "env": { "GITHUB_TOKEN": "..." } }
  }
}
```

With this, a coding agent's loop for "fix this failing test in CI" looks
like:

```
1. read_file / search_code (filesystem server) — locate the failing test and related code
2. run_tests (test-runner server) — reproduce the failure locally
3. edit_file (filesystem server) — propose a fix
4. run_tests again — verify the fix actually resolves it, doesn't break others
5. git_diff / git_commit (git server) — stage the change with a clear message
6. create_pull_request (github server) — open a PR for human review
   <-- human-in-the-loop checkpoint: a person reviews and merges, agent doesn't auto-merge
```

Each numbered step is a tool call exposed by an MCP server; the agent
decides the sequence and adapts based on each observation (e.g., if step 4
still fails, it loops back to step 3 rather than proceeding to step 5). The
value of MCP here specifically is that "test-runner," "git," and "github"
servers are reusable, off-the-shelf building blocks — the agent framework
didn't need bespoke integration code for any of them.

### Other realistic dev-automation shapes

- **Incident triage agent**: MCP servers for your metrics backend, log
  store, and ticketing system; agent correlates a firing alert with recent
  deploys and relevant logs, drafts a triage summary — stops short of taking
  any remediation action itself.
- **Dependency-upgrade agent**: reads `package.json`/`requirements.txt` via
  a filesystem server, checks changelogs via a web-fetch server, runs the
  test suite via a test-runner server, opens a PR with a summary of what
  changed and what it verified — human still reviews and merges.
- **Documentation-sync agent**: on a code change, an agent checks whether
  related docs mention the changed behavior, drafts an update, opens a PR —
  same human-approval checkpoint before merge.

---

## 6. Safety & Guardrail Considerations

Giving an agent **write access to real systems** is where agent design
stops being a productivity question and becomes a safety-engineering one.

- **Principle of least privilege for tool scope** — an agent doing code
  review shouldn't also have a tool that can push to `main` or modify IAM
  policies; scope each MCP server/tool's permissions to exactly what that
  agent's task needs, not "whatever might be useful someday."
- **Explicit approval gates before irreversible actions** — merges,
  deploys, deletions, and infra applies should require a human "yes" in the
  loop, not just a high-confidence model decision. This is true even for
  agents that have historically been reliable — confidence expressed by the
  model's output is not a calibrated measure of actual correctness.
- **Sandboxing and scoped credentials** — run agent-executed commands in a
  sandboxed/ephemeral environment where feasible, and issue narrowly scoped,
  short-lived credentials (a token that can open PRs but not merge them, a
  DB connection that's read-only) rather than reusing a human operator's
  full-privilege credentials.
- **Audit logging of every tool call** — every MCP tool invocation an agent
  makes should be logged (what was called, with what arguments, what it
  returned) so a human can reconstruct exactly what an agent did after the
  fact — the same expectation you'd have of any automation with production
  access.
- **Prompt injection from tool outputs** — a subtle risk specific to agents:
  if a tool result (a file's contents, a web page, a ticket description)
  contains text crafted to look like new instructions, a naively designed
  agent loop can be manipulated into following them. Treat all
  tool-returned content as **data, not instructions** — this needs to be
  designed into the agent/host, not left to the model to figure out
  case-by-case.
- **Rate/step/cost budgets** — cap how many tool calls or how much
  wall-clock time an agent loop can run unattended before requiring human
  check-in, so a stuck or looping agent (e.g., repeatedly retrying a failing
  command) doesn't run away silently.
- **Reversibility as a design lens** — when deciding whether an action needs
  a human checkpoint, ask "if the agent is wrong here, how hard is this to
  undo?" A misfiled read is free to undo; a merged PR, a sent notification,
  or a deleted resource often isn't — scale the amount of human oversight to
  that asymmetry, not to how tedious the checkpoint feels.

---

## 7. MCP vs. Plain Function/Tool Calling

Every major LLM API already supports **function/tool calling** — you define
a JSON schema for a function, the model returns a request to call it with
specific arguments, your application code executes it and returns the
result. MCP doesn't replace this mechanism; it standardizes what sits
**around** it.

| | Plain function calling (app-defined) | MCP |
|---|---|---|
| **Tool definition** | Hand-written per application, per tool | Server defines it once, any MCP host can use it |
| **Discovery** | Static — hardcoded into the app | Dynamic — host queries the server for its available tools/resources at connect time |
| **Reuse across apps** | None — copy-paste the schema/glue code into each app | A single server (e.g., a GitHub MCP server) works unmodified across every MCP host |
| **Underlying model mechanism** | The model's native tool-calling API | The same native tool-calling API — MCP feeds it a standardized tool list |
| **Resources/prompts** | Not part of the spec — ad hoc | First-class primitives alongside tools |

In other words: the LLM still ultimately does "function calling" under the
hood exactly as it always did — MCP's contribution is standardizing **how
the set of available tools gets defined, discovered, and shared**, so that
work isn't redone per application.

### Where this shows up in practice

- A team building an internal Postgres query tool for one AI coding
  assistant, pre-MCP, would need to rebuild that same integration for a
  second assistant/IDE. An MCP Postgres server is written once and both can
  connect to it.
- Community and vendor-maintained MCP servers (GitHub, Slack, filesystem,
  Google Drive, various databases) exist specifically because the protocol
  makes them reusable investments rather than one-off integrations tied to
  a single vendor's assistant.

---

## 8. Interview-Ready Q&A

**Q: What specific problem does MCP solve, and why wasn't a bespoke
per-app integration good enough?**
A: Before MCP, every AI application that wanted to call an external tool or
data source needed a custom integration built specifically for that
app-tool pairing — with N apps and M tools that's N×M integrations, each
duplicating auth, schema, and error-handling work. MCP standardizes the
interface both sides speak, turning it into an N+M problem: any
MCP-compatible host can use any MCP-compatible server without new glue code
per pairing.

**Q: Walk through the host/client/server architecture in MCP.**
A: The host is the user-facing AI application (e.g., Claude Code) that owns
the conversation and decides when to invoke a tool. Inside the host, a
client maintains a stateful 1:1 connection to a single MCP server. The
server is the process that actually exposes tools, resources, and prompts —
it can run locally as a subprocess over stdio, or remotely over HTTP. A host
typically holds many client connections at once, giving one conversation
unified access across all connected servers.

**Q: What's the core difference between a single-shot LLM call and an
agent?**
A: A single-shot call takes a prompt and returns one completion with no
ability to gather more information or verify its own work. An agent wraps
the model in a loop — it can call a tool, observe the result, and decide
what to do next, repeating until the task is done or a stop condition is
hit. That loop, formalized as reason-then-act-then-observe (ReAct), is what
lets an agent actually read a file, make an edit, run tests, and confirm the
fix worked, rather than just describing how it would.

**Q: Explain the ReAct pattern in your own words.**
A: ReAct interleaves explicit reasoning steps with tool-call actions: the
model reasons about what it currently knows and what to do next, takes an
action (a tool call), observes the result, and feeds that observation into
the next reasoning step. This loop repeats until the model decides the task
is complete. It's the foundational pattern most coding agents and
MCP-connected tool-using agents implement under the hood.

**Q: When would you use an orchestrator-worker pattern instead of a single
agent loop?**
A: When a task decomposes into genuinely independent subtasks that can run
in parallel — e.g., researching several unrelated libraries, or gathering
status from several unrelated services. An orchestrator plans and delegates
each subtask to a worker agent/call, then synthesizes the results. This
keeps each worker's context small and focused and gets parallelism a single
sequential agent loop wouldn't, at the cost of some coordination overhead
and the need to reconcile the workers' outputs at the end.

**Q: You're designing an agent that can open pull requests. What guardrails
would you put around it before giving it write access to a real repo?**
A: Scope its MCP tool access to least privilege — a token that can open PRs
but not merge or push directly to protected branches. Put a human-in-the-loop
checkpoint before anything irreversible (merging, deleting, force-pushing).
Log every tool call it makes for audit purposes. Cap its step/time budget so
a stuck loop doesn't run away. And treat any content it reads from tool
outputs (file contents, issue descriptions) as untrusted data, not
instructions, to guard against prompt injection via that content.

**Q: What is prompt injection in the context of an agent using MCP tools,
and why is it a distinct risk from a normal chat conversation?**
A: It's when content an agent reads through a tool (a file, a web page, a
ticket description) contains text crafted to look like instructions, and a
naively built agent loop follows them as if the user had said them. It's
distinct from normal chat because in a chat, the user controls all the
input; an agent with tool access pulls in content from sources it doesn't
control, so that content needs to be architecturally treated as data, not
as a new set of instructions — that separation has to be designed into the
host/agent, not left to the model's judgment alone.

**Q: How do you decide how much human oversight an agentic workflow step
needs?**
A: Scale it to reversibility, not to how tedious the checkpoint feels. A
read-only step (querying logs, reading a file, running a search) can run
with a long autonomous leash because a wrong step there is cheap to notice
and costs nothing to undo. A write or side-effecting step — a deploy, a
merge, a deletion, an infra apply — needs an explicit human approval gate
before it executes, because the cost of the agent being wrong there is high
and often not easily reversible.

**Q: How does MCP relate to a model's native function/tool-calling
capability — does it replace it?**
A: No — the model still calls functions exactly the way it always has under
its provider's native tool-calling API. MCP standardizes what sits around
that mechanism: how the set of available tools gets defined, discovered,
and shared across applications. Without MCP, each application hand-defines
and maintains its own tool integrations; with MCP, a server (e.g., a GitHub
or Postgres server) is written once and any MCP-compatible host can
discover and use it unmodified.

---

## 9. One-Line Summary

**MCP standardizes how AI applications discover and call external tools/data
sources, turning bespoke per-app integrations into reusable servers; agents
built on top of it turn single-shot LLM calls into reason-act-observe loops
with real tool access — and the entire safety story comes down to scoping
that access narrowly and gating anything irreversible behind a human
checkpoint.**
