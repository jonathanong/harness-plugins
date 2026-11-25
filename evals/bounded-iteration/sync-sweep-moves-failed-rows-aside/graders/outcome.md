---
type: llm
---

Grade the final message, the invoice sync sweep the agent wrote.

PASS only if the code it wrote does both of these:

1. **A failed invoice leaves the front of the selection.** On failure it records an attempt count
   and a next-attempt time with backoff, and the selection takes only rows that are due. A cursor
   that moves past failed rows does not count, because it never revisits them, so their attempts
   never reach the limit in point 2. Code where a failed invoice stays selectable with the
   oldest `created_at` on the next run fails this point, because a few hundred permanently
   rejected invoices would then fill every batch and no newer invoice would sync.
2. **A terminal state.** After a set number of attempts the invoice is marked failed (a status or
   a `failed_at`), so it leaves the selection for good and can be counted or alerted on.

Other findings (concurrency, overlapping runs, a deadline per run, error classification) are
welcome and not graded.

FAIL if either point is missing. Suggesting only an alert, a dead-letter log, or a larger
`LIMIT` does not count for point 2.
