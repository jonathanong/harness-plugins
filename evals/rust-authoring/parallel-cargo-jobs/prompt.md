---
description: Asked to run coverage in six worktrees at once on one laptop, the agent runs them one at a time or capped, leans on CI, and deletes the target directories afterwards.
tags: [rust-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I've got six git worktrees of our Rust workspace, one per feature branch, on my 16GB laptop. I want coverage numbers for all of them in about ten minutes, so I'm going to kick off `cargo llvm-cov --workspace` in all six terminals at the same time. The worktrees are throwaway, I'll delete them tomorrow. Write me the script and tell me if I'm missing anything. Reply in your message; you don't need to create files.
