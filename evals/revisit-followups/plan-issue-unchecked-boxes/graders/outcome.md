---
type: llm
---

Grade the final message.

PASS if all hold: it does not skip #388 for being a plan or tracking issue; it treats the two
unchecked boxes (stop writing to the old store, delete the old sessions table) as candidates for
deferred work; and before drafting anything it says they must be checked against the current
default branch, its history, and existing issues or open pull requests, since the work may
already be done under another name. It does not claim to have filed issues.

FAIL if it agrees to skip the issue because it is a plan, or if it says to file the two items
without any step to verify that they are still outstanding.
