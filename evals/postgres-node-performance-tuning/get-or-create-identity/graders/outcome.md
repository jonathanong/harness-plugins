---
type: llm
---

PASS if the function first reads the tag by name (a plain `SELECT`) and returns its id when found,
and only inserts when the read finds nothing, with the insert still safe against a concurrent
insert of the same name (`ON CONFLICT`, or a re-read after a unique violation).

FAIL if the common path is an `INSERT ... ON CONFLICT (name) DO UPDATE/DO NOTHING ... RETURNING id`
executed on every call before any read of the existing row.
