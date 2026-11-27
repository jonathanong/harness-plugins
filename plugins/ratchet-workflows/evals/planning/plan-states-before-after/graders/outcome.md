---
type: llm
---

Grade the final message, only for how the outcome is stated.

PASS if the plan states, in words a non-engineer could read, what a user experiences before and
after the change: for example a table or explicit pairs such as "today, a reset link works for a
day; after, it stops working after an hour and the user must request a new one", and what the
user sees on an expired link or in the email text. The pairs cover more than one changed
behavior or screen.

FAIL if the outcome is only technical (change a config value, edit a check) with no user-visible
before and after, or if the before and after are given only in code or config terms.
