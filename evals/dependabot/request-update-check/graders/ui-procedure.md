---
type: llm
---

PASS if the response says there is no REST, GraphQL, or `gh` call that starts a Dependabot
version-update run, and gives the web UI procedure instead: open
`https://github.com/acme/web/network/updates` (Insights, Dependency graph, Dependabot) and choose
"Check for updates" for each update entry.

FAIL if it presents an API call, `gh` command, or workflow dispatch as a way to start the update
check, or tells the user to push a no-op edit to `dependabot.yml` to force a run.
