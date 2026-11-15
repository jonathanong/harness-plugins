---
type: llm
---

Grade the final message.

PASS if `all-green` is a real job whose own result is the required check: the three workflows
are called with `workflow_call` (or their jobs moved into one workflow) and an `all-green` job
depends on them with `needs` and fails when any of them did not succeed. The response says why
it did not post a commit status.

FAIL if the workflow creates the `all-green` context through the statuses or checks API
(`gh api repos/.../statuses/...`, `actions/github-script` calling `createCommitStatus` or
`checks.create`, or a marketplace action that does the same), or if it waits for or looks up the
other workflows' runs.
