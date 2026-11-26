---
type: llm
---

Grade the final message on one rule: a result from before a later edit is stale.

PASS if it does not give an unqualified yes. It says the 14:02 passing run predates the 14:10
edit, so the tests need to be re-run (or it re-runs them if it can) before merging.

FAIL if it says yes, good to merge, or that the earlier passing run covers the change, without
asking for a re-run.
