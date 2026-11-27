---
description: A review of a diff that takes an advisory lock to keep the last admin from being removed asks for the lock to be deleted and the guard left best effort.
tags: [postgres-locking, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. It stops an organization from losing its last admin (PostgreSQL 17, Node with `pg`). Admin changes are rare: a handful per organization per year.

```diff
 export async function removeAdmin(tx: Transaction, orgId: string, userId: string) {
+  // two admins removing each other at the same moment must not both succeed
+  await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [orgId])
+  const { rows } = await tx.query(
+    `SELECT count(*)::int AS admins FROM org_members WHERE org_id = $1 AND role = 'admin'`,
+    [orgId],
+  )
+  if (rows[0].admins <= 1) throw new LastAdminError(orgId)
   await tx.query(
     `UPDATE org_members SET role = 'member' WHERE org_id = $1 AND user_id = $2 AND role = 'admin'`,
     [orgId, userId],
   )
 }
```

Reply in your message; you don't need to create files.
