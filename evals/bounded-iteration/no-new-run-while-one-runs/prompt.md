---
description: A sweep with no deadline whose passes pile up checks the queue before starting a pass, and stays a chain of capped jobs with its own position, with no lock, shared cursor, or single long job
tags: [bounded-iteration, skill-fired, sweep]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

This job re-syncs every account's search document. A scheduler adds one job every 15 minutes
and each job does 200 accounts and adds the next one, carrying its position. A full pass used
to take five minutes. It now takes about forty, so three passes run at once, and together they
are heavy enough on the database to slow the product down.

Nothing needs a pass to finish by any particular time; the documents are also updated when an
account changes, and the sweep only repairs drift. I can change the job and how it is
scheduled. What should I change so the passes stop piling up?

Node, PostgreSQL 18 with `pg`, and BullMQ. Reply with the changed code
and a short explanation. Don't edit any files.

```ts
// src/jobs/resync-search-documents.ts
import type { Pool } from 'pg'
import type { Queue } from './queue.ts'
import { writeSearchDocument } from '../search/write.ts'

const BATCH = 200

// scheduler: queue.add('resyncSearchDocuments', {}) every 15 minutes
export async function resyncSearchDocuments(
  db: Pool,
  queue: Queue,
  data: { afterId?: string },
): Promise<void> {
  const found = await db.query<{ id: string }>(
    `SELECT id FROM accounts WHERE ($1::uuid IS NULL OR id > $1) ORDER BY id LIMIT $2`,
    [data.afterId ?? null, BATCH],
  )
  for (const row of found.rows) await writeSearchDocument(db, row.id)

  if (found.rows.length === BATCH) {
    await queue.add('resyncSearchDocuments', { afterId: found.rows[BATCH - 1].id })
  }
}
```
