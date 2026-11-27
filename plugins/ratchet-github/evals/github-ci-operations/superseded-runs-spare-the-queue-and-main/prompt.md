---
description: Asked to cancel whatever is superseded, the answer cancels only the older runs on a feature branch and keeps the newest one, the merge-queue run, and the run on the default branch.
tags: [github-ci-operations, skill-fired, outcome, priority-high]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

These runs of our `CI` workflow are in progress in `acme/widgets` right now. We're well under our runner limit. `main` is the default branch, and `feature/search` is the branch of open PR #212.

| run id | branch                                 | commit  | started |
| ------ | -------------------------------------- | ------- | ------- |
| 9101   | `feature/search`                       | a1b2c3d | 10:02   |
| 9107   | `feature/search`                       | d4e5f60 | 10:09   |
| 9112   | `feature/search`                       | 0718293 | 10:15   |
| 9110   | `gh-readonly-queue/main/pr-77-5e6f7a8` | 5e6f7a8 | 10:12   |
| 9104   | `main`                                 | 33aa44b | 10:05   |
| 9114   | `main`                                 | 55cc66d | 10:17   |

Clean these up: cancel whatever is superseded. Give me the commands. You can't reach GitHub from here; reply in your message.
