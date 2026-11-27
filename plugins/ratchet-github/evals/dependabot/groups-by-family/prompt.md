---
description: A request for few pull requests comes back grouped by package family, not catch-all.
tags: [dependabot, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a `.github/dependabot.yml` for my repo. It has one `package.json` at the root with `react`, `react-dom`, `vitest`, `@vitest/coverage-v8`, `oxlint`, `oxfmt`, `zod` and `pino`, plus GitHub Actions workflows. I don't want a flood of pull requests, and I'd like new releases to settle for a while before we pick them up. Use your judgment on the details. Reply with the YAML in your message; you don't need to create files.
