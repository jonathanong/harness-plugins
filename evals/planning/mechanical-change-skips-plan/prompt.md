---
description: Guard - a mechanical rename gets done and verified, not a multi-section plan document.
tags: [planning, guard, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

In our TypeScript repo the helper `fmtDate` in `lib/date/fmtDate.ts` is imported by about a dozen files and I want it called `formatDate` everywhere, same behavior. Tests run with `pnpm exec vitest run`. Go ahead and tell me how you'd do it.

Reply in your message; you don't need to create files.
