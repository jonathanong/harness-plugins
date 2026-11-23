---
description: A purge sweep whose runs overlap is made safe by a re-check in the delete and a conditional cursor write, not by locking its rows or its cursor
tags: [bounded-iteration, skill-fired, sweep]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

This purge job is started by cron on two hosts, and when a run is slow the next one starts
before it finishes. Last week that bit us twice: a draft that the user had just restored got
deleted anyway, and the saved position went backwards so we rescanned a day of rows. I can't
change the cron setup this week. Make the job safe when two runs overlap.

Node, PostgreSQL 18 with `pg`. Reply with the changed code. Don't edit any files.

```ts
// src/jobs/purge-trashed-drafts.ts
import type { Pool } from 'pg'

const BATCH = 500
const MAX_BATCHES = 20

export async function purgeTrashedDrafts(db: Pool, cutoff: Date): Promise<{ hasMore: boolean }> {
  for (let i = 0; i < MAX_BATCHES; i++) {
    const cursor = await db.query<{ last_id: string }>(
      `SELECT last_id FROM purge_cursors WHERE name = 'trashed_drafts'`,
    )
    const lastId = cursor.rows[0].last_id

    const found = await db.query<{ id: string }>(
      `SELECT id FROM drafts
       WHERE id > $1 AND trashed_at IS NOT NULL AND trashed_at < $2
       ORDER BY id
       LIMIT $3`,
      [lastId, cutoff, BATCH],
    )
    if (found.rows.length === 0) return { hasMore: false }
    const ids = found.rows.map((row) => row.id)

    await db.query(`DELETE FROM drafts WHERE id = ANY($1::uuid[])`, [ids])

    await db.query(`UPDATE purge_cursors SET last_id = $1 WHERE name = 'trashed_drafts'`, [
      ids[ids.length - 1],
    ])
  }
  return { hasMore: true }
}
```

Restoring a draft sets `trashed_at` back to NULL. `drafts` has an index on `(id)` where
`trashed_at IS NOT NULL`.
