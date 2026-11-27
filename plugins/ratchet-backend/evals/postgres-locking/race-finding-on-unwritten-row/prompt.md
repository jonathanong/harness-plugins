---
description: A review bot reports a race between a comment insert and a thread being archived; the answer puts the guard in the insert and adds no share lock on the thread row.
tags: [postgres-locking, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

PostgreSQL 17, Node with `pg`. A review bot left this on my PR for the Acme forum, and I want to push a fix tonight. What should the fix be? Show me the code.

> **Race condition (major).** `addComment` checks `threads.archived_at IS NULL` and then inserts. A moderator can archive the thread between the check and the insert, so a comment lands on an archived thread. Lock the thread row before the check.

```ts
export async function addComment(
  tx: Transaction,
  threadId: string,
  authorId: string,
  body: string,
) {
  const { rows } = await tx.query('SELECT archived_at FROM threads WHERE id = $1', [threadId])
  if (!rows[0] || rows[0].archived_at) throw new Conflict('thread is archived')
  await tx.query('INSERT INTO comments (thread_id, author_id, body) VALUES ($1, $2, $3)', [
    threadId,
    authorId,
    body,
  ])
}
```

Archiving only hides the reply box; a late comment on an archived thread is shown like any other. Reply in your message; you don't need to create files.
