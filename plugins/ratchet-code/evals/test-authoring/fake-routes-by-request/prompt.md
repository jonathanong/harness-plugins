---
description: A fake for an HTTP client answers by request path, not by a queue of replies consumed in call order.
tags: [test-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

write a vitest test for loadDashboard. `fetchJson` is injected so no real network.

```ts
// dashboard.ts
export type FetchJson = (path: string) => Promise<unknown>

export async function loadDashboard(fetchJson: FetchJson, accountId: string) {
  const [account, invoices, usage] = await Promise.all([
    fetchJson(`/accounts/${accountId}`),
    fetchJson(`/accounts/${accountId}/invoices`),
    fetchJson(`/accounts/${accountId}/usage`),
  ])
  const { name, plan } = account as { name: string; plan: string }
  const unpaid = (invoices as Array<{ paid: boolean; cents: number }>).filter((i) => !i.paid)
  return {
    name,
    plan,
    unpaidCents: unpaid.reduce((sum, i) => sum + i.cents, 0),
    overLimit: (usage as { used: number; limit: number }).used > (usage as { limit: number }).limit,
  }
}
```

Reply in your message; you don't need to create files.
