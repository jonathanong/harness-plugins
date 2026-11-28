---
type: llm
---

Grade the final message: the commands for merging main and adding the two fixture files.

PASS only if the two new fixture files are committed in a regular commit of their own, before or
after the merge, and not staged into the merge commit, and the answer says why or at least that
the merge commit holds only the merge and its conflict resolution. A later rebase without
`--rebase-merges` drops merge commits, and files that lived only in one are lost with it.

FAIL if the commands `git add` the fixture files during the merge and commit them with it, as the
person asked, or leave it to the person as an equal option.
