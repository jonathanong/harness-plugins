# Lease patterns

A lease caps concurrency across an external call, such as a provider quota. It holds across jobs
and survives deferral, which an `ordering` slot does not: a job
moved to delayed keeps its slot until it completes.

## Acquire, renew, release

```ts
const token = randomUUID()
// SET leaseKey token NX PX ttlMs  -> null when another job holds the lease
if (!(await setIfAbsent(leaseKey, token, ttlMs))) {
  return job.moveToDelayed(Date.now() + jitteredDelayMs) // this job only; never falls through
}
try {
  // renew while running, e.g. every ttlMs / 3, only while the stored value equals token
  await doGuardedWork()
} finally {
  await compareAndDelete(leaseKey, token) // script: delete only when the value equals token
}
```

- The TTL is at least the job's `lockDuration`. A shorter lease can expire while the job is
  still active, and a second job then enters the guarded section.
- Renewal and release are scripts that compare the stored value with the token. A plain `DEL`
  can remove a lease another job has since acquired.
- The delay on contention is short, bounded, and jittered so deferred jobs do not wake together.
  `moveToDelayed` defers this job only and keeps its id, cursor, and dedup.

## Quota deferral

When the work defers itself for a quota or rate, release the lease first, then call
`moveToDelayed`. `moveToDelayed` never returns, so a release placed after it does not run, and a
deferred job that keeps the lease blocks the jobs the lease exists to admit.

```ts
await compareAndDelete(leaseKey, token)
await job.moveToDelayed(resumeAt)
```

## Why not the ordering key

Concurrency 1 on a key serializes ready work but lets deferred jobs hold the slot. Raising it to
2 lets two guarded sections overlap, and two deferred jobs still fill both slots. A lease
separates the cap on active work from the queue-order slot.

## Deferral and lease rules

Rules from the lane list for a job that defers itself or holds a lease.

5. **A job moved to delayed keeps its ordering slot until it completes.** A deferred job still
   counts against `ordering.concurrency`, so deferred jobs can fill a key and block ready work
   on it. A cap on concurrency across an external call that must survive deferral belongs in a
   token-owned lease, released before `moveToDelayed`, not in the ordering key. Never fix starvation by raising the key's
   concurrency: overlap grows and the same number of deferred jobs still fill the slots.
6. **Lease mechanics.** A lease is only for concurrency across an external call, such as a
   provider quota shared by several jobs. Never use one for an internal cap that can be best
   effort; count and write, as in the lock rules in
   [locking](../../postgres-locking/SKILL.md). Acquire a token-owned lease with `SET key token NX PX ttl` before the
   guarded work. Set the TTL at or above the job's `lockDuration`, renew it while the job runs,
   and release it with compare-and-delete in `finally`. On contention, `moveToDelayed` only this
   job by a short, bounded, jittered delay so it keeps its id, cursor, and dedup. Release the
   lease before any `moveToDelayed` for quota deferral. Reuse the repository's lease helper
   rather than adding a second.
