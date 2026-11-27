# Receiving webhooks

The full rules behind the receiving checklist in [`SKILL.md`](../SKILL.md).

- **Verify the signature over the raw bytes.** Read the body as bytes and verify before parsing.
  Parsed and re-serialized JSON is not what was signed: key order, whitespace, and number format
  change. Verify exactly what the sender's scheme signs, such as `<id>.<timestamp>.<body>`.
- **Compare in constant time,** with `crypto.timingSafeEqual` on equal-length buffers, never `===`.
- **Accept more than one secret,** so the sender can rotate: try each active secret, or each
  signature in the header, until one matches.
- **Limit the body size** before reading it, and reject a larger request with 413. A sender
  that never sends more than a few hundred kilobytes gives no reason to buffer more.
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
