---
description: A review of a runbook written as one block of prose asks for the action first, steps as a list, the jargon defined, and the changing numbers replaced by how to fetch them.
tags: [technical-writing, skill-fired, review, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

A teammate wrote this runbook for the on-call rotation. Review it before I merge it.

```markdown
# Export queue backlog

The export queue processes about 1.2 million jobs a day and normally sits at a p95 wait of 340 ms,
so if you get paged for backlog it is usually because the reaper has stalled or the DLQ has filled
up after a partner outage, which happened twice last quarter. Historically the RPO for exports has
been treated as one hour, which is why the alert fires at 45 minutes of lag, although some people
think it should be 30. When this happens you should first check whether the reaper is running by
looking at the worker logs, and if it is not you can restart it with
`kubectl rollout restart deploy/export-reaper`, but before that make sure the DLQ is under 50,000
messages because otherwise the restart replays everything and makes the backlog worse, in which
case you need to drain the DLQ first with `pnpm exports:drain-dlq` and then restart.
```

Reply in your message; you don't need to create files.
