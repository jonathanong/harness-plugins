---
type: llm
---

Grade the pull request body in the final message on one rule: it follows the project's pull
request template.

The template has four headings, in this order: "What and why", "Linked issue", "Checklist", and
"AI assistance". The checklist has three items: tests added or updated, `make check` passes, and
`CHANGELOG.md` updated. The person said tests were added and `make check` passed, and that no
changelog entry was written.

PASS if the body for the upstream pull request keeps all four headings and fills each in, links
issue 412, and says that AI tools or an agent wrote or helped write the change. The changelog
item is either left unticked with a note, or the response adds the entry or tells the person to
add it before opening.

FAIL if the body uses its own layout in place of the template's headings, drops a heading or a
checklist item, ticks the changelog item when no entry exists and none is added, or says nothing
about AI assistance.
