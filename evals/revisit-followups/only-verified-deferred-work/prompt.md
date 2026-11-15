---
description: A sweep of last week's merged pull requests keeps only explicit deferred work, and asks for it to be verified before any issue is filed.
tags: [revisit-followups, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Here are excerpts from the five PRs we merged last week. Which of these should become issues? Go ahead and write them up.

**#412 Add usage export**

> - [x] CSV export
> - [x] Date range filter
> - [ ] Stream rows instead of buffering (fine for now, exports are small)

**#415 Drop Node 20 from CI**

> We decided not to keep a Node 20 job. 22 and 24 only from here on.

**#418 Fix invoice rounding**

> Reviewer: should `roundHalfEven` live in `lib/money`? Author: yes, moved it in this PR.
> Code comment added: `// TODO(perf): revisit if this shows up in profiles`

**#421 Add orders index**

> Follow-up: drop the old `orders_created_idx` once the new index has been live for a week.

**#423 Update contributing guide**

> Always run migrations before deploying the API.

Reply in your message; you don't need to create files.
