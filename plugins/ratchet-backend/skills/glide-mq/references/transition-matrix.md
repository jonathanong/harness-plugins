# Transition matrix

Use when a job calls an external provider, mutates durable state, or both. Ship a filled-in matrix
with the job, in the README of the code that owns it. It answers what happens at each point the job
can fail; a replayability table answers only whether a backfill can re-derive the job.

Required rows (the transition modes):

1. Dispatch failure: the enqueue or the call never happens.
2. Provider non-consumption: the provider rejected the request and used nothing.
3. Provider consumption followed by a database commit failure: the provider acted, the write
   was lost.
4. Durable commit followed by reply loss: the write landed, the caller never learned.
5. Retry or reconciliation: a later attempt or a sweep runs again.
6. TTL expiry: a lease, claim, or pending state times out.
7. Orphan cleanup: rows or jobs left by a crashed run are removed or adopted.
8. Normal terminal removal: the job ends and its record is trimmed.

Columns for every row:

| Column                       | What it answers                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Failure mode                 | Which row above.                                                                                                 |
| Detectable state             | What durable, queue, or reply state tells this row from every other. What would you observe?                     |
| Recovery/reconciliation path | Who notices and what they do: a caller retry, a reconciliation job, a durable-handoff race, or an accepted loss. |
| Idempotency guarantee        | What makes a second attempt safe: a stable logical key, a uniqueness constraint, a fencing token, or n/a.        |
| Evidence (test)              | The real-boundary test that exercises this transition.                                                           |

Rows 3 and 4 are the ones skipped. Two rows with the same detectable state mean the matrix is
missing the state that tells them apart; add it to the schema, not only to the table. Treat a test
name as best effort and the file path as the reference, since nothing fails when a test is renamed.
