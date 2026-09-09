---
title: "Git: The Complete Guide"
description: "End-to-end reference for Git — the object model, branching/merging vs rebasing, staging, conflict resolution, safely undoing things, and interview-ready Q&A."
sidebar_position: 1
tags: [git, sde, version-control]
---

# Git — The Complete Guide

A single-read, end-to-end reference for Git: enough to reason about what's
actually happening under the hood, work a feature branch confidently, or walk
into an SDE interview. Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/git">📋 Quick reference: Git →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 290" role="img" aria-labelledby="mm-git-title mm-git-desc">
<title id="mm-git-title">The git snapshot pipeline</title>
<desc id="mm-git-desc">Edits in the working directory are staged with git add, committed into the local repo as a DAG of snapshots, and pushed to a remote. Git fetch or pull brings remote history back, and git checkout or restore brings a snapshot back into the working directory.</desc>
<defs>
  <marker id="mm-git-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="20" y="105" width="160" height="70" rx="10"/>
<text class="mm-node-title" x="100" y="135" text-anchor="middle">Working Dir</text>
<text class="mm-node-sub" x="100" y="152" text-anchor="middle">your edited files</text>

<path class="mm-arrow" d="M180,140 L226,140" marker-end="url(#mm-git-arrow)"/>
<text class="mm-flow-label" x="203" y="128" text-anchor="middle">git add</text>

<rect class="mm-n5" x="230" y="105" width="160" height="70" rx="10"/>
<text class="mm-node-title" x="310" y="135" text-anchor="middle">Staging Area</text>
<text class="mm-node-sub" x="310" y="152" text-anchor="middle">git add snapshot</text>

<path class="mm-arrow" d="M390,140 L436,140" marker-end="url(#mm-git-arrow)"/>
<text class="mm-flow-label" x="413" y="128" text-anchor="middle">git commit</text>

<rect class="mm-n1" x="440" y="100" width="170" height="80" rx="10"/>
<text class="mm-node-title" x="525" y="130" text-anchor="middle">Local Repo</text>
<text class="mm-node-sub" x="525" y="147" text-anchor="middle">DAG of commits</text>
<text class="mm-node-sub" x="525" y="160" text-anchor="middle">(snapshots, not diffs)</text>

<path class="mm-arrow" d="M610,140 L636,140" marker-end="url(#mm-git-arrow)"/>
<text class="mm-flow-label" x="623" y="128" text-anchor="middle">git push</text>

<rect class="mm-n6" x="640" y="105" width="130" height="70" rx="10"/>
<text class="mm-node-title" x="705" y="135" text-anchor="middle">Remote Repo</text>
<text class="mm-node-sub" x="705" y="152" text-anchor="middle">origin (GitHub)</text>

<path class="mm-arrow" d="M705,175 C705,220 560,220 560,182" marker-end="url(#mm-git-arrow)"/>
<text class="mm-flow-label" x="650" y="212" text-anchor="middle">git fetch / pull</text>

<path class="mm-arrow" d="M460,182 C460,250 100,250 100,177" marker-end="url(#mm-git-arrow)"/>
<text class="mm-flow-label" x="280" y="264" text-anchor="middle">git checkout / restore</text>
</svg>

<p class="mental-model__caption">Changes flow one way through git add, commit, and push — from working directory to staging to the local snapshot history to a remote — and flow back the other way through fetch/pull and checkout/restore, which together are most of what git commands do.</p>
</div>

## 1. What Git Actually Is

Git is a **distributed, content-addressable version control system**. Every
clone is a full copy of the repository's history — there is no single
"central" copy required for the system to function (GitHub/GitLab are just a
convention, not a technical requirement).

The mental model that unlocks everything else: **Git is a directed acyclic
graph (DAG) of snapshots, not a stack of diffs.** Each commit points to a
full snapshot of the project (via a tree), not a delta against the previous
commit — deltas are only a storage optimization Git applies internally
(packfiles), invisible at the model level. Understanding this DAG is what
separates "I memorized some commands" from "I understand what `rebase`,
`reset`, and `merge` are actually rewriting."

---

## 2. The Object Model

Git's entire history is four object types, all stored under `.git/objects`,
each addressed by the **SHA-1 (or SHA-256 on newer repos) hash of its
content** — identical content always produces the identical hash, which is
what "content-addressable" means.

| Object | What it stores | Analogy |
|---|---|---|
| **Blob** | Raw file *contents* only — no filename, no path | A file's bytes |
| **Tree** | A directory listing: names + modes + pointers to blobs/other trees | A directory |
| **Commit** | Pointer to one tree (the snapshot), pointer(s) to parent commit(s), author, committer, timestamp, message | A labeled snapshot + metadata |
| **Ref** | A human-readable pointer to a commit hash (branch, tag, HEAD) | A named bookmark |

```bash
git cat-file -p HEAD              # show the commit object: tree, parent, message
git cat-file -p HEAD^{tree}        # show the tree object: entries and their blob hashes
git cat-file -p <blob-sha>          # show a blob's raw content
git rev-parse HEAD                  # the commit's SHA
```

A **commit is a snapshot, not a diff** — every commit's tree is a complete
picture of the project at that point. Two files with identical content
anywhere in history (even in unrelated commits) share the *same* blob object
— this is why Git is efficient about renames/duplicated content despite
storing "full snapshots."

### Refs and branches

A **branch is nothing but a movable pointer to a commit** — a plain text file
under `.git/refs/heads/<name>` containing a 40-character SHA. Creating a
branch is O(1): write one small file. This is why Git branches are cheap
enough to create per-feature, per-experiment, per-bugfix — unlike
centralized VCS branches, which historically meant copying the whole tree.

- **`HEAD`** — a ref pointing to the ref you currently have checked out
  (usually `HEAD → refs/heads/main → <commit sha>`) — a pointer to a pointer.
- **Tags** — like branches but *don't* move as you commit; `git tag v1.0`
  marks a specific commit permanently (annotated tags also store a message
  and signer, useful for releases).

```bash
cat .git/refs/heads/main            # literally just a commit SHA
git symbolic-ref HEAD                # refs/heads/main
```

### Why "DAG" and not "a stack of commits"

Every commit points to its parent(s) — a merge commit has **two** parents.
Follow those parent pointers from any commit and you get the full ancestry
graph: a directed acyclic graph, not a line. This is exactly why operations
like `merge-base` (find the common ancestor of two branches) and `rebase`
(replay commits onto a different point in the graph) are well-defined graph
operations, not string/diff hacks.

---

## 3. The Three Trees: Working Directory, Staging Area, Repository

Git tracks state across **three areas**, and almost every command is really
about moving content between them:

| Area | What it is | Command that updates it |
|---|---|---|
| **Working directory** | The actual files on disk you edit | Your editor / `git checkout`, `git restore` |
| **Staging area (index)** | A snapshot-in-progress of what the *next* commit will contain | `git add` |
| **Repository (HEAD / history)** | The committed, immutable history | `git commit` |

```
working directory  --git add-->  staging area (index)  --git commit-->  repository (HEAD)
       ^                                                                       |
       └───────────────────────── git checkout / restore ─────────────────────┘
```

The staging area is Git's most distinctive feature versus most other VCS: it
lets you **build a commit incrementally** — stage only part of your changes
(`git add -p`) to make small, logically coherent commits even when your
working directory has multiple unrelated edits mixed together.

```bash
git status                    # see what's in working dir vs staged vs committed
git add file.py                # stage a whole file
git add -p                     # interactively stage hunks — the power move for clean commits
git diff                       # working dir vs staging area (unstaged changes)
git diff --staged              # staging area vs last commit (what commit would contain)
```

---

## 4. Branching, Merging, and Rebasing

### Creating and switching branches

```bash
git branch feature/checkout        # create, don't switch
git switch feature/checkout         # switch (modern, Git 2.23+)
git switch -c feature/checkout      # create + switch in one step
git checkout -b feature/checkout    # older equivalent, still everywhere in scripts
```

### Merging

`git merge` combines two branch histories by creating a new **merge commit**
with two parents, preserving the exact history of both branches as it
happened.

```bash
git switch main
git merge feature/checkout          # creates a merge commit if main has diverged
```

- **Fast-forward merge**: if `main` hasn't moved since the branch diverged,
  Git just slides the `main` pointer forward — no merge commit, linear
  history. Force one explicitly to guarantee this or fail: `git merge
  --ff-only`. Force a merge commit even when a fast-forward is possible with
  `git merge --no-ff` (common in team workflows to keep feature boundaries
  visible in history).

### Rebasing

`git rebase` **replays** your branch's commits one by one onto a new base
commit, producing brand-new commits (new SHAs, same content) — it rewrites
history rather than merging it.

```bash
git switch feature/checkout
git rebase main                     # replay feature commits on top of latest main
git rebase -i HEAD~4                 # interactive rebase — squash/reorder/reword last 4 commits
```

### Interactive rebase, in practice

`git rebase -i HEAD~5` opens your editor with the last 5 commits, oldest
first, each on a `pick` line:

```
pick a1b2c3d Add parser skeleton
pick e4f5a6b Fix typo
pick 7c8d9e0 Add tests
pick 1a2b3c4 fixup: address review comment
pick 5d6e7f8 Add docs

# Commands:
# p, pick   = keep commit as-is
# r, reword = keep contents, edit commit message
# e, edit   = pause here to amend the commit
# s, squash = combine into previous commit, merge messages
# f, fixup  = combine into previous commit, discard this message
# d, drop   = remove commit entirely
# (reorder by moving lines)
```

A common real edit — collapse the "fix typo" and "fixup" noise commits into
their logical parent, and reword the first:

```
r a1b2c3d Add parser skeleton
f e4f5a6b Fix typo
pick 7c8d9e0 Add tests
f 1a2b3c4 fixup: address review comment
pick 5d6e7f8 Add docs
```

Save and Git replays commits in order, pausing at `reword`/`edit` steps, and
opens a combined-message editor for `squash` (skipped automatically for
`fixup`). If a conflict occurs mid-rebase, Git pauses; resolve it (see
Section 7), `git add` the files, then `git rebase --continue` (`--skip` to
drop the commit entirely, `--abort` to bail out and restore the pre-rebase
state).

**Tip:** `git commit --fixup=<sha>` creates a properly-tagged fixup commit
for an *existing* commit, and `git rebase -i --autosquash <base>`
automatically reorders and marks it for you — the standard "address review
feedback without polluting history" pattern, so you never have to hand-edit
the todo list to move a fixup next to its target.

### Merge vs rebase — when to use each

| | Merge | Rebase |
|---|---|---|
| History shape | Preserves true history, including divergence (non-linear) | Produces a clean, linear history |
| Commit SHAs | Unchanged | **Rewritten** — every replayed commit gets a new SHA |
| Safe on shared/pushed branches? | Yes, always | **No** — rewriting history others have pulled causes divergence |
| Best for | Integrating a finished feature into `main`; preserving an accurate record | Cleaning up your own local/private branch before opening a PR |
| Conflict resolution | Once, at the merge point | Potentially once **per replayed commit** |

**Rule of thumb:** rebase your own local, not-yet-shared work to keep history
clean; merge (never rebase) once a branch is shared/pushed and others may
have built on it. "Never rewrite history you've already shared" is the single
most important Git safety rule.

### Golden rule violation example (what goes wrong)

```bash
# Alice pushes feature-x, Bob pulls and adds a commit on top
# Alice then rebases feature-x locally and force-pushes
git push --force origin feature-x
# Bob's local feature-x now has commits with different SHAs than origin's —
# Bob's next `git pull` produces a confusing, duplicated-looking history
# or outright conflicts, because Alice's rebase orphaned the commits Bob built on.
```

---

## 5. Common Branching Workflows

| Workflow | Shape | When it fits |
|---|---|---|
| **Feature branch workflow** | One short-lived branch per feature/fix, merged via PR into `main` | Default for most teams — small teams to large, works with CI/CD |
| **Trunk-based development** | Everyone commits directly to `main` (or very short-lived branches, hours not days), behind feature flags | High-deploy-frequency teams, strong CI, feature-flag infrastructure |
| **Git-flow** | Long-lived `develop` + `main`, plus `feature/`, `release/`, `hotfix/` branch types with strict merge rules | Scheduled/versioned releases (e.g. desktop software, mobile apps with app-store review cycles) — heavier process, less common for continuously-deployed web services now |

Most modern web teams use **feature branch + trunk-based hybrid**: short
feature branches merged frequently into `main` via PR, with feature flags
gating anything not ready for users — git-flow's release branches are
largely legacy for anything deploying more than a few times a month.

**The single biggest predictor of merge pain isn't which model a team
picks — it's branch lifetime.** Conflict risk grows nonlinearly the longer a
branch lives without integrating trunk, because both sides keep drifting
further from their common ancestor. A trunk-based team gets low conflict
risk largely as a side effect of forcing short branch lifetimes; git-flow's
long-lived `develop`/`release` branches earn their keep only when the
process genuinely requires maintaining multiple versions in parallel (e.g.
shipping v1.x patches while developing v2.0) — not as a default choice.

---

## 6. Essential Commands Beyond add/commit/push

### `git fetch` vs `git pull` — the distinction that trips people up

- **`git fetch`** downloads new commits/refs from the remote into your
  **remote-tracking branches** (`origin/main`) and touches nothing else —
  your local `main` and working directory are untouched. Always safe to run.
- **`git pull`** = `git fetch` + `git merge origin/<branch>` (or `git
  rebase` with `--rebase`/`pull.rebase=true`). It *does* touch your current
  branch and can create a merge commit or a conflict right then.

```bash
git fetch origin                     # safe, inspect first
git log HEAD..origin/main --oneline   # what did I miss?
git diff HEAD origin/main             # what exactly changed?
git merge origin/main                 # now integrate, on your terms
```

Prefer `fetch` + inspect + `merge`/`rebase` explicitly over a blind `pull`
on anything you care about — it separates "did anything change" from
"integrate it now," which is the source of most avoidable pull-time
surprises. `git pull --rebase` is the right default for a branch that's only
a commit or two behind and not yet pushed elsewhere.

### `git log` — reading history

```bash
git log --oneline --graph --all      # compact visual DAG across all branches
git log -p -- path/to/file.py         # full diffs touching this file
git log --author="Alice"              # filter by author
git log -S"functionName"              # find commits that added/removed this exact string ("pickaxe")
git log main..feature/checkout        # commits on feature/checkout not yet on main
```

### `git diff` — comparing states

```bash
git diff HEAD~3 HEAD                  # changes over the last 3 commits
git diff main feature/checkout         # changes between two branches
git diff --stat                        # just file names + line counts, no content
```

### `git stash` — shelve work in progress

```bash
git stash                              # shelve tracked changes, restore clean working dir
git stash push -m "wip: refactor auth"  # stash with a message
git stash list                          # see all stashes
git stash pop                           # reapply the most recent stash and drop it
git stash apply stash@{2}               # reapply a specific stash, keep it in the list
git stash drop stash@{2}                 # discard a stash without applying it
git stash push -u -m "wip"               # include untracked files (-u); --all also includes ignored files
```

Use when you need to switch branches urgently (hotfix interrupt) without
committing half-finished work. Stashes are themselves commits (on a hidden
ref, `refs/stash`) with their own reflog — `git stash list` is really `git
reflog show refs/stash` — so they survive branch switches but, like the main
reflog, are still local-only and not pushed or cloned.

### `git cherry-pick` — apply a specific commit elsewhere

```bash
git cherry-pick abc1234                 # replay one commit's changes onto current branch
git cherry-pick abc1234^..def5678        # a range of commits
git cherry-pick -x abc1234               # append "(cherry picked from commit ...)" to the message
git cherry-pick --continue               # after resolving a conflict, same mechanics as rebase
git cherry-pick --abort                  # bail out and restore the pre-pick state
```

Common real use: a hotfix landed on `main` and needs to also apply to a
`release/2.4` branch without merging all of `main`'s other changes. Use
`-x` for hotfix backports specifically — it stamps the original commit SHA
into the message, keeping provenance traceable when someone later asks
"where did this come from." Like rebase, cherry-pick produces a new commit
with a new SHA; the original is untouched. Cherry-picking a commit onto a
branch that later merges the source branch can surface as an "already
applied"/no-op — that's Git's common-ancestor detection working correctly,
not a bug.

### `git bisect` — binary-search for the commit that broke something

```bash
git bisect start
git bisect bad                          # current commit is broken
git bisect good v1.2.0                   # this old tag was known-good
# Git checks out the midpoint commit — you test it, then:
git bisect good   # or: git bisect bad
# repeat until Git identifies the exact first-bad commit
git bisect reset                          # return to where you started
```

Can be automated: `git bisect run ./test-script.sh` — Git drives the entire
search itself using the script's exit code (any command that exits `0` for
good and nonzero for bad works). Reserve exit code `125` for "skip this
commit" (`git bisect skip`) when a commit is genuinely untestable, e.g. it
doesn't build — Git routes around it instead of treating it as a false
good/bad answer. This turns a manual O(log n) investigation into a single
unattended command and is one of the highest-leverage debugging tools in
Git — far faster than guessing based on commit messages or diffing by eye.

### `git reflog` — your safety net

```bash
git reflog                              # every place HEAD has pointed, including "lost" commits
git reset --hard HEAD@{2}                # recover from a bad reset/rebase by rewinding to a prior HEAD position
```

The reflog is **local-only** (not pushed, not shared) and tracks every HEAD
movement — commit, checkout, rebase, reset, merge, even bisect — for ~90
days by default for reachable entries (30 days for unreachable ones, via
`gc.reflogExpire`/`gc.reflogExpireUnreachable`). Almost anything that looks
like "I lost my commits" is recoverable via reflog as long as it's not been
garbage-collected — this is why `reset --hard` and even a botched `rebase`
are less catastrophic than they feel in the moment.

If you don't want to reset your current branch, point a *new* branch at the
recovered commit instead — safer when you're not sure yet which state you
want:

```bash
git reflog                                   # find the SHA from before the disaster
git branch recovery-branch 9a8b7c6            # point a new branch at it, inspect at leisure
```

Note the reflog only tracks *commits* — it can't recover changes that were
never committed. For that, fall back to `git fsck --unreachable` (finds
dangling objects still in the object store) or `git fsck --lost-found`
(writes truly orphaned blobs/commits into `.git/lost-found/` for
inspection) — a last resort compared to the reflog, but occasionally the
only way back for uncommitted or unstashed work.

### A few more tools worth knowing

- **`git worktree`** — check out multiple branches into separate
  directories from *one* clone, sharing the same object store. Useful for
  building a hotfix while a feature branch stays checked out elsewhere,
  without stashing or juggling clones:
  ```bash
  git worktree add ../hotfix-2.3 release/2.3     # separate working dir, same repo
  git worktree list                                # see all active worktrees
  git worktree remove ../hotfix-2.3                # clean up when done
  ```
- **`git log -G"<regex>"`** — the pickaxe's sibling: `-S` finds commits that
  changed *how many times* a string occurs (added or removed one instance),
  while `-G` finds commits whose diff matches a regex anywhere in the added
  or removed lines. `-G` is the better tool when you're hunting for a
  pattern (e.g. a changed function signature) rather than an exact string
  count.
- **`git range-diff A..B C..D`** — compares two versions of a rebased
  branch commit-by-commit (e.g. before/after an interactive rebase, or your
  branch before/after `--force-with-lease`-ing over review feedback). Shows
  exactly what the rebase changed per-commit, instead of just the final
  aggregate diff — much faster than eyeballing two `git log -p` outputs
  side by side.

---

## 7. Resolving Merge Conflicts

A conflict happens when Git can't automatically reconcile the same lines
changed differently on both sides being merged/rebased.

```
<<<<<<< HEAD
const timeout = 3000;
=======
const timeout = 5000;
>>>>>>> feature/checkout
```

```bash
git status                     # lists conflicted files
# edit the file: remove markers, keep the correct/combined content
git add resolved_file.js        # mark as resolved
git commit                      # (merge) — or `git rebase --continue` (rebase)
```

- `git merge --abort` / `git rebase --abort` — bail out entirely and return
  to the pre-operation state if the conflict resolution goes sideways.
- `git checkout --ours <file>` / `--theirs <file>` — take one side's version
  wholesale for a file, when you know one side is simply correct.
- `git mergetool` — launch a configured visual diff/merge tool (vimdiff,
  Beyond Compare, VS Code) instead of resolving markers by hand.
- **During a rebase**, "ours"/"theirs" is flipped from intuition — because
  each commit is being replayed *onto* the target, "theirs" is the commit
  being replayed (your branch's commit), "ours" is the base you're rebasing
  onto. This trips people up constantly — verify with `git diff` before
  trusting `--ours`/`--theirs` during a rebase.
- **For a large or unfamiliar conflicting file**, don't just stare at the
  markers — `git log --merge -p <file>` shows both sides' commits that
  touched the conflicting lines, which is usually faster than reasoning
  about intent from the diff alone. Reach for `--ours`/`--theirs` only when
  one side really is simply correct wholesale (a generated lockfile, for
  example) — most real conflicts need you to merge *intent*, not pick a
  side, and blindly taking one side silently discards someone's fix.
- **`git config rerere.enabled true`** makes Git remember how you resolved
  a conflict and auto-reapply the same resolution next time the identical
  conflict recurs ("reuse recorded resolution") — valuable on a long-lived
  branch that repeatedly rebases against a fast-moving trunk and keeps
  hitting the same conflict.

---

## 8. Undoing Things Safely

This is the single highest-stakes topic in day-to-day Git — knowing the
**blast radius** of each undo command prevents real data loss.

| Command | What it moves | Rewrites history? | Safe on pushed/shared commits? |
|---|---|---|---|
| `git restore <file>` | Working dir ← staging/HEAD | No | Always safe |
| `git restore --staged <file>` | Unstages a file (staging ← HEAD) | No | Always safe |
| `git reset --soft <commit>` | Moves branch pointer; keeps changes staged | Yes (local ref only) | Unsafe if already pushed |
| `git reset --mixed <commit>` (default) | Moves branch pointer; unstages changes, keeps them in working dir | Yes | Unsafe if already pushed |
| `git reset --hard <commit>` | Moves branch pointer; **discards** working dir + staged changes | Yes | **Dangerous** — unsafe if already pushed, and destroys uncommitted work |
| `git revert <commit>` | Creates a **new** commit that undoes a prior commit's changes | No — adds history, doesn't remove it | **Always safe**, even on shared branches |
| `git checkout <commit> -- <file>` | Restores one file from any commit into working dir/staging | No | Safe |

### `reset` vs `revert` — the one interview question that separates juniors from seniors

- **`reset`** rewrites the branch's history — it moves where the branch
  pointer *is*. Fine for local, not-yet-pushed commits. On a shared branch,
  it creates divergence: anyone who already pulled the "reset-away" commits
  now has commits that no longer exist on the remote.
- **`revert`** adds a new commit that inverses a previous one — history
  stays intact and forward-only. This is the **only** safe way to undo a
  change that's already been pushed/shared/deployed, because it doesn't
  require anyone else to change what they have.

```bash
git revert abc1234                # undo one specific commit, safely, on any branch
git revert HEAD~3..HEAD            # revert a range (creates one revert commit per original, by default)
```

### Force-push, done responsibly

Sometimes rewriting a *pushed but not-yet-merged* feature branch (e.g. after
an interactive rebase to clean up commits before review) is legitimate.

```bash
git push --force-with-lease origin feature/checkout
```

`--force-with-lease` refuses to push if the remote branch has commits you
haven't seen yet (i.e., someone else pushed since your last fetch) — it
prevents silently clobbering a teammate's work, unlike plain `--force`,
which overwrites unconditionally. Treat plain `--force` as effectively
banned on any branch other than your own untouched-by-others feature branch.

### The "Oh No" Recovery Playbook

A quick-lookup table for the moment something has gone wrong and you need
the fix, not the theory:

| Situation | Fix |
|---|---|
| **Undo the last commit, keep the changes** | `git reset --soft HEAD~1` (changes stay staged) or `git reset HEAD~1` (changes stay unstaged) |
| **Undo the last commit, discard the changes entirely** | `git reset --hard HEAD~1` |
| **Already pushed — need to undo without rewriting shared history** | `git revert HEAD` (creates a new commit undoing the last one; safe to push normally) |
| **Already pushed — must actually remove it and you're certain no one else pulled it** | `git reset --hard HEAD~1 && git push --force-with-lease` |
| **Recover a deleted branch** | `git reflog` → find the last SHA the branch pointed to → `git branch <name> <sha>` |
| **Recover commits after a bad `rebase`** | `git reflog` → find the entry just before `rebase (start)` → `git reset --hard HEAD@{N}` (or branch off it if you want to keep the post-rebase work too) |
| **Unstage a file (keep the edits)** | `git restore --staged <file>` (or the older `git reset HEAD <file>`) |
| **Discard local (uncommitted) changes to a file** | `git restore <file>` (or the older `git checkout -- <file>`) — **irreversible**, no reflog for this |
| **Discard ALL local uncommitted changes** | `git restore .` for tracked files; add `git clean -fd` to also remove untracked files/dirs (`-n` first to dry-run — this is also irreversible) |
| **Amend the last commit (message or forgot a file)** | `git add <forgotten-file>; git commit --amend` — rewrites the last commit's SHA, so treat it like a rebase (don't do it on shared commits) |
| **Find which commit deleted a line/file** | `git log --all --oneline -- <path>` to find when it disappeared, then `git log -S"<string>"` (pickaxe search) to find the commit that added/removed specific text anywhere in history |
| **Restore a file from an old commit without touching anything else** | `git restore --source=<sha> -- <file>` |
| **Committed a secret and already pushed it** | Deleting the file in a new commit does **not** remove it from history — the blob is still fully retrievable via `git log -p` or `git show <old-sha>:<path>`. Rewrite history with `git filter-repo` (or BFG Repo-Cleaner) to strip it from every commit, force-push to all remotes, have every collaborator re-clone, **and rotate the credential** — anyone with an existing clone or prior fetch still has the old blob until they re-clone. |

---

## 9. Tags — Lightweight vs Annotated

Tags mark a specific commit permanently — unlike branches, they don't move
as you commit.

```bash
git tag v1.2.0-rc1                          # lightweight: just a named pointer to a commit
git tag -a v1.2.0 -m "Release 1.2.0"        # annotated: a full object (tagger, date, message, optional signature)
git tag -s v1.2.0 -m "Release 1.2.0"        # signed annotated tag (GPG)
git push origin v1.2.0                      # tags don't push automatically — explicit
git push origin --tags                      # push all local tags
git tag -d v1.2.0-rc1                       # delete locally
git push origin :refs/tags/v1.2.0-rc1       # delete on remote
```

**Use annotated tags for anything that's a real release.** They're actual
objects with author/date/message (and can be GPG-signed for provenance),
and `git describe` uses them to compute "commits since last tag." Lightweight
tags are fine for personal bookmarks (`before-refactor`, `known-good`) but
shouldn't be used for release versions since they carry no metadata and no
signature.

---

## 10. `.gitignore` and Hooks

```gitignore
# .gitignore
node_modules/
*.pyc
__pycache__/
.env
dist/
.DS_Store
```

Patterns are matched relative to the `.gitignore` file's location;
`.gitignore` only affects **untracked** files — a file already tracked
before being added to `.gitignore` keeps being tracked (`git rm --cached <file>`
to stop tracking it without deleting it from disk).

**Hooks** are scripts Git runs automatically at specific points, stored in
`.git/hooks/` (not version-controlled by default — teams use tools like
`husky` or `pre-commit` to share hook config via the repo itself).

| Hook | Fires | Common use |
|---|---|---|
| `pre-commit` | Before a commit is created | Lint, format, run fast unit tests |
| `commit-msg` | After message is written, before commit finalizes | Enforce commit message conventions (e.g. Conventional Commits) |
| `pre-push` | Before `git push` sends data | Run the full test suite, block push on failure |
| `post-merge` | After a merge completes | Reinstall dependencies if lockfile changed |

### A real `pre-commit` hook — block obvious secrets and debug breakpoints

`.git/hooks/pre-commit`:

```bash
#!/usr/bin/env bash
set -euo pipefail

staged=$(git diff --cached --name-only --diff-filter=ACM)

if git diff --cached | grep -qE 'AKIA[0-9A-Z]{16}'; then
    echo "ERROR: possible AWS access key in staged changes. Aborting commit." >&2
    exit 1
fi

for f in $staged; do
    case "$f" in
        *.py)
            if grep -qE '^\s*(import pdb|pdb\.set_trace\(\))' "$f"; then
                echo "ERROR: debugger breakpoint left in $f" >&2
                exit 1
            fi
            ;;
    esac
done
exit 0
```

### A real `pre-push` hook — run the fast suite before anything leaves the machine

`.git/hooks/pre-push`:

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "Running fast test suite before push..."
pytest -q tests/unit || {
    echo "ERROR: unit tests failed. Push aborted." >&2
    exit 1
}
```

```bash
chmod +x .git/hooks/pre-commit .git/hooks/pre-push   # hooks must be executable
git commit --no-verify -m "..."                       # explicit bypass, use sparingly
```

Because hooks live outside the repo's tracked files by default, they can't
be relied on as a security boundary for a team — anyone can skip or delete
their local copy. Treat local hooks as a fast feedback loop for the author,
and enforce the same checks in CI as the actual gate.

---

## 11. Common Gotchas

- **Detached HEAD state** — checking out a commit SHA or tag directly (not a
  branch) puts `HEAD` on the commit itself instead of a branch ref. Any new
  commits made here aren't attached to any branch — switch away without
  creating a branch first and they become unreachable (recoverable briefly
  via reflog, then garbage-collected). Fix: `git switch -c new-branch-name`
  immediately if you want to keep work done in this state.

  ```bash
  git checkout abc1234        # detached HEAD — "You are in 'detached HEAD' state"
  git switch -c hotfix-attempt # rescue: attach current position to a real branch
  ```

- **Force-push danger** — plain `git push --force` on a shared branch can
  silently discard a teammate's commits from the remote with no warning.
  Default to `--force-with-lease`, and never force-push `main`/`master`
  (most platforms let you branch-protect against this — turn it on).

- **Rewriting shared history** — rebasing, `commit --amend`, or `reset
  --hard` followed by a force-push on any branch others have already pulled
  from creates divergent histories that are painful to reconcile. The rule:
  once pushed and others may have it, treat history as append-only (use
  `revert`, new commits) — only rewrite history that's still purely local.

- **`git add .` sweeping up unwanted files** — stages everything in the
  current directory, including files you forgot were untracked (secrets,
  build artifacts not yet gitignored). Prefer explicit paths or `git add -p`
  in shared/sensitive repos, and check `git status` before committing.

- **Merge commit noise from pulling without a strategy** — `git pull`
  defaults to fetch + merge, which creates a merge commit any time your
  local branch has diverged from upstream, even for a one-line change.
  `git pull --rebase` (or `git config pull.rebase true` globally) replays
  your local commits on top instead — cleaner history for the common "I was
  a commit behind" case, but only appropriate for not-yet-pushed local work.

- **Committing large binaries directly** — Git's model works best for text;
  large binaries bloat `.git` permanently (history can't easily "forget"
  large old blobs without a history rewrite via `git filter-repo` or
  BFG Repo-Cleaner). Use Git LFS for assets like large images/videos/models.

- **Committing a secret, then thinking `git rm` fixes it** — deleting a
  file in a new commit only removes it going forward; the secret is still
  fully retrievable from every prior commit's tree/blob (`git log -p`,
  `git show <old-sha>:<path>`). Real remediation is two steps, both
  required: rewrite history to strip the blob (`git filter-repo` or BFG,
  see the "oh no" table in Section 8) **and** rotate the credential —
  anyone who already cloned or fetched keeps the old blob until they
  re-clone, so the leaked value must be treated as compromised regardless
  of the history rewrite.

---

## 12. Interview-Ready Q&A

**Q: What is a Git commit, really — a diff or a snapshot?**
A: A snapshot. Every commit points to a tree object representing the
complete state of the project at that point, plus a pointer to its parent
commit(s). Git computes diffs on the fly for display (`git diff`, `git log
-p`) and compresses storage internally via packfiles/deltas, but the logical
model is a full snapshot per commit, not a stored diff.

**Q: What's the actual difference between `git merge` and `git rebase`?**
A: Merge creates a new commit with two parents that combines both histories,
preserving exactly what happened including the divergence — existing commit
SHAs are untouched. Rebase replays your branch's commits one at a time onto
a new base, producing entirely new commits (different SHAs, same content)
and a linear history. Merge is always safe on shared branches; rebase
rewrites history and should only be used on local/not-yet-shared commits.

**Q: `git reset --hard` vs `git revert` — when is each appropriate?**
A: `reset --hard` moves the branch pointer and discards changes, rewriting
history — safe only for local commits nobody else has. `revert` creates a
new commit that undoes a previous one without touching history at all, so
it's safe on any branch, including ones already pushed, merged, or deployed.
If the commit in question is already shared, `revert` is essentially always
the right tool.

**Q: What is a detached HEAD state and how do you get out of it safely?**
A: It happens when you check out a specific commit or tag rather than a
branch — `HEAD` points directly at a commit instead of at a branch ref. Any
new commits made there aren't reachable from any branch; switching away
without saving them risks losing them once the reflog expires. To keep work
done in that state, run `git switch -c <new-branch-name>` before moving away
to attach those commits to a real branch.

**Q: Why is `--force-with-lease` preferred over `--force`?**
A: `--force-with-lease` checks that the remote branch hasn't changed since
your last fetch before overwriting it — if a teammate pushed in the
meantime, the push is rejected instead of silently discarding their commits.
Plain `--force` overwrites unconditionally with no such check, making it a
common source of lost work on shared branches.

**Q: How would you find which commit introduced a regression, across
hundreds of commits, without reading each one?**
A: `git bisect` — mark a known-good and known-bad commit, and Git binary
searches the range, checking out the midpoint each time for you to test.
With a scripted reproduction (`git bisect run ./test.sh`), it fully
automates the search and reports the exact first-bad commit in O(log n)
steps instead of a linear scan.

**Q: Why does Git use a staging area instead of just committing the working
directory directly?**
A: The staging area lets you construct a commit's contents independently of
what's currently on disk — you can stage only some files, or even only some
hunks within a file (`git add -p`), to build small, logically coherent
commits even when your working directory has several unrelated changes
mixed together. Without it, every commit would have to be "everything
that's currently different," which encourages large, unreviewable commits.

**Q: A teammate says they "lost" three commits after a bad rebase. What do
you check first?**
A: `git reflog` — it records every position `HEAD` has pointed to locally,
including commits no branch currently references, for roughly 90 days by
default before garbage collection. In the vast majority of "lost work"
cases the commits still exist as unreachable objects; `git reset --hard
HEAD@{n}` (or `git cherry-pick` from the reflog SHA) recovers them.

**Q: When would you actually reach for git-flow instead of trunk-based
development?**
A: When the team genuinely ships and supports multiple discrete, versioned
releases in parallel — e.g. patching v1.x while developing v2.0 — where
long-lived `release`/`develop` branches earn their keep. For a
continuously-deployed service with strong CI, trunk-based (short-lived
branches, feature flags) wins because merge-conflict risk grows
nonlinearly with branch lifetime, and git-flow's extra long-lived branches
work against that. The model matters less than keeping branches short.

**Q: A secret got committed and pushed to a shared repo. Is deleting it in
a new commit sufficient?**
A: No — it removes the file going forward but the secret is still fully
present in the old commit's blob, retrievable via `git log -p` or `git show <old-sha>:<path>`
by anyone with a clone. Fixing it requires rewriting
history to strip the blob from every commit (`git filter-repo` or BFG),
force-pushing, having every collaborator re-clone, *and* rotating the
credential — the rewrite alone doesn't help against clones/fetches that
already happened before it.

**Q: What does `git worktree` give you that `git stash` doesn't?**
A: `git stash` shelves uncommitted changes on your *single* working
directory so you can switch branches — you're still one checkout at a
time. `git worktree add ../hotfix release/2.3` checks out a second branch
into a completely separate directory backed by the *same* repository and
object store, so you can have two branches checked out and buildable
simultaneously (e.g. patching a hotfix while a long-running feature branch
stays untouched elsewhere) without stashing or cloning twice.

---

## 13. One-Line Summary

**Git is a content-addressable DAG of snapshots, not a stack of diffs — the
staging area lets you shape commits deliberately, rebase only what's still
local, merge or revert (never reset or force-push) what's already shared,
and the reflog is your safety net for almost everything else.**
