---
description: Updating a description after a CI failure caused by a narrower local check adds a short section naming the first failing run, what was run locally, and the correction, and leaves out the work history.
tags: [pr-description, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

CI is green now, update the PR description for me. Current body:

> Rename `Invoice.total` to `Invoice.amountDue` in `packages/shared` and update callers.

What happened: I renamed it in `packages/shared`, ran `pnpm tsc --noEmit` inside `packages/shared` and its tests, all fine, pushed (commit `a1b2c3d`). CI's typecheck job failed in run `https://github.com/acme/shop/actions/runs/9912` because `packages/web` still read `invoice.total`; CI runs `pnpm -r typecheck` from the root. I fixed the three `packages/web` call sites in `e4f5a6b`, and now I run the root typecheck before pushing. First I tried keeping `total` as a deprecated alias and dropped that. No API or database change; the field only exists in TypeScript types. Reply in your message; you don't need to create files.
