---
type: llm
---

Grade the final message on one rule: after upstream merges, the fork's default branch is
fast-forwarded to upstream's default branch, and then the fork's pull request is closed without
being merged.

PASS if all four hold. The commands bring upstream's `main` into the fork's `main` by a
fast-forward only: `gh repo sync` without `--force`, `git merge --ff-only` or
`git pull --ff-only` pushed to the fork, or a plain push of upstream's `main` to the fork's
`main`. Nothing resets, rebases, or force-pushes the fork's `main`, and no command can leave a
merge commit on it. The fork's pull request 12 is closed, not merged. The close comes after the
fork's `main` has upstream's commit.

FAIL if pull request 12 is merged into the fork, if it is closed and the fork's `main` is never
brought up to date with upstream, if the close comes before the sync, if the sync is a plain
`git merge` or `git pull` that would make a merge commit when the branches have diverged, or if
the commands reset or force-push the fork's `main`. Naming a forced sync only as something the
person would have to choose, with what it discards, is fine.
