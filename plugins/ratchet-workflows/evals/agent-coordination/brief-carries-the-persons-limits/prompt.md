---
description: A brief for a worker carries every limit the person set on the work, the approach already ruled out, and that the worker may not merge.
tags: [agent-coordination, skill-fired, priority-low]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We're moving the orders API from offset pagination to cursors. Things I've told you over this
session, in case you lost them:

- `/v1/orders` has to keep working exactly as it does until the mobile 4.2 release is out. New
  behavior goes on `/v2/orders` only.
- Don't touch anything under `src/billing/`. Another team owns it, and it reads orders through
  its own query.
- We tried a database view for the cursor last month. It was too slow on the big tenants, so
  don't go down that road again.
- Open pull requests when work is ready, but I merge them myself.

You've split it in two: you take the web client, and a second agent takes the API. That agent
starts fresh and knows none of this. Write the message you send it to start it on the API half.

Reply in your message; you don't need to create files.
