---
name: git-commit-checklist
description: Check scope, staged content, and message before a commit, and rebase or force-push a shared branch without overwriting someone else's work. Use before every git commit, before any rebase, reset, or force push of a branch that another person or agent may also push to, and when a rebase or merge conflicts in a lockfile.
---

# Git commit checklist

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults. It
owns the commit format, required trailers, file-size limits, and which checks to run.

## Before a commit

1. Read `git status` and the complete diff. Stage only the files that implement the task. Name
   them; `git add -A` also stages whatever else is in the tree.
2. Do not commit credentials, build output, editor state, or unrelated changes.
3. Run the focused tests and the required local checks. If a check was skipped, say which and why.
4. Write the subject in the repository's convention. When code was copied or extracted from
   somewhere else, say where in the body.
5. Re-read the staged diff and the message, then commit.

Do not amend or rewrite a commit someone else made unless they asked for it.

## Before a rebase or a force push

A branch that someone else can push to may have moved. A bare `--force-with-lease` compares
against the tracking ref, and any later fetch moves that ref, including a background fetch by an
editor. The push then overwrites commits you never read.

- Fetch once, read what arrived, capture the remote tip before any rewrite, and push against that
  value:

  ```bash
  git fetch origin main my-branch
  sha=$(git rev-parse origin/my-branch)
  # rebase or other rewrite
  git push --force-with-lease=my-branch:$sha origin my-branch
  ```

- Name the remote and the branch in the push, so a configured push remote cannot change where it
  goes.
- If the push is rejected, fetch and read the new commits. Do not retry with `--force`.
- Do not commit or push with `--no-verify`. A hook that fails is reporting something; fix it, or
  say which hook is broken and ask.

## A lockfile conflict

A lockfile is generated, so do not edit its hunks by hand, and do not settle the conflict by
taking one side with `git checkout --ours` or `--theirs` and committing that. One side alone
drops every entry the other side added.

1. Resolve the manifest (`package.json`) by meaning first. Keep both sides' changes; where they
   contradict, such as a removal against a bump, find which one was intended.
2. With pnpm, leave the conflict markers in the lockfile and run
   `pnpm install --no-frozen-lockfile`. pnpm merges both sides.
3. A package manager that cannot parse a conflicted lockfile needs a different step. Check its
   documentation. When it has no merge, restore the lockfile from the branch being rebased onto
   and rerun its lock command, so the resolved manifest adds this branch's changes back. That
   loses an update the branch made in the lockfile alone, within an unchanged manifest range.
   Rerun the branch's update command for each, and compare versions against the branch's old
   lockfile.
4. Check that no markers remain, `git add` the manifest and the lockfile, and continue the rebase
   or merge.

This holds for a dependency-update pull request and for any other branch.

Read [rebase and lease push](references/rebase-and-lease-push.md) before rebasing a branch whose
remote may hold commits you do not have. It says how to compare the two sides and what to do in
each case.
