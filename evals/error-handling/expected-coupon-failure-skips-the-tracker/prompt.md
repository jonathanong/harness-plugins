---
description: A checkout handler that learns two expected coupon failures answers them without sending them to the error tracker, and still reports the unexpected ones.
tags: [error-handling, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

`coupons.redeem` used to throw only when the database was down. It now also throws `CouponExpiredError` and `CouponAlreadyUsedError` (both extend `CouponError`, both have `couponId`). The checkout page needs to tell the shopper which one happened instead of "Something went wrong". Update the handler:

```ts
// src/http/redeemCoupon.ts
import * as Sentry from '@sentry/node'

export async function redeemCoupon(req: Request, res: Response) {
  try {
    const result = await coupons.redeem(req.user.id, req.body.code)
    res.json(result)
  } catch (err) {
    Sentry.captureException(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
```

Reply in your message with the changed code; you don't need to create files.
