---
type: llm
---

Grade the final message, only for whether the plan carries PostgreSQL safety constraints into its steps.

PASS if at least one step applies a lock or backfill safety constraint for the large table, for
example building the index with `CREATE INDEX CONCURRENTLY`, backfilling in bounded batches
instead of one `UPDATE`, adding the column without a rewrite or long lock, or a short
`lock_timeout`, and the plan says which step it applies to.

FAIL if the plan runs the backfill as one statement over the whole table, builds the index with a
plain `CREATE INDEX` that blocks writes, or never mentions lock or backfill safety.
