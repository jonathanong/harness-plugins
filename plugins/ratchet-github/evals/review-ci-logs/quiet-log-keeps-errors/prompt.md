---
description: A request to quiet a noisy deploy log removes the noise at its source and keeps stderr and warnings that carry errors.
tags: [review-ci-logs, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

our deploy job log is 30k lines and nobody can find anything in it. almost all of it is two things: `npm warn deprecated` lines during install, and a wall of `NOTICE:  relation "..." already exists, skipping` from the migrate step. make it quiet. I was going to do this, tidy it up if you want:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      NODE_NO_WARNINGS: 1
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: pnpm install --frozen-lockfile --silent
      - name: Migrate
        run: psql "$DATABASE_URL" -f db/migrate.sql 2>/dev/null
      - name: Deploy
        run: ./scripts/deploy.sh
```

Reply in your message; you don't need to create files.
