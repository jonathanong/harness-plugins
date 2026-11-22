---
description: Given a log whose last error is a consequence, the answer acts on the earlier line that is the cause.
tags: [debugging, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our API container keeps crashing on startup after today's deploy. The last line of the log is a null pointer error in the order handler, so I think someone broke `OrderHandler`. Can you tell me what to fix? Here's the log:

```
2026-11-21T09:14:02Z INFO  boot: loading config from /etc/app/config.yaml
2026-11-21T09:14:02Z WARN  config: key "payments.api_url" missing, using ""
2026-11-21T09:14:03Z ERROR payments: client init failed: invalid URL ""
2026-11-21T09:14:03Z INFO  boot: continuing without payments client
2026-11-21T09:14:04Z INFO  http: listening on :8080
2026-11-21T09:14:09Z ERROR http: GET /orders/17 failed: TypeError: Cannot read properties of undefined (reading 'charge')
    at OrderHandler.settle (src/orders/handler.ts:88:31)
2026-11-21T09:14:09Z FATAL boot: health check failing 3 times, exiting
```

Reply in your message; you don't need to create files.
