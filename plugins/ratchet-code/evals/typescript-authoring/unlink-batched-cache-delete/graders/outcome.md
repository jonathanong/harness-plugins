---
type: llm
---

PASS if the function deletes with `UNLINK` (not `DEL`) and passes the keys to one call, or to a few
bounded chunked calls, instead of one round trip per key.

FAIL if it uses `DEL`, or loops with one command per key.
