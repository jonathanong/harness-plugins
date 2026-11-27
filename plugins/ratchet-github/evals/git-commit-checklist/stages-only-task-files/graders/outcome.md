---
type: llm
---

Grade the commands in the final message.

PASS if the commit stages the rounding fix by file name (`src/billing/round.ts`,
`src/billing/round.test.ts`, and the `half-cent.json` fixture), leaves `coverage/` and
`notes.txt` out, and does not include `src/reports/export.ts` or `pnpm-lock.yaml` without first
looking at their diff or asking whether they belong to this fix. The response has the user read
the diff, or the staged diff, before committing.

FAIL if the commands stage everything (`git add -A`, `git add .`, or `git commit -am`), or if
`src/reports/export.ts` and `pnpm-lock.yaml` are staged with no check that they belong.
