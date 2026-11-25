---
name: webhooks
description: Use when writing or reviewing a webhook receiver or sender - an endpoint a partner posts events to, or code that delivers events to customer URLs. Covers verifying signatures over raw bytes, replay windows, duplicate and out-of-order deliveries, signing, retries, stable event ids, and checking a customer's URL at delivery time.
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
- **Acknowledge fast.** Verify, record the event, enqueue, and return 2xx. Do the work in a
  worker. A sender that times out retries, and slow work on the request path turns one event into
  several.
- **Deduplicate by the sender's event id** with a unique constraint:
  `INSERT INTO inbound_events (source, event_id, ...) ON CONFLICT DO NOTHING`. When nothing was
  inserted, return 2xx and stop. Never use a lock for this.
- **Do not trust arrival order.** A retried `invoice.payment_failed` can arrive after
  `invoice.paid`. Store the event's own time or sequence with the state it set, and write only
  when the event is newer; or treat the event as a hint and fetch the resource's current state
  from the sender's API in the worker.
- **Choose the status code by what a retry would do.** Return 2xx for an event type you do not
  handle, and for one you have already handled. Return 4xx only for a request that will never
  succeed, such as a bad signature. A 5xx or a timeout asks the sender to retry, so use it only
  for a failure a retry can fix.

## Sending

- **Record, commit, then deliver.** Write the event and one delivery row per endpoint in the same
  transaction as the change that caused it. Enqueue after commit, and let a sweep re-enqueue
  pending deliveries the enqueue missed. Never deliver inside the request that made the change.
- **Give each event one id and keep it across retries,** so a receiver can deduplicate. Store the
  serialized body with the event and resend the same bytes; a payload rebuilt on retry can carry
  newer state under the old id.
- **Sign every attempt** with HMAC-SHA256 over `<id>.<timestamp>.<body>`, using a secret unique to
  the endpoint, and send the id, timestamp, and signature in headers. Re-sign each attempt with a
  fresh timestamp. During rotation, sign with the old and the new secret and send both. The
  [Standard Webhooks](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md)
  specification defines a header format to follow.
- **Retry for days, not seconds.** Exponential backoff with jitter over about three days, from the
  delivery row, not an in-process loop. Only a 2xx is success. Honor `Retry-After`. Stop and
  disable the endpoint on `410 Gone`. When an endpoint fails for a long time, disable it and tell
  its owner through another channel.
- **Bound each attempt.** A timeout covers the connection and the whole response, and the worker
  reads at most a small, fixed number of response bytes. One slow endpoint gets its own
  concurrency limit so it cannot hold every worker.
- **Check the address at delivery time.** A URL checked when it was saved can resolve elsewhere
  later. Resolve the host when each attempt connects, reject loopback, private, link-local
  (including cloud metadata), and unique-local addresses for IPv4 and IPv6, and connect to the
  address you checked. Do not follow redirects; a 3xx is a failed attempt. Routing every delivery
  through an egress proxy that filters internal addresses does the same job in one place.
- **Show the customer each attempt** (time, status code, latency) and let them redeliver an event.
  Do not show the response body; that turns the sender into a way to read internal pages.
- **Keep payloads small and versioned.** Send the event type, the ids, and the fields a receiver
  needs, well under 20 KB; a receiver fetches the rest. Add fields freely, and change or remove
  one only with a new event version, as `expand-contract-migrations` describes for any contract.
  Never send a secret or a field the endpoint's owner may not see.

## Review

When reviewing a webhook change, check each rule above for the direction it covers, and state
the effect of a gap on the people involved: a customer charged twice, an invoice marked unpaid
after it was paid, a partner whose endpoint can read your internal network.
