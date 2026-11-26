# Performance patterns

Use pools and release checked-out clients in `finally`, especially for cursors, streams, and COPY.
Route ordinary reads to a replica when its lag is acceptable; route read-after-write, locking, and
transaction-consistent reads to the writer. Do not hold a client across unrelated application work.
Avoid advisory locks (see [locks](../../postgres-locking/SKILL.md)), and never hold a
transaction, a connection, or an advisory lock across an external call, including an enqueue
(commit, then enqueue); take
a token lease in a shared store instead, with a TTL, renewal, and compare-and-delete release. Stop work when
renewal fails, and guard any write a stale owner could make with the token.

For large reads, use keyset pagination, cursors, or streams with cancellation and bounded batches.
For writes, prefer set-based batches such as UNNEST or COPY when they preserve validation and error
handling. Do large list diffs and dedupes in the worker as a streaming comparison of sorted
inputs, not as writer-side set operations. Recompute a large tally over an append-only table in a background job that reads a replica, not in
a request or on the primary. Write the result back only when it is fresher than what is stored (a
marker taken from the same snapshot), so a job that finishes late cannot roll back a newer tally.
Accept the lag; a path that needs a fresh count reads the primary. Measure query plans with
representative cardinality before changing an index or query. Adding an index for a measured plan is a default: do not ask
first and do not make it a spec stop condition.

Check query predicates, joins, ordering, and selected columns against index shape. Use EXPLAIN
evidence to confirm planner behavior. Add extended statistics only when observed estimates show a
correlation problem; verify the statistics are collected and used. Partitioning can reduce scanned
data, but it does not replace suitable local indexes or predicates that permit pruning.

## Query shapes

### Simplest query first

A ranked list is a `JOIN` and an `ORDER BY`. A ranked sort joins the
entity to its stored score and orders by it. Filters go in `WHERE`; membership is a keyed `EXISTS`,
join, or subquery; then `ORDER BY` and `LIMIT`.

These need `EXPLAIN ANALYZE` plans, at representative cardinality, showing they beat the simple
query for the same result, not merely the previous version on the base branch: `MATERIALIZED` or
capped candidate CTEs, `UNION`, `GROUP BY` or `DISTINCT` dedupe, `LATERAL` joins and planner
fences, cohort or window ranking, and multi-stage cap-filter-rank pipelines. Never build a
candidate pool. A `MATERIALIZED` CTE whose only job is to pin or lock a row (`SELECT ... FOR UPDATE`
or `FOR SHARE` ahead of the write) is never justified by a plan; put the guard in the writing
statement, or take the lock plainly where [locking](../../postgres-locking/SKILL.md) allows one. A walk that stops at an inspected-row cap and returns a short or empty page with a
continuation cursor is fine.

Test existence with `EXISTS`, not `COUNT(*) > 0`. Use correlated `NOT EXISTS` rather than
`NOT IN (SELECT ...)`, whose NULL behavior can silently exclude expected rows. Filter and order
UUIDv7 rows by `id`, not generated `created_at`, so the key's index supports the query.
Read and return tables with explicit columns: no `SELECT *`, `alias.*`, or `RETURNING *`.
A view may use `*` when its reviewed column list is the reader contract.

Use keyset pagination, never `OFFSET`. An optimizer fence is a `MATERIALIZED` CTE, not
`OFFSET 0`. The fence keeps the outer query's filters and ordering away from the CTE's indexes.
The outer query still reads CTE rows on demand and can stop at its `LIMIT`, but when its filters
reject most CTE rows, or it sorts, aggregates or hash-joins them, it reads every row up to the CTE's own
`LIMIT`. Use a `MATERIALIZED` CTE only when it holds the final `LIMIT`, or for a small
viewer-scoped set, and only with plans showing it beats the plain query. Never use it as a
candidate pool before the page `LIMIT`. Constrain a partitioned table's partition key, or document the reason for a
cross-partition query. Choose the partition key from dominant access patterns; a hot reader
of `RANGE (id)` needs an id or time bound.

For a `RANGE (id)` child read by parent id, a shared lower-bound helper equivalent to
`id >= min_uuidv7(uuid_extract_timestamp(parent_id) - interval '1 hour')` prunes earlier
partitions; the overlap allows clock skew. It is safe only when every writer sets the parent at
insert to an existing parent, never re-points it to a newer parent, and nothing mints child ids
from a historical time; see
[parent lower bound](../../postgres-partitioning-uuid-v7/references/partition-lifecycle.md#parent-lower-bound).
Rate limits query an actor-keyed table rather than
recipient-keyed fan-out rows. Verify actual pruning with EXPLAIN.

Generic `jonathanong/no-mistakes` checks include `postgres-no-offset`; inspect available rules
and configure reviewed cross-partition exceptions rather than treating a rule as plan evidence.

## Volatile functions in predicates

`uuidv7(interval)` and `random()` are volatile: PostgreSQL evaluates them for every row, so
`WHERE id >= uuidv7(INTERVAL '-30 days')` is a `Filter`, cannot be an `Index Cond`, and blocks
partition pruning. Compute the bound once per statement and compare against that. A bind
parameter works, as does a stable expression such as `now() - INTERVAL '30 days'` fed to a stable
or immutable bound helper. A stable bound can be an index condition, and a partitioned table
prunes at executor start. Confirm `Index Cond` and `Subplans Removed` in the plan.

```sql
-- evaluated per row
SELECT id FROM events WHERE id >= uuidv7(INTERVAL '-30 days');
-- bound computed once by the caller
SELECT id FROM events WHERE id >= $1;
```

## Function inlining

PostgreSQL inlines a simple scalar SQL function into the calling query, so its body is planned
with the outer query and its predicates can become index conditions. A SQL function whose body
contains a subquery (for example `EXISTS`) is never inlined as a scalar call; a set-returning SQL
function in `FROM` follows a separate inlining path. Functions with `SECURITY DEFINER` or
a `SET` clause, and PL/pgSQL functions, are not inlined either, nor is a body that is not a single
simple expression. When the function is not inlined, the plan shows only `fn_x(col)` in a `Filter`
or output, and none of the queries it runs per row.

```sql
-- not inlined: the EXISTS runs once per orders row
CREATE FUNCTION fn_has_events(order_id uuid) RETURNS boolean
LANGUAGE sql STABLE AS $$ SELECT EXISTS (SELECT 1 FROM events e WHERE e.order_id = $1) $$;
SELECT id FROM orders WHERE fn_has_events(id);
-- plannable: write the semi-join in the query
SELECT o.id FROM orders o WHERE EXISTS (SELECT 1 FROM events e WHERE e.order_id = o.id);
```

Tell from the plan: a function name in `Filter` or output with no matching scan nodes. Count calls
with `SET LOCAL track_functions = 'all'` and `pg_stat_xact_user_functions` in the same transaction;
inlined functions are not counted. See [reading plans](reading-plans.md#opaque-function-calls).
Put per-row logic in the query as a join or `EXISTS`, or keep the function a plain expression.

## Views and entity reads

A plain view is for embedding a whole object. Join or subquery it only to project its entire row as
one JSON value:

```sql
SELECT n.id, to_jsonb(t) AS thing FROM notes n JOIN things_embedded t ON t.id = n.thing_id ...
SELECT n.id, (SELECT to_jsonb(t) FROM things_embedded t WHERE t.id = n.thing_id) AS thing ...
```

Embed a view only when the caller uses the whole object; when it needs a few fields, join the
base table. Reading individual columns from a view (`t.name`), or joining one only to filter or
sort, is a defect. The view computes every column for each row it touches, and the query depends on a shape
built for another reader. Read the base table instead. A materialized view is stored like a
table, so reading, filtering, and sorting its columns is fine.

```sql
-- Wrong: the view is joined only to drop notes whose author is deleted
SELECT n.id, n.body FROM notes n JOIN users_public up ON up.id = n.author_id ...
-- Right: test the base table with the predicate the view applied
SELECT n.id, n.body FROM notes n
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = n.author_id AND u.deleted_at IS NULL) ...
```

Look up each entity once per statement. A second join or scalar subquery for another field of the same row repeats the lookup for every
row of the result. Through a view it repeats the view's own joins and subqueries too: two
correlated subqueries into two user views on a 101-row page can make several hundred index
probes where one join makes about one read per author.

```sql
-- Wrong: two lookups of one author, each reading a column through a view
SELECT n.id,
  (SELECT username FROM users_embedded WHERE id = n.author_id) AS author_username,
  (SELECT display_name FROM users_public WHERE id = n.author_id) AS author_display_name
FROM notes n ...

-- Right: one join to the base table, its predicate, and the derived field from a helper
SELECT n.id, author.username AS author_username,
  ${verifiedDisplayName('author')} AS author_display_name
FROM notes n
LEFT JOIN users author ON author.id = n.author_id AND author.deleted_at IS NULL ...
```

Copy the predicates the view applies, such as `deleted_at IS NULL`, into the join. When the field is derived, such as a display name shown only once the user is verified, put its
expression in one code helper that takes the row's alias and returns the SQL fragment:

```ts
const verifiedDisplayName = (alias: string) =>
  sql`CASE WHEN ${alias}.verified_at IS NOT NULL THEN ${alias}.display_name END`
```

Every query that needs the field calls the helper, so a change to the rule changes them all. A
copy of the expression in each query drifts; a database function hides the expression from the
planner and needs a migration to change; a view column brings back the view. Where views are
built in code, build them from the same helpers.

## Reading views by key

PostgreSQL expands a view into the calling query, and a simple view lets the outer filter push
down into its base tables. A view that cannot be flattened (aggregation, `DISTINCT`, `LIMIT`,
set operations, window functions, volatile target-list expressions, a security barrier) is built
before a filter on a value it derives (such as an aggregate) applies, and before a sort, page, or
count over its output. A restriction on a grouping column can still be pushed below an aggregate,
so let the plan decide. Confirm from the
plan (large `Actual Rows` and `Actual Loops` inside the view's nodes), then choose the ids from the
base tables first and embed the view's row by its key, as a correlated `LATERAL` lookup so the page
restriction can reach inside the view. Reach for this only after the plan shows the simple
query builds the whole view, and keep it only if its plan beats the simple query. This works for an aggregate or `GROUP BY` view whose key is
a grouping column; a `LIMIT` in the view blocks pushdown of any qual, so rewrite that view's query
against the base tables instead. A plain join to the page is a join clause, not a restriction
inside the view, so the planner can still build the whole aggregate first.

```sql
-- order_summaries aggregates events, so event_count is built for every order, then filtered
SELECT * FROM order_summaries WHERE event_count > 3 ORDER BY id LIMIT 50;
-- choose ids from base tables with an equivalent predicate, then read the view by key
WITH page AS (
  SELECT o.id FROM orders o
  WHERE (SELECT count(*) FROM events e WHERE e.order_id = o.id) > 3
  ORDER BY o.id LIMIT 50
)
SELECT page.id, to_jsonb(s) AS summary
FROM page
CROSS JOIN LATERAL (
  SELECT * FROM order_summaries WHERE id = page.id
) s
ORDER BY page.id;
```

Filter and sort on indexed base-table columns, and read the view only to embed its whole row.
Confirm in the plan that the view's inner nodes run with `Actual Loops` equal to the page size and
read only that page's rows.

## Round trips

Sequential queries can add network round trips when the client waits between statements, and planning
can add latency when PostgreSQL does not reuse a prepared plan; count round trips per request before
tuning individual statements.

Load a parent and the viewer's relation to it in one query: join the membership row, or use a
lateral subquery, rather than reading the parent and then the relation.

`Promise.all` over statements on one transaction client is still serial, because one connection
runs one statement at a time. Merge them instead: CTEs, `UNNEST`, or one multi-row statement.

Write the batch implementation first, as in
[batch first](../../typescript-authoring/SKILL.md#batch-first-single-item-second): it takes an array
of keys and returns a keyed map, with no parallel per-item SQL path, for lookups and mutations
alike. The batch must give a one-item array the
same atomicity, partial-failure, ordering, duplicate-key, and result-shape semantics as the single
call; if it doesn't, fix the batch rather than keep a per-item path. Call the batch from loops, `.map`
callbacks, and `Promise.all` fan-outs. `no-await-in-loop` misses a helper that queries internally
and `Promise.all(items.map(helper))`; review those call sites by hand.

Overlap independent cache and PostgreSQL reads with `Promise.all`, such as a rate-limiter check
alongside the user fetch. Serialize only true dependencies, where one result feeds the next call. Suppress the
sequential-await lint only when each step consumes the previous step's result; a shared
transaction client or lock ordering is not a data dependency. A lock that must be taken first
stays a separate, earlier statement; never reorder or parallelize it. Do not keep a lock only
because it exists: one that fails the lock rule in
[schema design](../../postgres-schema-design/SKILL.md) is deleted. Audit every added suppression.

Correctness comes before round trips. Before folding a statement away, state the guarantee it
gave (what it locked, which snapshot it read) and reject the fold if that weakens. An `EXISTS`
inside a `FOR UPDATE` statement reads a snapshot taken before the lock wait, so it can be stale.

Run a symmetric check, such as "is either party blocking the other", as one query with an `OR`
or both-direction predicate, not twice with the arguments swapped.
