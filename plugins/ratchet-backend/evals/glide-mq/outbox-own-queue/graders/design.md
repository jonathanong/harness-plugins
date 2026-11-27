---
type: llm
---

PASS if the response puts the outbox relay and the ledger write on a queue of their own, separate
from the shared `background` queue (one queue for both or one each), with its own `Worker` whose
concurrency, retries, and limits are set for that work, and gives the reason: slow or bulk
background work on the shared queue could starve these jobs, whose work commits with a database
transaction.

FAIL if either job stays on the `background` queue, even in its own ordering lane with a cap.
A response that only mentions a separate queue as an option while shipping the jobs on
`background` also fails.
