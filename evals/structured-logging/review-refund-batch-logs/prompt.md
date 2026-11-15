---
description: A review of new log lines asks for a static message with structured fields and objects to the lookups added only to fill the log.
tags: [structured-logging, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. It adds logging to our nightly refund batch (pino, a few thousand items a night).

```diff
 export async function processRefunds(batch: RefundItem[]) {
   for (const item of batch) {
+    const order = await orders.findById(item.orderId)
+    const customer = await customers.findById(order.customerId)
+    const account = await accounts.findById(customer.accountId)
+    logger.info(`refunding ${item.amount} on order ${order.id} for ${account.email}`)
     try {
       await payments.refund(item.orderId, item.amount)
     } catch (error) {
+      logger.error(`refund failed for order ${order.id} (${account.email}): ${error.message}`)
       throw error
     }
   }
 }
```

Reply in your message; you don't need to create files.
