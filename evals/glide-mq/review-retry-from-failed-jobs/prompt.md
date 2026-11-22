---
description: A review of a repair job that scans the queue's failed jobs and retries them asks for it to read database rows, and for failed jobs not to be kept forever.
tags: [glide-mq, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this before I merge it? We use glide-mq on Valkey with PostgreSQL. Acme lets a user delete their account; a `purge-account` job erases their uploads from object storage. Sometimes storage is down for longer than the retries, so I added an hourly repair job.

```ts
export const purgeQueue = new Queue('purge', { connection })

export async function requestAccountPurge(userId: string) {
  await db.query('UPDATE users SET deleted_at = now() WHERE id = $1', [userId])
  await purgeQueue.add(
    'purge-account',
    { userId },
    {
      jobId: `purge:${userId}`,
      attempts: 5,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  )
}

// hourly
export async function repairFailedPurges() {
  const failed = await purgeQueue.getFailed(0, 500)
  for (const job of failed) {
    if (job.name === 'purge-account') await job.retry()
  }
}
```

Reply in your message; you don't need to create files.
