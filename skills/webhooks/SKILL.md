---
name: webhooks
description: Use when writing or reviewing a webhook receiver or sender - an endpoint a partner posts events to, or code that delivers events to customer URLs. Covers queues, raw payloads, and metrics on both sides, signatures over raw bytes, key rotation, replay windows, duplicate and out-of-order deliveries, retries, pausing and disabling endpoints, and checking a customer's URL.
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

## Receiving

- **Verify the signature over the raw bytes.** Read the body as bytes and verify before parsing.
  Parsed and re-serialized JSON is not what was signed: key order, whitespace, and number format
  change. Verify exactly what the sender's scheme signs, such as `<id>.<timestamp>.<body>`.
- **Compare in constant time,** with `crypto.timingSafeEqual` on equal-length buffers, never `===`.
- **Accept more than one secret,** so the sender can rotate: try each active secret, or each
  signature in the header, until one matches.
- **Reject a stale timestamp** when the signature covers one, so a captured delivery cannot be
  replayed later. Take the tolerance from the sender's documentation; a sender that re-signs each
  retry with a fresh timestamp allows a short one. Deduplication by event id still applies.
- **Nothing acts on an event until it is verified.** A check that reads only the request and
  local state runs before you acknowledge. A check that needs the network, such as fetching an
  unknown public key, runs in the worker after a provisional enqueue, as `service-boundaries`
  says; the worker verifies before it does anything else.
- **Enqueue by the sender's event id.** Make the job id `<source>:<event id>`, so a redelivery
  while the first job is queued is dropped. The worker still records the event id under a unique
  constraint, `INSERT INTO inbound_events (source, event_id, ...) ON CONFLICT DO NOTHING`, and
  stops when nothing was inserted, because a job id only dedupes while the job exists. Never use
  a lock for this.
- **Return 2xx only once the event is durable.** If recording or enqueueing fails, return 5xx, so
  the sender retries. A 2xx before the enqueue succeeded loses the event, and the sender will not
  send it again.
- **Do not trust arrival order.** A retried `invoice.payment_failed` can arrive after
  `invoice.paid`. Store the event's own time or sequence with the state it set, and write only
  when the event is newer; or treat the event as a hint and fetch the resource's current state
  from the sender's API in the worker.
- **Choose the status code by what a retry would do.** Return 2xx for an event type you do not
  handle, and for one you have already handled. Return 4xx only for a request that will never
  succeed, such as a bad signature. Return 5xx only for a failure a retry can fix.

## Sending

- **Record, commit, then enqueue.** Write the event and one delivery row per endpoint in the same
  transaction as the change that caused it. Enqueue after commit, and let a sweep re-enqueue
  pending deliveries the enqueue missed. The delivery row, not the job, says what is pending,
  delivered, or failed.
- **Give each event one id and keep it across retries,** so a receiver can deduplicate. Store the
  serialized body with the event and resend the same bytes; a payload rebuilt on retry can carry
  newer state under the old id.
- **Preserve order where you can.** Deliver one endpoint's events for one resource in the order
  they happened, with an ordering key of endpoint and resource, so `order.paid` does not overtake
  `order.created`. Put a per-resource sequence number or the event time in every payload, so a
  receiver can still order what the queue could not.
- **Sign every attempt** with HMAC-SHA256 over `<id>.<timestamp>.<body>`, using a secret unique to
  the endpoint, and send the id, timestamp, and signature in headers. Re-sign each attempt with a
  fresh timestamp. Store the secret encrypted, not hashed, since you must read it back, as
  [http-api-design](../http-api-design/SKILL.md) says for any secret. The
  [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md)
  specification defines a header format to follow.
- **Rotate keys with no downtime.** Rotating creates a new secret and keeps the old one active
  for an overlap window, such as 24 hours. During the overlap, sign every attempt with both and
  send both signatures, so the receiver can switch to the new secret at any moment without
  rejecting a delivery. Retire the old secret when the window ends.
- **Classify every response.** Only a 2xx is success. A 3xx, any other status, a timeout, a
  connection error, and a TLS error are failures that retry. `410 Gone` disables the endpoint.
  Record the status, latency, and error on the delivery row.
- **Retry for days, not seconds.** Exponential backoff with jitter over about three days, driven
  by the delivery row, not an in-process loop. Honor `Retry-After`.
- **Pause a host that is down.** A 503, a 429, or repeated timeouts and connection errors from one
  host pause every delivery to that host for a while, honoring `Retry-After` when sent, instead of
  each job finding out on its own. Deliveries wait and resume; none is dropped.
- **Disable an endpoint that stays broken.** When every delivery to an endpoint has failed for a
  set period, such as three days, or its DNS or TLS is misconfigured that long, disable it and
  tell its owner through another channel. Let the owner re-enable it and replay what it missed.
- **Bound each attempt.** The deadline reaches every phase of the call, as the Timeouts section of
  `service-boundaries` describes. The worker reads at most a small, fixed number of response
  bytes, and one slow endpoint has its own concurrency limit so it cannot hold every worker.
- **Check the address at delivery time.** A URL checked when it was saved can resolve elsewhere
  later. Resolve the host when each attempt connects, reject loopback, private, link-local
  (including cloud metadata), and unique-local addresses for IPv4 and IPv6, and connect to the
  address you checked. Do not follow redirects; a 3xx is a failed attempt. Routing every delivery
  through an egress proxy that filters internal addresses does the same job in one place.
- **Show the customer each attempt** (time, status code, latency) and let them redeliver an event.
  Do not show the response body; that turns the sender into a way to read internal pages.
- **Keep payloads small and stable.** Send the event type, the ids, and the fields a receiver
  needs, well under 20 KB; a receiver fetches the rest. Add a field freely; rename or remove one
  by expand and contract, as [expand-contract-migrations](../expand-contract-migrations/SKILL.md)
  describes for event fields. Never send a secret or a field the endpoint's owner may not see.

## Review

When reviewing a webhook change, check each rule above for the direction it covers, and state
the effect of a gap on the people involved: a customer charged twice, an invoice marked unpaid
after it was paid, a partner whose endpoint can read your internal network.
