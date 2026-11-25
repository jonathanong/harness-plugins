# Sending webhooks

The full rules behind the sending checklist in [`SKILL.md`](../SKILL.md).

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
  [http-api-design](../../http-api-design/SKILL.md) says for any secret. The
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
- **Only public hostnames.** At save time, require `https:`, a hostname rather than an IP
  literal, the default port or a short allowed list, no user and password in the URL, and a
  public domain: reject `localhost`, single-label names, and internal suffixes such as `.local`,
  `.internal`, and `.lan`. This catches mistakes early; the delivery-time check above is still
  what stops a hostname that later resolves inward.
- **Verify the endpoint when it is saved.** Send a signed test event and require a 2xx before the
  endpoint goes live, so a mistyped URL fails in front of the customer, not after days of
  retries.
- **Send only the event types an endpoint subscribed to.** An endpoint lists the types it wants;
  everything else is never enqueued for it.
- **Pool connections per host.** Keep one bounded keep-alive pool per destination host, so
  repeated deliveries reuse a TLS connection and one host cannot take every socket.
- **Rate-limit per customer and per host.** Give each customer and each destination host its own
  rate and concurrency limit, so one customer's burst of events, or one slow host, cannot delay
  every other customer's deliveries.
- **Document the guarantees** for the people who build receivers: at least once, order not
  guaranteed beyond the sequence field, the retry schedule, the signature format, and how
  rotation works.
- **Keep payloads small and stable.** Send the event type, the ids, and the fields a receiver
  needs, well under 20 KB; a receiver fetches the rest. Add a field freely; rename or remove one
  by expand and contract, as [expand-contract-migrations](../../expand-contract-migrations/SKILL.md)
  describes for event fields. Never send a secret or a field the endpoint's owner may not see.
