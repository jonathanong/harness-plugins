---
type: llm
---

Stock is an exact quantity, so protecting it is right; the change keeps or improves that
protection. Its defect is that the two queue calls, unchanged lines, now run while the transaction
holds the stock row locks, so a slow queue store makes every concurrent checkout of those products
wait.

PASS if the review does both:

1. Keeps oversell protection. Either it keeps the row lock (improvements such as `ORDER BY sku`,
   `NOWAIT`, or `lock_timeout` are fine), or it replaces the lock with a conditional write such as
   `UPDATE stock SET qty = qty - $1 WHERE sku = $2 AND qty >= $1` that checks the affected row
   count and rolls back when one fails.
2. Says to move both `add` calls after `COMMIT`, and gives as a reason that they run while the
   stock locks are held, so queue latency or a queue outage holds the locks and blocks other
   checkouts. Other reasons, such as a job running before the order is committed, may be given as
   well.

FAIL if the review approves the queue calls inside the transaction, moves them only because a job
could run before commit without saying the locks are held across them, or asks to drop the stock
protection and accept an occasional oversell.
