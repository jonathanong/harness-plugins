---
description: Asked to remove duplication between three lookups, the agent shares the column list and keeps each statement's name written out in its SQL.
tags: [postgres-node-performance-tuning, skill-fired, outcome, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

These three are the same query with a different WHERE, and every time we add a column to `images` somebody forgets one of them (last week `blurhash` was missing from the owner lookup). Clean up the duplication so that can't happen.

```ts
// src/images/queries.ts
import type { Pool } from 'pg'

export async function getImageById(db: Pool, id: string) {
  const { rows } = await db.query(
    `/* images.getById */
     SELECT id, owner_id, storage_key, width, height, content_type, blurhash, created_at
       FROM images
      WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  )
  return rows[0] ?? null
}

export async function getImageByStorageKey(db: Pool, storageKey: string) {
  const { rows } = await db.query(
    `/* images.getByStorageKey */
     SELECT id, owner_id, storage_key, width, height, content_type, blurhash, created_at
       FROM images
      WHERE storage_key = $1 AND deleted_at IS NULL`,
    [storageKey],
  )
  return rows[0] ?? null
}

export async function getImageForOwner(db: Pool, ownerId: string, id: string) {
  const { rows } = await db.query(
    `/* images.getForOwner */
     SELECT id, owner_id, storage_key, width, height, content_type, created_at
       FROM images
      WHERE id = $2 AND owner_id = $1 AND deleted_at IS NULL`,
    [ownerId, id],
  )
  return rows[0] ?? null
}
```

Reply in your message with the changed file; you don't need to create files.
