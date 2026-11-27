---
type: llm
---

Grade the final message on one rule: how long a job or step takes is read from the run's job and
step timestamps in the API, not from its logs.

PASS if the answer does not give a command that prints the whole run's log as the thing to
run, and gives in its place a query of the run's jobs that shows step or job durations from
their timestamps (for example `.steps[]` with `started_at` and `completed_at`). Saying that
one job's log can be fetched to a file and searched afterwards, once the slow step is known,
still passes.

FAIL if the answer gives a command that prints or downloads the full log of the run
(`gh run view --log`, `gh run view --log-failed` for the whole run, the run's logs archive)
as the thing to run, with or without a caveat about size. An answer that gives the log
command as asked and offers the timestamp query as an alternative also fails.

Do not grade the query's syntax or how the durations are computed.
