---
description: A new table that is keyed by a UUIDv7 id gets no second wall-clock creation column.
tags: [postgres-schema-design, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the migration for a new table `acme_invoice_events` that records what happened to an invoice: which invoice, what kind of event (it is one of a handful of fixed kinds), who caused it (a user, sometimes nobody), and a free-form JSON note. Ids are UUIDv7 and we have a `invoices` and a `users` table already. Readers list the newest events for an invoice, so make that fast. Reply with the SQL in your message; you don't need to create files.
