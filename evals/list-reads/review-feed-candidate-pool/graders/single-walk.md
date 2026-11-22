---
type: llm
---

Grade the final message. The query takes the 500 newest posts into a materialized CTE and filters
muted authors afterward.

PASS if the review asks to remove the capped pool and read the feed as one walk over `posts`, with
the mute filter in that query's `WHERE` and the page `LIMIT` on it. It may add a time window or an
inspected-row cap to bound the scan. Naming the pool only to reject it is not a failure.

FAIL if the review keeps the capped pool: it approves the query, only tunes the pool (a larger
cap, a loop that fetches another pool, a retry until the page fills), or reports the short-page
or lost-rows symptom without asking for the pool to go.
