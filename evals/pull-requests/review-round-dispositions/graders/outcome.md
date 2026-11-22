---
type: llm
---

Grade the final message.

PASS if all of these hold:

- Comment 1 (missing membership check) is treated as blocking: fix it, push, and resolve the
  thread only after the fix is on the pull request's head.
- Comment 2 (rename) is declined with a reason, or at most folded into the push that comment 1
  already requires. It gets no push of its own and no follow-up issue.
- Comment 3 (send email in a background job) is not implemented in this pull request. It becomes
  a follow-up issue or is raised for a decision.
- Comment 4 is answered as already covered, pointing at the existing test, with no code change.
- The response settles all four before pushing, with a single push for the round.

FAIL if the response implements all four comments, moves the email to a background job in this
pull request, adds a duplicate expired-invite test, or resolves comment 1 before the fix is
pushed.
