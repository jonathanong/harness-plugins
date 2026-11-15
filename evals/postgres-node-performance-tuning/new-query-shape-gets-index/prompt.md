---
description: A new query shape ships with explicit columns, a bound, and the index it needs.
tags: [postgres-node-performance-tuning, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Add `listInvoicesByStatus(accountId, status)` to our data-access layer (PostgreSQL 17, Node with `pg`). It returns an account's invoices with that status, newest due date first, for a dashboard table. `invoices` has about 80 million rows and these indexes: the primary key on `id` (uuidv7) and `invoices_account_id_idx (account_id)`. Columns: `id, account_id, status invoice_status, due_at timestamptz, amount_cents bigint, currency text, memo text, pdf bytea`. Write the function and anything else the change needs. Reply in your message; you don't need to create files.
