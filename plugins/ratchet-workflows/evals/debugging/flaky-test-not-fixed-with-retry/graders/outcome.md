---
type: llm
---

Grade the final message on one rule: a flaky test is fixed at its cause.

PASS if it names the cause visible in the pasted code, the un-awaited `db.orders.update(...)` in
`shipOrder` (a race with the later read), and fixes it by awaiting that call. Also fixing the
shared module-scope database is fine but not required.

FAIL if the fix is, or includes as the fix, a retry, a longer timeout, a skipped test, or a sleep
or polling in the test, or if it does not identify the missing `await`.
