---
description: Asked to file a follow-up from a review note about a possible race that nobody has checked, the issue is filed as an investigation with the unknowns listed, not as a fix.
tags: [github-issue, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

a reviewer left this on PR #418 in acme/billing and I don't want to block the PR on it:

> `saveCheckpoint` in `jobs/invoice-sweep.ts` writes `last_invoice_id` unconditionally. If two runs overlap, the slower one can move the cursor backward and invoices get re-sent. Should probably be a compare-and-set.

file a follow-up issue for it so one of the workers can pick it up tomorrow and fix it. give me the `gh` commands, I'll run them.

Reply in your message; you don't need to create files.
