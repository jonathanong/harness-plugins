---
description: A review of new tests asks for an ordinary user to be created through the production factory, and accepts a direct insert for legacy data production can no longer create.
tags: [test-authoring, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. `createUser` is what signup calls: it inserts the user, assigns the free plan, and creates the user's `notification_settings` row with the weekly digest turned on. Neither `createUser` nor `sendWeeklyDigest` is part of the diff.

```diff
+import { randomUUID } from 'node:crypto'
+import { describe, expect, it } from 'vitest'
+import { db } from '../db'
+import { sendWeeklyDigest } from './weekly-digest'
+
+describe('sendWeeklyDigest', () => {
+  it('sends to active users', async () => {
+    const id = randomUUID()
+    await db.query(`INSERT INTO users (id, email, status) VALUES ($1, $2, 'active')`, [
+      id,
+      `${id}@test.example`,
+    ])
+    const sent = await sendWeeklyDigest()
+    expect(sent).toContain(id)
+  })
+
+  it('skips users imported without a plan', async () => {
+    // createUser always assigns a plan; only the 2019 import left plan_id NULL
+    const id = randomUUID()
+    await db.query(
+      `INSERT INTO users (id, email, status, plan_id) VALUES ($1, $2, 'active', NULL)`,
+      [id, `${id}@test.example`],
+    )
+    const sent = await sendWeeklyDigest()
+    expect(sent).not.toContain(id)
+  })
+})
```

Reply in your message; you don't need to create files.
