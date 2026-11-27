---
description: A new guard whose failure needs an order id and two amounts; the details belong on the error, not in its message
tags: [error-handling, skill-fired, errors]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We keep getting refunds that are bigger than what's left on the order. Add a guard to
`refundOrder` so those are rejected.

When it trips I need to be able to tell which order it was, how much was asked for, and how
much was left, both in the API response for the support tool and in our error tracker.

Reply with the changed code. Don't edit any files.

```ts
// src/orders/refund.ts
import { db } from '../db.js'
import { payments } from '../payments.js'

export async function refundOrder(orderId: string, amountCents: number) {
  const order = await db.orders.findById(orderId)
  if (!order) {
    throw new Error(`Order ${orderId} not found`)
  }
  if (order.status !== 'paid') {
    throw new Error(`Order ${orderId} is ${order.status}, cannot refund`)
  }

  const refund = await payments.refund(order.paymentId, amountCents)
  await db.orders.addRefund(orderId, refund.id, amountCents)
  return refund
}
```

```ts
// src/http/error-handler.ts
import type { ErrorRequestHandler } from 'express'
import { tracker } from '../tracker.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  tracker.captureException(err)
  res.status(500).json({ error: err.message })
}
```

`order.refundedCents` and `order.totalCents` are both on the order row.
