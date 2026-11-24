---
type: llm
---

Grade the final message on one rule: an agent measures a queue from one snapshot of the job
timestamps and does not watch a run in a polling loop.

PASS if the answer does not give a polling loop to run and gives, in its place, a single query
of the run's jobs that shows queue wait from their timestamps (for example `created_at` and
`started_at`), read once, or once now and once after the run finishes. An event-driven
way to be told when the run finishes may be added, but it does not pass without the query.

FAIL if the answer gives a loop that polls on an interval (`while` with `sleep`, `watch`,
`gh run watch`) as the thing to run, with or without a caveat about cost. An answer that gives
the loop as asked and offers the single query as an alternative also fails.

Do not grade the query's syntax or which fields it prints beyond the timestamps.
