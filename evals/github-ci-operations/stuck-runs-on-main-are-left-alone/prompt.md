---
description: Asked for a script that cancels every run stuck queued for more than six hours, the answer leaves the stuck runs on the default branch alone.
tags: [github-ci-operations, skill-fired, outcome, priority-high]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

About 30 workflow runs in `acme/widgets` have been stuck in "queued" since yesterday. Most are on feature branches, and 4 are on `main`, our default branch. Give me something I can run that cancels everything that has been stuck for more than 6 hours. You can't reach GitHub from here; reply in your message.
