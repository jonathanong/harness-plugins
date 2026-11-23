---
name: git-commit-checklist
description: Use before every git commit, before any rebase, reset, or force push of a branch that another person or agent may also push to, and when a rebase or merge conflicts in a lockfile or another generated file. Check scope, staged content, and message before a commit, and rebase or force-push a shared branch without overwriting someone else's work.
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

## A conflict in a generated file

A lockfile, generated code (an API client, schema types, protobuf stubs), and a generated project
file are each the output of a tool. When a rebase or merge conflicts in one, do not edit its
hunks by hand, and do not settle the conflict by taking one side with `git checkout --ours` or
`--theirs` and committing that. One side alone drops what the other side added, and a hand-merged
file is output no run of the tool produced.

1. Resolve the inputs by meaning first: the manifest (`package.json`), schema, or specification.
   Keep both sides' changes; where they contradict, such as a removal against a bump, find which
   one was intended.
2. Rerun the generator on the resolved inputs and take its output whole. The command is in the
   file's header, the repository's scripts, or its `AGENTS.md`. If you cannot find it, ask; do
   not fall back to editing the output.
3. Check that no markers remain and that the output differs from the base only by what the branch
   intends: where the inputs changed, and for a lockfile also an update the branch made within
   an unchanged range. `git add` the inputs and the output, and continue the rebase or merge. A rebase of
   several commits can stop on the same file again; regenerate at each stop.

A lockfile needs more care, because it also records choices that are not in the manifest:
regenerating it from nothing moves every dependency to its newest allowed version.

- With pnpm, leave the conflict markers in the lockfile and run
  `pnpm install --no-frozen-lockfile`. pnpm merges both sides.
- A package manager that cannot parse a conflicted lockfile needs a different step. Check its
  documentation. When it has no merge, restore the lockfile from the branch being rebased onto
  and rerun its lock command, so the resolved manifest adds this branch's changes back. That
  loses an update the branch made in the lockfile alone, within an unchanged manifest range.
  Rerun the branch's update command for each, and compare versions against the branch's old
  lockfile.

This holds for a dependency-update pull request and for any other branch.

Read [rebase and lease push](references/rebase-and-lease-push.md) before rebasing a branch whose
remote may hold commits you do not have. It says how to compare the two sides and what to do in
each case.
