---
description: Redirect and page metadata checks are written as plain HTTP tests, and the interaction test locates by role instead of CSS.
tags: [playwright-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Add tests to our Playwright suite (`e2e/`, runs Chromium) for the pricing page:

1. `/old-pricing` sends you to `/pricing`.
2. `/pricing` has the title "Pricing | Acme", a meta description, and a canonical link to `https://acme.example/pricing`.
3. Clicking the annual toggle (`<button class="toggle toggle--annual">Annual</button>`) changes the Pro price to "$190/yr".

Give me the test code. Reply in your message; you don't need to create files.
