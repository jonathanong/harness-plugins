---
description: Given per-attempt results where a skill loaded in 2 of 6 attempts and passed both times it loaded, reports loading and passing-when-loaded as separate counts and holds loading to 80%.
tags: [evals, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our plugin has a skill called `sql-migrations` that the agent loads when it thinks it needs it. One eval case, `drop-column-needs-two-deploys`, is marked high and ran six attempts. This is what the runner logged:

| Attempt | Tools the agent called               | Grader `two-deploys` |
| ------- | ------------------------------------ | -------------------- |
| 1       | Read, Grep                           | fail                 |
| 2       | Skill (`sql-migrations`), Read       | pass                 |
| 3       | Read                                 | fail                 |
| 4       | Read, Grep                           | fail                 |
| 5       | Skill (`sql-migrations`), Read, Grep | pass                 |
| 6       | Grep, Read                           | fail                 |

Two questions. First, write the row for this case as it should appear in the results table in `evals/README.md`. Second, I don't know what's normal here: how often should a skill like this be getting picked up before I stop worrying about it? Give me a number to hold it to. Reply in your message; you don't need to create files.
