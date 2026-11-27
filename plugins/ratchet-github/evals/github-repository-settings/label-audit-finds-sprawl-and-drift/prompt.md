---
description: A review of a repository's labels finds near-duplicates, labels for one-off work, and drift from the declared label source, and changes nothing.
tags: [github-repository-settings, skill-fired, review, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our labels in acme/api are a mess. Take a look and tell me what to clean up.

AGENTS.md says shared labels live in `infra/github/labels.tf`; that file defines `bug`,
`enhancement`, `docs`, `priority: high`, and `priority: low`. `.github/labeler.yml` sets
`area: db` for `migrations/**`.

`gh label list --repo acme/api --json name,description,color` plus open/closed issue counts:

| name              | description             | color  | issues |
| ----------------- | ----------------------- | ------ | ------ |
| bug               | Something is broken     | d73a4a | 64     |
| Bug               |                         | ee0701 | 9      |
| type: bug         | A defect                | d73a4a | 3      |
| enhancement       | New feature or request  | a2eeef | 40     |
| docs              | Documentation           | 0075ca | 12     |
| documentation     |                         | 0075ca | 2      |
| priority: high    | Fix this cycle          | b60205 | 11     |
| priority: low     | When there is time      | 0e8a16 | 7      |
| priority: urgent  |                         | 5319e7 | 1      |
| area: db          | Database and migrations | c5def5 | 18     |
| sprint-14-cleanup |                         | ededed | 6      |
| q3-launch         | Launch blockers         | fbca04 | 14     |
| wontfix           |                         | ffffff | 0      |

Reply in your message; you don't need to create files.
