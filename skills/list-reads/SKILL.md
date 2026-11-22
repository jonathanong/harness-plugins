---
name: list-reads
description: Use when writing or reviewing a list endpoint, feed, timeline, inbox, search results, or any paginated query, including cursors and page size. Covers keyset pagination, one walk over the listed entity with filters in the query, bounding rows scanned, and ranked lists.
---

# List reads

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

For sweeps, exports, and scheduled jobs, use [bounded-iteration](../bounded-iteration/SKILL.md). A
ranking over every row is its global-ranking rule, not a list read.

1. **Keyset pagination.** No `OFFSET`. Clamp the client's page size on the server. The API schema
   keeps a static ceiling; the default and the effective maximum are runtime-tunable but never
   above it. (`postgres-no-offset`)
2. **A list read is one walk over the entity being listed.** Filters go in `WHERE`, served by an
   index. Order with `ORDER BY key DESC, id DESC` and `LIMIT page+1`, and continue with a plain
   keyset cursor, `(key, id) < ($1, $2)`.
3. **Bound the scan, not only the page.** The page `LIMIT` plus a time window or the keyset bound
   the read. A keyset alone does not bound rows scanned. When a filter can reject long runs, such
   as a viewer's blocks or mutes, the time window is the scan bound where the sort has one, and
   EXPLAIN at representative cardinality compares rows read with rows returned.
4. **The simplest query comes first**, per
   [performance tuning](../postgres-node-performance-tuning/SKILL.md). For a ranked list that is a
   join and `ORDER BY` on the stored score.
5. **No candidate pools.** No capped or `MATERIALIZED` CTE over the listed entity that is filtered
   or limited afterward, no window loops or resume probes, no proof state in the cursor, and no
   runtime-config fields that exist only to cap a read. A single walk with an inspected-row cap is
   fine, and may return a short or empty page with a continuation cursor and `has_next_page` true.
   See [`MATERIALIZED` CTEs](../postgres-node-performance-tuning/references/performance-patterns.md).
6. **Small viewer-scoped sets** (the viewer's follows, mutes, blocks and memberships) may be
   subqueries or semi-joins, because write limits bound them.
7. **Measure against the plain single walk**, not only against the base branch, for a list-read
   change.

Names in parentheses are generic `jonathanong/no-mistakes` rules; check that the installed release
has one before relying on it.
