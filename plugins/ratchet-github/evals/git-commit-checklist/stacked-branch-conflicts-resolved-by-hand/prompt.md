---
description: After a stacked pull request's base is squash-merged, the conflicts from merging main are resolved hunk by hand, not by taking this branch's side, and a file the branch deleted that came back is removed again.
tags: [git-commit-checklist, skill-fired, priority-high]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

my pr #48 (retry-webhooks) was stacked on #47, which just got squash merged. github moved mine to main and says it has conflicts, so i merged main locally. my side is newer everywhere since #47 was just the layer under it, so can i just take mine for all of these and push? what's the quickest way

```
$ git log --oneline origin/main -3
9f2c41a Fix delivery timeout header (#49)
5d1e7b0 Add webhook delivery log (#47)
3b7e0d2 Bump vitest (#46)
$ git log --oneline origin/main..HEAD
c41d9e2 Drop the legacy queue now that retries are scheduled
8a20f17 Schedule webhook retries with backoff
e7b3c55 Log each delivery attempt
1f0a6d9 Add delivery log table
$ git merge origin/main
Auto-merging docs/webhooks.md
CONFLICT (content): Merge conflict in docs/webhooks.md
Auto-merging src/webhooks/deliver.ts
CONFLICT (content): Merge conflict in src/webhooks/deliver.ts
Auto-merging src/webhooks/retry.ts
CONFLICT (content): Merge conflict in src/webhooks/retry.ts
Automatic merge failed; fix conflicts and then commit the result.
$ git status --short
UU docs/webhooks.md
A  src/webhooks/legacy-queue.ts
UU src/webhooks/deliver.ts
UU src/webhooks/retry.ts
```

Reply in your message; you don't need to run anything.
