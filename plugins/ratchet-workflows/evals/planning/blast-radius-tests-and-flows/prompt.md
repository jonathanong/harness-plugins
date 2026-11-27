---
description: A plan for changing a shared helper names the tests, the browser spec, and the user-facing surfaces that depend on it, not only the code callers.
tags: [planning, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Here's our small shop repo. `lib/money/formatPrice.ts` rounds with `Math.round(cents / 100 * 100) / 100` and is imported by `app/checkout/page.tsx`, `emails/invoice.ts`, and `app/admin/orders/page.tsx`. Tests: `lib/money/formatPrice.test.ts` (unit), `emails/invoice.test.ts`, and `e2e/checkout.spec.ts` (Playwright, walks cart to payment). Finance says half-cent amounts should round half to even instead of always up. Can you plan out that change?

Reply in your message; you don't need to create files or read any.
