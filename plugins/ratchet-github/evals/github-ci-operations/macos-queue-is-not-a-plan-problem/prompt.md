---
description: Asked whether a paid plan will clear a queue of macOS jobs, the answer says the macOS limit is the same on that plan and cuts the macOS jobs instead.
tags: [github-ci-operations, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our GitHub organization is on the Free plan and all our repos are public, using GitHub-hosted runners. On busy afternoons the macOS jobs in pull request CI sit queued for 20 to 30 minutes, while the Linux jobs start right away. Every push to a pull request starts 6 macOS jobs and about 12 Linux jobs, and we usually have a dozen pull requests moving at once.

My manager has approved paying for the Team plan to get more runners and make the queue go away. Should we do it? Tell me what you would do. Reply in your message; you don't need to create files.
