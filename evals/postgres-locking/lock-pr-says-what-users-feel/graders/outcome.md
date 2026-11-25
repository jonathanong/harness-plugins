---
type: llm
---

Grade whether the description says what the lock changes for the people affected, in their
terms, in both directions. The facts are in the prompt: on busy boards (more than 10 people
editing at once, mostly planning sessions) about a third of card moves at peak failed with
"Board changed, try again"; with the lock those moves succeed, and each move can wait behind
others on the same board, typically a few milliseconds and up to about 180 ms at p99, with a
2-second limit before it fails.

PASS if the description states:

1. who is affected and what they got before: people moving cards on a busy board (or in a
   planning session) saw "Board changed, try again", or had about a third of their moves fail at
   peak, and now do not;
2. what the lock costs them: a move can wait for others on the same board (a figure such as
   180 ms p99 or up to 2 seconds, or "a short wait"), and that it fails only past the 2-second
   limit;
3. that people on other boards, or the 98% of boards without such crowds, see no change, or the
   description otherwise makes the narrow scope plain.

FAIL if the benefit is given only as mechanism ("removes 40001 errors", "serializes writers",
"reduces serialization failures") without saying what users saw or now see. FAIL if the wait the
lock adds is not mentioned. FAIL if it invents an effect the numbers do not support.
