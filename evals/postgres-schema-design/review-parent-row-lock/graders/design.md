---
type: llm
---

PASS if the review says the `SELECT ... FOR UPDATE` on the `posts` row is an unnecessary lock on a
parent row and should be deleted (the `comment_count + 1` update is already atomic, or the count
should not be stored at all), and does not replace it with another serializer. It must also raise
at least two of: the foreign keys state no `ON DELETE`; the referencing columns `post_id` or
`author_id` have no index; the table and columns have no comments; `RETURNING *` should list
columns; the hand-written `BEGIN`/`COMMIT` has no rollback or should go through a transaction
helper.

FAIL if the review approves the parent-row lock, or recommends swapping it for an advisory lock, a
wider lock, a claim or counter table, or a higher isolation level.
