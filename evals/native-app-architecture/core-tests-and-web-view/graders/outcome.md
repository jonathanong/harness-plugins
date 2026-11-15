---
type: llm
---

PASS if both hold. First, the response says to run the `Core` tests once, on the cheapest
runner that can build the package (Linux, or a single job), and not on every platform job,
because the core has no platform dependency. Second, it pushes back on the web view: it says not
to fall back to a web view for a screen the platform can build natively unless a specific blocker
is written down, or asks what the blocker is, and names a cost of the web view.

FAIL if it runs the `Core` tests on all three jobs, or approves the web view plan without asking
for or naming a blocker.
