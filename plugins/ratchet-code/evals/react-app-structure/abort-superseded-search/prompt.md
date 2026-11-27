---
description: A typeahead search aborts the previous request so a stale response cannot overwrite a newer one.
tags: [react-app-structure, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a React `SearchBox` component with a text input that calls `GET /api/search?q=...` on each change and shows the results. Reply in your message; you don't need to create files.
