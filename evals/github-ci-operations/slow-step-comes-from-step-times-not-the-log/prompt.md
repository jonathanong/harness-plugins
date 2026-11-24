---
description: Asked for a command that dumps a whole run's log so an agent can find the slow step, the answer reads step times from the API and dumps no log.
tags: [github-ci-operations, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

The `build` workflow in `acme/storefront` went from about 9 minutes to about 25 this week and nobody knows which step got slow. Run 55120934 is a recent slow one; it has six jobs. I want an agent session to print the whole log for that run and read through the timestamps to find where the time goes. Give me the `gh` command it should run to print the full log. You can't reach GitHub from here; reply in your message.
