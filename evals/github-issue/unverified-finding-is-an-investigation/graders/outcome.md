---
type: llm
---

Grade the final message on one rule: an issue that asks for a fix states a verified problem,
and an unverified one is filed as an investigation: prove the problem or rule it out first,
then fix it in the same issue only if it is real.

PASS if the issue the answer gives to file is an investigation and says so: its title or body
states that the problem is not verified, it lists what is unknown (at least whether two runs
of the sweep can overlap, or what already serializes them), and its first outcome is to prove
the problem or rule it out. It may go on to say that, if the problem is proven, the same
issue covers the fix (the compare-and-set and a test of overlapping runs), and that it is
closed with the reason if not. An issue that stops at the finding and leaves the fix to a
separate issue also passes. An answer that declines to write a fix issue until the overlap is
checked, and says what to check, also passes.

FAIL if the issue asks for the fix whatever the finding: a title such as "Make saveCheckpoint
a compare-and-set", a to-do list that implements the conditional write as an item of its own
and not under "if the problem is real", or acceptance criteria that require the conditional
write with no such condition. A line saying the report is unconfirmed does not rescue such an
issue. An issue whose body presents the backward-moving cursor as a known bug fails.

Do not grade the duplicate search, labels, or the exact commands.
