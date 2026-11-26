---
description: A new eval suite gets a README for current scores, a history log, and an agent rules file, with both arms reported.
tags: [evals, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I have a CLI that prints a deploy summary, and a system prompt that tells an agent how to act on it. I've written 14 eval cases under `evals/` (each a directory with a prompt and graders), and I can run each case with the system prompt and without it. I just did the first full run: 3 attempts each, a mid-size model as the agent, a larger one as the judge.

Nothing documents the suite yet. Which files should I add under `evals/`, and what goes in each? Keep it to an outline per file. Reply in your message; you don't need to create files.
