---
description: Asked to write down a rule a person stated, the rule is recorded in their words, without added sub-rules, examples, or scope.
tags: [agent-rules, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

our tech lead reviewed the CI cleanup PR this morning. the PR had folded 16 test shards into 4 jobs that each loop over four shards, to save runner minutes. their whole review was one comment: "never serialize parallel work". the PR is closed now. add a rule to our AGENTS.md so the other agents don't do this again. here's the section it belongs in:

```md
## CI

- Use `ubuntu-slim` unless a job needs Docker.
- Every job has a `timeout-minutes`.
```

Reply with the updated section in your message; you don't need to create files.
