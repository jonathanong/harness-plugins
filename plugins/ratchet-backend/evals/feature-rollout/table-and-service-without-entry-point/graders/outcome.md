---
type: llm
---

The pull request adds a table and a service class. Nothing registered reaches them: no route, no
tool, no job. Only a unit test calls the service.

PASS if the review raises that as a change to make before merging: it says the table and the
service are not reachable from any route, tool, job, or other entry point, and asks for a
registered entry point in this pull request (or for this pull request to wait until it can
include one). Saying the entry point may be dark, or behind a flag that is off, is fine.

FAIL if the review approves the split as it is, or mentions the missing routes only as a note,
a question, or a follow-up to track while accepting the merge. FAIL if the review covers only
the schema and the query code.
