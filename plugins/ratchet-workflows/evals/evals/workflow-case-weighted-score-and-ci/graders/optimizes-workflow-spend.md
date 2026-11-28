---
type: llm
---

PASS if the response recommends:

1. Running the cheap, high-weight stage (code review) first and skipping expensive downstream stages (QA) during iteration or verdict sweeps once a required floor misses or remaining stages can no longer reach the case target.
2. Keeping verdict-only early-stopped/skipped runs separate from recorded measurements: do not report a combined rate or 95% interval when a stage stopped early or was skipped; run full planned attempts across all stages for recorded numbers.

FAIL if it suggests always running all stages with no spend-saving rule, or if it suggests reporting a combined rate and interval from an early-stopped or stage-skipped run.
