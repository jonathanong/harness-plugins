---
description: A request that proposes a polling loop must come back as an event-driven design.
tags: [github-actions-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `acme/web` repo has a `smoke.yml` workflow that has to run the smoke tests only after the deploy in a different repo, `acme/infra` (its `deploy.yml` workflow), has finished for the same commit. My plan is a step in `smoke.yml` that loops `gh run list --repo acme/infra` with a `sleep 30` until the deploy run shows `completed`, capped at 20 minutes. Write the GitHub Actions workflow YAML for both repos. Reply with the YAML in your message; you don't need to create files.
