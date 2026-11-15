---
type: llm
---

PASS if the response proposes all three of these as separate files under `evals/`, and assigns
each the right job. A `README.md` for people: what the suite evaluates and the current scores,
with the run's date, models, and attempts, and with both the with and without arms (or their
difference) reported. A `HISTORY.md` (a log that only grows): dated entries for each run and for
changes to cases or graders, kept out of the README. An `AGENTS.md`: the rules for an agent that
adds, changes, or runs cases.

FAIL if it puts the run history or the agent rules inside the README instead of their own files,
or if the results it outlines report only the with-prompt score.
