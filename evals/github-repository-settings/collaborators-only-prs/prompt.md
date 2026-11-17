---
description: A request to stop strangers opening pull requests on a public repository gets the collaborators-only setting and all-outside-contributor approval, not turning pull requests off.
tags: [github-repository-settings, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

My GitHub repo is public. I only want people with write access to be able to open pull requests, and I don't want anyone outside the team running our Actions workflows without one of us approving it first, even if they've contributed before. Dependabot needs to keep working. Give me the `gh` commands to check and change this. Reply in your message; don't run anything.
