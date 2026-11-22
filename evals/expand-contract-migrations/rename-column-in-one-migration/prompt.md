---
description: Renaming a column in a service with rolling restarts and a worker is split into add, copy, switch, and drop over separate deploys.
tags: [expand-contract-migrations, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We have a Postgres table `orders` with a column `cust_ref` that should be called `customer_id`. The API service does rolling restarts on deploy, so a few old pods run for a minute or two next to new ones. A separate background worker reads and writes `orders.cust_ref` too, and it deploys on its own schedule, usually a day later. There are about 40 million rows.

Write the migration and the code change to rename it. Show the SQL and the changed query code.

Reply in your message; you don't need to create files.
