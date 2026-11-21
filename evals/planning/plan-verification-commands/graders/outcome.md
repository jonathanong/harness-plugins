---
type: llm
---

Grade the verification in the plan.

PASS if both hold:

- Each step has its own runnable verification command (for example `pnpm exec vitest run
  packages/pricing/src/discount.test.ts`), not just "test it".
- The final verification selects tests from the change: a graph-based selection such as
  `no-mistakes tests plan vitest --from-git-diff origin/main...HEAD --format paths` (and the
  Playwright equivalent), or an explicit list derived from the dependents of `applyDiscount`
  including `apps/web/e2e/cart.spec.ts`. It also confirms the before/after behavior (the second
  code now stacks and the cap holds) with a spec or a manual step.

FAIL if verification is vague ("run the tests", "make sure it works"), if steps have no command,
or if the final step runs only the helper's own unit test and nothing selected from the change.
