---
name: structured-logging
description: Write log lines with a static message and structured fields, and load their context without extra queries. Use when adding or reviewing log statements, logger calls, or the data a log line carries.
---

# Structured logging

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

## Static message, structured fields

Keep the message a fixed string and put every value that varies in a field.

```ts
// Avoid: each call produces a different message.
logger.info(`refund ${refundId} for order ${orderId} failed: ${error.message}`)

// Prefer: one message, searchable fields.
logger.info({ refundId, orderId, err: error }, 'refund failed')
```

- A static message can be counted, grouped, alerted on, and searched for in the code. An
  interpolated one is a new string every time.
- Fields can be filtered and joined without parsing text, and a redaction rule can target a field
  by name.
- Use the same field name for the same thing everywhere (`orderId`, not `order` in one place and
  `order_id` in another).
- Pass the error object as a field so the logger records its type and stack. Do not flatten it to
  its message.

## Context without extra queries

Do not load the context for a log line by walking relations one at a time, such as fetching the
order, then its customer, then the customer's account, only to log their ids. That adds queries
to every call for the sake of a log line, and runs them even when the level is disabled.

- Select the identifiers the log needs in the query that already runs.
- Bind request-wide context (request id, tenant, user) once to a child logger and pass that down.

## What not to log

Do not put secrets, tokens, or full request bodies in fields. Log identifiers, and look the
record up when it is needed.
