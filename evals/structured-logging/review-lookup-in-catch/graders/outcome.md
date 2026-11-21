---
type: llm
---

Grade the review and any replacement code.

PASS if all hold: it objects to the `customers.findById` call in the catch block (it can fail and
hide the original error, or adds a query for a log line) and the replacement does not call it;
it objects to putting the customer's name in the log (personal data) and logs `customerId`
instead; and the replacement uses a fixed message with `invoiceId`, `customerId` and the error
object as fields, not a template string and not only `err.message`.

FAIL if it keeps the lookup (even guarded with try/catch), keeps the name in the log, or keeps a
message that interpolates values.
