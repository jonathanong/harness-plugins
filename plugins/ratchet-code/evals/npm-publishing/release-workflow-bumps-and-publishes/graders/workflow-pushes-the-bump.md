---
type: llm
---

PASS if the `release.yml` the agent gives in its reply is started by `workflow_dispatch` with an input
for the bump, and the workflow itself bumps the package version, commits it, and pushes that
commit to `main` (a tag pushed with it is fine).

FAIL if the workflow still publishes on a tag push, expects a person to edit the version or to
create the tag, opens a pull request for the bump instead of pushing it, or publishes a new
version without committing the bump to the repository.
