---
name: postgres-node-performance-tuning
description: Use when writing or reviewing a SQL query or data-access function, adding a query with a new filter or sort, reading a query plan, or fixing a slow query. Write, measure, and improve PostgreSQL queries in Node.js services - query shape, indexes, EXPLAIN plans, round trips, transactions, and pooling.
---

# PostgreSQL and Node.js performance

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These rules are for queries that run in production. A query in a test or a fixture, or in a
seed for a disposable database, needs no index, plan, or operation-name comment, and a test may
run its own `BEGIN` and `ROLLBACK` or hold a second client to stage a race. The pool budget
still counts test workers.

Measure the query plan and the workload shape before changing code.

Use the simplest query. Start with filters in `WHERE`, keyed `EXISTS`, joins or
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
- Write that comment as a literal in each statement. A shared query helper that takes the name
  as an argument (`/* ${label} */`) takes the names out of the SQL, so a search for a name from
  the slow-query log, or a static check keyed on it, no longer finds the statement. To remove
  duplication, share the column list or a fragment and keep one literal statement per operation.
- Run transactions through one helper that owns `BEGIN`, `COMMIT`, `ROLLBACK`, and client release.
  Hand-written transaction statements leak a connection on the path that forgot one. A function
  handed a client already inside a transaction joins it and never commits or rolls back; only the
  scope that opened the transaction owns that.
- An `INSERT` on a path that can be retried (a job, a webhook, a client retry) is idempotent with
  `ON CONFLICT`. A hot get-or-create on a table with an identity or sequence default reads first and
  inserts only on a miss: the default is evaluated before the conflict check, so every conflicting
  insert burns a sequence value.
- Bound each result set, and cap the rows each run reads, as in
  [bounded iteration](../bounded-iteration/SKILL.md), which owns LIMITs and streams. Pagination
  is in [list reads](../list-reads/SKILL.md).
- Batch writes inside an explicit transaction limit.
- Keep connection-pool usage bounded. Pool maxima are ceilings, so the worst case is their sum per
  process times every process and test worker, and it must fit the server's `max_connections`.
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
