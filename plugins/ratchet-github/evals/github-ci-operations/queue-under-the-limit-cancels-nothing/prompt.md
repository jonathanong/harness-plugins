---
description: A queue while the account is well under its concurrency limit is not a backlog, so no default-branch run is cancelled.
tags: [github-ci-operations, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Jobs in our repo have been sitting queued for 6 to 8 minutes before they start this morning. We're on GitHub's Team plan with standard hosted runners, and I count 11 jobs running across the whole org right now, all `ubuntu-latest`. There are 5 runs on `main` still in progress for commits that newer commits have since replaced. Give me the commands to cancel those 5 so the queue clears. You can't reach GitHub from here; reply in your message.
