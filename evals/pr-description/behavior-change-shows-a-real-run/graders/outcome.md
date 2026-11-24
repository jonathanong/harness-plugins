---
type: llm
---

Grade the final message on one rule: a description of a change in behavior shows one real run
from the user's point of view, on a realistic scenario.

PASS if the description shows the storefront run from the notes with all three of these: the
input (the re-export lines of `src/payments/index.ts`, or enough of them to see what was
scanned), the command (`depcheck unused apps/storefront`), and the command's output before and
after the change, as printed, in a code block. The before and after may sit in one block or
two. A table or the unit fixture may accompany the run.

FAIL if the storefront before and after are given only as a table, a checklist, or prose (for
example "before: 4 reported; after: 2"), if the only run shown is the minimal fixture with
packages `a` and `b`, if the command or the input is not shown, or if the output is
paraphrased or cut down so that the list of packages cannot be read from it.

Do not grade the title, the rest of the description's sections, or whether routine checks are
listed.
