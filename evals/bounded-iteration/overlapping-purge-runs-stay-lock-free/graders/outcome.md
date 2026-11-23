---
type: llm
---

Grade the fix on one rule: a sweep takes no locks. Each write re-checks eligibility on the row
it writes, and the stored position advances by a compare-and-set.

PASS if all three hold:

- The `DELETE`'s own `WHERE` clause repeats the eligibility test on the row it deletes
  (`trashed_at IS NOT NULL` and `trashed_at < cutoff`), so a draft restored after the read is not
  deleted. A test that appears only in a CTE or a subquery that picks the ids does not count.
- The cursor write is a compare-and-set on the value this batch read
  (`WHERE last_id = <that value>`), so a run whose position was moved by another run does not
  write over it.
- The job takes no lock to do this: no `FOR UPDATE` or `FOR UPDATE SKIP LOCKED` on the draft
  rows, no `FOR UPDATE` on the cursor row, no advisory lock, and no `LOCK TABLE`.

An answer that removes the stored position, and says why the sweep no longer needs one, has no
cursor write to guard and passes the second point.

FAIL if the fix serializes the runs or the rows with any lock named above, even when it also
adds the re-check. FAIL if the delete still deletes by id alone. FAIL if the cursor write is
still unconditional, or is only a forward-only guard such as `WHERE last_id < $new` or
`GREATEST(last_id, $new)`: such a guard lets a run write a position it computed from a start
that another run has since replaced. A compare-and-set never does.

A suggestion to also make the scheduler single-flight later is fine and is not graded. Do not
grade the batch size, the cap on batches, or whether the statements share a transaction.
