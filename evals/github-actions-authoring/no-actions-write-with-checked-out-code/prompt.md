---
description: A workflow that clears caches after tests does not give `actions: write` to the job that runs checked-out code.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a GitHub Actions workflow for pull requests that checks out the repo, runs `pnpm install` and `pnpm test`, and then deletes the Actions caches for the pull request's branch with `gh cache delete`. Reply in your message; you don't need to create files.
