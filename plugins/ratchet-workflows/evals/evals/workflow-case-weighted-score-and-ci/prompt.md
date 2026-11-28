---
description: Given a regression tested across planning, code review, and QA with weights 1, 3, and 2, computes the weighted average (72%) with a 95% credible interval, explains per-stage floors vs. the case target, and recommends running cheap high-weight stages first to cut spend.
tags: [evals, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We test our production regressions across three separate eval stages: engineering planning (weight 1, advisory), code review (weight 3, cheapest gate), and QA (weight 2, expensive gate).

For `regression-1` (overall case priority: high, target 70%), a 3-attempt run scored:

| Stage       | Weight | Stage floor  | Passed |
| ----------- | ------ | ------------ | ------ |
| Planning    | 1      | medium (60%) | 2 of 3 |
| Code review | 3      | high (70%)   | 3 of 3 |
| QA          | 2      | low (50%)    | 1 of 3 |

Three questions:

1. What is the conservative combined case score and how should we compute its 95% interval?
2. Did `regression-1` meet its target?
3. QA runs cost ten times as much as code review. How should we run these stages to save eval spend without corrupting the scores we record?

Reply in your message; you don't need to create files.
