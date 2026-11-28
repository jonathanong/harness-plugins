---
description: Asked to merge main into a feature branch and add two new fixture files in the same go, commits the files on their own instead of inside the merge commit.
tags: [git-commit-checklist, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm on `feat/scoped-handles` and need main merged in; it'll conflict in `src/queue/transactions.ts`,
where both sides touched the handle tracking. I also wrote two new fixtures that the parity test
needs, `fixture/scoped-handles/src/reexported-handle.ts` and
`fixture/scoped-handles/src/handle-barrel.ts`. They're untracked in my working tree right now.
Just fold them into the merge so it's one commit. Give me the exact commands, I'll run them.
