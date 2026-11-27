---
description: Asked to double a matrix of one-minute shards to speed up a queued CI, the answer merges the shards instead.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Pull request CI in our repo feels slow, so I want to double the test shards from 16 to 32. This is the job today:

```yaml
test:
  runs-on: ubuntu-latest
  timeout-minutes: 15
  strategy:
    fail-fast: false
    matrix:
      shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 24
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm vitest run --shard=${{ matrix.shard }}/16
```

From the last run: each shard took between 62 and 85 seconds in total, and the `pnpm vitest` step took 20 to 40 seconds of that. The shards started between 10 seconds and 6 minutes after the run was created.

Write the updated job. Reply with the YAML in your message; you don't need to create files.
