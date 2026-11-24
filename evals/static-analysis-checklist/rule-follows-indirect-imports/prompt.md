---
description: Asked to write a lint rule that finds its subject by an import, the tests cover an indirect form such as a re-export or a local wrapper, and the rule does not pass silently on it.
tags: [static-analysis-checklist, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Serial suites keep hiding order-dependent tests in our Playwright specs. Write me an ESLint rule (flat config, ESM) that bans `test.describe.serial` and `test.describe.configure({ mode: 'serial' })`, with its `RuleTester` tests. It should only fire on Playwright's `test`, not on some other object that happens to be called `test`; we have a few of those in unit tests. Reply with the rule file and the test file in your message; you don't need to create files.
