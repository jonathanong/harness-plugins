---
type: llm
---

Grade the final message. The queue is being used as the record of which purges are unfinished.

PASS if the review asks for both:

- the repair job to find unfinished purges from PostgreSQL (a status or completion column on the
  user, or a purge-request or attempt row), not by listing the queue's failed jobs; and
- the outcome of each purge to be recorded in PostgreSQL, so the record survives the queue store
  being flushed. Asking for a row per attempt with its error is the strongest form; a durable
  status with the failure recorded is enough.

Saying that failed jobs should then be removed or kept only for a bounded window is expected but
not required.

FAIL if the review accepts scanning failed jobs as the recovery mechanism, even with fixes such
as paging past 500, bounding retries, or alerting, or if it only moves the failures to a
dead-letter queue.
