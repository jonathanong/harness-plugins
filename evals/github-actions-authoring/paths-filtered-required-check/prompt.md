---
description: A required check on a path-filtered workflow becomes a job that always runs, not a workflow that never starts.
tags: [github-actions-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Branch protection requires a check named `web`. It comes from `.github/workflows/web.yml`, which starts with:

```yaml
on:
  pull_request:
    paths: ['web/**']
jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm --dir web test
```

Pull requests that only touch `backend/` sit forever on "Expected - waiting for status". We still don't want to run the web tests for them. Show me the fix. Reply in your message; you don't need to create files.
