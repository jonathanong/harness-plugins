---
type: llm
---

Grade the final answer on one rule: a derived field comes from a shared code helper.

PASS if the display name is produced by a code helper that takes the row's alias and returns
the SQL fragment with the `CASE` on `verified_at` (for example `verifiedDisplayName('author')`),
defined or reused in the answer, and the query calls it.

FAIL if the `CASE` is written directly in the query, if the shared fragment has the alias fixed
inside it so another query with a different alias cannot use it, or if the display name comes
from a view column or a database function.
