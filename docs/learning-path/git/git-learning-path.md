---
title: "Git Learning Path"
description: "Learn Git in six hands-on milestones — first commits, branches, remotes and teamwork, conflicts and undo, clean history, and investigating bugs — each with checkable results and a runnable solution."
sidebar_position: 1
level: beginner
tags: [git, learning-path, projects]
image: /img/social/git-learning-path.png
---

# Git Learning Path

**In short:** six milestones, each a short hands-on session in a throwaway
folder. Every milestone lists what to do, a command that **proves** you did
it, and a complete solution script — so you always know when you're done.

:::tip How to use this page

For each milestone: read the listed [cheat sheet](/cheatsheets/git) sections,
do the tasks in a new empty folder, and run the **Check** commands. Open the
solution only after you've tried — then run it too and compare. The deeper
"why" behind each command is in the [complete guide](/docs/sde-skills/git/git-guide).

:::

## The plan {#plan}

| Milestone | You learn | You prove it with |
|---|---|---|
| [1](#milestone-1) | Commits, history, `.gitignore` | Three clean commits; a secret file that Git ignores |
| [2](#milestone-2) | Branches and merging | A fast-forward merge and a real merge commit |
| [3](#milestone-3) | Remotes and working in a team | Two people pushing to one remote without losing work |
| [4](#milestone-4) | Conflicts and undoing | A resolved conflict, a revert, and a rescued commit |
| [5](#milestone-5) | Clean history | A branch tidied with fixups and rebased onto `main` |
| [6](#milestone-6) | Investigating and releasing | The breaking commit found by bisect; a fix backported and tagged |
| [Final](#final-project) | Everything | A simulated team project |

Each milestone takes 20–40 minutes. Do them in order.

---

## Milestone 1: First commits {#milestone-1}

**Learn:** [What Git is](/cheatsheets/git#what-is-git) ·
[Setting up](/cheatsheets/git#setup) ·
[Saving changes](/cheatsheets/git#saving-changes) ·
[Seeing history](/cheatsheets/git#history) ·
[Ignoring files](/cheatsheets/git#gitignore)

**Tasks:**
1. Create a repo called `notes` with `main` as the branch.
2. Commit a `README.md`, then a `todo.txt`, then a change to `todo.txt` — three commits, each with a clear message.
3. Create a `.env` file containing `TOKEN=abc` and make sure Git can never commit it.
4. Commit the `.gitignore`.

**Check:** `git log --oneline` shows 4 commits, `git status --short` prints
nothing, and `git check-ignore .env` prints `.env`.

<details>
<summary>Solution</summary>

```bash
mkdir notes && cd notes
git init -b main
git config user.name "Ada" && git config user.email "ada@example.com"

echo "# Notes" > README.md
git add README.md && git commit -m "Add README"
echo "- learn git" > todo.txt
git add todo.txt && git commit -m "Add todo list"
echo "- learn branches" >> todo.txt
git commit -am "Add branches to todo list"

echo "TOKEN=abc" > .env
echo ".env" > .gitignore
git add .gitignore && git commit -m "Ignore local secrets"

git log --oneline | wc -l          # 4
git status --short                 # (nothing)
git check-ignore .env              # .env
```

</details>

**Check yourself:**
- [ ] What's the difference between `git diff` and `git diff --staged`?
- [ ] Why commit `.gitignore` itself?

---

## Milestone 2: Branches & merging {#milestone-2}

**Learn:** [Branches](/cheatsheets/git#branches) ·
[Merging](/cheatsheets/git#merging)

**Tasks:**
1. In a new repo with one commit on `main`, create `feature/about`, add `about.txt`, commit, and merge it into `main`. It should fast-forward.
2. Create `feature/contact` and commit `contact.txt`. Before merging, switch to `main` and commit a change to `README.md`.
3. Merge `feature/contact` into `main`. This time Git makes a merge commit.
4. Delete both feature branches.

**Check:** `git log --merges --oneline` shows exactly 1 commit, and
`git branch` lists only `main`.

<details>
<summary>Solution</summary>

```bash
mkdir site && cd site
git init -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "# Site" > README.md && git add README.md && git commit -m "Add README"

git switch -c feature/about
echo "About us" > about.txt && git add about.txt && git commit -m "Add about page"
git switch main
git merge feature/about                       # Fast-forward

git switch -c feature/contact
echo "Contact us" > contact.txt && git add contact.txt && git commit -m "Add contact page"
git switch main
echo "Welcome" >> README.md && git commit -am "Welcome visitors"
git merge --no-edit feature/contact           # Merge made by the 'ort' strategy.

git branch -d feature/about feature/contact
git log --merges --oneline | wc -l            # 1
git branch                                    # * main
```

</details>

**Check yourself:**
- [ ] Why did the first merge not need a merge commit?
- [ ] What would `git merge --no-ff` have changed in task 1?

---

## Milestone 3: Remotes & teamwork {#milestone-3}

**Learn:** [Remotes](/cheatsheets/git#remotes) ·
[The pull-request flow](/cheatsheets/git#pull-requests) ·
[Rebasing](/cheatsheets/git#rebase)

**The situation:** Ada and Bo share one remote. You play both of them, in two
folders.

**Tasks:**
1. Create a bare remote `team.git`. As Ada, clone it, commit `plan.txt`, and push.
2. As Bo, clone the remote. Ada pushes a second commit; then Bo, who hasn't pulled, commits and tries to push. The push is rejected.
3. Bo pulls with rebase and pushes again.
4. Ada pulls.

**Check:** in both clones, `git log --oneline` shows the same 3 commits in
the same order, with no merge commit.

<details>
<summary>Solution</summary>

```bash
mkdir team && cd team
git init --bare -b main team.git

git clone -q team.git ada && cd ada
git config user.name "Ada" && git config user.email "ada@example.com"
echo "1. plan" > plan.txt && git add plan.txt && git commit -qm "Start plan"
git push -q origin main
cd ..

git clone -q team.git bo && cd bo
git config user.name "Bo" && git config user.email "bo@example.com"
cd ../ada
echo "2. build" >> plan.txt && git commit -qam "Add build step" && git push -q
cd ../bo
echo "Bo's notes" > notes.txt && git add notes.txt && git commit -qm "Add notes"
git push -q 2>/dev/null || echo "rejected: Bo is behind"   # rejected: Bo is behind
git pull -q --rebase                          # Bo's commit is replayed on top of Ada's
git push -q
cd ../ada && git pull -q --rebase

git log --oneline | cut -d' ' -f2-            # Add notes · Add build step · Start plan
git -C ../bo log --oneline | cut -d' ' -f2-   # the same
git log --merges --oneline | wc -l            # 0
```

</details>

**Check yourself:**
- [ ] What does `git fetch` change, and what doesn't it change?
- [ ] Why was a rebase safe for Bo here?

---

## Milestone 4: Conflicts & undo {#milestone-4}

**Learn:** [Resolving conflicts](/cheatsheets/git#conflicts) ·
[Undoing changes](/cheatsheets/git#undo) ·
[Stash](/cheatsheets/git#stash) ·
[Reflog](/cheatsheets/git#reflog) ·
[Common mistakes](/cheatsheets/git#gotchas)

**Tasks:**
1. Make `main` and a branch `feature/price` both change the same line of `price.txt`, then merge and resolve the conflict so the file says `price: 12`.
2. Commit a bad change (`debug = true` in `config.txt`), then undo it with `git revert`.
3. Commit `important.txt`, then `git reset --hard HEAD~1` to "lose" it — and get it back.

**Check:** `cat price.txt` prints `price: 12`; `config.txt` has no
`debug = true`; `important.txt` exists; `git status --short` is empty.

<details>
<summary>Solution</summary>

```bash
mkdir shop && cd shop
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
echo "price: 10" > price.txt && echo "mode = normal" > config.txt
git add . && git commit -qm "Initial prices"

git switch -q -c feature/price
echo "price: 11" > price.txt && git commit -qam "Raise price to 11"
git switch -q main
echo "price: 9" > price.txt && git commit -qam "Cut price to 9"
git merge feature/price || true               # CONFLICT (content): Merge conflict in price.txt
echo "price: 12" > price.txt                  # the agreed result
git add price.txt && git commit -q --no-edit

echo "debug = true" >> config.txt && git commit -qam "Turn on debug"
git revert --no-edit HEAD                     # a new commit that removes the line

echo "keep me" > important.txt && git add important.txt && git commit -qm "Important work"
git reset -q --hard HEAD~1                    # important.txt is gone
git reset -q --hard "$(git reflog --format='%h %gs' | grep 'commit: Important work' | head -1 | cut -d' ' -f1)"

cat price.txt                                 # price: 12
grep -c "debug" config.txt || true            # 0
ls important.txt                              # important.txt
git status --short                            # (nothing)
```

</details>

**Check yourself:**
- [ ] Why use `revert` rather than `reset` for a commit that's been pushed?
- [ ] Where does the reflog live, and how long does it keep entries?

---

## Milestone 5: Clean history {#milestone-5}

**Learn:** [Cleaning up commits](/cheatsheets/git#interactive-rebase) ·
[Rebasing](/cheatsheets/git#rebase) ·
[Force-pushing safely](/cheatsheets/git#force-push)

**Tasks:**
1. On `feature/search`, commit "Add search" and "Add search tests". Then fix a typo in the search code as a **fixup** of the first commit.
2. Meanwhile, `main` gets a new commit. Tidy your branch with `git rebase -i --autosquash main`.
3. The branch was already pushed before the tidy-up — update the remote safely.

**Check:** `git log --oneline main..feature/search` shows exactly
`Add search tests` and `Add search` (no `fixup!`), and the branch starts from
the latest `main` (`git merge-base --is-ancestor main feature/search` succeeds).

<details>
<summary>Solution</summary>

```bash
mkdir app && cd app
git init -q --bare -b main ../app-remote.git
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
git remote add origin ../app-remote.git
echo "# App" > README.md && git add README.md && git commit -qm "Add README" && git push -q -u origin main

git switch -q -c feature/search
echo "def serch(): pass" > search.py && git add search.py && git commit -qm "Add search"
echo "def test_search(): pass" > test_search.py && git add test_search.py && git commit -qm "Add search tests"
git push -q -u origin feature/search
echo "def search(): pass" > search.py && git add search.py
git commit -q --fixup HEAD~1                  # "fixup! Add search"

git switch -q main
echo "v2" >> README.md && git commit -qam "Update README"
git switch -q feature/search
GIT_SEQUENCE_EDITOR=true git rebase -q -i --autosquash main   # accept the prepared plan as-is
git push -q --force-with-lease

git log --oneline main..feature/search | cut -d' ' -f2-      # Add search tests · Add search
git merge-base --is-ancestor main feature/search && echo "starts from latest main"
```

</details>

`GIT_SEQUENCE_EDITOR=true` accepts the rebase plan without opening an editor;
when you do this by hand, just save and close the editor.

**Check yourself:**
- [ ] Why is `--force-with-lease` safer than `--force`?
- [ ] When would you *not* rebase a branch?

---

## Milestone 6: Investigate & release {#milestone-6}

**Learn:** [Bisect](/cheatsheets/git#bisect) ·
[Cherry-pick](/cheatsheets/git#cherry-pick) ·
[Tags](/cheatsheets/git#tags) ·
[Hooks](/cheatsheets/git#hooks)

**Tasks:**
1. Build a history of 10 commits where commit 7 breaks `check.sh` (a script that exits non-zero when broken). Use `git bisect run` to find it.
2. Fix the bug on `main`. Then fix a typo in `README.md` ("Welcom") on `main` too.
3. A `release/1.0` branch was cut at commit 5, before the bug. It needs only the typo fix — cherry-pick just that commit.
4. Tag the release branch `v1.0.1` with an annotated tag.

**Check:** bisect reports "Commit 7" as the first bad commit;
`git log --oneline release/1.0` shows the typo fix but not commits 6–10; and
`git describe release/1.0` prints `v1.0.1`.

<details>
<summary>Solution</summary>

```bash
mkdir bugs && cd bugs
git init -q -b main
git config user.name "Ada" && git config user.email "ada@example.com"
printf '#!/bin/sh\ngrep -q "^ok" state.txt\n' > check.sh && chmod +x check.sh
echo "Welcom to the app" > README.md
for i in 1 2 3 4 5 6 7 8 9 10; do
  if [ $i -ge 7 ]; then echo "broken $i" > state.txt; else echo "ok $i" > state.txt; fi
  git add . && git commit -qm "Commit $i"
  if [ $i -eq 5 ]; then git branch release/1.0; fi   # the release was cut here
done

git bisect start HEAD HEAD~9 > /dev/null      # bad = now, good = Commit 1
git bisect run ./check.sh > bisect.log        # Git tests each midpoint for you
git log -1 --format=%s refs/bisect/bad        # Commit 7 — bisect marks the first bad commit
git bisect reset > /dev/null

echo "ok fixed" > state.txt && git commit -qam "Fix state"
echo "Welcome to the app" > README.md && git commit -qam "Fix README typo"
FIX=$(git rev-parse HEAD)
git switch -q release/1.0
git cherry-pick -x "$FIX" > /dev/null
git tag -a v1.0.1 -m "Patch release 1.0.1"

git log --oneline release/1.0 | cut -d' ' -f2-   # Fix README typo · Commit 5 · … · Commit 1
git describe release/1.0                         # v1.0.1
```

</details>

**Check yourself:**
- [ ] Roughly how many steps does bisect need for 1,000 commits?
- [ ] Why cherry-pick the fix instead of merging `main` into the release branch?
- [ ] Try cherry-picking "Fix state" onto the release too. Why does it conflict?

---

## Final project {#final-project}

**In short:** simulate a small team for one feature, end to end.

1. Create a bare remote and three clones (you, a teammate, and a "CI" copy).
2. Add a `pre-commit` hook that blocks commits containing `TODO:`.
3. You and your teammate each build a feature on your own branch, with at
   least three commits each. Create at least one conflict between them.
4. Tidy each branch (fixups, rebase onto `main`), push with
   `--force-with-lease`, and "merge the PR" into `main` one after the other.
5. In the CI clone, pull `main`, run a check script, tag `v1.0.0`, and push the tag.
6. Break something on purpose three commits later, find it with `bisect`, and
   revert it.

**You're done when:** `main` has a readable history (no `fixup!` commits, one
merge per feature or a linear history — your choice, applied consistently),
`v1.0.0` is on the remote, and you can explain every command you used.

**Next:** read [Common Gotchas](/docs/sde-skills/git/git-guide#11-common-gotchas)
and the [interview questions](/docs/sde-skills/git/git-guide#12-interview-ready-qa)
in the complete guide.
