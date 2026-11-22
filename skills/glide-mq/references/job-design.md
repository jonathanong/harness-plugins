# Job design

Detail for the rules in [SKILL.md](../SKILL.md#payloads-and-replay).

## Job ids and deduplication

- A custom `jobId` is a hard uniqueness key. Keep colons, curly braces, and control characters
  out of it.
- Under numeric `removeOnComplete` or `removeOnFail`, the claim lasts until the terminal record is
  trimmed. Before pairing a stable id with numeric retention, pick one:
  - drop the custom id when `simple` or `throttle` deduplication already collapses duplicates;
  - release the claim at completion with `removeOnComplete: true` and `removeOnFail: true`, which
    also frees the id after a terminal stall;
  - time-bucket the id for periodic self-healing work, with `throttle` deduplication;
  - add a reactivation helper that removes only the finished record behind a skipped id, for work
    that must replay on demand;
  - key the id by entity and triggering event, so an overlapping sweep collapses and a new event
    enqueues.
- Pick deduplication by meaning: `throttle` for dispatchers, `debounce` only for delay-reset
  work without ordering keys, `simple` for one-shot suppression.
  `debounce` has no time window: it replaces the tracked job while that job is delayed or prioritized and skips
  while it is waiting or active. A `ttl` beside it is ignored (checked on glide-mq 0.20); only
  `throttle` reads `ttl`.
- When merging queues, namespace job names, job ids, deduplication ids, scheduler ids, and ordering
  keys by domain, and size the worker for the combined load.

## Schedulers

- A scheduler template cannot carry `delay`, `deduplication`, `parent`, or `jobId`; glide-mq
  rejects them because a scheduler tick never applies them. Put deduplication on the producer's
  own manual enqueue.
- Schedule the real processor job. The scheduler skips overlapping runs, so a trampoline job
  that enqueues the real one adds a hop and nothing else.
- Keep every scheduler definition in one registry, with its id, repeat rule, and job template.
  Removing an entry must delete the live scheduler, or it keeps firing from Valkey.

## Flows

- Put explicit retry options on every parent and every child. A node with none inherits defaults
  nobody chose.
- A flow's parent resumes from persisted state after its children, never by waiting on them in a
  processor.
- Await, return, or aggregate every fan-out enqueue. Persist intent before fan-out, use stable
  dedup ids, and advance a cursor or mark completion only after the children are enqueued.

## Backfills

- Replay only idempotent "ensure" effects, per
  [bounded iteration](../../bounded-iteration/SKILL.md) rule 15.
- Stream an exhaustive durable source by cursor and enqueue bounded batches from one throttled
  dispatcher, per [bounded iteration](../../bounded-iteration/SKILL.md).
- Exclude an irreversible external send, such as an email or a charge, unless a durable marker
  makes the replay safe. Record each exclusion and its reason where the registry lives.
- Test at the service boundary against real PostgreSQL, Valkey, and glide-mq. Find an enqueued job
  by id or `searchJobs`, not by listing the waiting state, which other tests share.

## Derived statistics

Refresh a derived statistic (a count, a rank, a rollup) in a job that is asynchronous and
debounced, never awaited on the write path. The write commits without it, and a burst of writes
collapses into one refresh.
