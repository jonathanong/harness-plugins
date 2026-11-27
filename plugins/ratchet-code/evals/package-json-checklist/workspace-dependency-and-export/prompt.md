---
description: A dependency and entry-point change uses the workspace package manager and verifies the published surface.
tags: [package-json-checklist, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

In my pnpm workspace, `packages/api` is published to npm. It is about to import `zod` in its request handlers, and its tests need `msw`. I'm also adding a second entry point, `@acme/api/client`, built to `dist/client.js`; today its `package.json` only has `"main": "dist/index.js"`. Tell me exactly what to change in `package.json` and what to run before I commit. Reply in your message; you don't need to create files.
