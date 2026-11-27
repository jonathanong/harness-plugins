---
description: A handler asked to enqueue a job and wait for its result returns an id for the client to poll.
tags: [glide-mq, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use glide-mq. `POST /reports` has to respond with the URL of the generated PDF. My plan: the Fastify handler enqueues a `build-report` job on our shared `background` queue and waits for it to finish, with a 30 second timeout, then returns the URL from the job result. Builds take 5 to 20 seconds. Write the handler and the worker. Reply in your message; you don't need to create files.
