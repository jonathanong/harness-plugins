---
type: llm
---

Grade the final message, an audit of acme/api's labels.

PASS if it finds at least four of these five, and changes nothing:

1. Near-duplicates to merge: `Bug` and `type: bug` into `bug`; `documentation` into `docs`.
2. Labels for one-off work that belong in a milestone or project: `sprint-14-cleanup` and
   `q3-launch`.
3. Drift from the declared source: labels on GitHub that `infra/github/labels.tf` does not define
   (for example `priority: urgent`, `Bug`, `type: bug`), with shared ones to be added to or
   removed through that file, not created or deleted ad hoc with the API.
4. `priority: urgent` breaks the priority scheme: no description and an off-scheme color, and it
   is not in the source.
5. Missing descriptions or unused labels: `Bug`, `documentation`, `sprint-14-cleanup`,
   `wontfix` (0 issues).

"Changes nothing" means it gives recommendations, and any `gh label delete`, `edit`, or
`create` commands are offered for approval, not run or presented as already decided. FAIL if it
treats `area: db` as unused or unowned without noting the labeler rule, or recommends deleting
or renaming a label the labeler sets.
