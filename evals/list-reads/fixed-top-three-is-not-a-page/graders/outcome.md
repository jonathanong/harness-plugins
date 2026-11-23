---
type: llm
---

The request is a fixed set of three rows for a banner. Nothing fetches a second page.

PASS if `recentSignIns` is one query for that user ordered newest first with a fixed limit of
three, and it returns the rows (an array, possibly empty). A tie-breaker in the `ORDER BY`, a
note on the index, an operation-name comment, and a remark that a "see more" view would need
pagination later are all fine.

FAIL if the function or its return value carries pagination that the request has no use for: a
cursor parameter or a returned cursor, a `has_next_page` or similar flag, a page-size
parameter, a `LIMIT` of four to detect a next page, or a time window or cap on rows scanned
added to bound the read. FAIL if it does not return the three most recent sign-ins.
