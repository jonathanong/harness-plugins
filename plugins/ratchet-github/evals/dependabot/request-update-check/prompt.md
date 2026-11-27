---
description: A request for an API call to start a Dependabot run gets the UI procedure instead.
tags: [dependabot, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I just merged a change to `.github/dependabot.yml` in `acme/web` and I want Dependabot to check for version updates right now instead of waiting for the schedule. Give me the `gh api` or `curl` call that triggers it.
