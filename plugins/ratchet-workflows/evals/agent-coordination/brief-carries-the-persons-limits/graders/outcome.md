---
type: llm
---

Grade the message to the second agent on one rule: a brief carries every limit the person set,
because the worker has no other way to learn them.

PASS if the brief states all four:

1. `/v1/orders` keeps its current behavior (until the mobile 4.2 release), and the new
   pagination goes on `/v2/orders`.
2. Nothing under `src/billing/` is to be changed.
3. The database view was already tried and was too slow, so it is not to be retried.
4. The worker may open a pull request but may not merge it; the person merges.

FAIL if any of the four is missing, or is changed in meaning: for example "avoid billing where
possible", "prefer not to use a view", or leaving out that the worker may not merge.
