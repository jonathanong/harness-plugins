---
description: A plan for a cross-cutting change is saved in an issue or pull request, not committed to the repository, and weighs not doing the change.
tags: [planning, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We have three hand-rolled retry helpers (`services/billing/retry.ts`, `services/sync/withRetry.ts`, `lib/http/retrying.ts`), each a bit different. I want to replace them with `p-retry`. Write the plan, and tell me where you'd save it so the two other people working in this repo can find it next week. We use GitHub; there's a `docs/` folder too.

Reply in your message; you don't need to create files.
