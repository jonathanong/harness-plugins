---
description: Guard. A review accepts a race test that holds a row lock and waits for two blocked writers to build the interleaving, because it asserts the final balance.
tags: [postgres-locking, guard, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this pull request (PostgreSQL 18, Node with `pg`, Vitest). `withdraw` is unchanged: it is one `UPDATE accounts SET balance_cents = balance_cents - $2 WHERE id = $1 AND balance_cents >= $2` and throws `InsufficientFunds` when no row is updated. The PR only adds a test.

```diff
--- /dev/null
+++ b/test/wallet/withdraw.race.test.ts
@@ -0,0 +1,34 @@
+import { expect, it } from 'vitest'
+import { pool } from '../helpers/db'
+import { createAccount } from '../helpers/accounts'
+import { waitForBlockedBackends } from '../helpers/locks'
+import { withdraw } from '../../src/wallet/withdraw'
+
+it('two withdrawals at once cannot overdraw the account', async () => {
+  const account = await createAccount({ balanceCents: 100 })
+
+  // Hold the row so both withdrawals queue behind us and then run back to back.
+  const blocker = await pool.connect()
+  await blocker.query('BEGIN')
+  await blocker.query('SELECT 1 FROM accounts WHERE id = $1 FOR UPDATE', [account.id])
+
+  const first = withdraw(account.id, 80)
+  const second = withdraw(account.id, 80)
+
+  // Polls pg_stat_activity until two backends wait on a lock, with a 5 s timeout.
+  await waitForBlockedBackends(pool, 2)
+  await blocker.query('COMMIT')
+  blocker.release()
+
+  const results = await Promise.allSettled([first, second])
+  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
+  expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1)
+
+  const { rows } = await pool.query('SELECT balance_cents FROM accounts WHERE id = $1', [
+    account.id,
+  ])
+  expect(rows[0].balance_cents).toBe(20)
+})
```

Reply in your message; you don't need to create files.
