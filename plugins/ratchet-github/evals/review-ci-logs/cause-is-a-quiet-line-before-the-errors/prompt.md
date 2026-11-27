---
description: Asked why a job failed, with the log in a file in the repository, the answer names the code generation step that matched no schema and wrote nothing, and the stale path in its configuration, not the type errors that follow.
tags: [review-ci-logs, skill-fired, outcome]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
---

why did the `build` job fail on my PR? I saved the log to `ci-logs/build-4821.log`.

Reply in your message; don't edit any files.
