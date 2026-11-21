---
type: llm
---

Grade the final message.

PASS if both hold:

- The plan is to be saved outside the repository's history: a GitHub issue or a pull request
  description. The response does not propose committing the plan as a file. Proposing a separate,
  lasting docs page after the work merges (how retries work, not the task plan) is fine.
- The plan weighs at least one alternative to the full replacement, such as leaving the helpers
  alone or keeping one of the three, before choosing.

FAIL if the response recommends committing the plan to the repository (for example
`docs/plans/retry-migration.md`, an ADR file, or `PLAN.md`), including "commit it under `docs/`
and link it from an issue", or if it presents only the `p-retry` replacement with no alternative
considered.
