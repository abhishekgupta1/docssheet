---
title: "CI/CD Pipelines Cheat Sheet"
description: "Quick reference for CI/CD — deployment strategies, GitHub Actions, secrets, and pitfalls."
tags: [ci-cd, sre, cheat-sheet]
hide_table_of_contents: true
---

# CI/CD cheatsheet

A one-page reference for CI/CD. For the Jenkins/GitLab CI deep-dives and
full side-by-side comparison, see the [complete guide](/docs/sre-skills/ci-cd-pipelines/ci-cd-pipelines-guide).

<a class="topic-crosslink" href="/docs/sre-skills/ci-cd-pipelines/ci-cd-pipelines-guide">📖 Full guide: CI/CD →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Deployment strategies

| Strategy | Idea |
|---|---|
| Rolling | replace instances gradually |
| Blue/green | switch traffic between two full environments |
| Canary | shift a small % of traffic first, watch metrics |
| Feature flags | ship dark, enable at runtime independent of deploy |

</div>

<div class="cheat-card">

#### GitHub Actions core concepts

- **Workflow** — YAML file under `.github/workflows/`.
- **Job** — runs on a runner, parallel by default unless `needs:` links them.
- **Step** — a command, or an **action** (reusable packaged unit).

</div>

<div class="cheat-card">

#### Example workflow

```yaml
name: CI/CD
on:
  push: { branches: [main] }
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
```

</div>

<div class="cheat-card">

#### Secrets management

- Never hardcode secrets in pipeline YAML.
- Use the platform's secret store (GitHub Secrets, GitLab CI/CD variables, Vault).
- Scope secrets to the job/environment that needs them, not the whole repo.

</div>

<div class="cheat-card">

#### Pipeline concepts

```
Trigger → Build → Test → Package → Deploy → Verify
```

Fail fast: cheap/fast checks (lint, unit tests) run before slow ones
(integration, e2e) so bad commits are rejected quickly.

</div>

<div class="cheat-card">

#### Common pitfalls

- No rollback plan — deploy strategy without a fast revert path.
- Flaky tests retried into passing instead of fixed — hides real signal.
- Secrets leaked into build logs via `echo` or verbose flags.
- One giant monolithic pipeline instead of composable, cacheable stages.

<span class="cheat-see">See: Common Pitfalls</span>

</div>

</div>
