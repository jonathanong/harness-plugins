---
description: A review of a docs diff flags restated configuration values, history and plans, and a comment that explains history.
tags: [documentation, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff before I merge it.

```diff
--- a/README.md
+++ b/README.md
@@
 ## Rate limiting
+
+Requests are limited to 100 per minute per API key, with a burst of 20. The
+limiter retries Redis three times with a 50 ms backoff.
+
+Previously the limiter was in-process, which broke when we went to four
+replicas. Next quarter we plan to move to a sliding window.
--- a/src/limiter.ts
+++ b/src/limiter.ts
@@
+// We switched from the token bucket to a fixed window in March because the
+// bucket math drifted across replicas. Keep this in sync with README.
 export const limiter = createLimiter(config.rateLimit)
```

Reply in your message; you don't need to create files.
