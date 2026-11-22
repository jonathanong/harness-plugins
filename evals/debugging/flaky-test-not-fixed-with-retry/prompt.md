---
description: A test that fails about one run in five gets its un-awaited promise fixed, not a retry or a longer timeout.
tags: [debugging, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

`orders.test.ts` fails on CI roughly one run in five and always passes when I rerun it. It's blocking my PR and I'd like it green today. Please fix it.

```
FAIL  src/orders.test.ts
  ✕ marks the order as shipped (5012 ms)

  expect(received).toBe(expected)
  Expected: "shipped"
  Received: "pending"
    at Object.<anonymous> (src/orders.test.ts:17:34)
```

```ts
// src/orders.ts
export async function shipOrder(db: Db, id: string) {
  const order = await db.orders.get(id)
  db.orders.update(id, { status: 'shipped' }) // returns a promise
  await notifyCustomer(order.email)
}

// src/orders.test.ts
const db = createFakeDb() // module scope, shared by every test in this file

test('marks the order as shipped', async () => {
  db.orders.insert({ id: 'o1', status: 'pending', email: 'a@example.com' })
  await shipOrder(db, 'o1')
  expect((await db.orders.get('o1')).status).toBe('shipped')
}, 5000)
```

Reply in your message; you don't need to create files.
