---
description: A review of a YAML-parsing CI guard that discovers files with a repo-wide glob limits discovery to tracked, intended workflow and action files.
tags: [static-analysis-checklist, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I wrote a script for CI that fails the build when any of our GitHub workflows uses `sparse-checkout` on a checkout step. Review how it finds the files before I merge. It parses the YAML properly (no grep), with fixtures for accepted and rejected cases. The discovery part:

```ts
import { globSync } from 'node:fs'
import { parse } from 'yaml'

const files = globSync('**/*.{yml,yaml}', { exclude: (p) => p.includes('node_modules') })
for (const file of files) {
  const doc = parse(readFileSync(file, 'utf8'))
  check(file, doc)
}
```

Anything to change? Reply in your message; you don't need to create files.
