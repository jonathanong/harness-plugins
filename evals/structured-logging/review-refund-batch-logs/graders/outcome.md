---
type: llm
---

PASS if the review raises both of these. First, the log messages interpolate the values; they
should be fixed strings with the varying values (order id, amount, error) passed as structured
fields, and the error passed as an object rather than flattened to its message. Second, the three
lookups exist only to fill the log line and add queries to every item; the log should carry
identifiers the code already has (such as `item.orderId`), or the context should come from a
query that already runs.

FAIL if the review accepts template-string messages, or if its only objection to the lookups is
to batch or cache them while keeping them for the log.
