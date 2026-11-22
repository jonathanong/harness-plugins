---
description: A test that nothing was sent waits for the event that would have sent it, not for a fixed delay.
tags: [test-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

write a vitest test that an unsubscribed user does not get an email. `enqueueDigest` puts a job on a queue and a worker handles it a moment later; `sendEmail` is injected.

```ts
// digest.ts
export type Deps = {
  sendEmail: (to: string, body: string) => Promise<void>
  isSubscribed: (userId: string) => Promise<boolean>
  onJobDone: (listener: (userId: string) => void) => void
}

export function startDigestWorker(deps: Deps) {
  return {
    enqueueDigest(userId: string, email: string): void {
      // pushes {userId, email} on an internal queue; a worker loop processes jobs in order
    },
    deps,
  }
}
```

`onJobDone` fires after each job finishes, whether or not it sent anything. Reply in your message; you don't need to create files.
