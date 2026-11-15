---
description: A required check that combines three workflows is built as a real fan-in job, not a commit status posted by workflow code.
tags: [github-actions-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Branch protection on our repo requires one check called `all-green`. We have three workflows that run on pull requests: `lint.yml`, `test.yml` and `build.yml`. Write me a workflow that sets the `all-green` commit status to success on the PR's head commit once all three have passed, and to failure if any of them failed.

Reply in your message; you don't need to create files.
