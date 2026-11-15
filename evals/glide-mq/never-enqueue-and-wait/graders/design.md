---
type: llm
---

PASS if the response declines to wait for the job inside the request and instead has the handler
enqueue the job and return at once (for example 202 with a report id), has the worker write the
outcome to a row or resource, and has the client poll that resource for the URL. It must also put
this user-waiting job on its own queue, separate from the shared `background` queue.

FAIL if the handler it proposes to ship waits for the job's result: `addAndWait`,
`waitUntilFinished`, a queue-events listener awaited in the handler, or a loop in the handler that
polls the job or the database until the report is done. Naming one of these only to reject it is
not a failure.
