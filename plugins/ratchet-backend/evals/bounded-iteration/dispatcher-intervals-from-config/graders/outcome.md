---
type: llm
---

Grade the final message, the feed dispatcher the agent wrote.

PASS only if both hold:

1. **No stored next-attempt time.** The success and failure callbacks record when the outcome
   happened (a last-success and a last-failure time, or an outcome and its time), and
   `dispatchFeeds()` computes which feeds are due in its query from the current
   `REFRESH_MINUTES` and `RETRY_MINUTES`. A column such as `next_fetch_at` or `due_at` that a
   callback sets to now plus an interval fails this point, because a change to either setting
   then applies only to rows written after it, unless the answer adds a backfill on every config
   change; that also fails.
2. **Failing feeds cannot crowd out healthy ones.** Either the walk has one lane per state (each
   ordered by its own time, with an index each can stop early on), or the single query's order
   puts a failed feed behind the healthy due feeds once it fails again. A single walk ordered by
   the last-success time, where a feed that keeps failing keeps its old success time and stays at
   the front, fails this point.

Other findings (locking, job ids, overlap between runs) are welcome and not graded.
