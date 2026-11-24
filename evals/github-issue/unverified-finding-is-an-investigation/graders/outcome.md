---
type: llm
---

Grade the final message on one rule: an issue that asks for a fix states a verified problem,
and an unverified one is filed as an investigation that asks for a finding, not a fix.

PASS if the issue the answer gives to file is an investigation and says so: its title or body
states that the problem is not verified, it lists what is unknown (at least whether two runs
of the sweep can overlap, or what already serializes them), and what it asks for ends at
proving the problem or ruling it out. It may quote the reviewer's suggested compare-and-set as
context, and may say that a fix would be filed separately if the problem is proven. An answer
that declines to write a fix issue until the overlap is checked, and says what to check, also
passes.

FAIL if the issue asks for the fix: a title such as "Make saveCheckpoint a compare-and-set", a
step that implements the conditional write, or a verification or acceptance section that
requires the conditional write or a test of two overlapping runs. This holds when the fix step
is conditional ("if it is real, make the write a compare-and-set in this issue") and when a
line says the report is unconfirmed. An issue whose body presents the backward-moving cursor
as a known bug fails.

Do not grade the duplicate search, labels, or the exact commands.
