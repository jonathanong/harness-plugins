---
type: llm
---

PASS if the response rejects `HASH` partitioning for this table and partitions by `RANGE` on the
UUIDv7 `id` (time-ordered ranges such as daily or weekly, with a default partition), has retention
drop or detach whole partitions instead of deleting rows, and has readers bound `id` with a value
generated from time (for example `id >= min_uuidv7(now() - interval '7 days')` or an equivalent
computed bound) so partitions prune, together with the `account_id` filter.

FAIL if the DDL it proposes uses `PARTITION BY HASH`, keeps a row-by-row `DELETE` as the retention
mechanism, or has readers filter by extracting a timestamp from `id` in the predicate.
