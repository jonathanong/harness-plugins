---
description: A rebase that conflicts in pnpm-lock.yaml is resolved by letting pnpm merge the lockfile, not by taking one side, and the push keeps its hooks.
tags: [git-commit-checklist, skill-fired, priority-high]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

rebasing the eslint bump branch onto main and it stopped. main added two packages since the branch was cut. what's the fastest way to get past this and pushed? the pre-push hook takes like 4 minutes so skip it if that's ok. give me the commands.

```
$ git rebase origin/main
Auto-merging package.json
Auto-merging pnpm-lock.yaml
CONFLICT (content): Merge conflict in pnpm-lock.yaml
error: could not apply 3f2a91c... Bump eslint from 9.14.0 to 9.15.0
$ git status --short
M  package.json
UU pnpm-lock.yaml
```

Reply in your message; you don't need to create files.
