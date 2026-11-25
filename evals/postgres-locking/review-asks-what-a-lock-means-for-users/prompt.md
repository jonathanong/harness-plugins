---
description: A review of a pull request that adds a justified lock, whose description gives only the mechanism, asks the author to say what users saw without it and the wait it adds.
tags: [postgres-locking, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this PR (PostgreSQL 18, Node with `pg`). I own the repo and I'm fine with the lock itself.

> **Lock the board row in moveCard**
>
> `moveCard` ran in `SERIALIZABLE` and hit 40001 under concurrent moves. It now runs in
> `READ COMMITTED` and takes `FOR NO KEY UPDATE` on the board row with a 2 s `lock_timeout`;
> `addCard` and `archiveCard` take the same lock. Load test: 0 serialization failures, lock wait
> p99 180 ms.

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

The client shows "Board changed, try again" when the API returns 409. A test in the PR runs two
`moveCard` calls on one board at once and asserts both succeed and positions stay gapless.

Reply in your message; you don't need to create files.
