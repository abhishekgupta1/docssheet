---
title: "Git Cheat Sheet"
description: "Quick reference for Git — branching, rebasing, stash, bisect, undoing mistakes, and conflict resolution."
sidebar_position: 4
tags: [git, sde, cheat-sheet]
hide_table_of_contents: true
---

# Git cheatsheet

A one-page reference for Git. For the object model, DAG internals, and the
full "Oh No" recovery playbook, see the [complete guide](/docs/sde-skills/git/git-guide).

<a class="topic-crosslink" href="/docs/sde-skills/git/git-guide">📖 Full guide: Git →</a>

<div class="cheat-sheet cheat-sheet--sde">

<div class="cheat-card">

#### Branching

```bash
git switch -c feature/x     # create + switch
git switch main
git branch -d feature/x     # delete (merged)
git branch -D feature/x     # force delete
```

</div>

<div class="cheat-card">

#### Merging vs rebasing

```bash
git merge feature/x         # preserves history, adds merge commit
git rebase main             # replays commits on top of main, linear history
```

Golden rule: never rebase commits already pushed/shared with others.

<span class="cheat-see">See: Merge vs rebase — when to use each</span>

</div>

<div class="cheat-card">

#### Interactive rebase

```bash
git rebase -i HEAD~4
# pick / reword / squash / fixup / drop
git rebase --continue
git rebase --abort
```

</div>

<div class="cheat-card">

#### fetch vs pull

```bash
git fetch origin            # downloads, doesn't merge
git pull origin main        # fetch + merge (or --rebase)
git pull --rebase           # avoids merge-bubble noise
```

</div>

<div class="cheat-card">

#### Inspecting history

```bash
git log --oneline --graph --all
git diff                    # working dir vs staged
git diff --staged           # staged vs last commit
git show <commit>
```

</div>

<div class="cheat-card">

#### Stash

```bash
git stash push -m "wip"
git stash list
git stash pop                # apply + drop
git stash apply stash@{1}    # apply, keep in list
```

</div>

<div class="cheat-card">

#### Cherry-pick & bisect

```bash
git cherry-pick <sha>              # apply one commit elsewhere
git bisect start
git bisect bad HEAD
git bisect good v1.2.0             # binary-searches the breaking commit
git bisect run npm test
```

</div>

<div class="cheat-card">

#### Reflog — your safety net

```bash
git reflog
git reset --hard HEAD@{2}   # recover a "lost" commit/branch
```

Nothing reachable via reflog is truly gone, even after a hard reset.

</div>

<div class="cheat-card">

#### Undoing things

```bash
git restore <file>              # discard working-dir changes
git restore --staged <file>     # unstage
git reset --soft HEAD~1         # undo commit, keep changes staged
git reset --hard HEAD~1         # undo commit, discard changes
git revert <sha>                # new commit that undoes <sha> (safe on shared history)
```

`reset` rewrites history (local only); `revert` adds a new commit (safe to push).

</div>

<div class="cheat-card">

#### Force-push, responsibly

```bash
git push --force-with-lease     # fails if remote has commits you haven't seen
```

Never plain `--force` on a shared branch — `--force-with-lease` protects
against clobbering someone else's push.

</div>

<div class="cheat-card">

#### Resolving conflicts

```bash
git status                  # lists conflicted files
# edit files, resolve <<<< ==== >>>> markers
git add <file>
git commit                  # or: git rebase --continue
```

</div>

<div class="cheat-card">

#### Tags & .gitignore

```bash
git tag v1.2.0                        # lightweight
git tag -a v1.2.0 -m "release"        # annotated (preferred for releases)
git push origin v1.2.0
```

`.gitignore` patterns are per-directory; `git check-ignore -v <file>` shows
which rule matched.

</div>

</div>
