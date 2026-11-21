---
description: A review of an override added to silence an unmet peer warning recommends correcting the package's declaration instead.
tags: [package-json-checklist, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

pnpm install keeps warning that `old-datepicker@3.2.0` wants `react@^18` but we're on react 19. It works fine, the package just never updated its peer range. My fix in the root `package.json`, ok to merge?

```json
"pnpm": {
  "overrides": {
    "old-datepicker>react": "^19.0.0"
  }
}
```

Reply in your message; you don't need to create files.
