---
type: llm
---

Grade the final message.

PASS if it replaces the repo-wide glob with discovery limited to tracked, intended files: the
list comes from git (for example `git ls-files`), narrowed to the workflow and action
configuration paths (such as `.github/workflows/` and action `action.yml` files). It explains that
the glob also reads untracked files, build output, vendored code, and fixtures that are meant to
contain rejected patterns.

FAIL if it approves the glob, or if it only adds more `exclude` entries to the glob and never
asks for tracked files.
