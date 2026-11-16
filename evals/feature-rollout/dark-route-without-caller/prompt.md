---
description: A review of a diff that adds a table, a service, and a mounted route behind an off flag accepts the route having no caller yet.
tags: [feature-rollout, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this pull request before I merge it (Node, Express, PostgreSQL 18 with `pg`). A teammate
commented that the route is dead code because no page calls it, and that I should hold the table
and the service back until the settings page is ready. Are they right?

> **Add usage alerts API**
>
> Adds the `usage_alerts` table, `UsageAlertService`, and `PUT /v1/usage-alerts/:metric`.
> Nothing calls the route yet; the settings page comes later. `usage_alerts` is off everywhere.

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
+  async upsert(accountId: string, metric: string, threshold: number) {
+    const { rows } = await this.pool.query(
+      `INSERT INTO usage_alerts (account_id, metric, threshold)
+       VALUES ($1, $2, $3)
+       ON CONFLICT (account_id, metric) DO UPDATE SET threshold = EXCLUDED.threshold
+       RETURNING id, metric, threshold, created_at`,
+      [accountId, metric, threshold],
+    )
+    return rows[0]
+  }
+}
--- /dev/null
+++ b/src/routes/usage-alerts.ts
@@
+import { Router } from 'express'
+import { flags } from '../flags.ts'
+import { requireAccount } from '../auth.ts'
+import { parseThreshold } from '../validation.ts'
+import { usageAlerts } from '../services/index.ts'
+
+export const usageAlertsRouter = Router()
+
+usageAlertsRouter.put('/:metric', requireAccount, async (req, res) => {
+  if (!(await flags.enabled('usage_alerts', req.account.id))) return res.sendStatus(404)
+  const threshold = parseThreshold(req.body)
+  res.json(await usageAlerts.upsert(req.account.id, req.params.metric, threshold))
+})
--- a/src/app.ts
+++ b/src/app.ts
@@
 app.use('/v1/accounts', accountsRouter)
+app.use('/v1/usage-alerts', usageAlertsRouter)
--- a/src/flags.ts
+++ b/src/flags.ts
@@
+defineFlag('usage_alerts', { default: false, description: 'Usage alerts API' })
--- /dev/null
+++ b/src/routes/usage-alerts.test.ts
@@
+import request from 'supertest'
+import { expect, test } from 'vitest'
+import { app } from '../app.ts'
+import { createAccount, enableFlag } from '../../test/helpers.ts'
+
+test('PUT stores the threshold when the flag is on', async () => {
+  const account = await createAccount()
+  await enableFlag('usage_alerts', account.id)
+  const res = await request(app)
+    .put('/v1/usage-alerts/api_calls')
+    .set('authorization', `Bearer ${account.token}`)
+    .send({ threshold: 5000 })
+  expect(res.status).toBe(200)
+  expect(res.body).toMatchObject({ metric: 'api_calls', threshold: '5000' })
+})
+
+test('PUT is a 404 while the flag is off', async () => {
+  const account = await createAccount()
+  const res = await request(app)
+    .put('/v1/usage-alerts/api_calls')
+    .set('authorization', `Bearer ${account.token}`)
+    .send({ threshold: 5000 })
+  expect(res.status).toBe(404)
+})
```

Reply in your message; you don't need to create files.
