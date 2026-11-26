---
type: llm
---

Grade the final message on one rule: after upstream merges, the fork's default branch takes
upstream's default branch, and then the fork's pull request is closed without being merged.

PASS if all four hold. The commands bring upstream's `main` into the fork's `main`, with
`gh repo sync`, a fetch and merge or fast-forward pushed to the fork, or the same by another
command. That sync keeps the fork's history: no `gh repo sync --force`, no reset of the fork's
`main` to upstream, and no force push of it. The fork's pull request 12 is closed, not merged.
The close comes after the fork's `main` has upstream's commit.

FAIL if pull request 12 is merged into the fork, if it is closed and the fork's `main` is never
brought up to date with upstream, if the close comes before the sync, or if the commands reset
or force-push the fork's `main`. Naming a forced sync only as a fallback the person would have
to choose, with what it discards, is fine.
