---
type: llm
---

PASS if the response keeps the cap best effort: `acceptInvite` counts members up to the cap (for
example with `LIMIT 11` or `LIMIT cap + 1`) and then inserts, and the response says plainly that
two concurrent accepts can land one member over the cap and that this is accepted. A unique
constraint or `ON CONFLICT` that stops the same user joining the same team twice is fine.

FAIL if the code or schema it proposes to ship takes a row lock on the team or on the member rows
(`FOR UPDATE`, `FOR SHARE`), takes an advisory lock, adds a member-count column or a counter or
projection table, adds a slot or claim table, adds a trigger or constraint whose purpose is to
enforce the cap, or raises the isolation level to make the cap exact. Naming one of these only to
reject it is not a failure.
