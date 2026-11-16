---
description: A review of a diff that adds a table and a service with no route, tool, or job asks for a registered entry point in the same change.
tags: [feature-rollout, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this pull request before I merge it (Node, Express, PostgreSQL 17 with `pg`).

> **Add usage alert storage**
>
> Adds the `usage_alerts` table and `UsageAlertService`. The API routes and the notifier that
> sends the alerts come in a follow-up pull request, so this one stays small.

```diff
--- /dev/null
+++ b/migrations/0042_usage_alerts.sql
@@
+CREATE TABLE usage_alerts (
+  id uuid PRIMARY KEY DEFAULT uuidv7(),
+  account_id uuid NOT NULL REFERENCES accounts (id),
+  metric text NOT NULL,
+  threshold bigint NOT NULL CHECK (threshold > 0),
+  created_at timestamptz NOT NULL DEFAULT now(),
+  UNIQUE (account_id, metric)
+);
--- /dev/null
+++ b/src/services/usage-alerts.ts
@@
+import type { Pool } from 'pg'
+
+export class UsageAlertService {
+  constructor(private readonly pool: Pool) {}
+
+  async create(accountId: string, metric: string, threshold: number) {
+    const { rows } = await this.pool.query(
+      `INSERT INTO usage_alerts (account_id, metric, threshold)
+       VALUES ($1, $2, $3)
+       ON CONFLICT (account_id, metric) DO UPDATE SET threshold = EXCLUDED.threshold
+       RETURNING id, account_id, metric, threshold, created_at`,
+      [accountId, metric, threshold],
+    )
+    return rows[0]
+  }
+
+  async listForAccount(accountId: string) {
+    const { rows } = await this.pool.query(
+      `SELECT id, metric, threshold, created_at FROM usage_alerts
+       WHERE account_id = $1 ORDER BY metric`,
+      [accountId],
+    )
+    return rows
+  }
+}
--- /dev/null
+++ b/src/services/usage-alerts.test.ts
@@
+import { expect, test } from 'vitest'
+import { UsageAlertService } from './usage-alerts.ts'
+import { createAccount, pool } from '../../test/db.ts'
+
+test('create upserts one alert per account and metric', async () => {
+  const account = await createAccount()
+  const service = new UsageAlertService(pool)
+  await service.create(account.id, 'api_calls', 1000)
+  await service.create(account.id, 'api_calls', 5000)
+  expect(await service.listForAccount(account.id)).toMatchObject([
+    { metric: 'api_calls', threshold: '5000' },
+  ])
+})
```

Those are all the files in the pull request. Reply in your message; you don't need to create files.
