---
type: llm
---

PASS if the response declines to implement the sleep-and-poll loop and instead connects the two
repositories with an event: `acme/infra` emits a completion event (for example a
`repository_dispatch` sent at the end of `deploy.yml`) and `acme/web` reacts to it. The design must
also carry correlation data such as the commit SHA and say that the receiver validates the sender
or payload before acting.

FAIL if the workflow YAML it proposes waits on remote state by looping, sleeping, or repeatedly
querying runs, deployments, or checks, or uses a CLI waiter such as `gh run watch`, even with a
timeout. Mentioning the polling loop only to reject it is not a failure.
