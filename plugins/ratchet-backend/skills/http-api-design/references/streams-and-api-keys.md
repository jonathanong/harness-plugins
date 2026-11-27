# Server-sent events and API keys

## Server-sent events

- Only a connection reset and a premature close are benign errors on a stream; they mean the
  client left. Log and surface every other error, since it is a real failure.
- Close the subscription (the listener, the queue read, the database cursor) when the client
  disconnects. A stream that outlives its client leaks a subscription per dropped connection.
- Recover a reconnect from durable state, not from what the old connection held in memory. Send
  an event id and resume from the stored record after it; the server may have restarted.

## API keys

- Validate cheapest first, so a bad key costs the least. Check structure or an HMAC with no I/O,
  then a probabilistic filter of known keys, then the database. Most invalid keys never reach
  the database.
- Show a raw secret once, at creation. It is never recoverable through any API, export, log, or
  helper; store only what verifies it, per "Secrets at rest" in the skill.
