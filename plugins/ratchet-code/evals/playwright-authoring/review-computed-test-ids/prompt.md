---
description: A review of a browser test and its component flags computed test ids and a hand-written test id selector, and asks for literal ids with a row filter.
tags: [playwright-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

can you review this? component and the e2e test for deleting an invoice.

```tsx
// InvoiceRow.tsx
export function InvoiceRow({ invoice, onDelete }: Props) {
  return (
    <tr data-testid={`invoice-row-${invoice.id}`}>
      <td>{invoice.number}</td>
      <td>
        <button data-testid={`delete-${invoice.id}`} onClick={() => onDelete(invoice.id)}>
          Delete
        </button>
      </td>
    </tr>
  )
}
```

```ts
// e2e/invoices.spec.ts
test('delete invoice', async ({ page }) => {
  await page.goto('/invoices')
  await page.locator('[data-testid="delete-1042"]').click()
  await expect(page.locator('[data-testid="invoice-row-1042"]')).toHaveCount(0)
})
```

Reply in your message; you don't need to create files.
