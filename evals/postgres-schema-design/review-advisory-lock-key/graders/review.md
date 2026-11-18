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
the operation. A review may also ask for the lock to be replaced, as long as it names a concrete
alternative that fits this case, such as inserting the account first with
`INSERT ... ON CONFLICT (org_id) DO NOTHING RETURNING` and copying the price book only when the
insert returned a row.

FAIL if the review does not mention the shared key, or asks for the advisory lock to be removed
because advisory locks are not allowed, without naming an alternative that fits.
