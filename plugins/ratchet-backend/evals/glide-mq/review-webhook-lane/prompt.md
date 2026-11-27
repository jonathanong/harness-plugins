---
description: A review of a diff that adds a floodable job family to a shared queue asks for its own lane and no internal limiter.
tags: [glide-mq, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. It adds inbound partner webhooks to our glide-mq setup. Any partner can send us thousands of these in a burst.

```diff
 // producer: routes/webhooks.ts
+app.post('/webhooks/:partner', async (req, reply) => {
+  await backgroundQueue.add('partner-webhook', { partner: req.params.partner, body: req.body }, { priority: 1 })
+  return reply.code(202).send()
+})
```

```diff
 // worker: workers/background.ts
 export const backgroundWorker = new Worker('background', processor, {
   connection,
-  concurrency: 20,
+  concurrency: 20,
+  // partner webhooks were hogging the workers, slow everything down a bit
+  limiter: { max: 50, duration: 1000 },
 })
```

The same queue runs our email, thumbnail, and billing-sync jobs, each with `ordering: { key, concurrency }`. Reply in your message; you don't need to create files.
