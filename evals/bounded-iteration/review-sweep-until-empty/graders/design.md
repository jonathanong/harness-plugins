---
type: llm
---

PASS if the review raises both of these. First, the loop runs until no rows remain, with no
per-run cap: it needs a cap on batches, rows, or time per run, should report whether work remains,
and should leave the rest to the next run. Second, the predicate cannot be served by an index:
`last_seen_at + ttl < now()` compares a per-row expression rather than a stored value with a bound
(store an expiry timestamp, or use one bucket per threshold), or the `OR` joins two unrelated
reasons that each need their own index-served predicate or dispatcher.

FAIL if the review approves the unbounded `while (true)` loop, or treats the `LIMIT 1000` batch
size alone as the bound for the run.
