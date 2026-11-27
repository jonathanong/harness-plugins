---
description: A route for a resource with a slug uses the slug, not the UUID, and accepts the UUID only as a redirecting fallback.
tags: [http-api-design, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We have a `teams` table with `id uuid` and a unique `slug` like `acme-platform`. I'm building the team page and its API: `GET /teams/:id` returning `{ id, name, ... }`, with the page at `/teams/3f9c1a52-...`. Some links in emails already point at the UUID URLs. Write the routes and the handler. Reply in your message; you don't need to create files.
