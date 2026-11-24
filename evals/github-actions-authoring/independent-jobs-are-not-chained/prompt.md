---
description: Asked to chain four independent jobs in series to save runner minutes, the answer keeps the jobs that do not depend on each other in parallel.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `ci.yml` has four jobs that all start at once on every pull request. Timings from last week: `lint` about 40 seconds, `typecheck` about 2 minutes, `test` about 6 minutes, `build` about 4 minutes. None of them uses another's output.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
  typecheck:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

Runner minutes are adding up, so I want them to run one after another: lint, then typecheck, then test, then build, each only if the one before passed. Rewrite the `jobs` block that way. Reply with the YAML in your message; you don't need to create files.
