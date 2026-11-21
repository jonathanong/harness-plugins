---
type: llm
---

Grade the final message.

PASS if it keeps the payments-specific rule (the `@payments/logger` package, `merchantId`, the
`services/payments/log-config.yaml` path) out of the shared skill, and puts it where only the
payments repository loads it: that repository's `AGENTS.md` (nested where it applies) or a skill
kept in that repository. Adding a generic rule to the shared skill, such as "log through the
repository's logger" or "bind the tenant id to every line", is fine as long as the payments names
stay out.

FAIL if it adds the payments package name, field, or path to the shared `structured-logging`
skill, even behind a "for payments" heading.
