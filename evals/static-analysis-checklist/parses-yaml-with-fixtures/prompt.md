---
description: A proposed grep-based workflow guard comes back as a parsed check with accepted and rejected fixtures.
tags: [static-analysis-checklist, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

People keep adding `sparse-checkout` to `actions/checkout` steps in our workflows, and it breaks our self-hosted runners, which reuse their workspace. I want CI to block it. My plan is one step that runs `grep -rn "sparse-checkout" .github/` and fails if it prints anything. Write up the plan for the check you would actually build. Reply in your message; you don't need to create files.
