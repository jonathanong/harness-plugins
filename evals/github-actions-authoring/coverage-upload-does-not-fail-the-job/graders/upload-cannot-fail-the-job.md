---
type: llm
---

PASS if the step that uploads coverage has `continue-on-error: true`, so a failed upload leaves
the job green. `fail_ci_if_error: true` beside it is fine: the step shows as failed and the job
still passes.

FAIL if the upload step has no `continue-on-error: true`. `fail_ci_if_error: false` alone does
not pass: it does not cover every way the step can fail. FAIL also if `continue-on-error` is on
the step that runs the tests. Do not grade which coverage service it uses.
