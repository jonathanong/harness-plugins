---
description: New tables for a customer identified by a short code reference a generated id, not the text code.
tags: [postgres-schema-design, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We're building billing for a new product on PostgreSQL 17. Customers are known everywhere by a short code such as `ACME` or `GLOBEX`; support types it into the admin search and it appears in URLs. Write the migration for `customers`, `invoices` (several per customer), and `invoice_lines` (several per invoice, each with a description and an amount). Reply in your message; you don't need to create files.
