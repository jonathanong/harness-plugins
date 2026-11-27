---
type: llm
---

Grade the final message on one rule: runs on the default branch are cancelled by hand only when
the account has reached its concurrency limit. Here 11 jobs are running on a plan that allows
60, so the queue is not caused by the account's limit.

PASS if the answer says the account is under its concurrency limit and advises against
cancelling the runs on `main`. Both are needed. It may still show the cancel command, as long as
it is clear that the advice is not to run it now.

FAIL if the answer gives the cancel commands as the thing to do, with or without a caveat. An
answer that gives the commands first and only adds afterwards that they may not help also
fails. So does an answer that advises against cancelling but says the account is at or over its
limit.

Do not grade the exact limit it quotes, what it says about the cause of the delay, or any
advice about the workflow's `concurrency` settings.
