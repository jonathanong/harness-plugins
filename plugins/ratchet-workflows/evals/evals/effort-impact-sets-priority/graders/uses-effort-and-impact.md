---
type: llm
---

PASS if the response:

1. Assigns priority from both effort (detection difficulty) and impact, ranking `missing-null-check` higher than `cross-service-race` (for example, high or critical for the easy medium-impact case vs. low or medium for the hard medium-impact case) and accounting for the very high effort of `subtle-token-leak` rather than assigning priority by impact alone.
2. Says that each suite defines and adjusts its own effort-by-impact decision matrix in `AGENTS.md` (and documents it in `README.md`), rather than treating one fixed table as mandatory for every suite.

FAIL if it assigns both medium-impact cases the same priority based on impact alone, or if it does not say where the suite's decision mapping lives.
