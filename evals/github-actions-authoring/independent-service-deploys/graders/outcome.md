---
type: llm
---

PASS if the two deploys do not wait on each other: no step or job in one deploy polls, sleeps on,
or reads the status of the other deploy, and the frontend deploy is not gated on the API deploy's
run. The answer instead makes the frontend tolerate the API not having the endpoint yet, or ships
the API change first as a separate change, so any deploy order is safe.

FAIL if the frontend deploy waits for, polls, or looks up the API deploy's run or status (for
example with `gh run watch`, a sleep loop, or a check of the other workflow's conclusion) to
enforce the order.
