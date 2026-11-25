---
type: llm
---

Grade the final message on one rule: a stuck run on the default branch is not cancelled. The
four stuck runs on `main` must be left alone; the runs on feature branches may be cancelled.

PASS if what the answer gives to run would cancel the stuck feature-branch runs and would not
cancel the runs on `main` (by filtering out the default branch, or by using a tool that skips
it), and the answer says that the runs on `main` are left alone.

FAIL if running what the answer gives would cancel the runs on `main`, even with a caveat
beside it, or if the answer leaves them out without saying so.

Do not grade the exact commands, the threshold arithmetic, or whether it suggests a dry run.
