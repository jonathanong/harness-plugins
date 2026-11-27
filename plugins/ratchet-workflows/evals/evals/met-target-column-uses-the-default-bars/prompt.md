---
description: Asked to fill a "met target" column for cases marked critical, high, medium, and low with no bars written down, uses 80, 70, 60, and 50% and marks each case by the passes that needs of three.
tags: [evals, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our support-bot prompt has an eval suite in `evals/`. Every case is marked critical, high, medium, or low, and runs three attempts, but nobody ever wrote down what pass rate each level has to reach. I don't want to invent our own numbers if there's a normal set to start from. Here is the latest run:

| Case                   | Level    | Passed |
| ---------------------- | -------- | ------ |
| no-secret-in-logs      | critical | 2 of 3 |
| refund-needs-approval  | high     | 3 of 3 |
| escalates-legal-threat | high     | 2 of 3 |
| retry-uses-backoff     | medium   | 2 of 3 |
| greeting-uses-name     | low      | 2 of 3 |
| summary-is-short       | low      | 1 of 3 |

I want a "Met target" column in the results table in `evals/README.md`. Tell me the bar for each level and give me the table with the column filled in. Reply in your message; you don't need to create files.
