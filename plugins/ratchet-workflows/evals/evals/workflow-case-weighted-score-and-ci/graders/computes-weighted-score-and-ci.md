---
type: llm
---

PASS if the response:

1. Computes the combined score as the weighted average `(1*(2/3) + 3*(3/3) + 2*(1/3)) / 6 = 13/18` (72% or 72.2%), not an unweighted average (67%) and not a probability product like `1 - prod(1 - p_i)` or `1 - prod(1 - p_i^w_i)`.
2. Explains computing the 95% credible interval by drawing each stage's rate from `Beta(passed + 0.5, failed + 0.5)` and taking the weighted average across draws (or gives a matching interval around `[42-87]` / `[43-87]` via `eval_stats.py`).
3. Explains that `regression-1` misses under the default rule because QA missed its 50% floor (1 of 3 needs 2 of 3), even though the combined score (72%) clears the 70% case target — and notes a suite can opt out of per-stage floors if it only judges by the combined score.

FAIL if it computes the wrong combined score, omits the 95% interval method, or misses the distinction between the QA floor failure and the 72% combined score.
