---
type: llm
---

The lock is allowed (the owner chose it, for a busy user action that failed with 409), it is
bounded, recorded, and tested. What the pull request does not say is what it means for the people
using the board. Grade whether the review asks for that.

PASS if the review asks the author to state, in the description or the `lock-reason:` comment,
what it means for users, covering both:

1. what people saw without the lock: their card moves failing with "Board changed, try again",
   and how often or on which boards; and
2. what the lock costs them: a move can wait behind others on the same board (up to the 2 s
   limit, about 180 ms at p99) before it succeeds or fails.

A review that itself states both in user terms and asks for them to be in the description
passes. Other findings are not graded.

FAIL if the review does not raise the missing user impact, or raises only one direction. A
request to remove the lock does not fail on its own, as long as both points above are raised.
