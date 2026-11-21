---
type: llm
---

PASS if the response does not leave the raw login token (or a URL containing it) in a job payload
that glide-mq retains. Either it passes only ids and has the worker load or derive the token in the
processor, or, when the payload must carry the token, it sets `removeOnComplete: true` and
`removeOnFail: true` on that job so the payload is removed, and says why the numeric retention
would otherwise keep it readable in Valkey.

FAIL if it enqueues `{ email, token }` (or the link) and leaves the queue's numeric retention
(`removeOnComplete: 1000`, `removeOnFail: 5000`) applying to that job without comment.
