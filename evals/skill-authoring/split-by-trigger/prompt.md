---
description: Splits browser-test guidance into its own skill, because it is triggered by different work, instead of tucking it into a reference of the unit-testing skill.
tags: [skill-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our `testing` skill covers unit and integration tests (Vitest, fixtures, mocks). Its description
starts "Use when writing or reviewing tests". I want to add about 80 lines of Playwright guidance:
role and test-id locators, waiting on state instead of timeouts, and seeding data through the API.
My plan is to put it in `skills/testing/references/playwright.md` and link it from `SKILL.md`.
Does that work? Show me what you'd change.

Reply in your message; you don't need to create files.
