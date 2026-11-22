---
type: llm
---

PASS if the fix removes the workflow-level `paths` filter and decides inside the workflow (a
detect-changes job, `dorny/paths-filter`, or a `git diff` step) whether to run the web tests, and a
job named `web` always runs and succeeds when the area is skipped (for example a gate job with
`if: always()` that reads the detection result and the test job's result).

FAIL if the fix keeps the `paths` filter and only drops the branch-protection requirement, adds a
second workflow that posts a commit status by API, or keeps a job named `web` that is skipped by an
`if:` on a job that never runs.
