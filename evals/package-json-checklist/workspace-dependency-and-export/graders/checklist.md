---
type: llm
---

PASS if the response adds the dependencies with pnpm scoped to `packages/api` (not `npm install` or
`yarn`), puts `zod` in `dependencies` and `msw` in `devDependencies`, adds the `./client` entry to
`exports` (with its types when the package ships declarations) while keeping the root entry point
importable through a `.` export, says to check that the published files and build output contain both
entry points, has the lockfile updated by the package manager, lists checks to run before
committing (such as a frozen-lockfile install, tests, typecheck, and build), and says to review the
lockfile diff for unrelated churn or to find the consumers of the changed entry points.

FAIL if it uses a package manager other than pnpm, puts `msw` in runtime dependencies, edits the
lockfile by hand, or publishes or suggests publishing as part of the change.
