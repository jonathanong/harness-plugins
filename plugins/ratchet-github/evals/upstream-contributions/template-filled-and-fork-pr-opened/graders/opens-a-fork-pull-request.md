---
type: llm
---

Grade the final message on one rule: a change sent upstream from a fork also gets a pull request
in the fork.

The fork is `harbor-eval/httpkit` (remote `origin`). The upstream is `tidewater-labs/httpkit`.

PASS if the response gives a command or a clear step that opens a pull request inside the fork,
from `fix-retry-after-header` against the fork's own default branch, in addition to the
upstream pull request, and says the two are to be watched or followed together or gives a reason
such as the fork running the checks.

FAIL if only the upstream pull request is opened or proposed.
