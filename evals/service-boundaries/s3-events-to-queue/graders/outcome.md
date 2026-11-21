---
type: llm
---

PASS if the answer says to deliver the S3 notification straight to a queue (SQS) that a worker
consumes, and removes the Lambda and the hop out to the public API and back (naming the extra
latency, public exposure, or shared secret as the reason). It may keep a Lambda only as a fallback
when no native queue target exists, limited to a self-contained check and an enqueue.

FAIL if it keeps the Lambda that POSTs to the public API, or only hardens that design (rotating
the secret, adding retries) without replacing the transport with a queue.
