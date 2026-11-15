---
type: llm
---

PASS if the review raises both of these. First, no index on the table serves the predicate as
written (`updated_at > synced_at` compares two columns of the same row, and the `OR` joins two
unrelated signals), so each run scans accounts to find work. It asks for one of: rows that mark
pending work (a work-item or dirty-marker row, or a stored due timestamp), one dispatcher per
signal with its own index-served predicate, or a partial index whose predicate matches the
query. Second, the job id is keyed only by the account, so a new change that
arrives while the previous job is running or still retained is dropped; the id should include the
triggering event or version as well as the entity.

FAIL if the review accepts the query with no index or marker for its predicate, or treats the entity-only job id as
correct deduplication.
