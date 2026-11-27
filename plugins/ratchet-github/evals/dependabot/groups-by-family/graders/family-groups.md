---
type: llm
---

PASS if the proposed `dependabot.yml` groups packages by compatibility family (for example a group
for `react` and `react-dom`, one for `vitest` and `@vitest/*`, one for `oxlint` and `oxfmt`), leaves
unrelated packages such as `zod` and `pino` ungrouped, covers both the npm root and GitHub Actions,
and sets a cooldown for version updates without delaying security updates.

FAIL if the configuration contains a catch-all group (`patterns: ['*']` or `"*"`), a group defined
by `update-types` or `dependency-type` rather than by package family, or no cooldown.
