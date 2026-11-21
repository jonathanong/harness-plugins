---
type: llm
---

Grade the final message.

PASS if both hold:

- It flags that the test ids are computed from a template (`invoice-row-${invoice.id}`,
  `delete-${invoice.id}`) and asks for fixed string literals, for example a literal `invoice-row`
  on the row and a literal id on the button.
- It flags the hand-written `page.locator('[data-testid="..."]')` selector and asks for
  `getByTestId` (or a role locator), and shows or describes narrowing the repeated row by content the row shows, such
  as its invoice number: `getByTestId('invoice-row').filter({ hasText: invoiceNumber })`.

FAIL if it approves the computed ids, keeps the attribute-selector locators in its suggested
code, or suggests narrowing the row by a computed id.
