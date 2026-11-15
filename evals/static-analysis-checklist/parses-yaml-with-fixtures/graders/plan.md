---
type: llm
---

PASS if the plan replaces the grep with a check that parses the workflow and action YAML, first
looks for an existing analyzer, rule, or guard that could own the invariant, limits discovery to
the tracked workflow and action files, and adds accepted and rejected fixtures, including an
equivalent YAML form or an allowed case that a text match would get wrong.

FAIL if the check it proposes to build matches text with grep or a regular expression over the raw
files, or if it has no fixtures.
