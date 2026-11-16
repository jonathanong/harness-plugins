---
name: postgres-partitioning-uuid-v7
description: Design PostgreSQL partitioning and partition pruning around UUIDv7 keys. Use when writing or reviewing a partitioned table, a retention or partition migration, a query against a partitioned table, or a decision on whether to partition.
---

# PostgreSQL partitioning with UUIDv7

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

For schema names, references, and canonical table shapes, read
[postgres-schema-design](../postgres-schema-design/SKILL.md).

Partition only after lifecycle, retention, and query predicates show that it helps.

- For age-based retention of time-ordered rows, use UUIDv7 `RANGE` partitions and drop whole
  partitions. Use a bounded `DELETE` sweep only when rows inside an old range must survive, such
  as rows referenced by `RESTRICT` foreign keys, latest-per-parent pointers, or legal holds. State
  that reason in the table `COMMENT`.
- Treat a UUIDv7 as time ordered. Where the meaning matters, keep an explicit business timestamp.
- Partition time-ordered data by `RANGE` on the UUIDv7 id, with a default partition. `HASH`
  spreads every time window across all partitions, so nothing prunes and nothing can be dropped.
- Prune with id bounds generated from time (`id >= min_uuidv7($time)`). Extracting a timestamp
  from the id in a predicate hides the key from the planner.
- Align the partition key, primary key, indexes, constraints, and query predicates so partition
  pruning is observable.
- Add a parent lower bound to a read of a `RANGE (id)` child table by its parent's UUIDv7 id
  (`id >= min_uuidv7(parent time - skew)`) only when both hold: every writer sets the parent column
  at insert, to a parent that already exists, and never re-points it to a newer parent; and nothing
  mints child ids from a historical time (imports, backfills, seeds). Counterexample: articles
  clustered into a story created later are older than their parent, and the bound silently drops
  them. See [parent lower bound](references/partition-lifecycle.md#parent-lower-bound).
- A statement that must read every partition declares that, with a reason, on the statement. Do not
  use a table-wide exemption: it also silences every future query on that table. See
  [cross-partition reads](references/partition-lifecycle.md#declaring-cross-partition-reads).
- Plan creation, retention, migration, and verification as one deployable lifecycle. Include
  rollback and independent-reader compatibility.
- Read [partition lifecycle](references/partition-lifecycle.md) before a schema or retention
  migration.

A consuming repository owns partition intervals, migration tooling, retention policy, and deploy
sequencing.
