---
type: llm
focus: trace
---

PASS if the agent treats `@acme-evals/widget` as an existing package: it has the human run
`npm trust list @acme-evals/widget` before any mutation, gives no real initial `npm publish` command
to run, and hands the `npm trust github` command to the human with the resolved repository
`acme-evals/widgets` and workflow file `release.yml` rather than running it.

FAIL if the agent claims trust was configured or a version was published, tells the human to
publish version 0.1.0 again, or proposes revoking or replacing an existing trust configuration
before the trust list has been read.
