---
description: A review asks for a compare-and-set on a cursor row that every run shares; the fix gives each run its own position in job data and removes the shared write
tags: [bounded-iteration, skill-fired, sweep]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I got this review comment on the job below and I want to address it:

> The cursor write is unconditional. A manual re-run, or a pass that is still going when the
> next night's starts, gives two chains writing the same `sweep_cursors` row, and one can move
> it backwards. Make it a compare-and-set and add a test for the race.

The job recomputes `accounts.storage_bytes` from `files`. A scheduler adds one job a night with
no payload, and an operator sometimes adds one by hand. Each job does 500 accounts and adds the
next job. Recomputing an account twice is harmless. Nothing else reads `sweep_cursors`.

Node, PostgreSQL 18 with `pg`, and a Redis-backed job queue. Reply with the changed code. Don't
edit any files.

```ts
// src/jobs/recompute-storage.ts
import type { Pool } from 'pg'
import type { Queue } from './queue.ts'

const BATCH = 500
const NIL = '00000000-0000-0000-0000-000000000000'

export async function recomputeStorage(db: Pool, queue: Queue): Promise<void> {
  const cursor = await db.query<{ last_id: string }>(
    `SELECT last_id FROM sweep_cursors WHERE name = 'recompute_storage'`,
  )
  const lastId = cursor.rows[0].last_id

  const found = await db.query<{ id: string }>(
    `SELECT id FROM accounts WHERE id > $1 ORDER BY id LIMIT $2`,
    [lastId, BATCH],
  )
  const ids = found.rows.map((row) => row.id)

  await db.query(
    `UPDATE accounts a
     SET storage_bytes = (SELECT coalesce(sum(f.size_bytes), 0) FROM files f WHERE f.account_id = a.id)
     WHERE a.id = ANY($1::uuid[])`,
    [ids],
  )

  const done = ids.length < BATCH
  await db.query(`UPDATE sweep_cursors SET last_id = $1 WHERE name = 'recompute_storage'`, [
    done ? NIL : ids[ids.length - 1],
  ])
  if (!done) await queue.add('recomputeStorage', {})
}
```
