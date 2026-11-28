---
type: llm
---

PASS if the response:

1. Computes the sequential catch rate with Noisy-OR `1 - (1 - 0.5*(2/3))*(1 - 2/3)*(1 - 1/3) = 23/27` (~85% or 85.2%), and notes that a weighted average is for independent dimensions rather than sequential gates.
2. Explains computing the 95% credible interval by drawing each stage's rate from `Beta(passed + 0.5, failed + 0.5)` and passing the draws through the Noisy-OR formula (or gives a matching interval around `[54-99]` via `eval_stats.py`), and notes the independence caveat (Noisy-OR assumes independent stage misses: positively correlated misses can make it optimistic, while negatively correlated misses can make it pessimistic).
3. Explains that `regression-1` misses under the default rule because code review (2 of 3 needs 3 of 3 for high) and QA (1 of 3 needs 2 of 3 for low) missed their stage floors, even though the 85% combined score clears the 80% case target — and notes a suite can opt out of per-stage floors in `AGENTS.md` to judge by the combined score alone.

FAIL if it uses a weighted average for this sequential pipeline, omits the 95% interval or independence caveat, or misses the distinction between stage floors and the combined target.
