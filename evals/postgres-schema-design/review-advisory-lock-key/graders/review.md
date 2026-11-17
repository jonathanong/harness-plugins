---
type: llm
---

The author explains why a constraint and `SERIALIZABLE` do not fit. The lock is
transaction-scoped. Its defect is the key: `hashtext(orgId)` alone is the same key that
`syncSeats` already takes, so a checkout waits behind an unrelated seat sync of up to 30
seconds, and the two operations block each other.

PASS if the review points out that the key is shared with `syncSeats` (or with any other lock
keyed on the organization id alone) and asks for a key specific to this operation, such as the
two-key form `pg_advisory_xact_lock(<namespace>, hashtext(orgId))` or a hashed string that names
the operation. Suggesting an alternative to the lock is fine as long as the review does not make
removing the lock a condition of merging.

FAIL if the review does not mention the shared key, or rejects the advisory lock as not allowed
and asks for it to be removed without engaging with the reasons the author gave.
