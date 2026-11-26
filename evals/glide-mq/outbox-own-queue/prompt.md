---
description: An outbox relay and a ledger write get their own queue, not a lane on the shared background queue.
tags: [glide-mq, skill-fired, outcome, priority-high]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We use glide-mq. Our `background` queue already runs thumbnails, CSV exports, and email, each with its own `ordering` key and cap. I'm adding two jobs: an `outbox-relay` job that reads committed rows from our `outbox` table and publishes them to Kafka, and a `post-ledger-entry` job that the payments service enqueues after it commits a payment, to write the matching double-entry ledger rows. I plan to add both to `background` with ordering keys `outbox` and `ledger`, each with a concurrency cap of 5. Write the producer and worker setup. Reply in your message; you don't need to create files.
