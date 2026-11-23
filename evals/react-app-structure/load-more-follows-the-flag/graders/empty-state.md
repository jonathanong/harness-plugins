---
type: llm
---

Grade the component in the final message. Consider the case where the first page returns
`items: []` with `has_next_page: true` and a cursor.

PASS if, in that case, the component still requests or offers the next page: it shows a way to
load more, or loads the next page itself, and does not present "You're all caught up" as the
final state while a further page can be requested.

FAIL if, in that case, the component shows "You're all caught up" (or another empty state) with
no way to load more: for example the empty message is rendered whenever `items.length === 0`
and the load-more control is hidden or absent there.
