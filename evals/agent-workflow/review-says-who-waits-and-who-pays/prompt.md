---
description: A review of a retry added around a payment call in the checkout request says what it does to shoppers - how long a checkout can hang and that a retried charge can bill twice - not only what the code does.
tags: [agent-workflow, skill-fired, review, priority-high]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff for me? Node, Express. `placeOrder` is the handler behind the "Pay now" button.
The provider has been flaky this week and this is meant to stop orders failing.

```diff
 export async function placeOrder(req: Request, res: Response) {
   const order = await createPendingOrder(req.body)
-  const charge = await payments.charge({ amount: order.total, card: req.body.cardToken })
+  const charge = await withRetry(
+    () => payments.charge({ amount: order.total, card: req.body.cardToken }),
+    { attempts: 4, backoffMs: [2000, 5000, 10000] },
+  )
   await markPaid(order.id, charge.id)
   res.json({ orderId: order.id })
 }
```

`payments.charge` posts to the provider with a 15-second timeout and no idempotency key.
`withRetry` retries on any thrown error, including timeouts.

Reply in your message; you don't need to create files.
