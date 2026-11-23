---
name: bounded-iteration
description: Use when writing or reviewing a sweep, scheduled job, reconciler, cleanup, dispatcher, backfill, or export - any loop that reads rows. Covers bounding the rows each run reads, sweeps that re-select their own writes, and effects that repeat on every run.
---

# Bounded iteration

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These rules are for code that runs against production data, including a one-off backfill. A
test, a fixture, or a seed on a disposable database may read, delete, or loop over every row.

A run's cost is the rows it reads and the work it starts, not the memory it holds. Read
[sweep patterns](references/sweep-patterns.md) for worked SQL and loop shapes. List endpoints,
feeds, and pagination are in [list-reads](../list-reads/SKILL.md).

1. **Choose work, not entities.** Read only rows that need work, through a predicate an index
   serves: a work-item or dirty-marker row, a parent id, a due timestamp with a partial index, or
   a time or UUIDv7 window past a high-water mark. Column-to-column comparisons, `OR` of unrelated
   conditions, and `EXISTS` as the only condition are not filters. (`postgres-required-predicates`)
   A per-row threshold becomes one bucket per distinct value, comparing the stored fact with a
   bound, never with another column; `timestamptz + interval` is not immutable, so it cannot be
   indexed. See [per-row interval](references/sweep-patterns.md#per-row-interval-one-bucket-per-threshold)
   and [age milestones](references/sweep-patterns.md#age-milestones-from-the-uuidv7-key).
2. **Cap every run.** Every loop has a per-run cap (batches, rows, or a deadline), reports whether
   work remains, and resumes from a persisted position. Never loop until empty, and never default
   a cap to infinity.
3. **Bound every statement.** A SELECT, UPDATE, or DELETE that can touch many rows has a `LIMIT`.
   For writes the `LIMIT` goes in a CTE, with `FOR UPDATE SKIP LOCKED` when workers compete.
   (`postgres-lock-ordering`) For list reads, the bound is the page `LIMIT` plus a window or keyset,
   not a separate candidate cap.
4. **A stream is not a bound.** A cursor or stream bounds memory, not work. Cap the rows streamed
   per run.
5. **Resume without restarting.** Keep a keyset position on the UUIDv7 key or a
   `<verb>_through_at` time position, fix the sweep's end when it starts, and rescan an overlap
   when insert order differs from commit order. Prefer the position in job data; a cursor table is
   for a position that must be transactional with domain rows, and follows
   [table shapes](../postgres-schema-design/references/table-shapes.md).
   (`postgres-generated-column-predicates`)
6. **No unbounded fan-out.** Use `Promise.all` only over a bounded result, with bounded
   concurrency.
7. **Tunables are runtime configuration.** Batch sizes, page sizes, caps, and windows come from the
   consumer's runtime configuration with a validated default and a hard maximum, and are bound as
   SQL parameters. `LIMIT 1` and an external API's page maximum are contracts, not tunables.
8. **One dispatcher per signal.** Split an `OR` of unrelated reasons into one dispatcher per
   reason, each with its own index-served predicate, position, and schedule, all enqueuing the same
   idempotent job. Writes that cause a signal enqueue directly; the sweep is the backstop. See
   [one dispatcher per signal](references/sweep-patterns.md#one-dispatcher-per-signal).
9. **Deduplicate jobs by entity and triggering event.** A job id keyed only by the entity drops a
   new trigger while the last job runs or is retained. Key it by entity and event; dedup lasts
   only while the record is retained, and a failed retained job still claims its id. See
   [queue job ids](references/sweep-patterns.md#queue-job-ids-for-deduplication).
10. **Repair through an existing reconciler.** Repeat a fire-and-forget side effect (cache fill,
    filter add, enqueue) idempotently from the reconciler that already sweeps recently changed
    rows. Do not add a sweeper. See
    [repair](references/sweep-patterns.md#repair-through-an-existing-reconciler).
11. **Membership filters are never rebuilt on a schedule.** Add on write, rebuild in full only on
    an operator action or a detected failure, and stop trusting the filter after a failed add.
    Deleted keys and growth only cost false positives. See
    [membership filters](references/sweep-patterns.md#membership-filters).
12. **Global rankings stay one periodic aggregate.** A result over every row needs every score;
    incremental per-row inputs move the cost to every write without freshening the ranking. Give
    the pass an EXPLAIN budget. See [global ranking](references/sweep-patterns.md#global-ranking).
13. **External listings carry the provider's continuation token.** Cap pages per run and enqueue a
    continuation with the token; restarting at page one lets failing front items starve the rest.
    See [external listing](references/sweep-patterns.md#external-listing-with-a-continuation-token).
14. **Each stage is its own job.** A reconciler with several sweeps, stages, or phases enqueues one
    job per stage, with its own name, cursor in job data, cap, retry, and failure. Stages share no
    mutable budget, tally, error list, or cursor map; the queue's lane and concurrency bound the
    total load. Independent stages read committed state and do not chain. Ordered phases enqueue
    the next phase after commit. See
    [separate stage jobs](references/sweep-patterns.md#separate-stage-jobs).
15. **A sweep converges.** It finds its work in database rows, never in a queue's failed jobs
    ([glide-mq](../glide-mq/SKILL.md)). It never writes a row back into its own selection, such as bumping the
    `updated_at` it selects by, unless that write is a lease; otherwise each run creates the next
    run's work and the sweep never ends. A write that takes a row out of the selection, such as
    setting `processed_at` on rows selected by `processed_at IS NULL`, is the point. A recovery
    sweep with a fixed staleness cutoff may touch the rows it enqueues, because the touch makes
    them ineligible until they stall again. Replay only idempotent "ensure" effects: an on-create
    effect, such as a notification or a charge, repeats on every run. Test it: once no eligible
    rows remain, another run writes nothing and creates no new job (a repeated idempotent enqueue
    is not new work). Recurring work that is unconditional by design, such as a scheduled
    materialized-view refresh, is exempt.
16. **Verify with a plan.** EXPLAIN at representative cardinality shows no Seq Scan on an
    unbounded table, and an index that supplies the `ORDER BY`, so the scan stops at the
    `LIMIT` instead of reading and sorting every match. Compare rows read with rows returned.

For work-item, lease, and cursor tables, read [postgres-schema-design](../postgres-schema-design/SKILL.md).
For query shape and streaming, read [performance patterns](../postgres-node-performance-tuning/references/performance-patterns.md).
For UUIDv7 windows and pruning, use [UUIDv7 partitioning](../postgres-partitioning-uuid-v7/SKILL.md).
Names in parentheses are generic `jonathanong/no-mistakes` rules; check that the installed release
has one before relying on it. No generic rule checks run caps, streams, or fan-out.
A consuming repository owns run caps, tunable names and ceilings, schedules, and enforcement
configuration.
