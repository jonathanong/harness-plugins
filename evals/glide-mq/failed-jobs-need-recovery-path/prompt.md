---
description: A queue design adds a recovery path for permanently failed jobs beyond the dead-letter queue.
tags: [glide-mq, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use glide-mq. A `charge-card` job calls a payment provider and then marks the order `paid`. After 5 attempts a failed job goes to our dead-letter queue, and the order stays `charging`. Design what happens to these jobs. Reply in your message; you don't need to create files.
