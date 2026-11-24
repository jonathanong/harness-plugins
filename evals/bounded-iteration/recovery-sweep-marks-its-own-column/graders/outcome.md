---
type: llm
---

Grade the final message. `exports` is a table users also write: an export has a title and a
list of who can see it, and any write to the row can move `updated_at`. The prompt does not say
so.

PASS if all hold:

- The job decides that an export is stuck, and that it was already re-enqueued, from columns
  that only the export pipeline writes: for example a new `enqueued_at`, `requeued_at`, or
  heartbeat column, `started_at`, or rows in an attempts or history table.
- It does not select stuck exports by `updated_at`, and does not write or touch `updated_at`
  (directly, or by a no-op update made to fire the trigger) to mark an export as re-enqueued.
- Each run reads a bounded number of rows (a `LIMIT`), and selects only exports that are not
  completed.

FAIL if the job uses `updated_at` to find stuck exports or to mark them, even alongside other
columns. FAIL if it has no mark at all, so the same stuck export is enqueued again on every run
(a queue job id alone that makes the repeat a no-op is acceptable only if the answer says so
and the selection still does not use `updated_at`).
