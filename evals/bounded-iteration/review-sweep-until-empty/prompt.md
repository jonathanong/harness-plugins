---
description: A review of a diff that adds a cleanup loop running until no rows remain asks for a per-run cap and a resumable position.
tags: [bounded-iteration, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff that adds a sweep job. It runs every 10 minutes from our scheduler (PostgreSQL 17, Node with `pg`). `sessions` has about 400 million rows.

```diff
+export async function purgeExpiredSessions(pool: Pool) {
+  let deleted = 0
+  while (true) {
+    const { rowCount } = await pool.query(
+      `DELETE FROM sessions
+        WHERE id IN (
+          SELECT id FROM sessions
+           WHERE last_seen_at + ttl < now() OR revoked_at IS NOT NULL
+           LIMIT 1000)`,
+    )
+    deleted += rowCount ?? 0
+    if (!rowCount) break
+  }
+  logger.info(`purged ${deleted} sessions`)
+}
```

Reply in your message; you don't need to create files.
