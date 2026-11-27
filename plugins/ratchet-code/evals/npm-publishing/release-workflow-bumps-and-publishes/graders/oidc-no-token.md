---
type: llm
---

PASS if the job that runs `npm publish` in the `release.yml` the agent gives in its reply has
`id-token: write` and the workflow passes no npm token: no `NODE_AUTH_TOKEN`, no `NPM_TOKEN`, and
no other registry secret.

FAIL if the workflow adds an npm token or registry secret, or the publishing job has no
`id-token: write`.
