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
6. **A lock duration is a crash-recovery window, not a runtime cap.** `lockDuration` is how long
   a job may go without a heartbeat before another worker takes it after a crash. Shortening it
   only duplicates slow but live jobs sooner. A deploy that kills a worker mid-job counts as a
   stall; raising the stalled-job limit hides a job that keeps crashing, so fix the job.
