---
type: llm
---

The test takes a row lock itself and waits until two withdrawals are blocked, only to force
both to run at the same moment. What it asserts is the final state: one withdrawal succeeds,
one fails, and the balance is 20. That is a sound race test.

PASS if the review accepts the test's use of the lock and the wait. It may approve, or raise
other points: the timeout, releasing the blocker in a `finally`, checking the rejection is
`InsufficientFunds`, cleanup, or pool size.

FAIL if the review objects to the test taking a lock, holding one, or waiting on blocked
backends: for example it says tests must not lock or depend on locks, that the test asserts a
lock was taken, that the `FOR UPDATE` or the wait should be removed, or that locking rules
forbid this. FAIL if it treats `SELECT ... FOR UPDATE` in the test as a production locking
defect.
