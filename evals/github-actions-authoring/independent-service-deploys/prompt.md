---
description: 'Deploy workflows for an API and a web app are independent; neither waits on or polls the other.'
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We have an API and a web frontend in one repo, and each has its own deploy workflow that runs on push to main. The frontend calls a new API endpoint, so the frontend must never go live before the API does. Sketch the workflows so that ordering holds. Reply in your message; you don't need to create files.
