---
type: llm
---

Grade the code the response proposes to ship.

PASS if both hold. First, the log call uses a fixed message string with the varying values
(order id, refund id, error) passed as structured fields. Second, the code does not call
`customers.findById` or `accounts.findById` to put the email in the log: it logs `customerId`
(or another identifier the function already has) instead, and the response says why (extra
queries for a log line, or an email address is personal data that should stay out of logs).
Showing the lookup version as a clearly marked alternative that it advises against is still a
pass.

FAIL if the code it recommends fetches the customer or the account to log the email, including
only on the failure path, or if the message is a template string containing the values.
