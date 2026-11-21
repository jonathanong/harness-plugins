---
type: llm
---

Grade the script and advice.

PASS if all hold: the script does not start six heavy cargo jobs at once (it runs them one after
another, or caps each with `--jobs` / `CARGO_BUILD_JOBS` so the total stays bounded); the response
suggests running the full-workspace coverage in CI, or narrowing local runs to the changed
crates; and it removes the throwaway worktrees' `target/` directories when done (the script or the
advice deletes them).

FAIL if it launches all six at full parallelism, or if it never mentions cleaning up `target/`.
