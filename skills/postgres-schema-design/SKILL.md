---
name: postgres-schema-design
description: Use when writing or reviewing a migration, a table, column, or foreign key. Designs PostgreSQL tables, names, keys, relations, history, retention, and work-item and cursor tables.
---

# PostgreSQL schema design

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

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
- Name every constraint and state `ON DELETE` on every foreign key. Index the referencing column.
- Keys are generated ids. A natural text key stays a unique column on its owning table; other
  tables reference the id. See [relations](references/relations.md).

For row locks, advisory locks, caps, and counters kept by triggers, use
[postgres-locking](../postgres-locking/SKILL.md).
For query shape, read [performance patterns](../postgres-node-performance-tuning/references/performance-patterns.md).
For partition lifecycle, use [UUIDv7 partitioning](../postgres-partitioning-uuid-v7/SKILL.md).
For how jobs choose, cap, and resume over work-item and cursor tables, read
[bounded iteration](../bounded-iteration/SKILL.md).
A consuming repository owns lifecycle, retention windows, migration strategy, and enforcement
configuration.
