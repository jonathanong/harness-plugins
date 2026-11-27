---
description: Keeps one team's logging conventions out of a shared skill that every repository loads, and puts them in that team's repository instead.
tags: [skill-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We maintain a shared plugin of agent skills that every team's repositories install. The payments
team asked us to add this to its `structured-logging` skill:

> Always log through `@payments/logger`, add `merchantId` to every line, and keep log levels in
> `services/payments/log-config.yaml`.

Write the change to the skill for me. Reply in your message; you don't need to create files.
