---
type: llm
---

Grade the fix to `listInbox` on one rule: a list read bounds the rows it scans, not only the rows
it returns, and a page that stops at that bound still lets the client continue.

The query is slow because, for a viewer who mutes a prolific sender, it walks past many muted
rows to fill a page of 30. Both indexes it can use already exist.

PASS if the fix limits how many rows one request scans, by a cap on rows looked at or by a time
window on the walk, and the response lets the client continue from where the scan stopped: when
the bound stops the read on a short or empty page and older messages may remain,
`has_next_page` is true and the cursor continues after the last row scanned. Ending the list at
the edge of a stated time window is also fine.

FAIL if one request can still scan an unbounded number of rows: for example the fix is only a
new index, a rewritten join or `NOT IN`, a statement timeout, or a cache. FAIL if it bounds the
scan but a page that stops at the bound reports no next page while older messages may remain,
or its cursor is taken from the last returned row so the next request rescans the same rows.
FAIL if it loops inside the request until the page is full. FAIL if it replaces the walk with one
probe per sender merged afterward, such as a skip scan over a `(recipient_id, sender_id, ...)`
index: that request's cost grows with the number of senders and is not bounded either.

A fix that removes the muted rows from the walk altogether, such as a per-viewer stored inbox
that mute writes maintain, also passes if it says how existing rows are handled.
