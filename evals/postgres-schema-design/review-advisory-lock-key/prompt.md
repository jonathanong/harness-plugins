---
description: Guard. A review of an advisory lock the author justified checks its key, and does not reject the lock on principle.
tags: [postgres-schema-design, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this pull request (PostgreSQL 18, Node with `pg`).

> **Serialize first-time setup of an organization's billing account**
>
> `ensureBillingAccount` runs on every checkout. On the first checkout for an organization it
> creates a `billing_accounts` row, three `billing_ledgers` rows, and a default `price_book` copied
> from a template, in one transaction. Two first checkouts at once created two price books. A unique
> constraint on `billing_accounts (org_id)` stops the second account, but the second transaction
> has already copied a price book by then, and the copy is hundreds of rows. We tried
> `SERIALIZABLE`: during the nightly bulk import every organization hits this path, and almost
> every transaction failed with `40001`. This takes a transaction-scoped advisory lock per
> organization instead, so the second caller waits and then finds the account.

```diff
 export async function ensureBillingAccount(tx: Transaction, orgId: string) {
+  await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [orgId])
   const existing = await findBillingAccount(tx, orgId)
   if (existing) return existing
   return createBillingAccountWithPriceBook(tx, orgId)
 }
```

This file is already on main and is not in the diff:

```ts
// src/seats/sync.ts
export async function syncSeats(tx: Transaction, orgId: string) {
  await tx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [orgId])
  // recounts seats from the identity provider; takes up to 30 seconds for large organizations
}
```

Reply in your message; you don't need to create files.
