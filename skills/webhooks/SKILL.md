---
name: webhooks
description: Use when writing or reviewing a webhook receiver or sender - an endpoint a partner posts events to, or code that delivers events to customer URLs. Covers queues, raw payloads, and metrics on both sides, signatures over raw bytes, key rotation, replay windows, duplicate and out-of-order deliveries, retries, pausing and disabling endpoints, SSRF, and rate limits.
---

# Webhooks

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

These rules are for runtime code. A test may post to `localhost`, sign with a fixed secret, and
replay a captured delivery; scrub a captured payload before committing it.

Delivery is at least once in both directions: the same event can arrive twice, late, or out of
order. Every rule below follows from that.

Where an inbound event enters (a public endpoint, a queue, a cloud event source) and how its raw
body is stored are in [service-boundaries](../service-boundaries/SKILL.md). Queue design is in
[glide-mq](../glide-mq/SKILL.md).

## A queue on both sides

A webhook never does its work in the request that carries it, in either direction.

- **Inbound:** verify, enqueue a job, and return 2xx. The worker does the work.
- **Outbound:** the change that causes an event enqueues a delivery, and a job makes the HTTP
  call. No request handler calls a customer's URL.

A queue gives each side retries, backoff, and isolation from the other side's uptime. A request
handler has none of them.

## Raw payloads and metrics, both sides

- **Store every raw payload with a TTL.** Keep the exact bytes received, and the exact bytes sent,
  in a store whose rows expire on their own, such as a table that a retention job empties or
  object storage with a lifecycle rule. Without the bytes, a mapping bug cannot be replayed and a
  partner's dispute cannot be answered; without the TTL, the store grows forever and holds
  personal data longer than anyone needs it. A sent payload outlives its retries and the window
  in which a customer may redeliver it. How long to keep them, and the access limits, are in
  the "Raw bodies" section of `service-boundaries`.
- **Emit metrics on both sides.** Inbound: deliveries received, signature failures, duplicates
  dropped, enqueue failures, and the age of the oldest unprocessed event. Outbound: attempts by
  result (2xx, 4xx, 5xx, timeout, connection error), latency, time from event to successful
  delivery, pending deliveries, paused hosts, and disabled endpoints. Alert on a rise in signature
  failures, enqueue failures, or the oldest pending age.
- **Keep metric labels bounded:** source, event type, and status class. An endpoint, customer, or
  event id as a label creates a series per value; that detail belongs on the delivery row.

## Receiving checklist

Read [`references/receiving.md`](references/receiving.md) for the reason and detail of each rule.

- Verify the signature over the raw bytes, in constant time, against every active secret.
- Limit the body size before reading it.
- Reject a stale signed timestamp.
- Act on nothing until it is verified; a check that needs the network runs in the worker.
- Enqueue with the sender's event id as the job id, and record the id under a unique constraint.
- Return 2xx only once the event is enqueued; return 5xx when that fails.
- Do not trust arrival order: compare the event's time or sequence, or fetch current state.
- Choose 2xx, 4xx, or 5xx by what a retry would do.

## Sending checklist

Read [`references/sending.md`](references/sending.md) for the reason and detail of each rule.

- Record the event and its deliveries in the change's transaction, enqueue after commit, sweep
  what was missed.
- One event id and the same bytes on every retry.
- Order per endpoint and resource, with a sequence in the payload.
- Sign `<id>.<timestamp>.<body>` per endpoint; store the secret encrypted; rotate with an overlap
  and both signatures, for no downtime.
- Only 2xx is success; retry with backoff for days; stop on `410`.
- Pause a host that returns 503 or 429; disable an endpoint that stays broken and tell its owner.
- Bound each attempt; pool connections per host; rate-limit per customer and per host.
- SSRF: public hostnames only at save time, and at each delivery connect only to a checked public
  address and follow no redirects.
- Verify an endpoint with a test event when it is saved; send only subscribed event types.
- Show the customer each attempt, never the response body; let them redeliver.
- Keep payloads small; change fields by expand and contract; document the guarantees.

## Review

When reviewing a webhook change, check each rule above for the direction it covers, and state
the effect of a gap on the people involved: a customer charged twice, an invoice marked unpaid
after it was paid, a partner whose endpoint can read your internal network.
