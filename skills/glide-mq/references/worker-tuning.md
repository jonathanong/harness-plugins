# Worker tuning

Rules from the lane list for queue-wide caps, priority, and lock duration.

4. **`globalConcurrency` caps the whole queue.** The worker option `globalConcurrency` limits
   every job on the queue together, so on a shared queue it throttles all families at once. Use
   ordering lanes for per-family caps, and use `globalConcurrency` only when one resource bounds
   the whole queue.
5. **Never mix ranked and priority-0 jobs in one queue.** glide-mq runs ranked jobs before
   priority-0 FIFO jobs, so a mixed queue starves its 0 jobs. Pick one kind per queue. Ranked
   priority orders only jobs promoted together: a large batch already in the ready list delays
   every later job whatever its priority, so cap a batch's admission instead of relying on rank.
6. **Signal a provider's rate limit with its wait time.** `worker.rateLimit(ms)` sets a
   timestamp in that one process, so other replicas keep calling the provider. Throw the rate
   limit error with the provider's `Retry-After` as the delay; an error with no delay drops it.
   Build that error in one place.
7. **Create workers through the codebase's worker factory when it has one.** The factory owns
   the request timeout, stall budget, connection isolation, and shutdown registration; a direct
   `new Worker(...)` skips them. A transport test on an isolated prefix may build a raw worker
   and close it itself.
8. **A lock duration is a crash-recovery window, not a runtime cap.** `lockDuration` is how long
   a job may go without a heartbeat before another worker takes it after a crash. Shortening it
   only duplicates slow but live jobs sooner. A deploy that kills a worker mid-job counts as a
   stall; raising the stalled-job limit hides a job that keeps crashing, so fix the job.
