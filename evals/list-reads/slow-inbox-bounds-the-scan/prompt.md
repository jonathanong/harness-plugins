---
description: A slow inbox read that walks past muted senders gets a bound on rows scanned per request, and a page that stops at the bound keeps the client paging.
tags: [list-reads, outcome, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

`listInbox` in our Node service (node-postgres) is slow for people who mute a very chatty sender: p99 is over two seconds for them and about 15 ms for everyone else. `messages` has an index on `(recipient_id, created_at DESC, id DESC)` and `mutes` has one on `(viewer_id, sender_id)`. Fix it and show the function and the response it returns.

```ts
// src/inbox/listInbox.ts
const PAGE = 30

export async function listInbox(db: Pool, viewerId: string, cursor: Cursor | null) {
  const { rows } = await db.query(
    `/* inbox.list */
     SELECT m.id, m.sender_id, m.subject, m.created_at
       FROM messages m
      WHERE m.recipient_id = $1
        AND ($2::timestamptz IS NULL OR (m.created_at, m.id) < ($2, $3))
        AND NOT EXISTS (
          SELECT 1 FROM mutes mu WHERE mu.viewer_id = $1 AND mu.sender_id = m.sender_id
        )
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT $4`,
    [viewerId, cursor?.createdAt ?? null, cursor?.id ?? null, PAGE + 1],
  )
  const items = rows.slice(0, PAGE)
  const last = items.at(-1)
  return {
    items,
    has_next_page: rows.length > PAGE,
    next_cursor: rows.length > PAGE && last ? { createdAt: last.created_at, id: last.id } : null,
  }
}
```

Reply in your message; you don't need to create files.
