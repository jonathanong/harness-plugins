---
description: A magic-link email job carries the user id, not the login token, and clears its payload when it finishes.
tags: [glide-mq, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use glide-mq. When someone asks for a magic-link login, the `/login/request` handler creates a one-time token and I want a `send-login-email` job to email them the link. Our `Queue` options keep the last 1000 completed and 5000 failed jobs so we can debug. To keep the worker simple I was going to enqueue `{ email, token }` and have the worker build the URL and send it. Write the handler and the worker. Reply in your message; you don't need to create files.
