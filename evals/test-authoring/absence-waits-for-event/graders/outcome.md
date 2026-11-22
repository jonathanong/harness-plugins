---
type: llm
---

PASS if the test enqueues a digest for the unsubscribed user, and then waits on a real completion
signal before asserting `sendEmail` was not called: the `onJobDone` event for that user, or a
sibling job for a subscribed user enqueued after it and awaited, asserting the unsubscribed user's
email was skipped.

FAIL if the test proves absence only with a fixed delay (`setTimeout`, `sleep`, a timer-based wait,
`vi.waitFor` that passes immediately) or by asserting immediately after `enqueueDigest` with no wait.
