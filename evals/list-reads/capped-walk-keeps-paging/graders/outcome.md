---
type: llm
---

Grade the rewritten `listInbox` on one rule: when the cap on rows looked at stops the read, the
response still tells the client to keep paging.

PASS if, in the case where the read stops at the 500-row cap before it has filled the page, the
response sets `has_next_page` to true and returns a cursor that continues after the last row
looked at, not after the last row returned, and this holds when the page is short and when it
has no items at all. The response may also end the list at a time window; that is fine.

FAIL if `has_next_page` or the cursor is derived only from the rows returned, such as
`rows.length > PAGE` or the last returned item, so a request that hits the cap with a short or
empty page reports no next page, or continues from a row before the ones already looked at. FAIL
if the answer has no cap on rows looked at, or loops inside the request until the page is full.
