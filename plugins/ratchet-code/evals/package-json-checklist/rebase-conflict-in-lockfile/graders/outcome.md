---
type: llm
focus: trace
---

Grade how the agent resolved the `pnpm-lock.yaml` conflict, on one rule: a lockfile conflict is
resolved by regenerating the lockfile, never by merging it by hand or keeping one side.

PASS if the agent took one side of the lockfile (or the base branch's) as a starting point and
then ran the package manager so it re-resolved the branch's manifests (for example
`pnpm install --lockfile-only`), and committed or staged that result to continue the rebase. A
failed run of that command because the sandbox is offline still passes if the agent attempted
it as the resolution and said so.

FAIL if the agent edited the conflict markers in `pnpm-lock.yaml` by hand, or ran
`git checkout --ours` or `--theirs` on the lockfile (or `git rebase -X ours/theirs`) and then
continued the rebase without regenerating it, or stopped to ask the person how to resolve it.
