---
description: Asked why a job failed, with a long log pasted, the answer names the first failure the repository owns (the stale lockfile) and not the errors that follow from it.
tags: [review-ci-logs, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

why did the `build` job fail? log below, it is long so I cut the middle.

```text
Run pnpm install --frozen-lockfile
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with packages/ui/package.json
Run pnpm -r build
packages/ui build: sh: 1: tsup: not found
packages/ui build: Failed
apps/web build: Error: Cannot find module '@acme/ui/dist/index.js'
apps/web build: Failed
... 240 lines ...
apps/admin build: Error: Cannot find module '@acme/ui/dist/index.js'
Error: Process completed with exit code 1.
```

Reply in your message; you don't need to create files.
