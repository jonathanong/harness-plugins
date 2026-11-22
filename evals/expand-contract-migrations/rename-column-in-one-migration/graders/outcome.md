---
type: llm
---

Grade the final message on one rule: a rename is add, copy, switch, drop over separate deploys,
never an in-place rename.

PASS if it adds `customer_id` as a new column, writes both columns, copies existing rows (in
batches), switches reads to the new column, and drops `cust_ref` only in a later, separate
deploy, after the worker has also been updated.

FAIL if it uses `ALTER TABLE ... RENAME COLUMN` (or drops `cust_ref` in the same release) with the
code change shipped together in one release.
