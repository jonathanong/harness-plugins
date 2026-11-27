# Table shapes

Choose a shape by lifecycle and meaning. Do not store hand-synchronized status beside lifecycle
timestamps. A final lifecycle derives enum status with an immutable generated expression over
timestamps such as `claimed_at`, `completed_at`, and `failed_at`. A time-based expiry needs an
explicit sweeper-written timestamp; `now()` cannot appear in an immutable generated expression.
Per-column timestamps fit a flow that is unidirectional or limited, such as start, success, and
fail. When there are a lot of scenarios, such as post statuses, the events belong in a history
table. When state keeps returning to earlier states, record append-only attempts or changes and
derive current state from the latest row rather than erasing the previous lifecycle.

| Concept                    | Shape                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field-diff history         | `<entity>_revisions`: UUIDv7 `id`, entity FK, nullable revision actor FK with `ON DELETE SET NULL`, revision-type enum, `changes jsonb`.                                                                  |
| Typed lifecycle ledger     | `<entity>_changes`: UUIDv7 `id`, entity FK, change-type enum, retained actor identity FK with `ON DELETE RESTRICT`, typed joined payload and JSON for unjoined data. Time comes from `id`.                |
| Current state from a log   | Latest change by `id DESC`, projected through a shared trigger or read through a view.                                                                                                                    |
| Per-entity work            | Default to a queue job id plus a bounded re-enqueue sweep. When justified, `<entity>_<job>_work_items`: entity FK, lease and final-outcome columns, claim index, retention.                               |
| Job progress               | Prefer the position in job data. Use `<job>_cursors` only when it must be transactional with domain rows: finite enum key or checked singleton, keyset positions without FKs, optional sweep upper bound. |
| Inbound or protocol events | Append-only `<source>_events` with `occurred_at` recording the event's business time.                                                                                                                     |

Revisions and changes are append-only through a generic `fn_reject_mutation`, parameterized by
actor columns that may be erased to NULL. Permit only those erasures; parent-cascade deletion
may be permitted by policy. A trigger-depth test alone cannot prove a delete came from a parent
cascade, because another trigger also increases depth. Do not copy the parent into each ledger
row. Keep historical before/after snapshots as JSON rather than joined history child tables.
A system change has a NULL actor. Retained actors remain historical identities, without authority.

## Work leases

Default to a queue job whose job id is the durable row id, enqueued after commit, plus a bounded
sweep that re-enqueues rows with no recorded outcome. The queue already supplies attempts,
backoff, locking, stall recovery and unique ids. A lease or outbox work-item table needs a stated
reason: legal or payment records, old values that vanish at commit, or an outcome that must
commit with domain rows. Making a cap exact is never a reason: no counter, slot, or claim table
for a cap; count up to the cap and write, as in the lock rules in
[locking](../../postgres-locking/SKILL.md).
A queue is ephemeral and the work-item row is the state; see [glide-mq](../../glide-mq/SKILL.md).

When a table is justified, fence with one compare-and-set on the outcome or a generation
(`WHERE completed_at IS NULL` / `AND generation = $n`) instead of a full set of lease columns.
Idempotent database-only work needs no fence. A unique job id stops duplicate enqueues, not
duplicate runs.

When a full lease is needed, the lease lives on a row that exists only for the work. If an invoice outlives a delivery job,
use `invoice_delivery_work_items`, with an invoice FK and `ON DELETE CASCADE`, rather than putting
the lease on the invoice. Do not create a shared polymorphic lease table.

A full lease uses `lease_token uuid`, `leased_at`, `lease_expires_at`, `attempt_count`, `available_at`, and
`completed_at` plus timestamps for final outcomes. Add `generation` only when re-enqueue can race
a running worker. Each claim or reclaim gets a fresh opaque token. Every renewal, completion,
and failure must include `WHERE lease_token = $mine`; zero affected rows means ownership was lost.
Keep retries in an optional `_attempts` ledger with `attempt_number` when their lifecycle must
survive. One-shot compare-and-set claims and human assignments need their own shapes.

## Retention

Give every durable row a finite retention window, except user content. Prefer a compact per-entity
summary over raw event rows when no reader needs the individual events; append-only ledgers still
get a retention window. Delete a cache's older rows when a new version is written.
A bounded post-commit enqueue-loss window is acceptable when the stale result heals itself through
a TTL; no transactional dirty-work table is needed.

## Counts and rankings

A periodic recount of a counter column only hides the write path that lost an update, so adding a
counter needs evidence that nothing simpler works.

- A displayed count is a capped count: count over a `LIMIT cap + 1` subquery and return the number
  with a `capped` flag, so the client shows "1k+".
- A ranking by a count that cannot be capped without changing the order is a materialized view of
  the counts, with a unique index on its key and an index matching the read order. Refresh it on a
  schedule, off the request path, and join live eligibility (deleted, hidden) at read time.
- Any other materialized view has a defining query bounded by an indexed id range or time window,
  so refresh cost follows the window, not the table's history. Read it with one keyset walk.

## Cursors and shared functions

Prefer keeping the position in job data; a cursor table is for a sweep whose position must commit with
its domain rows. A cursor key names the finite thing being swept. A singleton uses
`is_singleton boolean NOT NULL DEFAULT true` with a named primary key on it and a named
`CHECK (is_singleton)`; the job seeds its own row
with `ON CONFLICT DO NOTHING`. `cursor_<thing>_id` and optional `sweep_upper_bound_<thing>_id` are
FK-free UUIDv7 positions; NULL means the start. Per-unit work progress belongs in work items.
A stored cursor is one row for the sweep when each run continues from where the last one stopped,
or one row per run when runs are independent; choose by what the sweep requires. A cursor stored
per run has a retention policy: for example, partition the table to drop old cursors, or delete a
run's cursor when that run is complete. A single row for the sweep does not accumulate.
A UUIDv7 is assigned at insert, not commit: jobs that must see every committed row re-scan an
overlap rather than assuming an id high-water mark proves commit order.

A UUIDv7 key already records when the row was created. Do not add `created_at DEFAULT now()`
beside it: that is a second source for one fact, free to drift, and an index on it duplicates the
order `id` gives. Order and paginate by `id`. When a reader needs the timestamp, expose `created_at`
as a generated column over `uuid_extract_timestamp(id)`.

Use `updated_at` only for mutable rows, always maintained by its trigger; application code never
writes it. Comment every table, column, and view, including generated objects. Self-explanatory
columns may have explicit reviewed local exceptions; view comments describe their reader boundary.
Reuse generic trigger functions with `TG_ARGV` and `TG_TABLE_NAME`; quote dynamic identifiers
with `format('%I', ...)`. A trigger function and a SQL-callable helper are separate functions.

Generic enforcement in `jongleberry/no-mistakes`: `postgres-table-shape` and
`postgres-duplicate-function-body`. Configure canonical shapes explicitly and verify which
rules the installed release supports; lifecycle and authority decisions still need review.
