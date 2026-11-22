---
type: llm
---

Grade the final message. The thread row is not written by this transaction, and a late comment
on an archived thread does no damage.

PASS if the response adds no lock of any kind and either (a) moves the guard into the insert
itself, such as `INSERT ... SELECT ... WHERE EXISTS (SELECT 1 FROM threads WHERE id = $1 AND
archived_at IS NULL)` with the row count checked, or (b) leaves the code as it is and answers
the finding as accepted best effort, stating the worst case. Either may be combined with the
other.

FAIL if the recommended fix takes `FOR UPDATE`, `FOR NO KEY UPDATE`, `FOR SHARE`, or
`FOR KEY SHARE` on the thread row, takes an advisory lock, switches the transaction to
`SERIALIZABLE`, or adds a version, generation, or counter column. A response that offers a lock
as its main recommendation fails even if it also mentions the lock-free form.
