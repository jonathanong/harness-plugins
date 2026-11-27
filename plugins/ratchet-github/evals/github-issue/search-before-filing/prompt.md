---
description: A request to file a bug gets a duplicate search first and a self-contained body, and no label is invented.
tags: [github-issue, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

file a bug in acme/reports for me. the CSV export button on /reports/usage spins forever when the date range is over 90 days. smaller ranges are fine. I think it's the `exportUsage` handler in `api/export.ts` timing out. tag it `perf-regression`. give me the `gh` commands, I'll run them.

Reply in your message; you don't need to create files.
