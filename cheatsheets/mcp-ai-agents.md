---
title: "MCP & AI Agents Cheat Sheet"
description: "Quick reference for MCP and AI agents — hosts/clients/servers, tools/resources/prompts, and agent design patterns."
tags: [mcp, ai-agents, sre, cheat-sheet]
hide_table_of_contents: true
---

# MCP & AI agents cheatsheet

A one-page reference for MCP and AI agents. For agent design patterns and
safety/guardrail depth, see the [complete guide](/docs/sre-skills/mcp-ai-agents/mcp-ai-agents-guide).

<a class="topic-crosslink" href="/docs/sre-skills/mcp-ai-agents/mcp-ai-agents-guide">📖 Full guide: MCP & AI Agents →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Architecture: host, client, server

| Component | Role |
|---|---|
| Host | user-facing AI app (Claude Code, an IDE, a custom agent) — owns the conversation |
| Client | inside the host, 1:1 stateful connection to one MCP server |
| Server | exposes tools/resources/prompts over the protocol |

One host commonly holds many client connections at once — one per configured server.

</div>

<div class="cheat-card">

#### What a server exposes

| Primitive | What it is |
|---|---|
| Tools | callable functions with an input schema — the LLM decides when to invoke |
| Resources | read-only data, addressed like URIs (`file://`, `postgres://`) |
| Prompts | reusable, parameterized prompt templates |

</div>

<div class="cheat-card">

#### Transport

- **stdio** — server runs as a local subprocess (filesystem, git servers).
- **HTTP/SSE** — server runs remotely (hosted/shared servers).

Protocol is JSON-RPC 2.0-based, transport-independent.

</div>

<div class="cheat-card">

#### Agents vs single-shot calls

A single-shot LLM call answers once from its context. An **agent** loops:
observe → decide → call a tool → observe the result → decide again — until
the task is done or it hits a stop condition.

</div>

<div class="cheat-card">

#### Safety & guardrails

- Scope tool permissions narrowly — least privilege, same as any service credential.
- Put a human-approval checkpoint before irreversible/production-impacting actions.
- Read-only/investigative tasks: lower oversight. Anything that **writes**: explicit approval gate.

</div>

<div class="cheat-card">

#### MCP vs plain function calling

Plain tool/function calling is one host wiring its own tools by hand. MCP
standardizes the protocol so any compliant host can talk to any compliant
server — write the server once, use it from every MCP-compatible client.

<span class="cheat-see">See: Safety & Guardrail Considerations</span>

</div>

</div>
