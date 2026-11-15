---
description: A commit of a small fix stages the files of that fix by name and leaves unrelated and generated changes out.
tags: [git-commit-checklist, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

done with the invoice rounding fix. commit and push it for me, give me the commands. branch is `fix/invoice-rounding`.

```
$ git status --short
 M src/billing/round.ts
 M src/billing/round.test.ts
 M src/reports/export.ts
 M pnpm-lock.yaml
?? src/billing/__fixtures__/half-cent.json
?? coverage/
?? notes.txt
```

Reply in your message; you don't need to create files.
