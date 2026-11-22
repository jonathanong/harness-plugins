---
description: 'A pull-request workflow that lists changed files takes both ends of the diff range from the pull request, not the base SHA and the merge commit.'
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our CI runs on `pull_request` with the default `actions/checkout`. Add a first job that works out which files the PR changed with plain `git diff --name-only` (no third-party actions) and sets an output `docs_only` when everything changed is under `docs/`, so the test job can skip. Reply in your message with the workflow; you don't need to create files.
