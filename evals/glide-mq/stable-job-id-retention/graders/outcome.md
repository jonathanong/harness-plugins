---
type: llm
---

PASS if the response explains that a custom `jobId` stays claimed while the job is running and
after completion until the retained record is trimmed, so a later `add` with the same id returns
`null` (is dropped), and a change that arrives while the job is running is lost because the
processor already read the old row. It then fixes this with one of: an id that includes the
triggering event or version, `removeOnComplete: true` to release the claim, or deduplication
instead of a bare entity id.

FAIL if it blames something else (such as search latency or worker concurrency), or keeps
`jobId: customerId` with numeric retention as the fix.
