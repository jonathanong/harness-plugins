---
type: llm
---

The request is a mechanical rename with no behavior change. A plan document would be out of
proportion.

PASS if the response proceeds directly: it describes or performs the rename (a symbol rename,
a search and replace, or a codemod) and says how it verifies it, such as the type check, a search
for leftover `fmtDate` references, or running the tests. A short list of steps is fine.

A short note on risks (such as outside consumers or string references) and a question about a real
choice the request leaves open (such as renaming the file too) are fine.

FAIL if the response is a plan document: a before/after outcome table, an options comparison,
phases, stop conditions, a definition of done, or a handoff for another agent. Also FAIL if it
refuses to proceed until a decision is made that the request already settles.
