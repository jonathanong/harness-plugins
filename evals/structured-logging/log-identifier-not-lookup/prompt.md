---
description: Asked to log a customer's email that sits behind two lookups, the agent logs the identifier with a static message and adds no queries.
tags: [structured-logging, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Add logging to this so we can debug failed refunds. I want the order id, the refund id, the customer's email, and the error. We use pino.

```ts
export async function refundOrder(orderId: string, amount: number) {
  const order = await orders.findById(orderId) // { id, customerId, total }
  const refund = await payments.refund(order.id, amount)
  if (refund.status === 'failed') {
    throw new RefundFailedError(refund.id)
  }
  return refund
}
```

The email is on the account: `customers.findById(order.customerId)` then `accounts.findById(customer.accountId)`. Reply in your message; you don't need to create files.
