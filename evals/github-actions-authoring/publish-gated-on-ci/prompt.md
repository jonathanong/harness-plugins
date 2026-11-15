---
description: A publish workflow gated on CI waits through workflow structure, not a status lookup or a polling step.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write `publish.yml`: on a `v*` tag push, publish the package to npm. Only publish if our CI workflow (`ci.yml`, it has jobs `lint` and `test`) passed for that commit. Trusted publishing, Node 24. Reply with the YAML in your message; you don't need to create files.
