---
type: llm
---

Stock is an exact quantity, so the code must prevent overselling. Many concurrent checkouts hit the
same rows, so any lock must be short and bounded, and the queue calls are outside calls that must
not run inside the transaction.

PASS if the code does all three:

1. Prevents overselling, either with a conditional write such as
   `UPDATE stock SET qty = qty - $1 WHERE sku = $2 AND qty >= $1` that checks the affected row
   count and rolls back when an item is short, or with a row lock on the stock rows.
2. If it takes a row lock (`FOR UPDATE`) or an advisory lock, the wait is bounded (`NOWAIT`,
   `lock_timeout`, or `pg_try_advisory_xact_lock`; `SKIP LOCKED` does not count, because it would
   skip stock), and rows are locked in a fixed order such as `ORDER BY sku`. Code that takes no
   explicit lock passes this point.
3. Calls both queue `add` methods only after `COMMIT` has succeeded, not between `BEGIN` and
   `COMMIT`.

FAIL if any item can be oversold, if a lock waits without a bound, if rows are locked in an order
that depends on the cart, or if either queue call runs before `COMMIT`.
