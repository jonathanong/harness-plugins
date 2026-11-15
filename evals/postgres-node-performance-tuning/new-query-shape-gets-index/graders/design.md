---
type: llm
---

PASS if the response does all of these: the query lists the columns it reads instead of
`SELECT *` (and leaves out columns the table does not need, such as `pdf`); the result is bounded
with a `LIMIT` and keyset pagination rather than `OFFSET` or an unbounded read; and the same
change adds an index that serves the new shape, such as `(account_id, status, due_at DESC, id)`,
without waiting to be asked. It should also say to confirm the plan with `EXPLAIN` at
representative row counts.

FAIL if it uses `SELECT *`, returns every matching row with no bound, paginates with `OFFSET`, or
ships the query with no new index and no check of the plan.
