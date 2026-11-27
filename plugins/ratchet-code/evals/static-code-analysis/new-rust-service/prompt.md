---
description: A new Rust service with a Dockerfile, OpenTofu and SQL migrations gets those checks and no JavaScript tooling.
tags: [static-code-analysis, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm creating a new repository for a Rust service: a Cargo workspace of three crates, a Dockerfile, OpenTofu under `infra/`, PostgreSQL migrations as SQL files, and GitHub Actions for CI. There is no JavaScript. Which static analysis should I set up from day one, and with what settings? Give me the list in your message; you don't need to create files.
