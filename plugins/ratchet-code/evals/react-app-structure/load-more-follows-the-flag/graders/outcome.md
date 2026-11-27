---
type: llm
---

Grade the component in the final message. The API may return a page with fewer than 20 items, or
with none, while `has_next_page` is true.

PASS if whether more can be loaded is decided only by the response's `has_next_page` (with or
without also requiring `next_cursor`), and never by the number of items returned.

FAIL if the component treats the list as finished because a page had fewer items than the limit
or no items: for example `items.length < 20`, `items.length === 0`, or a "done" state set from
the item count.
