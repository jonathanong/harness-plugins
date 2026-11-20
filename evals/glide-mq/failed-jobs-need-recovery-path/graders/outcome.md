---
type: llm
---

PASS if the response adds a terminal recovery path for permanently failed jobs that is not the
dead-letter queue alone, such as a reconciler, sweep, or owning repair job that finds orders stuck
in `charging` and either redoes or explicitly abandons the side effect.

FAIL if the dead-letter queue, an alert, or manual inspection is the only handling.
