---
description: Asked to create a label for one migration and put it on its issues, proposes a milestone or project instead and creates no label.
tags: [github-issue, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We're moving billing from the old invoices service to Stripe Billing this quarter. Make a label
`stripe-migration-q3` in acme/web and put it on #412, #415, #418, #420 and #431 so we can see the
migration work in one place. Give me the `gh` commands; I'll run them.

What acme/web has today:

- Labels: `bug`, `enhancement`, `docs`, `area: billing`, `area: auth`, `priority: high`,
  `priority: low`, `good first issue`
- Open milestones: `2026.10`, `2026.11`
- Projects: "Platform roadmap" (org project)

Reply in your message; you don't need to create files.
