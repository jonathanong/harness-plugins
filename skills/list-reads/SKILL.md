---
name: list-reads
description: Use whenever a task writes or reviews a query, function, or endpoint that returns a list - a feed, timeline, inbox, search results, or any paginated read - including a review of a feed or list query before merge, and its cursors and page size. Covers keyset pagination, one walk over the listed entity with filters in the query, bounding rows scanned, ranked lists, and how a page signals the end.
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
8. **Only the flag ends the list.** A page a client fetches carries an explicit `has_next_page`
   and a cursor, and nothing else says the list is over. A short or empty page with the flag
   true is valid, so set the flag from whether the read can continue, not from the rows returned:
   it is true when an inspected-row cap stopped the read, even with no rows to return. The
   `page+1` row only answers it when the read ran to its `LIMIT`.
9. **Bound a run of empty pages on the server.** A client keeps asking while the flag is true and
   has no cap of its own. The time window of rule 3 is the bound: at its edge the flag is false.
   Where the sort has no time window, the end of the index is the bound, so the filter must not
   reject long runs there: move it into the index or the stored set. Do not count empty pages in
   the cursor.
10. **A client never infers the end from the rows.** Not from `items.length === 0`, and not from
    `items.length < limit`. It requests the next page while the flag is true and a cursor came
    back. It shows the empty state only when it holds no items and no further page can be
    requested; an empty list with more pages still offers a way to load more. Otherwise a capped
    read that returns an empty first page shows "nothing here" and hides every older item.

Rules 8 to 10 are the contract for a page that crosses an API boundary. A sweep that reads its own
table may still end on a short batch, as in [bounded-iteration](../bounded-iteration/SKILL.md).

Names in parentheses are generic `jonathanong/no-mistakes` rules; check that the installed release
has one before relying on it.
