---
description: An inbox read capped at 500 inspected rows still tells the client to keep paging when the cap stops it short.
tags: [list-reads, outcome, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

`listInbox` in our Node service (node-postgres) got slow for people who mute a very chatty sender: the query walks past thousands of muted messages to fill a page of 30. I want to cap it at 500 messages looked at per request, so one request can never do more work than that. Rewrite the function with the cap and show the response it returns.

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
