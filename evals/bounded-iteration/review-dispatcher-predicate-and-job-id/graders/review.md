---
type: llm
---

PASS if the review raises both of these. First, the predicate cannot be served by an index:
`updated_at > synced_at` compares two columns of the same row, or the `OR` joins two unrelated
signals; the dispatcher should read rows that need work through an index-served predicate (a
work-item or dirty-marker row, a stored due timestamp with a partial index) or be split into one
dispatcher per signal. Second, the job id is keyed only by the account, so a new change that
arrives while the previous job is running or still retained is dropped; the id should include the
triggering event or version as well as the entity.

FAIL if the review approves the query's predicate as is, or treats the entity-only job id as
correct deduplication.
