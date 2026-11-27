---
description: Writing the pull request description for a lock the owner chose, says what it changes for the people affected - the failed drags it removes and the wait it adds - not only the mechanism.
tags: [postgres-locking, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the PR description for this change. I decided on the lock last week; the code is done and
reviewed for correctness. PostgreSQL 18, Node with `pg`.

```diff
 export async function moveCard(db: Pool, boardId: string, cardId: string, to: Position) {
-  return withSerializable(db, async (tx) => {
+  return withReadCommitted(db, async (tx) => {
+    await tx.query("SET LOCAL lock_timeout = '2s'")
+    // lock-reason: concurrent moves on one board fail with 40001; moveCard vs moveCard, addCard, archiveCard
+    await tx.query('SELECT 1 FROM boards WHERE id = $1 FOR NO KEY UPDATE', [boardId])
     const cards = await loadColumnCards(tx, boardId, to.columnId)
     await writePositions(tx, reorder(cards, cardId, to))
   })
 }
```

`addCard` and `archiveCard` take the same lock in the same PR. Numbers from staging and last
week's production metrics:

- `moveCard` 40001 rate on boards with more than 10 concurrent editors: 31% at peak, 0.4%
  overall. The client shows "Board changed, try again" on 409.
- After the change in staging: 0 serialization failures; lock wait p50 3 ms, p99 180 ms; hold
  time p99 40 ms; `lock_timeout` hit 0 times in a 20-editor load test.
- 2% of boards ever have more than 10 concurrent editors; they are mostly planning sessions.

Reply with the description only.
