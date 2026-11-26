---
type: llm
---

PASS if the response says a third attempt is needed for `no-secret-in-logs` (a critical case
needs 3 of 3) and for `summary-is-short` (1 of 2 can still reach 2 of 3), and for no other case:
it treats `retry-uses-backoff` as already meeting its target, and `refund-needs-approval` and
`migration-is-reversible` as already missing theirs.

FAIL if it asks for a third attempt on a case whose verdict cannot change, or skips the third
attempt for `no-secret-in-logs` or `summary-is-short`. Do not grade how it writes the table rows.
