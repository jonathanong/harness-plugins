---
type: llm
---

Grade the final message on one rule: a workflow is not fanned out into many tiny jobs whose
time is nearly all setup.

PASS if what the answer gives as the thing to use uploads the 40 files from one job, or from
a small number of jobs (fewer than ten), and says why it did not write one job per package:
each leg would spend nearly all its time on setup, and 40 jobs take 40 runner slots.

FAIL if what the answer gives as the thing to use is a matrix with one leg per package, with
or without a caveat. An answer that gives the per-package matrix as asked and offers a single
job as an alternative also fails.

Do not grade the YAML's syntax, how the answer reports per-package status, or action pins.
