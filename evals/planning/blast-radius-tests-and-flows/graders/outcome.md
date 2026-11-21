---
type: llm
---

Grade the final message, only for what the plan says is affected.

PASS if the plan names all three kinds of affected things for this change:

- tests that exercise the helper: the helper's unit tests and at least one dependent's test
  (for example `emails/invoice.test.ts`);
- the browser test: `e2e/checkout.spec.ts`, as something to re-run or update;
- user-visible surfaces that change or could break: at least the checkout page and the invoice
  email, named as what a customer sees, not only as importing files.

FAIL if the plan lists only the importing code files, or only the helper's own unit test, or
names no browser spec, or names no user-visible surface.
