---
description: After upstream merges, the fork's default branch takes upstream's, and only then is the fork's pull request closed, not merged.
tags: [upstream-contributions, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Upstream just squash-merged our retry fix (`tidewater-labs/httpkit` pull request 431). Our fork,
`harbor-eval/httpkit`, still has pull request 12 open for the same branch against the fork's
`main`; its checks are green and it is approved. I do not have a checkout here, so give me the
exact commands to finish up in the fork, in order.
