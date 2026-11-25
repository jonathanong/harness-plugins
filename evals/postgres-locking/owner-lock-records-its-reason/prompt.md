---
description: Asked by the owner to lock a busy shared row so users stop getting conflicts, takes a bounded lock on the root row, records next to it why it exists and which writers it keeps apart, and adds a test that fails without it.
tags: [postgres-locking, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our collaborative playlists let everyone in a room drag songs around at once. Each reorder
rewrites `position` for the moved range in one `SERIALIZABLE` transaction and returns 409 on
`40001`. At a party with twenty people dragging, about a third of drags bounce with "someone
else changed the list, try again", and people are complaining. I've decided we take a lock on
the playlist so drags queue up for a moment instead of failing. Write it, plus whatever we need
so nobody rips it out later or copies it somewhere it doesn't belong.

PostgreSQL 18, Node with `pg`, Vitest with a real database. Reply with the code; don't edit any
files.

```ts
// src/playlists/reorder.ts
export async function moveTrack(db: Pool, playlistId: string, trackId: string, to: number) {
  return withSerializable(db, async (tx) => {
    const { rows } = await tx.query(
      'SELECT id, position FROM playlist_tracks WHERE playlist_id = $1 ORDER BY position',
      [playlistId],
    )
    const order = moveInArray(rows, trackId, to)
    await tx.query(
      `UPDATE playlist_tracks AS t SET position = v.position
       FROM unnest($1::uuid[], $2::int[]) AS v(id, position)
       WHERE t.id = v.id AND t.playlist_id = $3`,
      [order.map((r) => r.id), order.map((_, i) => i), playlistId],
    )
  })
}
```

`playlist_tracks` has a unique constraint on `(playlist_id, position)`, deferrable initially
deferred. Adding a track (`addTrack`) and removing one (`removeTrack`) also rewrite positions in
the same playlist. A playlist has at most 500 tracks.
