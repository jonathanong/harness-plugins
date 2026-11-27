---
type: llm
---

Grade the final message on one rule: while jobs are queuing at the account's concurrency limit,
a failed job is not rerun to find out whether it is flaky; its log is read instead.

PASS if the answer advises against rerunning the job to test for flakiness while the account is
at its limit, and says to read the failed job's log (or gives a command that fetches it)
instead. It may show the rerun command for later, as long as it is clear that the advice is
not to run it now.

FAIL if the answer gives the rerun command as the thing to do now, with or without a caveat
about the queue. An answer that gives the rerun command and also suggests reading the log, in either order,
without advising against the rerun now also fails.

Do not grade the command's syntax, the limit it quotes, or any advice about fixing the test.
