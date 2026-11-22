---
description: A review of a state transition that selects the row FOR UPDATE and then runs an update that is already conditional asks for the select to be deleted.
tags: [postgres-locking, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick review before I merge? PostgreSQL 17, Node with `pg`. Two support agents at Acme can click "claim" on the same ticket at once; only one should get it.

```ts
export async function claimTicket(tx: Transaction, ticketId: string, agentId: string) {
  const { rows } = await tx.query('SELECT status FROM tickets WHERE id = $1 FOR UPDATE', [ticketId])
  if (rows[0]?.status !== 'open') throw new Conflict('ticket is not open')
  const res = await tx.query(
    "UPDATE tickets SET status = 'claimed', claimed_by = $2 WHERE id = $1 AND status = 'open'",
    [ticketId, agentId],
  )
  if (res.rowCount !== 1) throw new Conflict('ticket is not open')
}
```

Reply in your message; you don't need to create files.
