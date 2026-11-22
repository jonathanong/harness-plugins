---
type: llm
---

PASS if both ends of the `git diff` range come from the pull request itself: the pull request's
base SHA with its head SHA (`github.event.pull_request.head.sha`), or a three-dot or merge-base
range against the base branch from a checkout of the pull request's head.

FAIL if the range pairs `github.event.pull_request.base.sha` with `github.sha`, or with `HEAD` on
the default checkout (which is the temporary merge commit), using a two-dot or plain two-argument
diff. That range includes changes that landed on the base branch after the pull request branched.
