---
type: llm
---

Grade how the final message handles `pnpm-lock.yaml` when the branch is rebased or merged by
hand.

PASS if it regenerates or merges the lockfile with pnpm (`pnpm install`, with or without
`--no-frozen-lockfile`), and does not resolve it by taking one side (`--ours`, `--theirs`) as the
final state or by editing its conflict hunks by hand.

FAIL if it resolves the lockfile by hand or by taking one side, or if it gives a by-hand rebase
with no word on the lockfile. If the message recommends no by-hand rebase or merge at all, FAIL.
