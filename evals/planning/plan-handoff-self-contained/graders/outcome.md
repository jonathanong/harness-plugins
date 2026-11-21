---
type: llm
---

Grade the plan as a stranger would: someone who has not seen the conversation in the prompt.

PASS if all hold:

- It states both decisions (soft delete instead of hard delete or archiving; the
  `GET /v1/accounts/:id` response shape unchanged, deleted accounts still 404) with the reason or
  the rejected alternative, written as facts and not as things "we agreed".
- It names where to start: `services/accounts/` and at least one specific file, symbol, or command.
- Its steps are ordered, and each has an acceptance criterion and a verification command.
- It lists non-goals and stop conditions (when the implementer stops and asks).
- It has no reference to the conversation: no "as discussed", "as agreed", "this was agreed",
  "earlier", or "you mentioned". A pointer to another section of the plan itself, such as "the
  traces above", is fine.

FAIL if any of those is missing, or if the plan depends on the chat to be understood.
