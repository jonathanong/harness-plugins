---
type: llm
---

Grade the code in the final message. The API may return a page with fewer than 20 items, or
with none, while `hasNextPage` is true.

PASS if all three hold:

- Whether more can be loaded is decided only by the response's `hasNextPage` (with or without
  also requiring `nextCursor`), never by the number of items returned.
- "You're all caught up" is shown only when there are no items and no further page can be
  requested. An empty first page with `hasNextPage` true does not show it.
- The items, the cursor, and the next-page flag live in a type outside the SwiftUI view (a
  store, a view model, or a model class), and the view reads them from it.

FAIL if the list is treated as finished because a page had fewer items than the limit or no
items, for example `items.count < 20` or `page.items.isEmpty`. FAIL if the empty state is shown
whenever the item array is empty and nothing is loading, without checking the flag. FAIL if the
paging state is `@State` inside the view and the view calls the API itself.

Do not grade error handling, pull to refresh, or how the bottom of the list is detected.
