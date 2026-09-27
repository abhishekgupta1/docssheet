---
title: "Git Cheat Sheet"
description: "A beginner-to-advanced reference for Git — saving changes, branches, merging, remotes, conflicts, undoing mistakes, rebasing, reflog, bisect, and hooks."
sidebar_position: 4
level: beginner
tags: [git, sde, sdet, sre, cheat-sheet]
hide_table_of_contents: true
image: /img/social/git.png
---

# Git cheatsheet

Learn Git step by step, from your first commit to rescuing "lost" work. Each
section has three parts:

- **In short** — the idea in one sentence.
- **Example** — commands with a comment saying what each one does or prints.
- **Try it** — a tiny exercise to check you understood.

Want the longer story behind a topic? The [complete guide](/docs/sde-skills/git/git-guide)
walks through it in more depth.

<a class="topic-crosslink" href="/docs/sde-skills/git/git-guide">📖 Full guide: Git →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Git learning sections">
  <a class="button button--primary" href="/docs/learning-path/git/git-learning-path">Learning Path</a>
  <a class="button button--primary" href="/docs/sde-skills/git/git-guide">Complete Guide</a>
</nav>

:::tip How to use this page

First create the [practice repo](#practice-repo) — every example runs inside
it, and nothing you do there can hurt real work. Then go through **Part 1** in
order. Move to **Part 2** once you're comfortable, and **Part 3** when you
need to rescue or investigate something. Type the commands yourself.

:::

## Contents {#contents}

**[Practice repo](#practice-repo)**

**[Part 1 — Beginner](#part-1)**:
[What Git is](#what-is-git) ·
[Setting up](#setup) ·
[Saving changes](#saving-changes) ·
[Seeing history](#history) ·
[Branches](#branches) ·
[Merging](#merging) ·
[Remotes](#remotes) ·
[Ignoring files](#gitignore)

**[Part 2 — Core](#part-2)**:
[Resolving conflicts](#conflicts) ·
[Undoing changes](#undo) ·
[Stash](#stash) ·
[Rebasing](#rebase) ·
[Cleaning up commits](#interactive-rebase) ·
[Tags](#tags) ·
[The pull-request flow](#pull-requests) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Reflog: finding lost work](#reflog) ·
[Cherry-pick](#cherry-pick) ·
[Bisect: finding the bad commit](#bisect) ·
[Force-pushing safely](#force-push) ·
[Hooks](#hooks) ·
[How Git stores data](#internals) ·
[Big repositories](#big-repos) ·
[Words you'll meet](#glossary)

## Practice repo {#practice-repo}

**In short:** a tiny project with two commits and its own local "remote"
(a second repository in the next folder), so you can practise pushing and
pulling without GitHub.

```bash
# Practice repo: run once, in any empty folder
mkdir git-practice && cd git-practice
git init --bare -b main origin.git            # plays the part of GitHub
git init -b main shop && cd shop              # your working copy
git config user.name "Ada"
git config user.email "ada@example.com"
echo "# Shop" > README.md
git add README.md
git commit -m "Add README"
echo "print('hello')" > app.py
git add app.py
git commit -m "Add app"
git remote add origin ../origin.git
git push -u origin main
```

You're now inside `git-practice/shop`, on branch `main`, with two commits that
are also on the remote. To start over, delete the `git-practice` folder and run
this again.

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 1. What Git is {#what-is-git}

**In short:** Git records **snapshots** of your project over time, so you can
see what changed, go back, and work on several things at once without them
getting in each other's way.

| Word | Meaning |
|---|---|
| **Repository (repo)** | A project folder whose history Git tracks (the history lives in `.git/`) |
| **Commit** | One saved snapshot, with a message, an author, and an id like `3f2a9c1` |
| **Branch** | A movable name pointing at a commit — a separate line of work |
| **Remote** | Another copy of the repo, usually on GitHub or GitLab, called `origin` |
| **HEAD** | "Where you are now" — usually the current branch |

Every change moves through three places:

```text
working folder  --git add-->  staging area  --git commit-->  history
(files you edit)              (what goes in                  (saved snapshots)
                               the next commit)
```

```bash
git status          # which branch you're on, and which files changed
```

**Try it:** in the practice repo, run `git status` and `git log --oneline`.
How many commits are there?

</div>

<div class="cheat-card">

#### 2. Setting up {#setup}

**In short:** tell Git who you are once per computer, then either create a
new repo or copy ("clone") an existing one.

```bash
git config --global user.name "Ada Lovelace"       # stored in ~/.gitconfig
git config --global user.email "ada@example.com"
git config --global init.defaultBranch main        # new repos start on "main"
git config --global pull.rebase true               # see section 13 for why

git init my-project                                # new, empty repo in my-project/
git clone ../origin.git shop-copy                  # copy an existing repo (a URL works the same way)
git config --list --show-origin                    # every setting, and which file it came from
```

`--global` settings apply to every repo on your computer; without
`--global`, a setting applies to the current repo only.

**Try it:** clone the practice remote into a folder called `second-copy` and
check `git log --oneline` shows the same two commits.

</div>

<div class="cheat-card">

#### 3. Saving changes {#saving-changes}

**In short:** `git add` chooses what goes into the next snapshot;
`git commit` saves it with a message.

```bash
echo "print('bye')" >> app.py          # change a tracked file
echo "flask" > requirements.txt        # create a new file

git status                             # app.py modified, requirements.txt untracked
git add app.py requirements.txt        # stage both (git add . stages everything here)
git status                             # both listed under "Changes to be committed"
git commit -m "Say goodbye and add requirements"
git status                             # nothing to commit, working tree clean
```

Write the message as a short summary of *why*, in the imperative:
"Add login rate limit", not "changes" or "fixed stuff". Commit small,
related changes together — one idea per commit.

**Try it:** change two files, but stage and commit only one of them. Check
`git status` shows the other is still modified.

</div>

<div class="cheat-card">

#### 4. Seeing history & changes {#history}

**In short:** `git log` lists commits; `git diff` shows exactly what changed,
line by line.

```bash
git log --oneline                     # one line per commit: id + message
git log --oneline --graph --all       # with branches drawn as a graph
git log -p -1                         # the latest commit, with its changes
git log --author="Ada" --since="2 weeks ago"

echo "# TODO" >> app.py
git diff                              # unstaged changes (working folder vs staging area)
git add app.py
git diff --staged                     # staged changes (staging area vs last commit)
git show HEAD                         # the latest commit: message + changes
git blame README.md                   # who last changed each line, and in which commit
```

In a diff, lines starting with `+` were added and lines with `-` were
removed. `HEAD~1` means "one commit before HEAD", `HEAD~2` two before, and so on.

**Try it:** show only the commits that touched `app.py`
(`git log --oneline -- app.py`).

</div>

<div class="cheat-card">

#### 5. Branches {#branches}

**In short:** a branch lets you work on something without changing `main`.
Creating one is instant — it's just a new name pointing at a commit.

```bash
git switch -c feature/login           # create a branch and move onto it
echo "def login(): pass" > login.py
git add login.py
git commit -m "Add login stub"

git branch                            # list branches; * marks the current one
git switch main                       # go back — login.py disappears from the folder
git switch feature/login              # ...and comes back
git branch -m feature/login feature/sign-in   # rename
```

Name branches after the work: `feature/login`, `fix/crash-on-empty-cart`.
`git switch` is the modern command; older guides use `git checkout` for the
same thing.

**Try it:** create a branch `docs/readme`, add a line to `README.md`, commit
it, then switch back to `main` and confirm the line isn't there.

</div>

<div class="cheat-card">

#### 6. Merging {#merging}

**In short:** `git merge` brings another branch's commits into the branch
you're on.

```bash
git switch -c feature/login
echo "def login(): pass" > login.py
git add login.py && git commit -m "Add login stub"

git switch main
git merge feature/login               # "Fast-forward": main simply moves up to feature/login
git branch -d feature/login           # delete the branch — its commits are now on main
git log --oneline --graph
```

| Kind | When | Result |
|---|---|---|
| **Fast-forward** | `main` has no new commits since the branch started | `main` just moves forward; no extra commit |
| **Merge commit** | Both branches have new commits | A new commit with two parents joins them |

`git merge --no-ff feature/login` always makes a merge commit, which keeps a
visible record that a branch existed.

**Try it:** make a commit on `main` *and* on a new branch, then merge. Look
at `git log --oneline --graph` — you'll see the two lines join.

</div>

<div class="cheat-card">

#### 7. Remotes {#remotes}

**In short:** `push` sends your commits to the remote; `fetch` downloads
theirs; `pull` downloads *and* merges them into your branch.

```bash
git remote -v                          # origin  ../origin.git (fetch/push)

echo "v2" >> README.md
git commit -am "Update README"         # -a stages every tracked file that changed
git push                               # send main's new commit to origin

git switch -c feature/search
echo "def search(): pass" > search.py
git add search.py && git commit -m "Add search stub"
git push -u origin feature/search      # -u: remember origin/feature/search for next time

git fetch                              # download new commits; your files don't change
git status                             # "Your branch is up to date with 'origin/feature/search'"
git pull                               # fetch + merge (or rebase) into the current branch
```

`origin/main` is your copy of "where `main` was on the remote at the last
fetch". `git log --oneline main..origin/main` lists commits the remote has
that you don't yet.

**Try it:** clone the remote into a second folder, commit and push from there,
then run `git fetch` and `git log --oneline main..origin/main` in the first.

</div>

<div class="cheat-card">

#### 8. Ignoring files {#gitignore}

**In short:** a `.gitignore` file lists files Git should never track —
build output, logs, secrets, editor settings.

```bash
cat > .gitignore <<'EOF'
# comments start with #
__pycache__/
*.log
.env
build/
!build/keep.txt
EOF
# above: a folder anywhere · every .log file · one file · a folder · except this one (!)

echo "SECRET=1" > .env
git status --short                    # .env is not listed
git check-ignore -v .env              # .gitignore:4:.env	.env  — which rule matched
git add .gitignore && git commit -m "Ignore build output and secrets"
```

`.gitignore` only affects files Git isn't tracking yet. To stop tracking a
file you already committed: `git rm --cached secrets.txt`, then add it to
`.gitignore` — and if it held a real secret, **rotate the secret**, because
it's still in the history.

**Try it:** create `debug.log` and `notes/todo.txt`; ignore all `.log` files
and the whole `notes/` folder, then check with `git status`.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 9. Resolving conflicts {#conflicts}

**In short:** a **conflict** happens when two branches change the same lines.
Git marks both versions in the file; you choose the result and commit.

```bash
git switch -c feature/greeting
echo "print('hi from feature')" > app.py
git commit -am "Feature greeting"
git switch main
echo "print('hi from main')" > app.py
git commit -am "Main greeting"

git merge feature/greeting            # ✗ CONFLICT (content): Merge conflict in app.py
git status                            # app.py listed under "Unmerged paths"
cat app.py
# <<<<<<< HEAD
# print('hi from main')
# =======
# print('hi from feature')
# >>>>>>> feature/greeting

echo "print('hi from both')" > app.py # edit to the result you want; delete the markers
git add app.py                        # mark it resolved
git commit --no-edit                  # finish the merge
```

`git merge --abort` gives up and puts everything back as it was. Many editors
(VS Code, IntelliJ) show "Accept current / incoming / both" buttons for each
conflict.

**Try it:** create a conflict in `README.md`, then resolve it by keeping both
lines.

</div>

<div class="cheat-card">

#### 10. Undoing changes {#undo}

**In short:** pick the undo that matches *where* the change is — only in your
folder, staged, committed locally, or already pushed.

```bash
echo "oops" >> app.py
git restore app.py                    # throw away unstaged changes to a file

echo "oops" >> app.py && git add app.py
git restore --staged app.py           # unstage (the change stays in the file)
git restore app.py

git commit --allow-empty -m "Too early"
git reset --soft HEAD~1               # undo the commit, keep its changes staged

echo "bad" > bad.txt && git add bad.txt && git commit -m "Bad commit"
git revert --no-edit HEAD             # a NEW commit that undoes it — safe on pushed history
git log --oneline -3                  # Revert "Bad commit" · Bad commit · …
```

| Situation | Command |
|---|---|
| Unstaged edits to a file | `git restore <file>` |
| Staged by mistake | `git restore --staged <file>` |
| Fix the last commit's message or add a forgotten file (not pushed) | `git commit --amend` |
| Undo local commits, keep the changes | `git reset --soft HEAD~1` |
| Undo local commits **and** their changes | `git reset --hard HEAD~1` — destroys work |
| Undo a commit that's already pushed | `git revert <commit>` |

**Try it:** commit a file by mistake, then use `git reset --soft HEAD~1` and
`git restore --staged` to get back to a clean state with the file still on disk.

</div>

<div class="cheat-card">

#### 11. Stash {#stash}

**In short:** `git stash` puts unfinished changes on a shelf so you can switch
branches, then brings them back later.

```bash
echo "half-finished" >> app.py
git stash push -m "wip: new greeting"   # the folder is clean again
git stash list                          # stash@{0}: On main: wip: new greeting

git switch -c hotfix                    # do something else…
git switch main

git stash pop                           # bring the changes back and remove them from the shelf
git diff --stat                         # app.py | 1 +
```

`git stash apply` brings changes back but keeps them on the shelf;
`git stash -u` also stashes new, untracked files. Don't leave things in the
stash for long — it's easy to forget what's there.

**Try it:** stash two separate changes, list them, then apply the older one
with `git stash apply stash@{1}`.

</div>

<div class="cheat-card">

#### 12. Rebasing {#rebase}

**In short:** `git rebase main` replays your branch's commits on top of the
latest `main`, giving a straight history instead of a merge commit.

```bash
git switch -c feature/cart
echo "cart = []" > cart.py
git add cart.py && git commit -m "Add cart"

git switch main
echo "## Shop docs" >> README.md
git commit -am "Improve README"         # main has moved on

git switch feature/cart
git rebase main                         # feature/cart now starts from the new main
git log --oneline --graph --all         # one straight line, no merge commit
```

```text
Before:        A---B---D  main              After:   A---B---D  main
                    \                                         \
                     C  feature/cart                           C'  feature/cart
```

The **golden rule:** never rebase commits that other people already have.
Rebasing creates new commits (`C'` has a new id), so anyone who built on the
old ones gets a confusing, duplicated history. Rebase your own local work;
merge shared branches.

**Try it:** rebase a branch that conflicts with `main`. Fix the file, then
`git add` it and run `git rebase --continue` (or `git rebase --abort`).

</div>

<div class="cheat-card">

#### 13. Cleaning up commits {#interactive-rebase}

**In short:** before sharing a branch, tidy its commits — squash "fix typo"
commits into the commits they fix, reword messages, drop mistakes.

```bash
git switch -c feature/tidy
echo "a" > a.txt && git add a.txt && git commit -m "Add a"
echo "b" > b.txt && git add b.txt && git commit -m "Add b"
echo "a2" >> a.txt && git add a.txt
git commit --fixup HEAD~1                    # "fixup! Add a" — marks this as a fix for "Add a"

git rebase -i --autosquash main              # opens the editor with the fixup already placed
git log --oneline main..                     # Add b · Add a — the fix is folded in
```

In the editor that `git rebase -i` opens, change the word at the start of each
line: `pick` keeps a commit, `reword` edits its message, `squash` / `fixup`
merges it into the one above, `drop` deletes it. Save and close to run it.

Setting `pull.rebase true` (section 2) makes `git pull` rebase your local
commits on top of the remote's, instead of adding a merge commit each time.

**Try it:** make three commits, then squash them into one with
`git rebase -i HEAD~3`.

</div>

<div class="cheat-card">

#### 14. Tags {#tags}

**In short:** a **tag** is a permanent name for one commit — usually a release
like `v1.2.0`.

```bash
git tag -a v1.0.0 -m "First release"    # annotated tag: has author, date, message
git tag                                 # v1.0.0
git show v1.0.0 --stat                  # the tag's message, then the commit
git push origin v1.0.0                  # tags aren't pushed unless you ask
git switch --detach v1.0.0              # look at the code as it was at the release
git switch main
```

Use **annotated** tags (`-a`) for releases. Plain `git tag v1.0.0` makes a
"lightweight" tag — just a name, with no author or message. Version numbers
usually follow **SemVer** (Semantic Versioning): MAJOR.MINOR.PATCH, where a
MAJOR change breaks compatibility.

**Try it:** tag the current commit `v0.1.0`, make another commit, then list
the commits since the tag with `git log --oneline v0.1.0..`.

</div>

<div class="cheat-card">

#### 15. The pull-request flow {#pull-requests}

**In short:** most teams never commit to `main` directly. You push a branch,
open a **pull request** (PR, called a "merge request" on GitLab), and
teammates review it before it's merged.

```bash
git switch main && git pull                  # 1. start from the latest main
git switch -c fix/empty-cart                 # 2. one branch per change
echo "# handle empty cart" >> app.py
git commit -am "Handle empty cart"           # 3. small, focused commits
git fetch && git rebase origin/main          # 4. catch up with main before asking for review
git push -u origin fix/empty-cart            # 5. push, then open the PR on GitHub/GitLab
```

6. Reviewers comment; you push more commits to the same branch and the PR
   updates itself.
7. After approval, the PR is merged (often "squash and merge" — one tidy
   commit on `main`), and the branch is deleted.

**Keep PRs small** — a few hundred lines at most. Small PRs get reviewed
faster and more carefully, and are easier to revert.

**Try it:** follow steps 1–5 in the practice repo, then merge the branch into
`main` yourself and push.

</div>

<div class="cheat-card">

#### 16. Common mistakes {#gotchas}

**In short:** the classic Git traps, and how to get out of each one.

| Mistake | Way out |
|---|---|
| Committed to `main` instead of a branch (not pushed) | `git branch fix/x` (keeps the commit), then `git reset --hard origin/main` on `main`, then `git switch fix/x` |
| Wrong commit message (not pushed) | `git commit --amend -m "Better message"` |
| Forgot a file in the last commit (not pushed) | `git add file` then `git commit --amend --no-edit` |
| Committed a secret | Rotate the secret **first**; then remove it from history (`git filter-repo`) — deleting the file in a new commit isn't enough |
| "detached HEAD" | You're on a commit, not a branch. `git switch -c new-branch` to keep work, or `git switch main` to leave |
| `git pull` made a surprise merge commit | Use `git pull --rebase` (or set `pull.rebase true`) |
| Push rejected: "fetch first" | Someone pushed before you: `git pull --rebase`, then `git push` |
| `reset --hard` lost commits | They're still in the [reflog](#reflog) for about 90 days |

**Try it:** make a commit on `main` by mistake, then move it onto a new branch
using the first row of the table.

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 17. Reflog: finding lost work {#reflog}

**In short:** the **reflog** records every place `HEAD` has been, so commits
"lost" by a reset, rebase, or deleted branch can almost always be found.

```bash
echo "important" > work.txt
git add work.txt && git commit -m "Important work"
git reset --hard HEAD~1                 # oops — the commit seems gone
git log --oneline -1                    # it's not in the log…

git reflog -3                           # …but the reflog remembers:
# <id> HEAD@{0}: reset: moving to HEAD~1
# <id> HEAD@{1}: commit: Important work
git reset --hard HEAD@{1}               # jump back to it
cat work.txt                            # important
```

The reflog is local to your computer and entries expire after about 90 days.
Work that was never committed (or stashed) isn't in it — commit often.

**Try it:** delete a branch with unmerged commits (`git branch -D`), then
recreate it from the reflog: `git branch restored <id>`.

</div>

<div class="cheat-card">

#### 18. Cherry-pick {#cherry-pick}

**In short:** `git cherry-pick` copies one specific commit from another branch
onto the current one.

```bash
git switch -c release/1.0               # the release branch starts here
git switch main
echo "new feature" >> README.md
git commit -am "Add new feature"        # NOT for the release
echo "fix: guard empty cart" >> app.py
git commit -am "Fix empty cart crash"
FIX=$(git rev-parse HEAD)               # the fix's commit id

git switch release/1.0
git cherry-pick "$FIX"                  # only the fix, as a new commit on release/1.0
git log --oneline -2                    # Fix empty cart crash · Add app — no "new feature"
```

Typical use: a bug fix made on `main` that must also go into a release branch.
`git cherry-pick -x` adds "(cherry picked from commit …)" to the message, so
you can trace where it came from.

**Try it:** cherry-pick two commits at once with `git cherry-pick A B`.

</div>

<div class="cheat-card">

#### 19. Bisect: finding the bad commit {#bisect}

**In short:** `git bisect` finds the commit that broke something by
**binary search** — halving the range each step — so even 1,000 commits take
about 10 checks.

```bash
for i in 1 2 3 4 5 6 7 8; do            # make 8 commits; the 6th breaks the "test"
  if [ $i -ge 6 ]; then echo "fail $i" > status.txt; else echo "pass $i" > status.txt; fi
  git add status.txt && git commit -qm "Change $i"
done

git bisect start
git bisect bad HEAD                     # it's broken now
git bisect good HEAD~7                  # it worked at "Change 1"
git bisect run grep -q pass status.txt  # exit 0 = good, 1 = bad; Git does the rest
# <id> is the first bad commit … Change 6
git bisect reset                        # go back to where you started
```

Without `run`, Git checks out a middle commit and you test it yourself, typing
`git bisect good` or `git bisect bad` each time.

**Try it:** bisect by hand — no `run` — and count how many steps it takes for
8 commits.

</div>

<div class="cheat-card">

#### 20. Force-pushing safely {#force-push}

**In short:** after rewriting history you've already pushed (a rebase or
amend), a normal push is rejected. `--force-with-lease` overwrites the remote
**only if** nobody else pushed in the meantime.

```bash
git switch -c feature/rewrite
echo "v1" > f.txt && git add f.txt && git commit -m "Draft"
git push -u origin feature/rewrite

git commit --amend -m "Final"           # rewrite the pushed commit
git push                                # ✗ rejected (non-fast-forward)
git push --force-with-lease             # accepted — the remote was where you last saw it
```

Plain `--force` overwrites whatever is there, including a teammate's commits.
Only ever force-push **your own** branches — protect `main` in your Git host's
settings so nobody can force-push to it.

</div>

<div class="cheat-card">

#### 21. Hooks {#hooks}

**In short:** **hooks** are scripts Git runs at certain moments — before a
commit, before a push — to block mistakes automatically.

```bash
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
# Refuse commits that contain an obvious secret
if git diff --cached | grep -qE 'AKIA[0-9A-Z]{16}|BEGIN PRIVATE KEY'; then
  echo "pre-commit: possible secret in staged changes" >&2
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit

echo "key=AKIAABCDEFGHIJKLMNOP" > config.txt
git add config.txt
git commit -m "Add config"              # ✗ pre-commit: possible secret in staged changes
git restore --staged config.txt
```

| Hook | Runs | Typical use |
|---|---|---|
| `pre-commit` | Before a commit is made | Formatting, linting, secret scanning |
| `commit-msg` | After you write the message | Enforce a message format |
| `pre-push` | Before a push | Run the fast tests |

`.git/hooks` isn't shared when someone clones the repo. Teams share hooks
with a tool like **pre-commit** (the framework) or Husky, and repeat the
important checks in CI, since hooks can be skipped with `--no-verify`.

</div>

<div class="cheat-card">

#### 22. How Git stores data {#internals}

**In short:** Git is a database of **objects**, each named by a hash of its
contents. A commit points to a **tree** (a folder listing), which points to
**blobs** (file contents).

```bash
git cat-file -t HEAD                    # commit
git cat-file -p HEAD                    # tree <id> · parent <id> · author … · message
git cat-file -p 'HEAD^{tree}'           # the folder listing: blob <id> README.md, blob <id> app.py
git cat-file -p HEAD:README.md          # # Shop — the file's contents
git rev-parse HEAD                      # the full 40-character commit id
```

| Object | Holds |
|---|---|
| **blob** | A file's contents (not its name) |
| **tree** | Names and modes of files and subfolders, pointing at blobs and trees |
| **commit** | A tree, parent commit(s), author, date, message |
| **tag** (annotated) | A commit, a name, a tagger, a message |

This is why a branch is cheap (a file holding one commit id), why identical
files are stored once, and why changing any old commit changes the id of
every commit after it.

</div>

<div class="cheat-card">

#### 23. Big repositories {#big-repos}

**In short:** for huge repos, download less — fewer commits, fewer files, or
big files stored elsewhere.

```bash
REPO="file://$(cd .. && pwd)/origin.git"          # a real URL works the same way
git -C ../origin.git config uploadpack.allowFilter true   # GitHub and GitLab already allow this
git clone --depth 1 "$REPO" shallow               # only the latest commit ("shallow clone")
git clone --filter=blob:none "$REPO" lazy         # all commits, file contents fetched when needed
git -C shallow log --oneline | wc -l              # 1
```

| Tool | Helps when |
|---|---|
| `--depth 1` (shallow clone) | CI builds that only need the latest code |
| `--filter=blob:none` (partial clone) | Long history, but you want full `git log` |
| `git sparse-checkout set src/api` | A monorepo where you only work in one folder |
| **Git LFS** (Large File Storage) | Big binary files — images, models, videos |
| `git maintenance start` | Keeps a big local repo fast in the background |

</div>

<div class="cheat-card">

#### 24. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **SHA / commit id** | The 40-character hash that names a commit; the first 7 characters are usually enough |
| **origin** | The default name for the remote you cloned from |
| **upstream** | The remote branch your local branch tracks; also the original repo of a fork |
| **Fork** | Your own server-side copy of someone else's repo |
| **Fast-forward** | Moving a branch forward without a merge commit |
| **Detached HEAD** | Being on a commit directly instead of on a branch |
| **Squash** | Combining several commits into one |
| **Trunk-based development** | Everyone merges small changes into `main` often; branches live hours or days |
| **Git flow** | An older model with long-lived `develop` and `release` branches |
| **Monorepo** | Many projects in one repository |
| **CODEOWNERS** | A file naming who must review changes to which folders |

For the object model, workflows, and interview questions, see the
[complete guide](/docs/sde-skills/git/git-guide).

</div>

</div>
