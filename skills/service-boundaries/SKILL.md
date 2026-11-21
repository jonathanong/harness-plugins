---
name: service-boundaries
description: Use when writing or reviewing code that calls another service or a third-party API, handles a webhook, reads another service's data, or puts deployment topology in a repository. Keep the boundary between services, and between a service and an outside partner, explicit - own your data, map foreign payloads once, keep raw bodies for replay, and test the contract.
---

# Service boundaries

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A boundary holds when each side can change its insides without asking the other. These rules
keep one side's shapes and storage from leaking into the other.

## Another service's data

Do not read or write another service's database, cache, or queue directly. Call its API or
consume the events it publishes. Direct access couples you to its schema, skips its validation
and authorization, and means its owner cannot migrate without breaking you.

## A partner's payload

- Map a partner's payload to your own types once, at the edge. Nothing past the mapping layer
  sees the partner's field names, enums, or nesting.
- Validate there too. Reject or quarantine what does not parse; do not pass a partial object
  inward.
- When the partner changes its format, the change then stops at one module.

## Inbound events

Route an event by where the sender is and what its auth needs. For a new source, read
[`references/event-ingress.md`](references/event-ingress.md) for the decision order.

- A check is self-contained only if it reads nothing but the request bytes and local state (your
  own database or cache). Any outbound network request, such as fetching a key or calling the
  sender's API, makes it not self-contained, however it looks at the call site.
- Run self-contained checks on the request path, then enqueue and return. Move a check that needs
  the network into the worker after a provisional enqueue. A request handler cannot retry or back
  off, and an outbound call there makes your acknowledgment depend on someone else's uptime.
- Do not send an event from inside your own cloud out to your public endpoint and back in. It adds
  latency, a public attack surface, and a shared secret to rotate, for a hop two internal
  resources can make directly.
- When the sender is AWS-native (SNS, EventBridge, an S3 event) and can target SQS, deliver to a
  queue and consume it with a worker. Use a Lambda only when no native queue target exists, and
  keep it to a self-contained check plus an enqueue; other I/O belongs in a worker.
  SQS gives at-least-once delivery, a dead-letter queue, and redrive without building them.
- Push first. Make every source arrive by push or long-poll. A scheduled poll is a safety net that
  the push path converges on, not the trigger. If a schedule is the only way data arrives, add the
  missing enqueue path rather than shortening the interval.

## Raw bodies

Store the raw request or response body from a partner before mapping it, with a retention period
and access limits. When a mapping fails or a partner disputes what was sent, the raw body is the
only evidence, and it lets the failure be replayed after the fix.

- Set the retention to the window in which a replay is useful, and delete after it.
- Treat the store as sensitive: it holds whatever the partner sent, including personal data.

## Testing the boundary

- Test the mapping layer with captured real responses, replayed from files. Hand-written payloads
  encode what you believe the partner sends, which is the thing in doubt.
- Refresh the captures when the partner's format changes, and scrub secrets and personal data
  before committing them.
- Where two services you run depend on an unwritten agreement (a field always present, an event
  order, a status meaning), add a contract test on the side you own. An implicit contract breaks
  at deploy time, with both sides' own tests passing.

## Topology

Keep deployment topology out of application repositories: instance counts, scaling limits,
resource identifiers, region lists. Put it in the infrastructure repository and pass the
application what it needs as configuration. Application code that knows its own topology has to
be released to change it.
