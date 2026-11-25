---
type: llm
---

Grade the review on one thing: whether it says what the change does to the people affected, not
only what the code does. The retry runs inside the request behind "Pay now". Each attempt can
take up to 15 seconds and the backoff adds 17, so a shopper can wait well over a minute (up to
about 77 seconds) before any answer, and a charge that timed out at the client but succeeded at the provider is sent again
with no idempotency key, so the shopper can be charged more than once.

PASS if the review states both consequences in terms of the shopper or customer:

1. how long a shopper can be left waiting after pressing "Pay now" (a figure, or "over a
   minute", or "far past any reasonable request time"), and what they see or do meanwhile, such
   as a spinner, a gateway timeout, or pressing the button again;
2. that a shopper can be charged twice (or more) for one order.

It may also propose fixes, such as an idempotency key or moving the retry out of the request; that
is not graded.

FAIL if either consequence is stated only in mechanism terms ("retries are not idempotent",
"adds latency", "the request may time out") without saying what it means for the shopper.
