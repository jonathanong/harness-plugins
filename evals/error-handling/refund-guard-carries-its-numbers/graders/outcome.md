---
type: llm
---

Grade the new refund guard on one rule: the details of a failure are attributes on the error,
and its message is a fixed string.

PASS if the error thrown by the new guard carries the order id, the requested amount, and the
remaining amount as fields of the error (properties on an error class, a details object, or
similar), and its message does not contain those values. The response and the tracker call may
then read them from those fields.

FAIL if the order id or either amount appears only inside the message, for example a template
string such as `Refund of ${amountCents} exceeds remaining ${remaining} for order ${orderId}`.
FAIL if the values are fields on the error but the message also interpolates them: a tracker
then opens a new issue for every order. FAIL if the answer parses the values back out of a
message.

Do not grade whether the answer adds error codes, changes the status of the response, changes
the two existing errors, or stops reporting this error to the tracker.
