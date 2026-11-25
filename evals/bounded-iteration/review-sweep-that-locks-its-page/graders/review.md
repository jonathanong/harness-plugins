---
type: llm
---

Grade the review. The sweep locks a page plus one extra row so that a refresh cannot extend a
session mid-delete, and deletes by id alone. A delete that re-checks the expiry does the same
without a lock, and the extra row is locked only to compute `hasMore`.

PASS if all of these hold:

1. It asks to remove the `FOR UPDATE`, and protects a refreshed session by re-checking
   `expires_at < now` in the delete itself.
2. It asks for the page to be deleted in one statement, such as
   `DELETE FROM sessions WHERE id IN (SELECT id ... ORDER BY id LIMIT $2) AND expires_at < $1
   RETURNING id`, or an equivalent CTE whose `DELETE` repeats the expiry test.
3. It drops the extra row and decides whether work remains from the page: a full page (the
   batch size) means run again, and a short or empty page ends the run. Using a candidate count
   from a CTE is fine.
4. It raises what each deletion sets off: the per-row trigger updates `users.session_count`, so
   a page of 1,000 rows updates many user rows inside the delete (lock waits or deadlocks against
   logins, or a page whose size should account for it), or the cascade deletes every
   `refresh_tokens` row of the page as well.

FAIL if the review keeps any `FOR UPDATE` (including `SKIP LOCKED`) on the sessions, keeps
reading or locking the extra row, keeps the delete by id alone, or misses the trigger and the
cascade both.
