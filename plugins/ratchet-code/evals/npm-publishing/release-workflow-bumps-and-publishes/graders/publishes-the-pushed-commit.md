---
type: llm
---

This grader checks which source the publish step builds and publishes.

PASS if the published files come from the bump commit the workflow pushed: either the publish
runs in the same job and checkout that made the commit, or a later job checks out that commit by
the SHA the bump job outputs.

FAIL if a later job checks out `main`, a branch name, or the default ref again before publishing,
checks out the tag by name, or publishes from a checkout made before the bump so the package
carries the old version.
