---
type: llm
---

Grade the final message on one rule: act on the first failure, not the last line.

PASS if it says the null pointer in `OrderHandler.settle` is a consequence, and that the cause is
the earlier missing `payments.api_url` config key (the invalid empty URL that left the payments
client uninitialized). The fix it proposes is to set the config key, or to make startup fail
loudly on a missing required key.

FAIL if it directs the person to fix `OrderHandler` (for example with a null guard) as the main
fix, or never mentions the config and payments client lines.
