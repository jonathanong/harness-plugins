---
description: A description for a change an agent wrote ends with a provenance block naming where it was verified, the agent and model, the harness, and the worktree, without the hostname, username, or absolute paths.
tags: [pr-description, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the pull request description for the change you just finished.

The change: `GET /invoices` took about 4 seconds for accounts with more than 50,000 invoices,
because it counted every row to fill `total` before returning the first page. It now returns
`has_next_page` and drops `total`; the web client's "Page 3 of 812" label becomes "Next" and
"Previous" buttons. For the largest account in the fixture the first page takes 90 ms.

What you ran: the invoice route tests (38 of 38 passed, after the last commit) and one timed
request before and after, against PostgreSQL 17 in Docker with a seeded fixture of 120,000
invoices. Nothing was run against staging or production.

Your session, from the environment:

```
harness: Claude Code CLI 2.1
model: Sonnet (as reported by the harness)
session: invoices-keyset
cwd: /home/dana/work/billing/.worktrees/invoices-keyset
host: dana-thinkpad-x1
user: dana
branch: invoices-keyset
```

Reply with the description in your message; you don't need to create files.
