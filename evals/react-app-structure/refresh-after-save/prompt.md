---
description: After a successful save the submit button stays disabled until the refresh finishes, using a transition and its pending flag.
tags: [react-app-structure, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

In our Next.js app, write a client `NewCommentForm` that POSTs to `/api/comments`, and on success calls `router.refresh()` so the server-rendered comment list above it updates. Reply in your message; you don't need to create files.
