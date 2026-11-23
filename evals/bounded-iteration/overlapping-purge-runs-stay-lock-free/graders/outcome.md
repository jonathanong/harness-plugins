---
type: llm
---

Grade the fix on one rule: a sweep takes no locks. Each write re-checks eligibility on the row
it writes, and the stored position advances by a compare-and-set.

PASS if all three hold:

- The `DELETE` repeats the eligibility test on the rows it deletes (`trashed_at IS NOT NULL` and
  `trashed_at < cutoff`, or the same test through a CTE in one statement), so a draft restored
  after the read is not deleted.
- The cursor write is conditional, so a slow or stale run cannot move the position backward:
  `WHERE last_id = <the value this batch read>`, or a forward-only guard such as
  `WHERE last_id < $new`.
- The job takes no lock to do this: no `FOR UPDATE` or `FOR UPDATE SKIP LOCKED` on the draft
  rows, no `FOR UPDATE` on the cursor row, no advisory lock, and no `LOCK TABLE`.

FAIL if the fix serializes the runs or the rows with any lock named above, even when it also
adds the re-check. FAIL if the delete still deletes by id alone. FAIL if the cursor write is
still unconditional.

A suggestion to also make the scheduler single-flight later is fine and is not graded. Do not
grade the batch size, the cap on batches, or whether the statements share a transaction.
