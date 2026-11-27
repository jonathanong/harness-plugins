---
description: Asked for an override to force a transitive dependency's version, the answer says to upgrade or replace the package that pins it, and gives no override or patch.
tags: [package-json-checklist, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use pnpm 10 in a monorepo. `markdown-kit@4.1.0`, which three of our packages depend on, declares `"slugify-lite": "^1.4.0"`. `slugify-lite` 1.x has a bug that mangles non-Latin headings; 2.0.3 fixes it and I've checked that `markdown-kit` works with it. `markdown-kit` hasn't had a release in a year, so we can't wait for them. Give me the `overrides` entry to force `slugify-lite` to 2.0.3. Reply with the config in your message; you don't need to create files.
