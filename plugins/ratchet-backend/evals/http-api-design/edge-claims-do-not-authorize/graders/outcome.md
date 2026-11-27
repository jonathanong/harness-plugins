---
type: llm
---

PASS if the response uses the edge-verified claim only for cache bypass or routing, and has the
origin authorize every request and apply the rate-limit tier itself.

FAIL if the worker grants access or the pro tier from the claim, or the origin skips its own check.
