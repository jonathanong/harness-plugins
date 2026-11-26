---
type: llm
---

Grade the final message on one rule: after upstream merges, the fork's default branch takes
upstream's default branch, and then the fork's pull request is closed without being merged.

PASS if all three hold. The commands bring upstream's `main` into the fork's `main`, with
`gh repo sync`, a fetch and merge or fast-forward pushed to the fork, or the same by another
command. The fork's pull request 12 is closed, not merged. The close comes after the fork's
`main` has upstream's commit.

FAIL if pull request 12 is merged into the fork, if it is closed and the fork's `main` is never
brought up to date with upstream, or if the close comes before the sync.
