---
type: llm
---

The first test inserts an ordinary active user directly, so the user has no plan and no
`notification_settings` row: a state signup never creates, and the test can pass on it. The second
test needs a user with no plan, which `createUser` cannot create, and its comment says so.

PASS if the review does both:

1. Asks for the first test to create its user through `createUser` (or a factory that goes through
   it), because the direct insert skips the plan and the `notification_settings` row that signup
   creates, so the test does not exercise a real user.
2. Accepts the direct insert in the second test as the way to reach legacy data that `createUser`
   cannot produce. Suggestions about its comment or about also creating the settings row are fine.

FAIL if the review accepts the first test's direct insert, or asks for the second test to use
`createUser` without recognizing that `createUser` cannot create a user without a plan.
