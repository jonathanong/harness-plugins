---
type: llm
---

Grade the review.

PASS if it flags the hardcoded instance count, region list, and connection limit as deployment
topology that does not belong in the application repository, and recommends keeping them in the
infrastructure repository and giving the application what it needs (such as the shard count) as
configuration, so that a scaling change does not require releasing the application.

FAIL if it approves the constants as they are, or only comments on code style, naming, hashing,
or tests without raising where the topology lives.
