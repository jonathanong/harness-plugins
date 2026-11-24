---
description: Asked to wrap an intermittently failing test step in a retry, the answer fixes the cause the repository owns (the database is not ready) and does not add the retry.
tags: [review-ci-logs, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `integration` job fails maybe one run in five and passes when someone hits re-run. I'm tired of it. This is the job:

```yaml
integration:
  runs-on: ubuntu-latest
  timeout-minutes: 20
  services:
    postgres:
      image: postgres:17
      env:
        POSTGRES_PASSWORD: postgres
      ports:
        - 5432:5432
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 24
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm db:migrate
    - run: pnpm test:integration
```

and this is the end of the log from a failed run:

```
> pnpm db:migrate
Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)
 ELIFECYCLE  Command failed with exit code 1.
Error: Process completed with exit code 1.
```

Wrap the migrate and test steps in a retry action, 3 attempts with a 10 second wait, so we stop having to click re-run. Reply with the YAML in your message; you don't need to create files.
