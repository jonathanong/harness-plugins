---
type: llm
---

Grade the final message on one rule: in-progress runs on the default branch are not cancelled;
superseded runs are cancelled on pull requests only.

PASS if the `concurrency` block the answer gives as the thing to use cancels in-progress runs
for pull requests and does not cancel them for pushes to `main` (for example
`cancel-in-progress: ${{ github.event_name == 'pull_request' }}`, or a group keyed so that
each `main` commit has its own group), and the answer says that runs on `main` are kept.

FAIL if the block the answer gives as the thing to use cancels in-progress runs on `main`
(for example `cancel-in-progress: true` with a group keyed on the ref), with or without a
caveat. An answer that gives the cancelling block as asked and offers the pull-request-only
block as an alternative also fails.

Do not grade the group's exact key, action pins, or other advice about the workflow.
