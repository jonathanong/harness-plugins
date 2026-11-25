---
name: postgres-locking
description: Use when writing or reviewing PostgreSQL code that takes a row lock (FOR UPDATE, FOR NO KEY UPDATE, FOR SHARE, FOR KEY SHARE), LOCK TABLE, or an advisory lock, serializes concurrent writers, answers a race-condition finding, or enforces a cap, limit, or last-one guard under concurrency. Decides when code may lock and what to use instead.
---

# PostgreSQL locking

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Most writes need no lock: a comment, a like, a vote, a follow, a profile edit. Each lock adds
waiting, deadlock risk, and a reason for the next reader to keep it, and one held too long stalls
every writer queued behind it. By default take none: add one only for a reason under "When a
lock is allowed", and record that reason beside it. When more than one mechanism is correct,
pick the simplest. For table design, use `postgres-schema-design`.

## What counts as a lock

`FOR UPDATE`, `FOR NO KEY UPDATE`, `FOR SHARE`, `FOR KEY SHARE`, `LOCK TABLE`, an advisory lock,
and any helper function that wraps one of them. A share lock is a lock: it blocks writers and
two holders that go on to update deadlock. A foreign key already takes the key-share lock it
needs; do not add one beside it.

## Write without a lock

- **Append-only writes never lock**: votes, events, history, anything where the latest row wins.
  When two of them can trigger the same outside effect, derive the effect's id from the
  action and what the request read (action, actor, entity, previous row id), so a retry or a
  concurrent duplicate reuses the id and a different action does not, and dedupe where the effect is delivered, with a
  unique key and `ON CONFLICT DO NOTHING`. Serializing the writers is not the fix.
- **A guard inside the writing statement needs no lock.**
  `UPDATE ... WHERE id = $1 AND EXISTS (<guard>)` reads the guard and the target in one snapshot.
  Do not lock the guarded row first, in a separate statement or in a CTE. A guard on another row
  can still change the moment after; that is best effort, and only the reasons under "When a
  lock is allowed" justify more.
- **A conditional write needs no lock on the row it writes.** `UPDATE ... WHERE state = 'open'`
  and `INSERT ... ON CONFLICT` already decide atomically. Delete the `SELECT ... FOR UPDATE` that
  precedes one, and read the row count to learn who won.
- **A cap or a "don't remove the last X" guard is best effort.** Count up to the cap
  (`LIMIT cap + 1`), then write. Concurrent requests that all count before any of them commits may each land a row over; say so
  and accept it. When asked to make a cap exact, answer with this design. Do not add a lock, a counter or
  projection table, a slot or claim table, a constraint that exists only to make the cap exact, or a `SERIALIZABLE` transaction.
- **An invariant whose violation corrupts data** (a unique name, a balance that cannot go
  negative, one active row per parent) is closed by the narrowest of: a constraint, a conditional
  write, or, for a rare race across rows, a `SERIALIZABLE` transaction whose `40001` is returned
  as 409 with no retry. The guard's read and the write it decides run inside that transaction; a
  read made before it protects nothing. A scheduled job leaves the work to its next run.
- Do not add generation, revision, claim, fence, or counter columns to coordinate concurrent
  writers. Make the write idempotent or use the options above. Two exceptions: an exact quantity,
  and an optimistic version column on an entity people edit by hand, so a lost update returns 409. A lease token on leased work is not a coordination column.
- Do not keep a counter or rollup table current with triggers when that needs global or ordered
  locks to avoid deadlocks. Compute each closed period once, with a scheduled job or a
  materialized view, and read the open period from the source rows.

## When a lock is allowed

Only for these three reasons. Anywhere else, never lock a read set or a parent row to serialize
writers, and never close a race with a wider lock. A cap or a last-one guard fits none of them.

- **User experience**: a busy user action that would otherwise fail often with 409 under a
  guarded write or `SERIALIZABLE`, such as many people reordering one shared list. Lock the
  shared root row so the writers queue for a moment, and make every writer of those rows take the
  same lock. Run the transaction at `READ COMMITTED`: under `SERIALIZABLE` or `REPEATABLE READ`
  the snapshot is taken at the lock statement, so a writer that waited still reads the old rows
  and fails with `40001`.
- **A rare race on a privacy, legal, or irreversible invariant**: an account-deletion fence, a
  legal hold, a delete in an outside store that cannot be undone. Lock the aggregate's root row,
  even when the transaction does not write it: `FOR SHARE` for the side that only needs the row
  to stay put, `FOR NO KEY UPDATE` taken first by a transaction that will also update it.
- **A race the lock-free tools cannot express**: a guarded write (`UPDATE` or `DELETE ... WHERE
  <condition re-checked>`), a unique constraint with `ON CONFLICT`, or `SERIALIZABLE`. The usual
  case is an exact quantity (money, a balance, inventory) whose rule spans rows; for one row,
  `UPDATE stock SET qty = qty - $1 WHERE sku = $2 AND qty >= $1` or a constraint is enough. Then
  lock the rows the transaction writes, or their parent.

An advisory lock is for those cases only when no row exists to lock, or when the critical section
must span transactions or outside I/O; then hold it on a dedicated connection, taken from its own small pool so held locks cannot
starve request queries, and release it in a `finally`. Otherwise avoid advisory locks.

## Record the reason

Beside every lock, including an advisory one, a comment starting `lock-reason:` names the
outcome the lock prevents and the writers it keeps apart. A test forces that interleaving and
fails without the lock (see "Tests"). A lock with no recorded reason, often one copied along with
shared code or a helper, is deleted, or its reason is found and recorded.

```ts
// lock-reason: concurrent drags fail with 409; moveTrack vs moveTrack, addTrack, removeTrack
await tx.query('SELECT 1 FROM playlists WHERE id = $1 FOR NO KEY UPDATE', [playlistId])
```

## Every lock

- It is transaction-scoped and short, except the advisory case above.
- It waits a bounded time: `NOWAIT` or `lock_timeout` in a request path, returning 409; a lock
  for user experience uses `lock_timeout`, since `NOWAIT` returns the 409s it exists to avoid. For
  an advisory lock use `pg_try_advisory_xact_lock` (`pg_try_advisory_lock` for the session-level
  case above) or `lock_timeout`; the blocking form holds a pooled connection while it waits.
- It takes rows in a fixed order, parent before child, so two writers cannot deadlock. While it
  is held, check many rows in one statement, not in a loop of queries.
- It covers no outside call, except the advisory case above, which exists to span one. An
  enqueue is an outside call: commit, then enqueue. A slow queue store inside the transaction
  stretches every lock it holds.
- An advisory key covers exactly the writers that conflict. A key such as `hashtext(org_id)`
  alone is shared by every other lock keyed on the same id; use the two-key form with a namespace
  for the operation.
- `SKIP LOCKED` is only for competing workers that select rows they then write in the same
  transaction. When the queue already runs the job single-flight (an ordering lane, a job id), it
  is not needed. A sweep that deletes or updates the rows it found is not a claim: it locks
  neither its candidates nor its cursor row; see
  [bounded-iteration](../bounded-iteration/SKILL.md).
- Remove a lock by deleting it, not by swapping in another serializer.

## Lock order and deadlocks

Before adding, moving, or removing a lock, read [lock order and deadlocks](references/deadlocks.md):
locks that triggers and foreign keys take, what removing a lock does to other writers, why a
lock-only statement does not refresh a waiting guard, and how wide a `SERIALIZABLE` transaction
may be.

## Adding a lock

Adding a lock is the repository owner's decision.

- A change that adds a lock says in its pull request description which interleaving it
  prevents, and why a constraint, a conditional write, a guard inside the statement, and
  `SERIALIZABLE` with 409 do not fit.
- An agent working unattended does not add one. Where an allowed reason applies, it
  ships the lock-free design, states the worst case, and puts the lock it would propose in the
  description for the owner to decide. Where none applies, such as a cap, there is no lock to
  propose or to offer as an option.
- A reviewer's "race condition" finding, from a person or a bot, never by itself justifies a lock,
  a wider lock, or a coordination column. First [verify
  it](../agent-workflow/SKILL.md#verify-a-finding): name the two writers, trace what each writes,
  and show they can run at the same time. If the race cannot happen, reply with the reason. If you
  cannot tell, reply that it is unverified. Change nothing in either case. Answer only a verified
  race, in this order: a constraint; a conditional write; a guard inside the writing statement;
  `SERIALIZABLE` with 409 when the outcome is unacceptable; otherwise "accepted: best effort", with
  the worst case stated. Reply with that reasoning and resolve the thread.

## Tests

The rules above are for runtime code. A test is free to try to break the locking: it may take a
lock itself, hold a row, or wait until other backends are blocked, to force the interleaving it
wants to check. Do not report that as a locking defect.

Do not assert that a lock was taken, the order locks were taken in, or an exact cap under
concurrency. Those tests force the lock back in when someone removes it. Assert the final state
under the interleaving: no negative balance, no duplicate effect, one winner, or, for a lock
taken for user experience, every writer succeeding. That test fails without the lock, which is
what keeps it. Where a race has more than one valid outcome, accept each of them.
