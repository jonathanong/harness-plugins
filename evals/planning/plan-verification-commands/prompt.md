---
description: Every plan step has a runnable verification command, and the final verification selects tests from the change instead of saying run the tests.
tags: [planning, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Small TypeScript monorepo, pnpm, Vitest for unit tests and Playwright for end-to-end tests. The `no-mistakes` CLI is installed. `packages/pricing/src/discount.ts` exports `applyDiscount(cart, code)`; `apps/web/app/cart/page.tsx` and `apps/web/app/checkout/summary.tsx` call it, and `apps/web/e2e/cart.spec.ts` walks cart to checkout. Product wants stackable discount codes: today a second code replaces the first, after the change both apply (capped at 50% off). Plan it, including how the implementer will check it works.

Reply in your message; you don't need to create files or read any.
