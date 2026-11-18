---
name: glide-mq
description: Design glide-mq queues, jobs, ordering lanes, worker concurrency, rate limits, and cross-job caps. Use when writing or reviewing a queue producer, worker, or dispatcher, choosing which queue or lane a job belongs in, or handling a request that waits on a job's result.
---

# glide-mq queues

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Names below are the glide-mq API: the job option `ordering: { key, concurrency }`, the worker
option `concurrency`, `lockDuration`, `limiter: { max, duration }`, `job.moveToDelayed(timestamp)`,
`queue.addAndWait()`, and `job.waitUntilFinished()`. Read
[lease patterns](references/lease-patterns.md) for the lease shape.

## Choose the queue and the lane

- **Jobs a user is waiting on get their own queue.** A lane protects a family's share of one
  worker pool; it does not protect latency when every slot is busy with background work. A
  separate queue has its own workers, so a backfill cannot delay a signup email.
- **A job whose work commits with, or is triggered by, a database transaction gets its own
  queue.** An outbox relay and a payment or ledger write are examples. Slow or bulk jobs on a
  shared queue can hold every worker slot and delay them, and a stalled relay or ledger write
  leaves committed rows unpublished or unposted. A queue of its own lets you set its
  concurrency, retries, backoff, and rate limits for that work alone.
- **Never enqueue a job and wait for its result.** No `addAndWait`, no `waitUntilFinished`, in a
  request handler or in another job. The caller holds a connection and a request slot for as long
  as the queue is backed up, and a deploy or timeout loses the result. Return the job or resource
  id, write the outcome to a row, and let the client poll that resource.

  ```ts
  // Rejected: the request lives as long as the queue is slow.
  const report = await reports.addAndWait('build', { reportId })

  // Accepted: 202 with an id; the client polls GET /reports/:id until status is final.
  await reports.add('build', { reportId }, { jobId: reportId })
  return reply.code(202).send({ id: reportId })
  ```

- **`limiter` is for an external rate limit only**, such as a provider's requests per minute. It
  pauses fetching for the whole worker, so using it to slow an internal family throttles every
  job on that queue. Shape internal load with `ordering.concurrency`.
- **A job family outsiders can flood gets its own lane.** Inbound webhooks, user-triggered
  imports, and anything a client can enqueue in bulk must not share an ordering key with ordinary
  work.

## Lanes, caps, and leases

1. **Every shared-queue job sets `ordering`.** An ungrouped job in a shared queue competes for
   every worker slot, so a flood of it starves other families. Give each job an
   `ordering.key` prefixed with its domain name and an explicit `ordering.concurrency`.
2. **`ordering.concurrency` is a global cap; the worker `concurrency` is per process.** The key's
   cap holds across all workers and processes. The worker option only bounds one process's
   active jobs. Never size lane caps to sum to the worker option. Take caps from runtime
   configuration, and give batched families a low cap.
3. **Group FIFO ignores `priority`.** Jobs sharing an ordering key run in enqueue order whatever
   their priority. Work that must not wait behind a flood, and dispatchers that rely on
   priority, get their own lane. Put work that outsiders can flood in a lane of its own.
   Ordering keys are the orchestration layer; add none on top.
4. **`globalConcurrency` caps the whole queue.** The worker option `globalConcurrency` limits
   every job on the queue together, so on a shared queue it throttles all families at once. Use
   ordering lanes for per-family caps, and use `globalConcurrency` only when one resource bounds
   the whole queue.
5. **A job moved to delayed keeps its ordering slot until it completes.** A deferred job still
   counts against `ordering.concurrency`, so deferred jobs can fill a key and block ready work
   on it. A cap on concurrency across an external call that must survive deferral belongs in a
   token-owned lease, released before `moveToDelayed`, not in the ordering key. Never fix starvation by raising the key's
   concurrency: overlap grows and the same number of deferred jobs still fill the slots.
6. **Lease mechanics.** A lease is only for concurrency across an external call, such as a
   provider quota shared by several jobs. Never use one for an internal cap that can be best
   effort; count and write, as in the lock rules in
   [schema design](../postgres-schema-design/SKILL.md#locks). Acquire a token-owned lease with `SET key token NX PX ttl` before the
   guarded work. Set the TTL at or above the job's `lockDuration`, renew it while the job runs,
   and release it with compare-and-delete in `finally`. On contention, `moveToDelayed` only this
   job by a short, bounded, jittered delay so it keeps its id, cursor, and dedup. Release the
   lease before any `moveToDelayed` for quota deferral. Reuse the repository's lease helper
   rather than adding a second. See [lease patterns](references/lease-patterns.md).
7. **Job count is not a KPI.** Many small jobs with a dispatcher and a sweep are fine. Do not
   merge or remove jobs to cut the count. Judge a design by model calls or spend per item and by
   how simply the jobs share a lifecycle.

## Code layout

- Producers enqueue and workers execute. Producer code never imports worker code, so an API
  process does not load worker dependencies and the two deploy separately.
- A message consumer enqueues a job and acks. Work done inside the consumer has no retry,
  backoff, or dedup.
- A processor calls the service that owns the write. Business logic in the processor cannot be
  reached from a request, a script, or a test without a queue.

Dispatchers, paged fan-out, and job-id deduplication follow
[bounded iteration](../bounded-iteration/SKILL.md). A lease for work that spans an external call
replaces holding a PostgreSQL transaction or advisory lock open across it; see
[performance patterns](../postgres-node-performance-tuning/references/performance-patterns.md).

A consuming repository owns queue names, lane keys, caps and their configuration source, the lease
helper, and enforcement configuration.
