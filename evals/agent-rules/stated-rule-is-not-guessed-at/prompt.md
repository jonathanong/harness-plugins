---
description: Asked to write down a rule a person stated in five words, the answer does not guess at its scope; it records what was said and names what to ask, including a case the person has not considered.
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
