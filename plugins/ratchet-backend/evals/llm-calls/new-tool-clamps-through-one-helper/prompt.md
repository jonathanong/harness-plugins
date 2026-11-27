---
description: A new agent tool that takes a limit and a day range from the model bounds both through one shared helper, not with arithmetic written into the tool
tags: [llm-calls, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our support agent needs to look up refunds. Add a `list_refunds` tool next to the two we have:
it takes a customer id, how many days back to look, and how many refunds to return, and calls
`refunds.listForCustomer(customerId, { since, limit })`.

Reply with the changed code. Don't edit any files.

```ts
// src/agent/tools.ts
import { z } from 'zod'
import { orders, tickets } from '../data/index.js'
import type { Actor } from '../auth.js'

export const tools = {
  list_orders: {
    description: 'List a customer’s most recent orders.',
    input: z.object({ customerId: z.string().uuid(), limit: z.number().int() }),
    async run(actor: Actor, input: { customerId: string; limit: number }) {
      await actor.assertCanReadCustomer(input.customerId)
      return orders.listForCustomer(input.customerId, { limit: Math.min(input.limit, 50) })
    },
  },

  search_tickets: {
    description: 'Search a customer’s support tickets.',
    input: z.object({ customerId: z.string().uuid(), query: z.string(), limit: z.number().int() }),
    async run(actor: Actor, input: { customerId: string; query: string; limit: number }) {
      await actor.assertCanReadCustomer(input.customerId)
      return tickets.search(input.customerId, input.query, { limit: input.limit })
    },
  },
}
```
