---
type: llm
---

Grade one thing: which errors the updated handler sends to Sentry. An expired or already-used
coupon is an outcome the code expects and nobody on the team can act on.

PASS if, in the updated handler, a `CouponExpiredError` or `CouponAlreadyUsedError` is answered
with a 4xx response and is not passed to `Sentry.captureException`, while any other error is
still reported and answered with a 500.

FAIL if `Sentry.captureException(err)` still runs for the two coupon errors, for example because
it stays at the top of the `catch` before the branches. FAIL if nothing is reported any more.
FAIL if the coupon errors are answered with a 500.

Do not grade how the response names the failure to the client.
