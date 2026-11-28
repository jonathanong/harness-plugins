---
description: Given a regression tested sequentially across planning (advisory, e=0.5), code review (gate, e=1), and QA (gate, e=1), uses Noisy-OR (85%) with a 95% credible interval and independence caveat, explains per-stage floors vs. the case target, and recommends running cheap primary gates first to cut spend.
tags: [evals, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We test our production regressions across a sequential workflow: engineering planning (advisory, effectiveness 0.5), then code review (hard gate, effectiveness 1.0), then QA (hard gate, effectiveness 1.0). In production, a bug caught in code review never reaches QA; QA only needs to catch what escapes earlier stages. In our eval suite, each stage is sampled separately with 3 attempts on its own fixture for `regression-1` (measuring each stage's catch rate conditional on the bug reaching that stage).

For `regression-1` (overall case priority: critical, target 80%), a 3-attempt run scored:

| Stage       | Effectiveness | Stage floor  | Passed |
| ----------- | ------------- | ------------ | ------ |
| Planning    | 0.5           | medium (60%) | 2 of 3 |
| Code review | 1.0           | high (70%)   | 2 of 3 |
| QA          | 1.0           | low (50%)    | 1 of 3 |

Three questions:

1. What is the combined catch rate for `regression-1`, how should we compute its 95% interval, and what caveat must we state in `README.md`? (Also mention when a weighted average would be used instead.)
2. Did `regression-1` meet its target?
3. QA runs cost ten times as much as code review. How should we run these stages to save eval spend without corrupting the scores we record?

Reply in your message; you don't need to create files.
