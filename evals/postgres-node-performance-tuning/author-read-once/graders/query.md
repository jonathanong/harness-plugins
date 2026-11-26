---
type: llm
---

PASS if the final query reads the author with a single join to the `users` base table, keeps the
`deleted_at IS NULL` predicate (in the join condition or an equivalent place that keeps notes whose
author is deleted or missing), takes `username` from that join, and computes the display name
from the same row through a shared code helper that takes the row's alias and returns the
`CASE` on `verified_at` (for example `verifiedDisplayName('author')`), defined or reused in the
answer. It must not
join or look up the author a second time, read `users_embedded` or `users_public` for these
fields, or propose a new view column, SQL function, or migration to get them.

FAIL if the query adds a second join or scalar subquery for the same author, keeps reading either
view for these two fields, writes the `CASE` directly in the query instead of calling a helper,
or proposes a new view column, function, or migration.
