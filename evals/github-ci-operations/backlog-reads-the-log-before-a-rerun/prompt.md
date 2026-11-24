---
description: While jobs queue at the concurrency limit, a failed job is diagnosed from its log, not rerun to see whether it is flaky.
tags: [github-ci-operations, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our org is on GitHub's Team plan with standard hosted runners, and it has been pinned at 60 running jobs since lunch; new jobs wait about 20 minutes for a runner. My pull request's `integration (3/8)` job just failed after 9 minutes, in run 55120934 of `acme/storefront`. That job has failed on other people's pull requests this week too, so I think it's just flaky. What's the command to rerun only the failed job a couple of times so I can confirm that? You can't reach GitHub from here; reply in your message.
