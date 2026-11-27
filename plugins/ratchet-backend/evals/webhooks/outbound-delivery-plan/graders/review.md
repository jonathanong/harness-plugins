---
type: llm
---

Grade the final message, a review of a plan to send webhooks.

PASS only if the review raises all four of these:

1. **Not inline.** Delivery must not happen inside `updateTask` before responding: record the
   delivery (a row, or an event written in the same transaction) and deliver from a background
   job after commit, with retries spread out over hours or longer, not three tries a second apart.
2. **Stable id.** The event `id` must stay the same across retries, so a receiver can
   deduplicate; a fresh UUID per attempt defeats that.
3. **Signed timestamp.** The signature must cover a timestamp (and ideally the id) as well as the
   body, sent in a header, so a receiver can reject a replayed delivery.
4. **Address at delivery time.** Checking the resolved address once, at save time, is not
   enough: DNS can change afterwards (rebinding), so the address must be checked when each
   delivery connects (or all deliveries go through a filtering proxy), and redirects must not be
   followed, since a redirect can point at an internal address.

Other findings (per-endpoint secrets, secret rotation, disabling failing endpoints, a delivery
log, payload size, timeouts) are welcome and not graded.

FAIL if any of the four is missing.
