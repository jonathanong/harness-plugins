---
name: glide-mq
description: Use when writing or reviewing a queue producer, worker, dispatcher, scheduler, or flow, choosing which queue or lane a job belongs in, deciding what a job payload carries, or handling a request that waits on a job's result. Design glide-mq queues, jobs, lanes, concurrency, rate limits, and replay safety.
---

# glide-mq queues

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These rules are for runtime code. A test or a one-off script may wait for a job to finish, keep
finished jobs to inspect them, and add a job with no options to a throwaway queue.

Names below are the glide-mq API: the job option `ordering: { key, concurrency }`, the worker
option `concurrency`, `lockDuration`, `limiter: { max, duration }`, `job.moveToDelayed(timestamp)`,
`queue.addAndWait()`, and `job.waitUntilFinished()`. Read
[lease patterns](references/lease-patterns.md) for the lease shape,
[job design](references/job-design.md) for payloads, replay, schedulers, and flows, and the
[transition matrix](references/transition-matrix.md) for a job that calls a provider and writes state.

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

- **A queue is ephemeral; state lives in PostgreSQL.** A job is a delivery attempt, not a
  record. Finished jobs, completed and failed, are removed at once or kept for a short, bounded
  window: `removeOnComplete` and `removeOnFail` are `true`, a small count, or an age, never
  `false` and never a default that keeps everything. A failed job kept forever grows without
  bound, holds its job id so a re-add is dropped, and hides state from anyone reading SQL.
- **Recover from rows, not from the queue.** No code reads a job's state to learn whether work is
  done, and no reconciler scans failed jobs or a dead-letter queue for work to redo. The row says
  what is pending, done, or failed, and a sweep re-enqueues from it, so a failed job's side
  effect is settled or explicitly abandoned, not left half done.
- **What the row records depends on the work.** Legal, privacy, and irreversible work (a
  takedown, an account deletion, a payment, a moderation action) keeps a row per attempt with
  status, error, time, and actor, which must survive a flush of the queue store. Work that can be
  recomputed (a feed, a count, a cache) keeps none; the next sweep picks up what was lost.
- **Share a queue by default; add one only when sharing cannot work.** Put limits on the job, not
  the queue: group `ordering.concurrency`, `rateLimit`, or `tokenBucket`, and per-job
  `lockDuration` and `timeout`. A new queue is justified by a different worker class, a batch
  worker, a limiter a group cannot express (a token bucket charged by actual usage), or a domain
  that needs both a domain-wide cap and per-entity ordering keys, since a job has one key.
- **`limiter` is for an external rate limit only**, such as a provider's requests per minute. It
  pauses fetching for the whole worker, so using it to slow an internal family throttles every
  job on that queue. Shape internal load with `ordering.concurrency`. Never throw
  `RateLimitError` or call `worker.rateLimit()` from a worker shared by several families: it idles
  all of them. Defer the one job with `job.rateLimitGroup` or `job.moveToDelayed`.
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
4. **Job count is not a KPI.** Many small jobs with a dispatcher and a sweep are fine. Do not
   merge or remove jobs to cut the count. Judge a design by model calls or spend per item and by
   how simply the jobs share a lifecycle.

Read [worker tuning](references/worker-tuning.md) for `globalConcurrency`, mixing ranked and
priority-0 jobs, and `lockDuration`. Read [lease patterns](references/lease-patterns.md) for a job
moved to delayed and for lease mechanics.

## Payloads and replay

- **Pass ids; load state in the processor.** Copied entities go stale, and the payload sits in
  Valkey, readable by anyone with queue access. Never put a secret or personal data in one. When a
  job must carry a value the recipient redeems, such as a login token or a presigned URL, set
  `removeOnComplete: true` and `removeOnFail: true` on that job name; numeric retention keeps the
  payload. A waiting or active job still holds it.
- **Every processor is safe to run twice.** A stall or retry reruns it. Re-read current state at
  the start and exit if the work is done, and make the write an upsert, a uniqueness constraint, a
  version guard, or a durable sent marker. Deduplication never replaces this. Write the result
  and the state that marks it done in one transaction.
- **Choose a job id by entity and event**, per [bounded iteration](../bounded-iteration/SKILL.md),
  which owns why a stable id drops re-enqueues.
- **A continuation job gets a new identity.** Re-adding the active job's id or deduplication id
  is silently dropped. Count waiting, active, and delayed jobs in a backlog guard, because a
  retry or priority job sits delayed before promotion.
- Every `add`, scheduler, and flow node sets `attempts`, `backoff`, retention, and `priority`
  explicitly. Throw `UnrecoverableError` for a failure a retry cannot fix. Honor an external 429
  `Retry-After` by deferring the job without spending an attempt.
- Details for jobIds, deduplication modes, schedulers, flows, and backfills are in
  [job design](references/job-design.md).

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
