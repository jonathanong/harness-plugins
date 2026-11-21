---
description: A request to codify two repository hardening settings in OpenTofu gets the provider gap and the REST calls, not invented attributes.
tags: [github-repository-settings, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We manage our public GitHub repos with OpenTofu and the `integrations/github` provider (latest). I want only people with write access to be able to open PRs, and outside contributors' fork PR workflow runs to always need approval, even repeat contributors. Add those to our `github_repository` resource and show me the HCL.

Reply in your message; you don't need to create files.
