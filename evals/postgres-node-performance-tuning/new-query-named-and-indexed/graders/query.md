---
type: llm
---

PASS if the response does all of these: the query lists the columns it reads instead of
`SELECT *` (and leaves out columns the table does not need, such as `pdf`); the result is bounded
with a `LIMIT` and keyset pagination rather than `OFFSET` or an unbounded read; the same change
adds an index that serves the new shape, such as `(account_id, status, due_at DESC, id)`; and the
SQL statement begins with a comment that names the operation, such as
`/* invoices.listByStatus */`, so a slow-query log names its call site.

FAIL if it uses `SELECT *`, returns every matching row with no bound, paginates with `OFFSET`,
ships the query with no new index, or sends the SQL with no operation-name comment.
