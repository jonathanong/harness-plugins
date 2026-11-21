---
description: A review of a catch block that fetches the customer's name to log it flags the extra query on the failure path and the personal data, and asks for the identifier instead.
tags: [structured-logging, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this before I merge. Support wanted the customer's name in the log when a charge fails, and I only do the lookup on the failure path so it costs nothing on the happy path.

```ts
export async function chargeInvoice(invoice: { id: string; customerId: string; cents: number }) {
  try {
    return await gateway.charge(invoice.customerId, invoice.cents)
  } catch (err) {
    const customer = await customers.findById(invoice.customerId)
    logger.error(
      `Charge failed for ${customer.name} on invoice ${invoice.id}: ${(err as Error).message}`,
    )
    throw err
  }
}
```

Reply in your message; you don't need to create files.
