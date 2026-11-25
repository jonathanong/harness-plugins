---
description: Writing a sweep that pushes unsynced invoices to an accounting provider, moves a failed invoice out of the front of the selection (a next-attempt time with backoff, or a cursor past it) and marks it failed after a set number of attempts.
tags: [bounded-iteration, skill-fired, sweep]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I need a job that pushes new invoices to our accounting provider. PostgreSQL 17, Node 24 with
`pg`; it'll run every 5 minutes. We make about 3,000 invoices a day.

The table is `invoices (id uuid primary key, created_at timestamptz not null, synced_at
timestamptz, ...)`. `loadInvoice(id)` builds the payload and
`accounting.createInvoice(payload, { idempotencyKey })` sends it; it throws on any non-2xx.

Write `syncInvoices()` and any migration it needs. Reply in your message; you don't need to
create files.
