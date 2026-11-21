---
type: llm
---

PASS if the script runs on the macOS system Bash 3.2: it uses none of `mapfile`, `readarray`,
`declare -A`, `${var,,}`, `${var^^}`, or `|&`, or it explicitly requires a newer Bash and says why.

FAIL if the script uses any of those Bash 4 features without addressing macOS.
