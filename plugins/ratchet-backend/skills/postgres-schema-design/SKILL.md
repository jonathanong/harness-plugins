---
name: postgres-schema-design
description: Use when writing or reviewing a migration, a table, column, foreign key, or trigger, or before adding a table, trigger, counter, lease, cursor, or history table. Designs PostgreSQL tables, names, keys, relations, history, retention, and work-item and cursor tables, and picks the simplest design that is correct.
---

# PostgreSQL schema design

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

## The simplest design first

Every table, trigger, lock, counter, and lease is something the next change has to keep correct.
Before adding one, take the first rung that is correct, and name in the change the simpler rung
you rejected and why:

1. a column on the row that already exists
2. a constraint or a conditional write (a `WHERE` guard, `ON CONFLICT`)
3. a capped count at read time (`LIMIT cap + 1`)
4. a queue job keyed by the row id, plus a bounded sweep
5. a new table with a named reader

- An agent working unattended ships the simplest rung that is correct and proposes the next one in
  the pull request description. It does not add the machinery itself; the owner decides.
- A finding from an automated reviewer is not a reason to climb a rung. Verify it first
  (`ratchet-workflows:change-review`), then answer it on the rung the design is already on.
- Rules that ask for a reason do not stop the total from growing, since each addition arrives
  with a plausible one. To hold it, count the shapes in
  [shapes to count](references/shapes-to-count.md) against a baseline.

## Tables, triggers, and history

- **A trigger rejects a row or fills a column of its own row. It does not write another table.**
  Counters, projections, and "latest" pointers kept by triggers add tables, hidden locks, and
  values that drift from their source.
- **A trigger that only compares one parent column** with a literal or with a column of the child
  is a composite foreign key plus a `CHECK`; see [relations](references/relations.md).
- **A number has one owner.** Readers take it from a counter that is already maintained or from a
  capped live count, never from both: the two disagree, and nothing says which is right.
- **History needs a named reader.** A history, attempt, or result table says in its comment who
  reads it: a screen, an export, a legal duty. A table that is only written is deleted. The live
  row holds its current state; it has no `latest_*_id` pointer to its history, and current state
  is never read from the newest history row.
- **Before adding a cursor, lease, attempt, or identity table,** name the existing table of that
  shape and say why it cannot hold the row. Near-identical copies of these multiply unnoticed.
- **A lease or outbox table states its reason in its table comment:** values that vanish at
  commit, an outcome that commits with domain rows, or a legal record. The default is rung 4; see
  [table shapes](references/table-shapes.md#work-leases).
- **A generation or fence counter column** has the interleaving it prevents written in its
  comment. Without one, nobody can tell later whether it is still needed.
- **One creator per object.** A function or an index is created by one migration. A second
  `CREATE OR REPLACE` or `CREATE INDEX IF NOT EXISTS` for it elsewhere makes the definition in
  force depend on which ran last; a migration that changes it says what it replaces.
- **A table partitioned with only a `DEFAULT` partition is not partitioned.** Record the evidence
  for partitioning and who owns retention, or keep an ordinary table.
- **A table, column, or enum value that no code reads is deleted.** A column that a `CHECK` or a
  foreign key uses is read on every write and stays.

## Names, columns, and keys

- Names explain the stored thing; read [naming](references/naming.md) when naming schema objects.
- Columns say their type and FK target; finite sets use enums or lookup tables.
- Joined identities use foreign keys; read [relations](references/relations.md) before modeling references.
- Split differing shapes, share identical values, and keep history documents as JSON.
- Use canonical [table shapes](references/table-shapes.md) for revisions, changes, work, and cursors.
- Default to finite retention for everything except user content; see [table shapes](references/table-shapes.md#retention).
- Prefer a lifecycle timestamp (`archived_at`) to a boolean or a status column: it says when, and
  null says not yet. A final result lives on the row that owns it, not on a row that merely
  refers to it.
- Reuse parameterized trigger functions instead of copying bodies.
- A seed or generator that replays on every bootstrap converges: `ON CONFLICT DO UPDATE` assigns
  constants, never `col = col + 1` or a volatile value.
- Comment every table, column, and view; document reviewed exceptions explicitly.
- Name every constraint, the primary key included, and state `ON DELETE` on every foreign key.
  Index the referencing column. `NOT NULL` is written inline and needs no name. A generated name is not in the migration's text, so a later
  migration that drops or alters the constraint has to guess it. See
  [naming](references/naming.md).
- Keys are generated ids. A natural text key stays a unique column on its owning table; other
  tables reference the id. See [relations](references/relations.md).

For row locks, advisory locks, and caps, use [postgres-locking](../postgres-locking/SKILL.md).
For query shape, read [performance patterns](../postgres-node-performance-tuning/references/performance-patterns.md).
For partition lifecycle, use [UUIDv7 partitioning](../postgres-partitioning-uuid-v7/SKILL.md).
For how jobs choose, cap, and resume over work-item and cursor tables, read
[bounded iteration](../bounded-iteration/SKILL.md).
A consuming repository owns lifecycle, retention windows, migration strategy, and enforcement
configuration.
