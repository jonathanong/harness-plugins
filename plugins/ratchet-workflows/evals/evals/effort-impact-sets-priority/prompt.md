---
description: Asked to prioritize code-review eval cases with differing detection difficulty and impact, assigns priorities from both effort and impact and records the suite's decision matrix in AGENTS.md and README.md.
tags: [evals, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We are adding cases to our code-review eval suite in `evals/`. Right now we assign priority only by how bad the bug is, which makes our pass targets feel broken:

1. `missing-null-check`: medium impact (causes rework), very easy to spot in a single-file diff.
2. `cross-service-race`: medium impact (causes rework), hard to detect because it spans four services.
3. `subtle-token-leak`: critical impact (leaks a secret), very hard to spot reliably in review.

How should we assign priorities to these three cases instead of using impact alone, and where should we write down the rule so our team and agents apply it consistently? Reply in your message; you don't need to create files.
