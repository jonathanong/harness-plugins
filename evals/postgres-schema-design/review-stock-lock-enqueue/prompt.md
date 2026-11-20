---
description: A review of a stock lock added to checkout keeps the oversell protection and moves the enqueues that now run under the lock to after commit.
tags: [postgres-schema-design, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. We oversold a few products during a launch, so this locks the stock rows during checkout (PostgreSQL 17, Node with `pg`). `receipts` and `warehouse` are BullMQ queues.

```diff
 export async function placeOrder(pool: Pool, cartId: string) {
   const client = await pool.connect()
   try {
     await client.query('BEGIN')
     const items = await loadCartItems(client, cartId)
+    const { rows: stock } = await client.query(
+      'SELECT sku, qty FROM stock WHERE sku = ANY($1) FOR UPDATE',
+      [items.map((item) => item.sku)],
+    )
+    for (const item of items) {
+      const row = stock.find((s) => s.sku === item.sku)
+      if (!row || row.qty < item.qty) throw new OutOfStockError(item.sku)
+    }
     for (const item of items) {
       await client.query('UPDATE stock SET qty = qty - $1 WHERE sku = $2', [item.qty, item.sku])
     }
     const orderId = await insertOrder(client, cartId, items)
     await receipts.add('send-receipt', { orderId })
     await warehouse.add('reserve-shelf', { orderId })
     await client.query('COMMIT')
     return orderId
   } catch (error) {
     await client.query('ROLLBACK')
     throw error
   } finally {
     client.release()
   }
 }
```

Reply in your message; you don't need to create files.
