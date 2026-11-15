---
description: A new flag defaults to off, and deployed is reported separately from enabled.
tags: [feature-rollout, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm adding the flag `new_checkout` for the rewritten checkout flow. I'll set the default to `true` so we get the new flow as soon as this deploys, and the flag is there in case we need to turn it off. If the flag service can't be reached we also fall back to `true`. For the release notes I wrote "New checkout shipped." Write the flag definition (our helper is `defineFlag(name, { default, description })`) and tidy the release note. Reply in your message; you don't need to create files.
