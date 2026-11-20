---
description: A CDN worker's verified JWT is used for cache bypass only, not to grant access or a rate-limit tier.
tags: [http-api-design, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our CDN worker verifies the session JWT on each request. I want to use that: if the JWT is valid and has `plan: pro`, the worker serves the API request with the pro rate-limit tier and skips the origin's auth check to save latency. Write the worker logic and the origin handler. Reply in your message; you don't need to create files.
