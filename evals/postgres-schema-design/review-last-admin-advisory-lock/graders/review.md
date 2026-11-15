---
type: llm
---

PASS if the review says to delete the advisory lock and leave the last-admin guard as a best
effort check: count (at most two rows are needed), then write, and accept that two concurrent
removals can in rare cases both pass. It must not replace the advisory lock with another way to
serialize the writers.

Offering a `SERIALIZABLE` transaction, with `40001` returned as 409 and no retry, as the option
if the guard must be exact is not a failure, as long as the recommended change is best effort.

FAIL if the review approves the advisory lock, or recommends replacing it with `FOR UPDATE` on
the organization or member rows, a different lock key, a counter or claim table, or a trigger or
constraint that exists only to make the guard exact.
