---
description: A review of one reconciler job that runs several stages with a shared budget and error list asks for one job per stage.
tags: [bounded-iteration, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff before I merge it (Node, PostgreSQL 18 with `pg`, BullMQ). The job runs every 10 minutes.

```diff
+type Budget = { pages: number }
+
+export async function reconcileAccounts(job: Job) {
+  const budget: Budget = { pages: 50 }
+  const errors: Error[] = []
+  const cursors: Record<string, string | null> = job.data.cursors ?? {}
+
+  for (const stage of [
+    expireTrials,
+    syncSeats,
+    repairInvoices,
+    closeOrphanedSessions,
+    pruneDraftProjects,
+  ]) {
+    try {
+      cursors[stage.name] = await stage(budget, cursors[stage.name] ?? null)
+    } catch (err) {
+      errors.push(err as Error)
+    }
+  }
+
+  await job.updateData({ ...job.data, cursors })
+  if (errors.length > 0) throw new AggregateError(errors, 'reconcile failed')
+}
```

Each stage reads at most `budget.pages` pages of 500 rows, decrements `budget.pages` for each page it reads, and returns its next cursor. Reply in your message; you don't need to create files.
