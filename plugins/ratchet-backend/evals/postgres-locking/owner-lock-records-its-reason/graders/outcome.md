---
type: llm
---

The owner has decided on a lock, for a reason the skill allows: a busy user action that
otherwise fails often with 409. Grade how the lock is added and recorded.

PASS if all of these hold:

1. It locks the playlist's row (`SELECT ... FROM playlists WHERE id = $1 FOR UPDATE` or
   `FOR NO KEY UPDATE`) before reading the tracks, and the reorder runs under that lock in a
   `READ COMMITTED` transaction. Keeping `SERIALIZABLE` (or `REPEATABLE READ`) fails this point:
   such a transaction takes its snapshot at the lock statement, so a writer that waited reads
   the old positions and fails with `40001` anyway.
2. The wait is bounded with `lock_timeout` (or `SET LOCAL lock_timeout`), and a timeout returns
   a conflict. `NOWAIT` alone fails this point: it turns every contended drag back into a 409,
   which is what the lock is for.
3. A comment next to the lock records why it is there. It uses the label `lock-reason:`, names
   the outcome it prevents (drags failing with 409 under concurrent reorders, or positions
   corrupted by concurrent rewrites), and names the competing writers (concurrent `moveTrack`
   calls, and `addTrack` or `removeTrack`).
4. It adds a test that runs two reorders (or a reorder and an add or remove) on one playlist at
   the same time, and asserts the outcome: both succeed and positions stay a gapless
   permutation. The test would fail without the lock. A test that asserts the lock itself (for
   example by reading `pg_locks`) fails this point.
5. It says that `addTrack` and `removeTrack` must take the same lock, or adds it to them.

FAIL if any point is missing. FAIL if it uses an advisory lock, or takes a lock on the track rows
instead of the playlist row.
