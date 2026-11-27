---
type: llm
---

Grade the final message. The case is about where the plan is saved.

PASS if the plan is to be saved outside the repository's history: a GitHub issue or a pull request
description. The response does not propose committing the plan as a file. Proposing a separate,
lasting docs page after the work merges (how retries work, not the task plan) is fine. Naming a
file in the repository only to reject it is not a failure.

FAIL if the response recommends committing the plan to the repository (for example
`docs/plans/retry-migration.md`, an ADR file, or `PLAN.md`), including "commit it under `docs/`
and link it from an issue".
