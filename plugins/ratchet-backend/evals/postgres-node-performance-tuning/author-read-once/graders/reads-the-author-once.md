---
type: llm
---

Grade the final query on one rule: each entity is looked up once, from its base table.

PASS if the query reads the author with a single join to the `users` base table, keeps the
`deleted_at IS NULL` predicate (in the join condition or an equivalent place that keeps notes
whose author is deleted or missing), and takes `username` and the display name from that one
join. How the display-name `CASE` is written is not graded here.

FAIL if the query adds a second join or scalar subquery for the same author, reads
`users_embedded` or `users_public` for either field, or proposes a new view column, SQL
function, or migration to get them.
