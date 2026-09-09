---
title: "Kiro Cheat Sheet"
description: "Quick reference for Kiro — the spec-driven requirements/design/tasks workflow, steering, hooks, and MCP."
tags: [kiro, ai, cheat-sheet]
hide_table_of_contents: true
---

# Kiro cheatsheet

A one-page reference for Kiro's spec-driven workflow. For the full walkthrough
and worked EARS/design/tasks examples, see the [complete guide](/docs/ai-skills/kiro/kiro-guide).

<a class="topic-crosslink" href="/docs/ai-skills/kiro/kiro-guide">📖 Full guide: Kiro →</a>

<div class="cheat-sheet cheat-sheet--ai">

<div class="cheat-card">

#### The core loop

```
Idea → requirements.md → [review gate]
     → design.md → [review gate]
     → tasks.md → [review gate]
     → implementation
```

Spec first, code second — the agent never touches implementation files until
a task list is approved.

</div>

<div class="cheat-card">

#### `.kiro/` layout

```
.kiro/
├── specs/<feature>/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── steering/{product,tech,structure}.md
├── hooks/*.json
└── settings/mcp.json
```

</div>

<div class="cheat-card">

#### EARS acceptance criteria

```
WHEN <trigger> THE SYSTEM SHALL <response>
IF <precondition> THEN THE SYSTEM SHALL <response>
WHILE <state> THE SYSTEM SHALL <response>
```

Unambiguous and testable — unlike "handle errors gracefully," every
criterion has a concrete trigger and observable response.

</div>

<div class="cheat-card">

#### Tasks trace to requirements

```markdown
- [x] 1. Add failed_attempts/locked_until columns
      _Requirements: 3, 4_
- [ ] 2. Implement lockout logic
      _Requirements: 3, 4_
```

Three-hop trace: requirement → task → commit/PR.

</div>

<div class="cheat-card">

#### Steering (persistent context)

| File | Purpose |
|---|---|
| `product.md` | what the product is, who it's for |
| `tech.md` | stack, versions, conventions |
| `structure.md` | repo layout, naming, boundaries |

`inclusion: always \| fileMatch \| manual` controls when a steering file loads.

</div>

<div class="cheat-card">

#### Agent hooks

```json
{
  "trigger": { "type": "fileEdited", "pattern": "src/services/**/*.ts" },
  "action": { "type": "agentPrompt", "prompt": "Sync tests for this change." }
}
```

For deterministic housekeeping (test sync, doc refresh) — not a CI
replacement; hooks can be skipped or missed.

</div>

<div class="cheat-card">

#### MCP integration

```json
{ "mcpServers": { "aws-docs": { "command": "uvx",
  "args": ["aws-documentation-mcp-server@latest"], "autoApprove": [] } } }
```

Scope `autoApprove` to read-only tools — never auto-approve write/delete
capable ones.

</div>

<div class="cheat-card">

#### Kiro vs. autocomplete tools

| | Cursor/Copilot | Kiro |
|---|---|---|
| Intent | chat transcript, ephemeral | checked into git |
| Review | after code (diff) | before code + per-task |
| Traceability | none by default | requirement → task → PR |

</div>

<div class="cheat-card">

#### Common mistakes

- Skipping review gates (one uninterrupted pass to code)
- Vague EARS criteria with no concrete trigger/response
- Treating `.kiro/specs/` as disposable, deleting after merge
- Letting steering docs drift out of date
- Over-scoping hooks to fire on every keystroke-adjacent save
- Broad MCP `autoApprove` on write/delete tools

</div>

<div class="cheat-card">

#### When to skip specs

Small, self-contained changes — a one-line fix, quick prototype — don't need
requirements/design overhead. Specs earn their cost on features with real
acceptance criteria, multiple reviewers, or compliance needs.

</div>

</div>
