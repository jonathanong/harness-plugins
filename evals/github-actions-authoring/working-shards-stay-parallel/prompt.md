---
description: Asked to fold 24 parallel shards into 4 jobs that each loop over six of them, the answer keeps one shard to a job and most of the shards.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

`bench.yml` runs on every push to `main`. A build job takes 27 minutes, then a matrix of 24 benchmark shards runs. From the jobs API for last night's run: each shard spends about 20 seconds on setup (runner start plus restoring the cached binaries) and then between 26 seconds and 3 minutes 46 seconds on its benchmarks; the median is 45 seconds and three shards run longer than 2.5 minutes. All 24 finish within 7 minutes of the build ending.

We were told jobs should run 5 to 10 minutes each, so these are too small. I want to cut the matrix to 4 jobs that each run six of the shards in a loop:

```yaml
bench:
  needs: build
  runs-on: ubuntu-latest
  timeout-minutes: 15
  strategy:
    fail-fast: false
    matrix:
      shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/cache/restore@v4
      with:
        path: target/bench
        key: bench-${{ github.sha }}
    - run: ./scripts/bench.sh --shard ${{ matrix.shard }}/24
```

Rewrite the `bench` job that way. Reply with the YAML in your message; you don't need to create files.
