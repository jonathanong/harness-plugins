---
description: 'A helper script that CI and developers both run avoids Bash 4 features, since macOS ships Bash 3.2.'
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I want a `scripts/changed-packages.sh` that reads a list of changed file paths from stdin and prints the unique top-level package directories, sorted. CI calls it from a workflow step, and the team also runs it on their MacBooks before pushing. Show the script and the workflow step. Reply in your message; you don't need to create files.
