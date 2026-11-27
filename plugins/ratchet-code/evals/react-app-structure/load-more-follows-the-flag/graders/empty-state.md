---
type: llm
---

Grade the component in the final message against two states.

State A: the first page returns `items: []` with `has_next_page: true` and a cursor.
State B: the component holds no items and the last response had `has_next_page: false`.

PASS if both hold:

- In state A the component requests or offers the next page (a control to load more, or it loads
  the next page itself) and does not show "You're all caught up" or another empty message.
- In state B it shows "You're all caught up".

FAIL if in state A it shows the empty message, with or without a way to load more, or offers no
way to reach the next page: for example the message is rendered whenever `items.length === 0`.
FAIL if in state B it never shows the empty message.

A loading indicator in state A is not an empty message.
