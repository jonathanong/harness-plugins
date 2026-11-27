---
type: llm
---

Grade the new `list_refunds` tool on one rule: a limit or a range that the model supplies is
bounded in one shared helper, not with arithmetic written into each tool.

PASS if the answer adds a shared helper (a function such as `clampLimit`, or a shared schema
such as one `limitSchema` built once and reused) that bounds the number of refunds and the
number of days, both from below and from above, and `list_refunds` uses it. Moving the two
existing tools onto the helper is welcome and is not required, but the helper must be written
so they can use it.

FAIL if `list_refunds` passes the model's limit or day count through unbounded. FAIL if it
bounds them only inside the tool, for example `Math.min(input.limit, 50)` or
`z.number().int().max(50)` written inline in `list_refunds` with no shared helper or shared
schema. FAIL if only an upper bound is applied and a zero or negative value still reaches the
query.

Do not grade whether the tool authorizes the actor, or how the date is computed from the day
count.
