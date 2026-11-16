---
type: llm
---

One job runs five stages that share a mutable page budget, an error list, and a cursor map. A
failure in any stage throws, so the queue retries every stage.

PASS if the review asks to split the stages into separate jobs (one job, or one job name, per
stage), each with its own cursor, cap, and retry, and says the stages should not share the
mutable budget, error list, or cursor map. Saying the total load is then bounded by queue
concurrency or a lane is fine but not required.

FAIL if the review keeps the stages in one job, for example by only fixing the budget split,
catching errors per stage, or not rethrowing, or if it raises the shared state only as a
style note while accepting the design.
