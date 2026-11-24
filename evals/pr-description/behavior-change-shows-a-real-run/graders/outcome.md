---
type: llm
---

Grade the final message on one rule: a description of a change in behavior shows a real run,
not only a summary of one.

PASS if the description includes all three of these, taken from the notes: the input (the
re-export lines of `src/index.ts`, or enough of them to see what was scanned), the exact
command (`depcheck unused fixtures/reexport`), and the command's real output before and after
the change, as printed, in a code block. The before and after may sit in one block or two. A
table may accompany the run.

FAIL if the before and after are given only as a table, a checklist, or prose (for example
"Before: 4 reported; after: 2"), if the command is not shown, if the input is not shown, or if
the output is paraphrased or cut down so that the list of packages cannot be read from it.

Do not grade the title, the rest of the description's sections, or whether routine checks are
listed.
