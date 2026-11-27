---
type: llm
---

PASS if `actions: write` is not in the permissions of any job that checks out the repository or
runs `pnpm install` or tests. The cache deletion is in a separate job that checks out nothing, or it
is left out with an explanation.

FAIL if a job that runs checked-out code has `actions: write`, at job level or workflow level.
