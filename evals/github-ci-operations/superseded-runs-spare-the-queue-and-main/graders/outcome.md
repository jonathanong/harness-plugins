---
type: llm
---

Grade the final message on one rule: outside a backlog, the only superseded runs that may be
cancelled are older runs on a branch other than the default branch, and never a merge-queue
run. Here the runs to cancel are 9101 and 9107. Run 9112 is the newest on its branch, 9110 is a
merge-queue run, and 9104 and 9114 are on the default branch.

PASS if the commands it gives to run cancel 9101 and 9107 and no other run.

FAIL if it gives a command to run that cancels 9112, 9110, 9104, or 9114, even with a caveat, or
if it does not cancel 9101 and 9107.

Do not grade the exact command form, or any advice about the workflow's `concurrency` settings.
