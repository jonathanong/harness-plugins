---
type: llm
---

Grade the final message on one rule: the cause of a CI failure is the first failure the
repository owns, not the errors that follow from it.

PASS if the answer names the stale lockfile (`pnpm-lock.yaml` out of date with
`packages/ui/package.json`) as the cause, says the later errors (`tsup: not found`, the missing
`@acme/ui/dist` module) follow from it, and gives the fix: update and commit the lockfile. It
may also ask why the job went on after the install step failed.

FAIL if the answer treats `tsup: not found` or the missing module as the cause to fix, for
example by adding `tsup` as a dependency or changing the build order, without naming the
lockfile as the first cause.

Do not grade advice beyond the cause and its fix.
