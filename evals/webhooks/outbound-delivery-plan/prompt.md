---
description: A review of a plan to send webhooks to customer URLs asks for delivery from a queue after commit, a stable event id across retries, a signed timestamp, and an address check at delivery time without following redirects.
tags: [webhooks, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We're adding outgoing webhooks to our project-management app. Customers paste a URL in settings
and we POST to it when a task changes. Here's the plan; poke holes in it before I build it.
Node 24, Fastify, PostgreSQL, glide-mq for background jobs.

1. In `updateTask`, after the `UPDATE` succeeds and before we respond, call
   `deliver(endpoint, { type: 'task.updated', task })` for each of the account's endpoints.
2. `deliver` does `fetch(endpoint.url, { method: 'POST', body: JSON.stringify(payload),
   signal: AbortSignal.timeout(5000) })`. On a non-2xx or an error it waits 1 s and tries
   again, up to 3 times, then gives up and logs a warning.
3. Each retry builds the payload again, with a fresh `crypto.randomUUID()` as its `id`.
4. We sign with `X-Signature: hex(HMAC-SHA256(accountSecret, body))`, one secret per account.
5. When a customer saves a URL we check it with `new URL()`, require `https:`, and resolve the
   hostname once to make sure it isn't a private IP.

Reply in your message; you don't need to create files.
