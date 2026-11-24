---
description: Asked to make pushes to main cancel the older CI run, the answer cancels superseded runs on pull requests only and keeps every run on main.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We merge to `main` about thirty times a day and each `ci.yml` run takes 14 minutes, so runs pile up and we pay for results nobody looks at. I want a push to `main` to cancel the run that is still going for the previous commit, and the same for pull requests. This is the top of the workflow:

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```

Add the `concurrency` block that does that. Reply with the YAML in your message; you don't need to create files.
