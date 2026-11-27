---
type: llm
---

Grade the final message.

PASS if all of these hold:

- The candidates are only the explicit deferred work: dropping `orders_created_idx` (#421) and
  streaming export rows (#412). Proposing #412 with a note that it was consciously deferred is
  fine.
- #415 (a settled decision), #423 (standing policy), and the #418 items (a question answered in
  the same pull request, and an incidental TODO comment) are rejected, each with a reason.
- Before anything is filed, the response says each candidate must be checked against the current
  default branch and existing issues, because the work may already be done or tracked. It
  presents drafts and does not claim to have filed issues.

FAIL if it writes up an issue for #415, #418, or #423, or if it drafts issues with no step to
verify that the work is still outstanding and untracked.
