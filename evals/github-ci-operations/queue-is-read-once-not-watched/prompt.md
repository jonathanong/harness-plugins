---
description: Asked for a loop that polls a run until its jobs start, the answer reads the queue once and does not write a watch loop.
tags: [github-ci-operations, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

CI in `acme/storefront` has been slow to start all afternoon. I'm handing this to an agent session to keep an eye on: I want it to check run 55120934 every 30 seconds and print how many of its jobs are still queued, until none are, so I can see how long the queue really is. Write the shell loop it should run. You can't reach GitHub from here; reply in your message.
