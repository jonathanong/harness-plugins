---
name: postgres-node-performance-tuning
description: Write, measure, and improve PostgreSQL queries in Node.js services - query shape, indexes, EXPLAIN plans, round trips, transactions, and pooling. Use when writing or reviewing a SQL query or data-access function, adding a query with a new filter or sort, reading a query plan, or fixing a slow query.
---

# PostgreSQL and Node.js performance

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Measure the query plan and the workload shape before changing code.

Use the simplest query; making it more complex requires `EXPLAIN ANALYZE` plans. Start with filters in `WHERE`, keyed `EXISTS`, joins or
subqueries, `ORDER BY`, and `LIMIT`. A complex shape stays only with `EXPLAIN ANALYZE` plans showing
it beats that simple query, not merely the previous version; see
[simplest query first](references/performance-patterns.md#simplest-query-first).

- Select only the required columns: no `SELECT *`, `alias.*`, or `RETURNING *`. A new column then
  cannot change a result shape or widen a row by accident.
- A new query shape (a new filter, join key, or sort) gets its index in the same change. Check
  the plan at representative cardinality, add the index it needs, and do not wait to be asked. An
  unindexed shape works in tests and fails at production row counts.
- An index change rechecks the plan of every query that depends on that index's predicate, join,
  ordering, or selected columns, not only the query being fixed. A changed or dropped index can
  turn a neighbor's plan into a scan. Find those queries by searching the query builders
  separately from where queries execute, and include callers that reach a builder through helper
  functions; a search of call sites alone misses a query assembled elsewhere.
- Start every statement with an operation-name comment, such as `/* invoices.listByAccount */`, so
  a slow-query log or `pg_stat_activity` row names its call site.
- Run transactions through one helper that owns `BEGIN`, `COMMIT`, `ROLLBACK`, and client release.
  Hand-written transaction statements leak a connection on the path that forgot one.
- An `INSERT` on a path that can be retried (a job, a webhook, a client retry) is idempotent with
  `ON CONFLICT`.
- Bound each result set. Paginate or stream a large read. A stream bounds memory, not work: cap
  the rows per run as in [bounded iteration](../bounded-iteration/SKILL.md).
- Batch writes inside an explicit transaction limit.
- Keep connection-pool usage bounded.
- Validate a query change at representative cardinality. Watch latency, memory, lock time, and
  connection pressure together.
- Cut round trips without weakening correctness: fold dependent reads, batch per-item lookups, and
  overlap independent reads; see
  [round trips](references/performance-patterns.md#round-trips).
- Read the plan for hidden per-row work before trusting a change; see
  [reading plans](references/reading-plans.md).
- Read [performance patterns](references/performance-patterns.md) before changing a high-volume
  path.

A consuming repository owns schema ownership, operational thresholds, pooling configuration, and
rollout.
