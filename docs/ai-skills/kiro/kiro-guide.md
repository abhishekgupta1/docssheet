---
title: "Kiro: The Complete Guide"
description: "End-to-end reference for Kiro, AWS's spec-driven agentic IDE — the requirements/design/tasks workflow, steering, hooks, MCP integration, and interview-ready Q&A."
sidebar_position: 1
tags: [kiro, ai-ide, aws, spec-driven-development, agentic-coding]
---

# Kiro — The Complete Guide

A single-read, end-to-end reference for Kiro: what it is, how its spec-driven
workflow differs from plain AI-autocomplete tools, and how the pieces —
specs, steering, hooks, and MCP — fit together in a real team's SDLC.
Organized as a lookup you can also read top-to-bottom.

Kiro is a fast-evolving product (a VS Code fork from AWS, publicly
introduced in 2025), so treat the concrete file names, JSON shapes, and UI
flows below as illustrative of the underlying concepts rather than a
permanently fixed spec — verify exact syntax against current AWS
documentation before depending on it in production tooling.

<a class="topic-crosslink" href="/cheatsheets/kiro">📋 Quick reference: Kiro →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-kiro-title mm-kiro-desc">
<title id="mm-kiro-title">Kiro's spec-first pipeline</title>
<desc id="mm-kiro-desc">An idea becomes requirements, then a design, then a checkbox task list, each behind a review gate, before any implementation code is touched. Steering, hooks, and MCP supply persistent context, automation, and tool access that feed into that same pipeline.</desc>
<defs>
  <marker id="mm-kiro-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="10" y="50" width="100" height="60" rx="10"/>
<text class="mm-node-title" x="60" y="85" text-anchor="middle">Idea</text>

<path class="mm-arrow" d="M110,80 L146,80" marker-end="url(#mm-kiro-arrow)"/>

<rect class="mm-n5" x="150" y="40" width="140" height="80" rx="10"/>
<text class="mm-node-title" x="220" y="75" text-anchor="middle">Requirements</text>
<text class="mm-node-sub" x="220" y="92" text-anchor="middle">user stories, EARS</text>

<path class="mm-arrow" d="M290,80 L326,80" marker-end="url(#mm-kiro-arrow)"/>
<text class="mm-flow-label" x="308" y="68" text-anchor="middle">review gate</text>

<rect class="mm-n2" x="330" y="40" width="120" height="80" rx="10"/>
<text class="mm-node-title" x="390" y="75" text-anchor="middle">Design</text>
<text class="mm-node-sub" x="390" y="92" text-anchor="middle">architecture, data</text>

<path class="mm-arrow" d="M450,80 L486,80" marker-end="url(#mm-kiro-arrow)"/>
<text class="mm-flow-label" x="468" y="68" text-anchor="middle">review gate</text>

<rect class="mm-n1" x="490" y="40" width="120" height="80" rx="10"/>
<text class="mm-node-title" x="550" y="75" text-anchor="middle">Tasks</text>
<text class="mm-node-sub" x="550" y="92" text-anchor="middle">checkbox steps</text>

<path class="mm-arrow" d="M610,80 L646,80" marker-end="url(#mm-kiro-arrow)"/>
<text class="mm-flow-label" x="628" y="68" text-anchor="middle">review gate</text>

<rect class="mm-n4" x="650" y="40" width="120" height="80" rx="10"/>
<text class="mm-node-title" x="710" y="75" text-anchor="middle">Implementation</text>
<text class="mm-node-sub" x="710" y="92" text-anchor="middle">code changes</text>

<path class="mm-arrow" d="M150,210 L215,124" marker-end="url(#mm-kiro-arrow)"/>
<path class="mm-arrow" d="M390,210 L530,124" marker-end="url(#mm-kiro-arrow)"/>
<path class="mm-arrow" d="M630,210 L700,124" marker-end="url(#mm-kiro-arrow)"/>

<rect class="mm-n6" x="60" y="210" width="180" height="70" rx="10"/>
<text class="mm-node-title" x="150" y="240" text-anchor="middle">Steering</text>
<text class="mm-node-sub" x="150" y="257" text-anchor="middle">persistent project context</text>

<rect class="mm-n1" x="300" y="210" width="180" height="70" rx="10"/>
<text class="mm-node-title" x="390" y="240" text-anchor="middle">Hooks</text>
<text class="mm-node-sub" x="390" y="257" text-anchor="middle">event-triggered automations</text>

<rect class="mm-n2" x="540" y="210" width="180" height="70" rx="10"/>
<text class="mm-node-title" x="630" y="240" text-anchor="middle">MCP</text>
<text class="mm-node-sub" x="630" y="257" text-anchor="middle">pluggable tool access</text>
</svg>

<p class="mental-model__caption">Kiro never lets the agent touch implementation code until an idea has passed through reviewed requirements, design, and task-list gates in that order, while steering context, event-triggered hooks, and MCP tool access feed into that same spec-first pipeline from below.</p>
</div>

## 1. What Kiro Is

Kiro is an agentic AI IDE from AWS built around **spec-driven development**:
before the agent writes a single line of implementation code, it
collaborates with you to produce structured, reviewable artifacts —
requirements, design, and a task list — checked into the repo under
`.kiro/`. On top of that spec workflow it layers persistent project context
(**steering**), event-triggered automations (**hooks**), and pluggable tool
access (**MCP**), so agent output stays traceable and repeatable rather than
a one-off "vibe coded" diff.

The core loop, in one line: **spec first, code second.** The agent doesn't
touch implementation files until a task list is approved, and every task in
that list traces back to a specific requirement.

```
Idea → requirements.md → [review gate] → design.md → [review gate] → tasks.md → [review gate] → implementation
```

```
.kiro/
├── specs/
│   └── <feature-name>/
│       ├── requirements.md   # user stories + EARS acceptance criteria
│       ├── design.md         # architecture, sequence diagrams, data models
│       └── tasks.md          # discrete, checkbox-tracked implementation steps
├── steering/
│   ├── product.md             # what the product is, who it's for
│   ├── tech.md                 # stack, libraries, conventions
│   └── structure.md           # repo layout, naming, module boundaries
├── hooks/
│   └── *.json | *.kiro.hook   # event-triggered agent automations
└── settings/
    └── mcp.json                # MCP server registrations (workspace or user-level)
```

---

## 2. Spec-Driven Development vs. Vibe Coding

"Vibe coding" — the plain Cursor/Copilot-style autocomplete or chat-to-code
loop — optimizes for velocity on a single prompt: you describe what you
want, the agent produces code, you iterate on the diff. There's no durable
intermediate artifact; intent lives only in the chat transcript and
disappears once the session ends. That's fine for a small fix, but it
leaves nothing for a reviewer, a future teammate, or a compliance audit to
point back to.

Kiro inserts explicit review gates before any code gets generated:

1. **Requirements gate** — the agent turns a feature idea into user stories
   and formal, testable acceptance criteria (EARS format — see below), then
   stops for your approval.
2. **Design gate** — once requirements are approved, the agent proposes
   architecture: components, data models, sequence diagrams, API contracts,
   error-handling strategy. Stops for approval again.
3. Only after design is approved does the agent generate **`tasks.md`**, a
   discrete, ordered, checkbox-tracked implementation plan, where each task
   references the requirement(s) it satisfies.
4. Implementation proceeds task by task — often one task per agent turn —
   so you can review each diff against its listed requirement before the
   agent moves on to the next one.

The net effect: specs become a persistent, versioned artifact you can diff,
review in a pull request, and reference later — closer to how a human
tech lead and engineer would pair, versus a single unstructured
prompt-to-code exchange. Skipping the gates and letting the agent barrel
straight through requirements → design → tasks → code in one pass defeats
the purpose; you end up debugging one large diff instead of several small,
pre-reviewed ones.

---

## 3. EARS-Format Acceptance Criteria

Kiro's `requirements.md` expresses acceptance criteria in **EARS** (Easy
Approach to Requirements Syntax) instead of free-form prose, because EARS
statements are unambiguous and testable in a way that prose like "the login
should be fast and secure" simply isn't:

- `WHEN <trigger> THE SYSTEM SHALL <response>`
- `IF <precondition> THEN THE SYSTEM SHALL <response>`
- `WHILE <state> THE SYSTEM SHALL <response>`

This structure is what makes a requirement mechanically traceable to a task
and, later, to an automated test. A vague criterion like "handle errors
gracefully" can't be mapped 1:1 to either — every criterion needs a
concrete trigger and a concrete, observable response.

### Example: `.kiro/specs/user-authentication/requirements.md`

```markdown
# Requirements: User Authentication

## User Story 1
As a registered user, I want to log in with email and password,
so that I can access my account.

### Acceptance Criteria
1. WHEN a user submits valid credentials
   THE SYSTEM SHALL authenticate the user and redirect to /dashboard within 2 seconds
2. IF a user submits invalid credentials
   THEN THE SYSTEM SHALL display "Invalid email or password" without indicating which field was wrong
3. IF an account has 5 consecutive failed login attempts within 10 minutes
   THEN THE SYSTEM SHALL lock the account for 15 minutes and notify the user by email
4. WHILE an account is locked
   THE SYSTEM SHALL reject login attempts with a 423 status and a "try again later" message
```

### Example: `.kiro/specs/user-authentication/design.md` (excerpt)

```markdown
# Design: User Authentication

## Architecture
- `AuthController` (HTTP layer) → `AuthService` (business logic) → `UserRepository` (persistence)
- Password hashing: bcrypt, cost factor 12
- Session token: signed JWT, 15 min access / 7 day refresh

## Sequence: Login
sequenceDiagram
    participant U as User
    participant C as AuthController
    participant S as AuthService
    participant R as UserRepository
    U->>C: POST /login {email, password}
    C->>S: authenticate(email, password)
    S->>R: findByEmail(email)
    R-->>S: User | null
    S->>S: verify password hash, check lockout state
    S-->>C: AuthResult
    C-->>U: 200 + session cookie | 401 | 423

## Data Model
| Field | Type | Notes |
|---|---|---|
| `failed_attempts` | int | resets on success |
| `locked_until` | timestamp \| null | drives the WHILE-locked criterion |
```

### Example: `.kiro/specs/user-authentication/tasks.md` (excerpt)

```markdown
# Implementation Tasks

- [x] 1. Add `failed_attempts` and `locked_until` columns to `users` table
      _Requirements: 3, 4_
- [x] 2. Implement `AuthService.authenticate()` with bcrypt verification
      _Requirements: 1, 2_
- [ ] 3. Implement lockout logic (increment/reset counter, set locked_until)
      _Requirements: 3, 4_
- [ ] 4. Add integration tests covering all four acceptance criteria
      _Requirements: 1, 2, 3, 4_
```

Each task cites the requirement number(s) it implements — this is the
traceability thread that lets a reviewer (or a future you) answer "which
code satisfies requirement 3?" without re-reading the whole diff. Because
every task cites its requirement, and every commit/PR should reference the
task it closes, you get a three-hop trace: **requirement → task →
commit/PR** — the artifact a reviewer needs to confirm a PR actually
satisfies what was agreed, without re-deriving intent from the diff alone.
Plain vibe-coded PRs structurally lack this.

Larger features are usually better split into multiple spec directories
(`.kiro/specs/user-authentication/`, `.kiro/specs/password-reset/`, …) that
can reference each other's requirements — e.g., password-reset's design
citing auth's lockout logic — rather than one monolithic spec. Keep each
spec scoped to something independently reviewable and shippable, and treat
`.kiro/specs/` as living documentation, not disposable scratch: deleting a
spec directory after merge throws away the traceability that justified
using specs in the first place.

---

## 4. Steering: Persistent Project Context

Steering documents (`.kiro/steering/*.md`) are persistent project context
the agent is expected to load and honor on every turn — not just for one
spec. By default Kiro seeds three:

| File | Purpose |
|---|---|
| `product.md` | What the product is, who it's for |
| `tech.md` | Stack, frameworks, versions, conventions |
| `structure.md` | Directory layout, naming, module boundaries |

Steering is the mechanism that stops an agent from re-litigating "which
HTTP client do we use" or "where do controllers live" on every session —
the same context a senior engineer would give a new hire verbally, but
persistent and consistently applied.

You can add custom steering files beyond the default three, with front
matter controlling *when* each one loads:

- `inclusion: always` — loaded into every agent interaction.
- `inclusion: fileMatch` with a glob — loaded only when files matching the
  pattern are in context.
- `inclusion: manual` — loaded only when explicitly referenced.

### Example: scoped steering — `.kiro/steering/api-conventions.md`

```markdown
---
inclusion: fileMatch
fileMatchPattern: 'src/api/**/*.ts'
---

# API Conventions

- All routes return `{ data, error }` envelopes, never bare arrays/objects.
- Pagination uses `?cursor=` + `limit`, never offset-based paging.
- Validation errors return 422 with a `field -> message` map.
- New endpoints require an OpenAPI entry in `docs/openapi.yaml` in the same PR.
```

Combining several `inclusion: fileMatch` steering files per subsystem — API
conventions, frontend component conventions, infra conventions — keeps
agent context scoped to what's relevant, rather than loading the entire
project's conventions into every prompt.

Steering files are living documents, not a one-time setup step. A `tech.md`
that still says "we use Redux" three migrations later actively misleads the
agent into reproducing deprecated patterns; steering needs the same upkeep
as onboarding docs, reviewed at major refactors. On a team, checking
`.kiro/steering/*.md` into the repo (rather than leaving it as local-only
config) means every engineer's agent sessions — and every spec generated —
inherit the same architectural constraints, cutting down on the "reviewer
has to explain the same convention in every PR" tax.

---

## 5. Agent Hooks

Agent hooks are event-triggered automations: an IDE event — a file saved, a
file created, a spec task marked complete, or a manual trigger — fires an
agent prompt automatically, without you re-typing it. Typical uses:

- Run or update tests when a source file changes.
- Refresh a changelog or API doc when a route file changes.
- Enforce a lint/format pass before a task is marked done.

Hooks close the loop between "developer intent" and the housekeeping work
that's easy to forget under deadline pressure.

### Example (illustrative): "update tests on service change"

```json
{
  "name": "sync-tests-on-service-change",
  "trigger": {
    "type": "fileEdited",
    "pattern": "src/services/**/*.ts"
  },
  "action": {
    "type": "agentPrompt",
    "prompt": "A service file changed. Check whether its unit tests in test/services/ still cover the modified behavior. Update or add tests as needed, then run the test suite for this file and report failures."
  }
}
```

Hooks are for deterministic housekeeping — test sync, doc refresh, lint —
not open-ended feature work; reserve specs for anything that actually
changes behavior. Scope triggers to meaningful boundaries (a save after an
edit session, a task completion) rather than high-frequency events — a hook
firing on every keystroke-adjacent save burns tokens and interrupts flow.

It's also worth being clear about where hooks sit relative to CI: hooks run
inside the IDE session, not in CI, so they complement rather than replace
CI checks. A hook keeps tests roughly in sync while you work; CI remains
the authoritative gate on merge. Don't treat a hook firing as a substitute
for a required CI check — hooks can be skipped, disabled, or miss an edit
made outside the IDE.

---

## 6. MCP Integration

Kiro can register MCP (Model Context Protocol) servers — at the workspace
level (`.kiro/settings/mcp.json`) or user level
(`~/.kiro/settings/mcp.json`) — to extend what tools the agent can call:
internal ticketing systems, cloud provider docs/APIs, databases, design
systems, and more, beyond the IDE's built-in file and terminal tools. This
is the same MCP ecosystem used by other AI coding tools, so existing MCP
servers are generally reusable across them.

### Example: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["aws-documentation-mcp-server@latest"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    },
    "internal-jira": {
      "command": "node",
      "args": ["./tools/jira-mcp-server/index.js"],
      "env": { "JIRA_TOKEN": "${env:JIRA_TOKEN}" },
      "disabled": false,
      "autoApprove": ["search_issues"]
    }
  }
}
```

`autoApprove` lists tool calls the agent may invoke without a per-call
confirmation prompt — scope it to read-only, low-risk operations. MCP
access should follow least privilege the same way IAM does: register only
the servers a given repo actually needs, and avoid auto-approving
write/delete-capable tools (a ticketing server's `close_issue`, for
instance) — that removes the human-in-the-loop check exactly where it
matters most.

---

## 7. How Kiro Differs from Autocomplete-Style Tools

Tools like Cursor and GitHub Copilot are excellent at what they optimize
for: fast, in-flow code suggestions and chat-to-diff iteration on a single
task. Kiro isn't a replacement for that experience so much as a different
default posture for anything beyond a small, self-contained change:

| | Autocomplete-style (Cursor/Copilot) | Kiro (spec-driven) |
|---|---|---|
| Intent capture | Lives in the chat transcript, ephemeral | Checked into git as `requirements.md`/`design.md`/`tasks.md` |
| Review point | After code is written (diff review) | Before code is written (requirements + design review), then per-task diffs |
| Traceability | None by default — "why does this code exist" requires re-reading chat history | Requirement → task → commit/PR, citable in an audit or a PR description |
| Project context | Re-established per session unless manually re-prompted | Persisted via steering, loaded automatically and scoped with `inclusion` rules |
| Best fit | Fast iteration, small/exploratory changes, prototyping | Features with real acceptance criteria, team review processes, regulated/audited environments |

Neither approach is strictly superior — a one-line bug fix doesn't need a
spec, and a large, ambiguous feature benefits from one. Kiro's bet is that
for anything with real acceptance criteria and more than one reviewer, the
overhead of writing a spec pays for itself in a smaller, more reviewable
diff and a durable answer to "why does this code exist."

---

## 8. Fitting Kiro into a Team's SDLC

- **PR review** — reviewers can review `requirements.md`/`design.md` as a
  lightweight design-doc pass before implementation exists, catching
  architecture problems while they're still cheap to change, then review
  `tasks.md`-scoped diffs incrementally rather than one large final diff.
- **Traceability for audits/compliance** — EARS-format requirements plus
  task-to-requirement citations give you a paper trail from "why does this
  code exist" back to an approved requirement, useful in regulated
  environments where PR descriptions alone aren't sufficient evidence.
- **Onboarding** — steering docs double as living onboarding material; a
  new engineer, or a fresh agent session, gets the same context a senior
  engineer would otherwise have to explain verbally.

---

## 9. Common Mistakes

- **Skipping the review gates.** Letting the agent generate requirements →
  design → tasks → code in one uninterrupted pass removes the human
  checkpoints that are the entire point of spec-driven development.
- **Writing vague EARS criteria.** "THE SYSTEM SHALL handle errors
  gracefully" isn't testable — every criterion needs a concrete trigger and
  a concrete, observable response.
- **Treating `.kiro/specs/` as disposable scratch.** Deleting spec
  directories after merge throws away the traceability that justified using
  specs in the first place.
- **Letting steering docs drift.** A `tech.md` that still references a
  retired framework actively steers the agent wrong.
- **Over-scoping hook triggers.** Firing an agent prompt on every
  keystroke-adjacent save burns tokens and interrupts flow.
- **Granting broad MCP auto-approval.** Auto-approving write/delete-capable
  MCP tools removes the human-in-the-loop check exactly where it matters.

---

## 10. Interview-Ready Q&A

**Q: What problem does Kiro's spec-driven workflow solve that plain
AI-autocomplete tools like Cursor or Copilot don't?**
A: Autocomplete-style tools capture intent only in the chat transcript —
once the session ends, there's no durable record of what was requested or
why. Kiro forces intent into checked-in artifacts (`requirements.md`,
`design.md`, `tasks.md`) with review gates before any code gets written, so
a reviewer, a future teammate, or an auditor can trace a piece of code back
to the requirement that justified it, without re-deriving intent from a
diff alone.

**Q: Walk through Kiro's spec workflow end to end.**
A: A feature idea first becomes `requirements.md` — user stories with
EARS-format acceptance criteria — which the agent stops on for approval.
Once approved, it proposes `design.md`: architecture, data models, sequence
diagrams, error handling — another approval gate. Only after that does it
generate `tasks.md`, a checkbox-tracked, ordered implementation plan where
each task cites the requirement(s) it satisfies. Implementation then
proceeds task by task, with the diff for each task reviewable against its
listed requirement before the agent moves to the next.

**Q: What is EARS format and why does Kiro use it instead of free-form
requirements prose?**
A: EARS (Easy Approach to Requirements Syntax) expresses acceptance
criteria as structured statements — `WHEN <trigger> THE SYSTEM SHALL <response>`,
`IF <precondition> THEN THE SYSTEM SHALL <response>`,
`WHILE <state> THE SYSTEM SHALL <response>`. It's unambiguous and testable in a
way prose isn't — a criterion like "the login should be secure" can't be
mapped to a specific task or test, but a WHEN/THEN/SHALL statement can.

**Q: What are steering documents and what happens if they go stale?**
A: Steering files (`.kiro/steering/*.md`, seeded by default with
`product.md`, `tech.md`, `structure.md`) are persistent project context the
agent loads on every turn, so it doesn't have to re-learn the stack or
directory conventions each session. If they go stale — say `tech.md` still
references a framework the team migrated off two quarters ago — they
actively steer the agent toward deprecated patterns, so they need the same
ongoing upkeep as onboarding documentation.

**Q: How do agent hooks differ from CI, and should they replace CI checks?**
A: Hooks run inside the IDE session and fire on IDE events — a file save, a
task completion — to trigger deterministic housekeeping like syncing tests
or refreshing docs. They're not a substitute for CI: they can be skipped,
disabled, or miss an edit made outside the IDE, so CI remains the
authoritative gate on merge. Hooks complement CI by keeping things roughly
in sync while you work, not by replacing the required checks.

**Q: How does MCP fit into Kiro, and what's the security consideration?**
A: Kiro registers MCP servers (workspace-level `.kiro/settings/mcp.json` or
user-level) to give the agent tool access beyond the IDE's built-in
file/terminal tools — ticketing systems, cloud docs, databases, design
systems. It's the same MCP ecosystem other AI coding tools use, so servers
are generally portable. The security consideration is `autoApprove`: it
lets the agent invoke listed tools without a per-call confirmation, so it
should be scoped to read-only, low-risk operations — auto-approving a
write or delete-capable tool removes the human checkpoint exactly where it
matters most.

**Q: When would you *not* use Kiro's spec-driven flow, and just use
something like Cursor instead?**
A: For small, self-contained changes — a one-line bug fix, a quick
prototype, fast exploratory iteration — the overhead of writing
requirements and a design doc doesn't pay for itself. Spec-driven
development earns its cost on features with real acceptance criteria,
multiple reviewers, or compliance/audit requirements, where a durable,
traceable artifact is worth more than raw iteration speed.

**Q: Is everything about Kiro's implementation fixed, or should you expect
it to change?**
A: Kiro is a relatively new, fast-evolving product, so exact file
extensions, JSON shapes, menu names, and UI flows have already shifted
between preview and GA and can shift again. The durable part is the
concept — spec-first development with review gates, persistent steering
context, event-triggered hooks, and MCP-based tool extension — the exact
syntax should always be checked against current AWS documentation before
being relied on in production tooling.

---

## 11. One-Line Summary

**Kiro treats requirements, design, and tasks as reviewable, git-tracked
artifacts instead of disposable chat history — trading some upfront ceremony
for traceability from requirement to code to PR, which pays off on anything
bigger than a one-line fix.**
