---
description: A review of a feed query that filters a capped pool of recent posts asks for one walk over posts with the filters in the query, because the pool returns short and empty pages.
tags: [list-reads, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Can you review this before I merge? It's the home feed read for our app (Node, PostgreSQL 18, `pg`). The old version joined everything in one query and someone flagged it as risky for people who mute a lot of accounts, so I rewrote it to cap the work up front. `posts` has an index on `(created_at DESC, id DESC)`. Mutes are capped at 5,000 per user.

```ts
export async function homeFeed(
  db: Pool,
  viewerId: string,
  cursor: Cursor | null,
  pageSize: number,
) {
  const { rows } = await db.query(
    `WITH candidates AS MATERIALIZED (
       SELECT id, author_id, body, created_at
         FROM posts
        WHERE ($2::timestamptz IS NULL OR (created_at, id) < ($2, $3))
        ORDER BY created_at DESC, id DESC
        LIMIT 500
     )
     SELECT c.*
       FROM candidates c
      WHERE NOT EXISTS (
              SELECT 1 FROM mutes m
               WHERE m.viewer_id = $1 AND m.muted_id = c.author_id)
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT $4`,
    [viewerId, cursor?.createdAt ?? null, cursor?.id ?? null, pageSize + 1],
  )
  const page = rows.slice(0, pageSize)
  const last = page.at(-1)
  return {
    items: page,
    nextCursor: rows.length > pageSize && last ? { createdAt: last.created_at, id: last.id } : null,
  }
}
```

Tests cover the first page, a second page, and a viewer with two mutes. Anything to change?

Reply in your message; you don't need to create files.
