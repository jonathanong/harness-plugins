---
type: llm
---

Grade the pull request body in the final message on one rule: it follows the project's pull
request template.

The template has four headings, in this order: "What and why", "Linked issue", "Checklist", and
"AI assistance". The checklist has three items: tests added or updated, `make check` passes, and
`CHANGELOG.md` updated. The prompt says the agent wrote the fix, tests were added, `make check` passed, and
no changelog entry was written.

PASS if the body for the upstream pull request keeps all four headings and fills each in, links
issue 412, ticks the tests item and the `make check` item, and says that AI tools or an agent
wrote the change. The changelog
item is either left unticked with a note, or the response adds the entry or tells the person to
add it before opening.

FAIL if the body uses its own layout in place of the template's headings, drops a heading or a
checklist item, leaves the tests item or the `make check` item unticked or says either was not done, ticks the
changelog item when no entry exists and none is added, or does not say an agent or AI tool wrote
the change.
