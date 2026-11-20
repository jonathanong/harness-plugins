---
type: llm
---

PASS if the component aborts the superseded in-flight request with an `AbortController` (signal
passed to `fetch`, aborted in the effect cleanup or before the next request), so a stale response
cannot replace a newer one.

FAIL if requests are not aborted, or the only guard is a debounce or an ignore flag with no abort.
