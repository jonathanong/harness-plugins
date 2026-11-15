---
description: An existing package gets a trust check and trust setup only, with no publish command.
tags: [npm-publishing, outcome, skill-fired]
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
---

`@acme-evals/widget` (in `packages/widget`) has been on npm for a while; version 0.1.0 is the latest published version, and I published it from my laptop with a token. Move it to trusted publishing from our `release.yml` workflow. I'm logged in to npm in this terminal, so run whatever npm commands are needed yourself.
