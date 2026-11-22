# Lock order, deadlocks, and what a lock does not do

Read this before adding, moving, or removing a lock, when a change produces `40P01` (deadlock
detected) or `40001`, and when a guard has to see what another transaction just committed.

## Find the real lock order

- **Triggers take locks the calling code does not show.** Before reordering or removing a lock,
  read the triggers on every table the transaction writes. A trigger that locks or updates a
  parent row sets the order the database sees, whatever the application code says.
- **Foreign-key checks lock the parent.** Inserting or updating a child takes `FOR KEY SHARE` on
  the parent row. That is compatible with `FOR NO KEY UPDATE` and blocked by `FOR UPDATE`, by a
  delete, and by an update that changes a key. A plain child insert joins a deadlock cycle with a
  parent writer this way. Take `FOR NO KEY UPDATE` on a parent unless the transaction changes its
  key or deletes it.
- **Root row first.** When a parent and its children are both written, every writer takes the
  parent before the children.

## Removing or moving a lock

A lock orders every other writer of the same rows, not only the transaction it sits in.

- List each transaction that touches those rows and the order it takes them in, before and after
  the change. Include the locks triggers and foreign keys take.
- A lock that looks redundant may be redundant only while another, stronger lock exists. Removing
  the stronger one later makes the first one load-bearing, and removing both reorders two writers.
- For competing workers, a `SKIP LOCKED` claim and a later guarded write do different jobs. The
  claim keeps two workers off the same rows; the guard keeps a stale worker from writing. Removing
  the claim lets two workers do the same batch.

## A lock-only statement does not refresh a waiter's guard

Under `READ COMMITTED`, a statement that waits for a row lock re-checks its `WHERE` only when the
holder changed that row. When the holder only locked it (`FOR SHARE`, `FOR NO KEY UPDATE`, or
`FOR UPDATE` with no update), the waiter goes on with the row and the snapshot it started with.
Subqueries in its `WHERE` are never re-run against newer data.

So a guard such as `DELETE ... WHERE id = $1 AND NOT EXISTS (<hold>)` can wait behind the
transaction that inserts the hold, and still delete. Where an allowed lock protects such an
invariant:

- take the lock in one statement, and read or guard in a later statement, which gets a fresh
  snapshot; or
- have the other side update the locked row, so the waiter re-checks.

This applies only where a lock is allowed at all. A guard on a best-effort rule stays inside the
writing statement with no lock.

## Keep a `SERIALIZABLE` transaction narrow

`SERIALIZABLE` tracks what a transaction read. An index scan tracks the rows and pages it
touched; a sequential scan tracks the whole table, and so do the checks behind a foreign-key
cascade over tables it scans. A wide transaction then fails with `40001` against writers that
have nothing to do with it.

- Keep it to a few index-served reads and the write they decide.
- Do not wrap a delete that cascades across many tables in `SERIALIZABLE`. Larger tables and
  better statistics do not narrow it. Use a lock on the root row for that case, where one is
  allowed.

## Tests

To prove an ordering, force the interleaving with a helper that holds one transaction at a known
point, then assert the final state. Do not assert that a statement waited on a lock.
