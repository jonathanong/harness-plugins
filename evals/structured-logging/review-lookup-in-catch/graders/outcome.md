---
type: llm
---

Grade the review and any replacement code.

PASS if both hold: it objects to the `customers.findById` call in the catch block (it can fail
and hide the original error, or adds a query for a log line) and the replacement does not call
it; and it objects to putting the customer's name in the log (personal data) and logs
`customerId` instead.

FAIL if it keeps the lookup (even guarded with try/catch) or keeps the name in the log.
