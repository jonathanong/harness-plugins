---
description: A review of a capped dispatcher flags a predicate no index can serve and a job id keyed only by the entity.
tags: [bounded-iteration, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. It adds a dispatcher that our scheduler runs every 5 minutes (PostgreSQL 17, Node with `pg`, BullMQ). `accounts` has about 30 million rows, with indexes on `id` and `updated_at`.

```diff
+export async function dispatchAccountSyncs(pool: Pool, queue: Queue) {
+  const { rows } = await pool.query(
+    `SELECT id FROM accounts
+      WHERE updated_at > synced_at OR plan_changed_at IS NOT NULL
+      ORDER BY id
+      LIMIT 500`,
+  )
+  for (const row of rows) {
+    await queue.add('sync-account', { accountId: row.id }, { jobId: `sync-account:${row.id}` })
+  }
+  return { dispatched: rows.length, more: rows.length === 500 }
+}
```

Reply in your message; you don't need to create files.
