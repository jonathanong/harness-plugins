---
name: postgres-schema-design
description: Design PostgreSQL tables, names, relations, history, work-item and cursor tables, retention, and row locking. Use when writing or reviewing a migration, a new table or column, a foreign key, a transaction that takes a lock, or a request to make a cap or limit exact.
---

# PostgreSQL schema design

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

- Names explain the stored thing; read [naming](references/naming.md) when naming schema objects.
- Columns say their type and FK target; finite sets use enums or lookup tables.
- Joined identities use foreign keys; read [relations](references/relations.md) before modeling references.
- Split differing shapes, share identical values, and keep history documents as JSON.
- Use canonical [table shapes](references/table-shapes.md) for revisions, changes, work, and cursors.
- Default to finite retention for everything except user content; see [table shapes](references/table-shapes.md#retention).
- Take no unnecessary locks; read [Locks](#locks) before adding `FOR UPDATE`, a counter, or a claim.
- Reuse parameterized trigger functions instead of copying bodies.
- Comment every table, column, and view; document reviewed exceptions explicitly.
- Name every constraint and state `ON DELETE` on every foreign key. Index the referencing column.
- Keys are generated ids. A natural text key stays a unique column on its owning table; other
  tables reference the id. See [relations](references/relations.md).

## Locks

Most locks guard nothing. Each one adds waiting, deadlock risk, and a reason for the next reader to
keep it. Start with none and add one only for the case below.

- Lock rows (`FOR UPDATE`) only when a concurrent write would corrupt the rows this transaction
  itself writes. Never lock a read set or a parent row to serialize writers, and never use advisory
  locks.
- A cap or a "don't remove the last X" guard is best effort. Count up to the cap
  (`LIMIT cap + 1`), then write. Two concurrent requests may land one row over; say so and accept
  it. When asked to make a cap exact, answer with this design. Do not add a lock, a counter or
  projection table, a slot or claim table, or a constraint that exists only to make the cap exact.
- An invariant whose violation corrupts data (a unique name, a balance that cannot go negative,
  one active row per parent) is closed by the narrowest of: a constraint, a conditional write
  (`UPDATE ... WHERE <condition>`, `INSERT ... ON CONFLICT`), or, for a rare race across rows, a
  `SERIALIZABLE` transaction whose `40001` is returned as 409 with no retry. A scheduled job leaves
  the work to its next run. Never close a race with a wider lock.
- Do not add generation, revision, claim, or counter columns to coordinate concurrent writers. Make
  the write idempotent or use the options above. A lease token on leased work is not a
  coordination column.
- A lock that is justified waits a bounded time in a request path: `NOWAIT` or `lock_timeout`,
  returning 409.
- Remove a lock by deleting it, not by swapping in another serializer.

For query shape, read [performance patterns](../postgres-node-performance-tuning/references/performance-patterns.md).
For partition lifecycle, use [UUIDv7 partitioning](../postgres-partitioning-uuid-v7/SKILL.md).
For how jobs choose, cap, and resume over work-item and cursor tables, read
[bounded iteration](../bounded-iteration/SKILL.md).
A consuming repository owns lifecycle, retention windows, migration strategy, and enforcement
configuration.
