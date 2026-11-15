---
type: llm
---

PASS if the review raises both of these. First, the `partner-webhook` job is added to a shared
queue with no `ordering` key and no explicit `ordering.concurrency`, so a burst competes for every
worker slot and starves the other families; a family outsiders can flood needs its own ordering
lane (or its own queue), and `priority` does not fix this. Second, the worker `limiter` is the
wrong tool: it throttles every job on the queue, and a limiter is for an external rate limit, so
the internal load should be shaped with `ordering.concurrency` instead.

FAIL if the review approves the diff, keeps the `limiter` as the way to contain the webhooks, or
proposes raising worker `concurrency` as the fix.
