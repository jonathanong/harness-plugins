---
description: Dropping a partial index to fix one query makes the agent recheck other queries that use that index.
tags: [postgres-node-performance-tuning, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use node-postgres. `listOpenInvoices` is slow, and I think the partial index `invoices_open_idx ON invoices (account_id, due_at) WHERE status = 'open'` is the problem, so I plan to replace it with `invoices_account_idx ON invoices (account_id)`. The SQL for the invoice queries is assembled in `src/invoices/queryBuilders.ts` and run from several services and jobs. Write the migration and say what else you will check before shipping it. Reply in your message; you don't need to create files.
