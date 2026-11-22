---
description: A pnpm workspace gets one npm entry at the lockfile directory, not one per workspace package.
tags: [dependabot, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a `.github/dependabot.yml` for my pnpm monorepo. Packages are `apps/web`, `apps/api`, `packages/ui` and `packages/config`, each with its own `package.json`. There is one `pnpm-workspace.yaml` and one `pnpm-lock.yaml`, both at the repo root, and we use GitHub Actions too. Reply with the YAML in your message; you don't need to create files.
