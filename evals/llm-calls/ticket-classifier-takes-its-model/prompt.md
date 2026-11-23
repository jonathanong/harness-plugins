---
description: A new ticket classifier takes its model from configuration or an argument, with no model id or fallback written in the code
tags: [llm-calls, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Support wants incoming tickets routed automatically. Write a TypeScript function
`classifyTicket(subject: string, body: string)` for our backend that asks Claude to label a
ticket as `billing`, `bug`, `how_to`, or `other`, and returns the label. Use the Anthropic SDK.
It's a small, high-volume call, so it should run on a cheap, fast model.

Reply in your message with the code; you don't need to create files.
