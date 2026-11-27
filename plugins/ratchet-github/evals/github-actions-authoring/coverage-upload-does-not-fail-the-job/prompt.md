---
description: Adding coverage reporting to a public repository's test job, uploads to Codecov in a step that cannot fail the job.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our library is open source on GitHub. The `test` job in `ci.yml` checks out the code, sets up Node 24 and pnpm, and runs `pnpm test --coverage`, which writes `coverage/lcov.info`. I want pull requests to show how coverage changed. Add that to the job and reply with the whole `test` job's YAML in your message; you don't need to create files.
