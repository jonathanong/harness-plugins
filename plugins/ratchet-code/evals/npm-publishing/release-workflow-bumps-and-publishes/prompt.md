---
description: A reworked release workflow pushes the version bump itself with a token that may pass the ruleset, and publishes that commit with OIDC.
tags: [npm-publishing, outcome, skill-fired, priority-high]
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
---

Releasing `@acme-evals/widget` is too manual. Today I edit the version in `packages/widget/package.json` in a pull request, merge it, then tag `main` by hand, and `.github/workflows/release.yml` publishes on the tag. Last month I tagged the wrong commit. Rework `release.yml` so I start a release from the Actions tab, choose patch, minor, or major, and it does the rest. `main` has a ruleset that requires a pull request for every change. Give me the new `release.yml` in your reply and tell me anything I have to set up; I'll commit it myself.
